#!/usr/bin/env python3
"""Generates the static HTML pages. Run from the repo root:  python3 tools/build.py
Edit copy here, run it, commit the HTML. Prices, hours, links live in config.js / products.js."""
import os, html

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IG, SAGE, DEPOP, VENMO = "very_wear_apparel", "sagejoygold", "illa9", "very_wear_apparel"

NAV = [("shop.html", "Shop"), ("archive.html", "The Archive"), ("stylist.html", "Stylist"),
       ("sip-thrift.html", "Sip &amp; Thrift"), ("book.html", "Book")]

FAV = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23faf8f3'/%3E%3Cpath d='M16 3l13 13-13 13L3 16z' fill='%23111'/%3E%3C/svg%3E"


def page(fname, title, desc, body, wide_title=None):
    nav = "".join(f'<li><a href="{h}">{t}</a></li>' for h, t in NAV)
    out = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{html.escape(title)}</title>
<meta name="description" content="{html.escape(desc)}">
<meta property="og:title" content="{html.escape(title)}">
<meta property="og:description" content="{html.escape(desc)}">
<meta property="og:image" content="images/sip-and-thrift-flyer.png">
<meta name="theme-color" content="#faf8f3">
<link rel="icon" href="{FAV}">
<link rel="stylesheet" href="styles.css">
<link rel="preload" href="fonts/BigShoulders-Bold.ttf" as="font" type="font/ttf" crossorigin>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<div class="strip"><div class="wrap mono"><span>Vintage curation</span><span>Appointment-only showroom</span><span>@{IG}</span></div></div>
<header class="mast"><a href="index.html" aria-label="Wear / Rare home"><h1 class="logo shoulders">Wear / Rare</h1></a>
<div class="sub mono mute">The Holy Haberdashery &middot; Excellently curated gems</div></header>
<nav class="nav" aria-label="Main"><div class="wrap"><ul>{nav}</ul>
<button class="bagbtn" data-open-bag>Bag (<span data-bag-count>0</span>)</button></div></nav>
<main id="main">
{body}
</main>
<footer class="site"><div class="wrap">
<div class="cols">
<div><div class="shoulders" style="font-size:44px;line-height:1">Wear / Rare</div>
<p class="mute" style="max-width:36ch">Vintage as art. Garments and accessories with value far beyond money, curated one piece at a time.</p></div>
<div><span class="mono">Explore</span><ul>{''.join(f'<li><a href="{h}">{t}</a></li>' for h, t in NAV)}<li><a href="about.html">About</a></li></ul></div>
<div><span class="mono">Elsewhere</span><ul>
<li><a href="https://instagram.com/{IG}" target="_blank" rel="noopener">Instagram @{IG}</a></li>
<li><a href="https://www.depop.com/{DEPOP}" target="_blank" rel="noopener">Depop</a></li>
<li><a href="https://venmo.com/u/{VENMO}" target="_blank" rel="noopener">Venmo @{VENMO}</a></li>
<li><a href="https://instagram.com/{SAGE}" target="_blank" rel="noopener">Personal @{SAGE}</a></li></ul></div>
</div>
<div class="fine mono mute"><span>&copy; <span data-year>2026</span> Wear / Rare</span><span>Every piece is one of one</span></div>
</div></footer>
<noscript><div class="notice">The shop, bag and booking need JavaScript. You can always reach him on <a href="https://instagram.com/{IG}">Instagram @{IG}</a>.</div></noscript>
<script src="config.js"></script>
<script src="products.js"></script>
<script src="app.js"></script>
</body>
</html>
"""
    with open(os.path.join(ROOT, fname), "w", encoding="utf-8") as f:
        f.write(out)


def head(kicker, h, lede=""):
    return f"""<section style="padding-bottom:0"><div class="wrap">
<span class="mono mute">{kicker}</span>
<h1 class="disp h1" style="margin:10px 0 16px">{h}</h1>
{f'<p class="lede">{lede}</p>' if lede else ''}
</div></section>"""


TICK = "".join(f"{w} &nbsp;&middot;&nbsp; " for w in ["Chanel","Gucci","Christian Dior","Rick Owens","One of one","Archive pieces","Excellently curated gems","Wear it. It's rare."]) + " &nbsp; "
# ---------------------------------------------------------------- HOME
home = f"""
<section class="hero"><div class="wrap">
<span class="mono mute">Vintage curation &middot; Appointment-only showroom</span>
<h2 class="disp h1">Not just clothes.<br>A collection.</h2>
<p class="lede">Vintage garments and accessories are art, and their value runs far past money. Wear / Rare is a curated archive of rare pieces you can own, wear, and keep.</p>
<div class="row" style="justify-content:center"><a class="btn" href="shop.html">Shop the collection</a><a class="btn ghost" href="book.html">Book a showroom visit</a></div>
</div></section>
<div class="ticker mono"><span>{TICK}{TICK}</span></div>

