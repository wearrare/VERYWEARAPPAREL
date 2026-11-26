#!/usr/bin/env python3
"""Turns the tee spreadsheet + photos into site pieces.

  python3 tools/import_pieces.py SHEET.csv PHOTOS_FOLDER            (dry run: shows what it would do)
  python3 tools/import_pieces.py SHEET.csv PHOTOS_FOLDER --write    (copies photos + updates products.js)

SHEET.csv  = the Google Sheet exported as CSV (File > Download > CSV).
PHOTOS     = a folder of photos. Two ways to name them:
  A) VWA-014_1.jpg, VWA-014_2.jpg ...   (ID, underscore, photo number; 1 = cover)
  B) straight off the phone (IMG_1234.jpg). Photos are handed out IN ORDER, each piece taking the number of
     photos in its "Photos" column, in ID order. Run the dry run and check the contact sheet before --write.
Rows are skipped until they have an ID, a Name and a Price (or an Archive status).
Pieces already in products.js outside the IMPORTED block (the Archive plates) are left alone."""
import csv, os, re, sys, glob, json
from PIL import Image, ImageOps
try:
    from pillow_heif import register_heif_opener   # lets iPhone .HEIC photos work (pip install pillow-heif)
    register_heif_opener()
except ImportError:
    pass

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_IMG = os.path.join(ROOT, "images", "pieces")
PJS = os.path.join(ROOT, "products.js")
START, END = "/* IMPORTED:START */", "/* IMPORTED:END */"
MAXSIDE, THUMBSIDE = 1400, 640

def norm(h): return re.sub(r"[^a-z0-9]", "", h.lower())
ALIASES = {"id": "id", "name": "name", "title": "name", "label": "label", "brand": "label", "era": "era", "year": "era",
           "size": "size", "tagsize": "size", "condition": "condition", "pittopit": "pit", "pit": "pit", "chest": "pit",
           "length": "length", "shoulder": "shoulder", "sleeve": "sleeve", "price": "price", "status": "status",
           "category": "category", "story": "story", "photos": "photos", "numberofphotos": "photos", "photocount": "photos"}

def num(v):
    v = re.sub(r"[^0-9.]", "", v or "")
    return float(v) if v else None

def read_rows(path):
    with open(path, newline="", encoding="utf-8-sig") as f:
        rd = csv.DictReader(f)
        rows = []
        for r in rd:
            d = {}
            for k, v in r.items():
                if k and norm(k) in ALIASES: d[ALIASES[norm(k)]] = (v or "").strip()
            rows.append(d)
    return rows

def natural(s): return [int(t) if t.isdigit() else t.lower() for t in re.split(r"(\d+)", s)]

def find_photos(folder, rows):
    files = [p for p in glob.glob(os.path.join(folder, "*")) if p.lower().endswith((".jpg", ".jpeg", ".png", ".heic", ".webp")) and not os.path.basename(p).startswith("_")]
    named, loose = {}, []
    for p in sorted(files, key=lambda x: natural(os.path.basename(x))):
        m = re.match(r"^([A-Za-z]+-?\d+)[_-](\d+)\.", os.path.basename(p))
        if m:
            named.setdefault(m.group(1).upper(), []).append((int(m.group(2)), p))
        else:
            loose.append(p)
    out = {k: [p for _, p in sorted(v)] for k, v in named.items()}
    # loose photos: hand out in ID order by each row's Photos count
    i = 0
    for r in sorted((r for r in rows if r.get("id") and r["id"].upper() not in out), key=lambda r: natural(r["id"])):
        n = int(num(r.get("photos")) or 0)
        if n and i < len(loose):
            out[r["id"].upper()] = loose[i:i + n]
            i += n
    return out, len(loose) - i

def save(src, dst, side):
    im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
    im.thumbnail((side, side), Image.LANCZOS)
    im.save(dst, "JPEG", quality=80, optimize=True, progressive=True)

def js(v): return json.dumps(v, ensure_ascii=False)