<section><div class="wrap">
<div class="sec-head"><h2 class="disp h2">Latest pieces</h2><a class="mono" href="shop.html">See everything &rarr;</a></div>
<div data-mount="featured" data-limit="3"></div>
</div></section>

<section style="padding-top:0"><div class="wrap">
<div class="sec-head"><h2 class="disp h2">Three ways in</h2></div>
<div class="grid g3">
<div class="panel"><span class="mono mute">01 / Shop</span><h3 class="disp h3">The collection</h3><p>One of one pieces, priced and ready. Add to your bag, pay with Venmo, done.</p><a class="btn sm" href="shop.html">Shop now</a></div>
<div class="panel"><span class="mono mute">02 / Showroom</span><h3 class="disp h3">By appointment</h3><p>Private visits only, open seven days. Pick a time, browse the racks, and buy on the spot.</p><a class="btn sm" href="book.html">Book a visit</a></div>
<div class="panel"><span class="mono mute">03 / Stylist</span><h3 class="disp h3">Style with him</h3><p>Personal styling, closet edits, and sourcing from someone fluent in the houses.</p><a class="btn sm" href="stylist.html">See services</a></div>
</div></div></section>

<section style="padding-top:0"><div class="wrap">
<div class="grid g2" style="align-items:center">
<div><span class="mono mute">The name</span><h2 class="disp h2" style="margin:10px 0 16px">Wear. Rare.</h2>
<p class="lede">Say it fast and it's the same word. That's the point. The rarest things are worth wearing, and the things worth wearing are rare. Each piece here has already lived a life. You're next in line.</p>
<p><a class="btn ghost sm" href="archive.html">Enter the Archive</a></p></div>
<div class="panel"><span class="mono mute">Invitation only</span><h3 class="disp h3">Sip &amp; Thrift</h3>
<p>An evening in the showroom with tea, drinks, and the racks. Guests are selected, then invited.</p>
<p class="mono" data-sip-date></p><a class="btn sm" href="sip-thrift.html">Request an invite</a></div>
</div></div></section>

<section style="padding-top:0"><div class="wrap">
<hr class="rule2"><p class="mono mute" style="text-align:center;margin:16px 0">Find him at pop-ups &amp; markets &middot; T-Street &middot; ThriftCon ATL &middot; NC Bazaar &middot; PunkFlea &middot; The Senate &middot; USC</p><hr class="rule2">
</div></section>
"""
page("index.html", "Wear / Rare | Vintage as art. Worn as rare.",
     "A curated vintage collection of rare garments and accessories. Shop one-of-one pieces, book the showroom, and work with a stylist fluent in Chanel, Gucci, Dior and Rick Owens.", home)

# ---------------------------------------------------------------- SHOP
shop = head("The collection", "Shop", "Every piece is one of one. Tap a piece for photos and details, add it to your bag, and pay with Venmo.") + """
<section><div class="wrap"><div data-mount="shop"></div>
<div class="notice" style="margin-top:34px"><span class="mono">How it works</span>
<p style="margin:8px 0 0">1. Add pieces to your bag. 2. Check out and pay with Venmo. 3. He confirms your payment and arranges pickup at the showroom or shipping. Looking for something specific? <a href="stylist.html">Ask him to source it</a>.</p></div>
</div></section>"""
page("shop.html", "Shop | Wear / Rare", "Shop the Wear / Rare collection of rare vintage garments and accessories. One of one pieces, pay with Venmo.", shop)

# ---------------------------------------------------------------- ARCHIVE
archive = head("Value beyond money", "The Archive",
               "Some pieces are not for sale. They are held, studied, and shown, because a garment can be an artifact: a hand, a decade, a body that once moved through the world in it.") + """
<section><div class="wrap">
<div class="grid g2" style="margin-bottom:40px">
<div><h2 class="disp h2" style="margin-bottom:14px">Clothing as collection</h2>
<p>Price tells you what something costs. It doesn't tell you what it is. In the Archive, pieces are kept for their craft, their era, their cut, and the culture they carry, and shown the way a gallery shows a work.</p>
<p>Some archive pieces eventually find a new keeper. Most stay. Ask him about any plate.</p></div>
<div><span class="mono mute">What he looks at</span>
<ul class="list" style="margin-top:12px">
<li><span>Label &amp; construction</span><span class="mono mute">01</span></li>
<li><span>Era &amp; provenance</span><span class="mono mute">02</span></li>
<li><span>Condition &amp; wear</span><span class="mono mute">03</span></li>
<li><span>Cultural weight</span><span class="mono mute">04</span></li></ul></div></div>
<div class="sec-head"><h2 class="disp h3">The plates</h2><span class="mono mute">Not for sale unless noted</span></div>
<div data-mount="archive"></div>
</div></section>"""
page("archive.html", "The Archive | Wear / Rare", "Vintage clothing and accessories as an art collection with value far beyond money.", archive)

# ---------------------------------------------------------------- STYLIST
stylist = head("Services", "Stylist", "He knows the houses, the seasons, and the stitching. Bring a closet, an occasion, or a grail you can't find, and he'll build from there.") + """
<section><div class="wrap">
<div data-mount="services"></div>
<div class="grid g2" style="margin-top:44px">
<div class="panel"><span class="mono mute">Fluent in</span><h3 class="disp h3">The houses</h3><p>Chanel, Gucci, Christian Dior, Rick Owens, and the wider world of designer and archive fashion. Ask about a label, a season, a stitch.</p></div>
<div class="panel"><span class="mono mute">How it works</span><h3 class="disp h3">Request, confirm, meet</h3><p>Choose a service and a time on the booking page. He confirms by message, then you meet at the showroom or online.</p><a class="btn sm" href="book.html">Book now</a></div>
</div></div></section>"""
page("stylist.html", "Stylist | Wear / Rare", "Personal styling, closet edits and sourcing from a stylist fluent in Chanel, Gucci, Dior and Rick Owens.", stylist)

# ---------------------------------------------------------------- SIP & THRIFT
sip = head("By invitation", "Sip &amp; Thrift", "An evening in the showroom. Tea, drinks, music, and racks of rare pieces, with a room of people who care what they wear.") + """
<section><div class="wrap"><div class="grid g2" style="align-items:start">
<div><img class="flyer" src="images/sip-and-thrift-flyer.png" alt="Sip and Thrift event flyer, Wear / Rare" loading="lazy" width="800">
<p class="hint">Flyer preview. Date and address go to invited guests.</p></div>
<div>
<span class="mono mute" data-sip-date></span>
<h2 class="disp h2" style="margin:10px 0 14px">Selected, then invited</h2>
<p>Sip &amp; Thrift is small on purpose. Guests are chosen, then invited to the showroom to shop, sip, and stay awhile. Tea and beverages are on, with non-alcoholic options always.</p>
<ul class="list" style="margin:18px 0 26px">
<li><span>First pour on arrival</span><span class="mono mute">Tea &middot; spritzes &middot; sangria</span></li>
<li><span>Racks by era and mood</span><span class="mono mute">Not by size</span></li>
<li><span>Find of the night</span><span class="mono mute">One piece, revealed</span></li>
<li><span>Guests-only pricing</span><span class="mono mute">That night</span></li></ul>
<form class="panel" data-gform="sipThrift" data-request="Sip & Thrift invite request" data-thanks="Thank you. Guests are selected and invited. If you're chosen, he'll reach out with the date, time and address." novalidate>
<h3 class="disp h3" style="margin-bottom:14px">Request an invite</h3>
<div class="f"><label for="s-name">Name</label><input id="s-name" name="Name" type="text" required data-label="name"></div>
<div class="two"><div class="f"><label for="s-ig">Instagram</label><input id="s-ig" name="Instagram" type="text" placeholder="@" required data-label="Instagram"></div>
<div class="f"><label for="s-email">Email</label><input id="s-email" name="Email" type="email"></div></div>
<div class="two"><div class="f"><label for="s-plus">Plus one?</label><select id="s-plus" name="Plus one"><option>No</option><option>Yes</option></select></div>
<div class="f"><label for="s-drink">Drink</label><select id="s-drink" name="Drink"><option>Cocktail</option><option>Mocktail</option><option>Tea</option><option>Surprise me</option></select></div></div>
<div class="f"><label for="s-note">Anything he should know?</label><textarea id="s-note" name="Notes" placeholder="Labels you love, sizes, dietary notes..."></textarea></div>
<input class="hp" type="text" name="company" tabindex="-1" autocomplete="off" aria-hidden="true">
<p class="err" hidden></p><button class="btn" type="submit">Request invite</button></form>
</div></div></div></section>"""
page("sip-thrift.html", "Sip & Thrift | Wear / Rare", "An invitation-only evening of tea, drinks and rare vintage in the Wear / Rare showroom.", sip)

# ---------------------------------------------------------------- BOOK
book = head("Appointment only", "Book the showroom", "The showroom opens by appointment. Choose what you'd like, pick a day and time, and he'll confirm.") + """
<section><div class="wrap" style="max-width:820px"><div data-mount="booking"></div></div></section>"""
page("book.html", "Book an appointment | Wear / Rare", "Request a private showroom visit, styling session, closet edit or sourcing consult with Wear / Rare.", book)

# ---------------------------------------------------------------- ABOUT
about = head("About", "The Holy Haberdashery", "Wear / Rare is a vintage curation practice built on one belief: what we wear is art, and the best of it is worth far more than its price tag.") + f"""
<section><div class="wrap"><div class="grid g2" style="align-items:start">
<div><p>Vintage is not a trend here. It is an archive. Every piece is sourced, studied, and chosen for what it is: the hand that made it, the decade it's from, and the way it carries itself.</p>
<p>He knows the industry deeply, especially high fashion and designer garments from houses like Chanel, Gucci, Christian Dior and Rick Owens. That knowledge shapes what comes into the collection, how it's presented, and how he styles the people who wear it.</p>
<p>Beyond selling, there's styling, closet edits, and Sip &amp; Thrift evenings in the showroom, because clothes are better when people get to love them in the same room.</p></div>
<div class="panel"><span class="mono mute">Find him</span>
<ul class="list" style="margin-top:12px">
<li><span>Instagram</span><a href="https://instagram.com/{IG}" target="_blank" rel="noopener">@{IG}</a></li>
<li><span>Personal</span><a href="https://instagram.com/{SAGE}" target="_blank" rel="noopener">@{SAGE}</a></li>
<li><span>Depop</span><a href="https://www.depop.com/{DEPOP}" target="_blank" rel="noopener">depop.com/{DEPOP}</a></li>
<li><span>Venmo</span><a href="https://venmo.com/u/{VENMO}" target="_blank" rel="noopener">@{VENMO}</a></li></ul>
<a class="btn sm" href="book.html">Book an appointment</a></div>
</div></div></section>"""
page("about.html", "About | Wear / Rare", "About Wear / Rare, a vintage curation practice treating clothing as art.", about)

# ---------------------------------------------------------------- LINKS (landing page for the one QR card)
LINKS = [
    ("Pay with Venmo", f"@{VENMO}", f"https://venmo.com/u/{VENMO}", True),
    ("Follow on Instagram", f"@{IG}", f"https://instagram.com/{IG}", True),
    ("Shop on Depop", f"depop.com/{DEPOP}", f"https://www.depop.com/{DEPOP}", True),
    ("Shop the collection", "One of one pieces", "shop.html", False),
    ("Book an appointment", "Open 7 days, 12 to 9:30", "book.html", False),
    ("Sip &amp; Thrift", "Request an invite", "sip-thrift.html", False),
]
rows = "".join(
    f'<a class="lk" href="{h}"{" target=\"_blank\" rel=\"noopener\"" if ext else ""}><span class="disp">{t}</span><span class="mono mute">{s}</span><span class="arrow" aria-hidden="true">&rarr;</span></a>'
    for t, s, h, ext in LINKS)
links_html = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Wear / Rare | All links</title>
<meta name="description" content="Pay, follow, shop and book with Wear / Rare.">
<meta name="theme-color" content="#faf8f3">
<link rel="icon" href="{FAV}">
<link rel="stylesheet" href="styles.css">
<style>
.lp {{ max-width: 520px; margin: 0 auto; padding: 28px 18px 44px; text-align: center; }}
.lp .logo {{ font-size: clamp(60px, 18vw, 96px); line-height: .9; margin: 6px 0 6px; }}
.lp .tag {{ margin-bottom: 22px; }}
.lks {{ display: grid; gap: 12px; margin-top: 8px; text-align: left; }}
.lk {{ display: grid; grid-template-columns: 1fr auto; gap: 2px 12px; align-items: center; border: 1px solid var(--ink); padding: 16px 18px; text-decoration: none; background: var(--paper); position: relative; }}
.lk::after {{ content: ""; position: absolute; inset: 4px; border: 1px solid var(--ink); opacity: .35; pointer-events: none; }}
.lk .disp {{ font-size: 28px; grid-column: 1; }}
.lk .mono {{ grid-column: 1; }}
.lk .arrow {{ grid-column: 2; grid-row: 1 / span 2; font-size: 24px; }}
.lk:hover, .lk:focus-visible {{ background: var(--ink); color: var(--paper); }}
.lk:hover .mute {{ color: #cfcabd; }}
</style>
</head>
<body>
<main class="lp">
<span class="mono mute">Vintage curation &middot; Appointment only</span>
<h1 class="logo shoulders">Wear / Rare</h1>
<div class="tag mono mute">The Holy Haberdashery</div>
<hr class="rule2" style="margin-bottom:20px">
<div class="lks">{rows}</div>
<p class="mono mute" style="margin-top:28px">Every piece is one of one</p>
</main>
</body>
</html>
"""
open(os.path.join(ROOT, "links.html"), "w", encoding="utf-8").write(links_html)
print("built pages")