def build_entry(r, imgs, thumbs):
    lines = ["  {"]
    def put(k, v):
        if v not in (None, "", []): lines.append(f"    {k}: {js(v)},")
    sid = r["id"].upper()
    status = (r.get("status") or "available").lower()
    put("id", sid); put("name", r.get("name")); put("label", r.get("label")); put("category", r.get("category") or "Tees")
    put("era", r.get("era")); put("size", r.get("size")); put("condition", r.get("condition"))
    for k in ("pit", "length", "shoulder", "sleeve"):
        n = num(r.get(k)); put(k, int(n) if n is not None and n == int(n) else n)
    n = num(r.get("price")); put("price", None if status == "archive" else (int(n) if n is not None and n == int(n) else n))
    put("status", status); put("story", r.get("story")); put("images", imgs)
    if thumbs: lines.append("    thumbs: true,")
    lines[-1] = lines[-1].rstrip(",")
    lines.append("  }")
    return "\n".join(lines)

def contact_sheet(items, path):
    cell, cols = 220, 6
    rows_n = (len(items) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * cell, rows_n * (cell + 18)), "white")
    from PIL import ImageDraw
    d = ImageDraw.Draw(sheet)
    for i, (sid, p) in enumerate(items):
        im = ImageOps.exif_transpose(Image.open(p)).convert("RGB"); im.thumbnail((cell - 8, cell - 8))
        x, y = (i % cols) * cell + 4, (i // cols) * (cell + 18)
        sheet.paste(im, (x, y + 16)); d.text((x, y + 2), sid, fill="black")
    sheet.save(path, quality=80)

def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    write = "--write" in sys.argv
    if len(args) != 2: sys.exit(__doc__)
    rows, folder = read_rows(args[0]), args[1]
    photos, leftover = find_photos(folder, rows)
    ready, skipped, entries, report, cover_items = [], [], [], [], []
    for r in sorted(rows, key=lambda r: natural(r.get("id", ""))):
        sid = (r.get("id") or "").upper()
        if not sid: continue
        status = (r.get("status") or "available").lower()
        if not r.get("name") or (status != "archive" and num(r.get("price")) is None):
            skipped.append(f"{sid}: needs a name and a price"); continue
        ph = photos.get(sid, [])
        if not ph: skipped.append(f"{sid}: no photos found"); continue
        low = sid.lower()
        names = [f"{low}-{i + 1}.jpg" for i in range(len(ph))]
        ready.append((sid, ph, names))
        entries.append((r, names))
        pr = num(r.get("price"))
        report.append(f"{sid}: {len(ph)} photos, {('$' + format(pr, 'g')) if pr is not None else 'no price'}, {r['name']}")
        cover_items.append((sid, ph[0]))
    print(f"Ready: {len(ready)}   Skipped: {len(skipped)}   Unused loose photos: {leftover}")
    for s in report: print("  ok  ", s)
    for s in skipped: print("  skip", s)
    if leftover > 0: print(f"  note {leftover} loose photos were not matched to any piece (check the Photos counts)")
    if not write:
        if cover_items:
            cs = os.path.join(folder, "_check-contact-sheet.jpg"); contact_sheet(cover_items, cs); print("Contact sheet:", cs)
        print("Dry run only. Add --write to publish these."); return
    os.makedirs(OUT_IMG, exist_ok=True)
    for sid, ph, names in ready:
        for i, (p, n) in enumerate(zip(ph, names)):
            save(p, os.path.join(OUT_IMG, n), MAXSIDE)
            if i < 2: save(p, os.path.join(OUT_IMG, n.replace(".jpg", "-t.jpg")), THUMBSIDE)
    body = ",\n".join(build_entry(r, names, True) for r, names in entries)
    src = open(PJS, encoding="utf-8").read()
    if START not in src: sys.exit("products.js is missing the IMPORTED markers")
    a, b = src.index(START), src.index(END)
    old = src[a + len(START):b]
    keep = []   # previous imports for pieces not in this run stay
    old_blocks = re.findall(r"\n  \{\n.*?\n  \}", old, flags=re.S)
    new_ids = {r["id"].upper() for r, _ in entries}
    for blk in old_blocks:
        m = re.search(r'id:\s*"([^"]+)"', blk)
        if m and m.group(1) not in new_ids and not m.group(1).startswith("WR-"): keep.append(blk.strip("\n"))
    allb = keep + ([body] if body else [])
    open(PJS, "w", encoding="utf-8").write(src[:a + len(START)] + "\n" + ",\n".join(allb) + ("," if allb else "") + "\n  " + src[b:])
    print(f"Wrote {len(entries)} pieces to products.js and images/pieces/. Commit and push to publish.")

main()
