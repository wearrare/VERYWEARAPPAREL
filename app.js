/* WEAR / RARE - site behaviour. No build step, no dependencies. */
(function () {
  "use strict";
  var C = window.WR || {};
  var PRODUCTS = window.WR_PRODUCTS || [];
  var BAG_KEY = "wr_bag_v1";
  var IS_MOBILE = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  /* ---------- helpers ---------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function money(n) { return "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 }); }
  function el(html) { var t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstChild; }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function imgPath(f) { return /^(https?:|images\/)/.test(f) ? f : "images/pieces/" + f; }
  function dmLink() { return "https://ig.me/m/" + C.igHandle; }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function load(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }
  function copy(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text).catch(function () {});
    var t = document.createElement("textarea"); t.value = text; document.body.appendChild(t); t.select();
    try { document.execCommand("copy"); } catch (e) {} t.remove(); return Promise.resolve();
  }
  function byId(id) { return PRODUCTS.filter(function (p) { return p.id === id; })[0]; }
  function isBuyable(p) { return p.status === "available" && typeof p.price === "number"; }

  /* ---------- delivering requests (orders, bookings, invites) ---------- */
  function deliver(subject, fields) {
    var lines = Object.keys(fields).filter(function (k) { return fields[k] !== "" && fields[k] != null; })
      .map(function (k) { return k + ": " + fields[k]; });
    var text = subject + "\n\n" + lines.join("\n");
    if (!C.formEndpoint) return Promise.resolve({ sent: false, text: text });
    var body = Object.assign({ subject: subject, from_name: "Wear/Rare website" }, fields);
    if (C.formAccessKey) body.access_key = C.formAccessKey;
    return fetch(C.formEndpoint, { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(body) })
      .then(function (r) { return { sent: r.ok, text: text }; })
      .catch(function () { return { sent: false, text: text }; });
  }
  function fallbackHtml(text) {
    var mail = C.email ? '<a class="btn sm ghost" href="mailto:' + esc(C.email) + "?subject=" + encodeURIComponent(text.split("\n")[0]) + "&body=" + encodeURIComponent(text) + '">Email it</a>' : "";
    return '<div class="notice"><p class="mono" style="margin:0 0 8px">One more step</p>' +
      "<p style=\"margin:0 0 12px\">Your request is ready. Send it to him and he'll confirm.</p>" +
      '<textarea readonly rows="7" aria-label="Your request text">' + esc(text) + "</textarea>" +
      '<div class="row" style="margin-top:12px"><button type="button" class="btn sm" data-copy>Copy request</button>' +
      '<a class="btn sm ghost" target="_blank" rel="noopener" href="' + dmLink() + '" data-dm>Open Instagram DM</a>' + mail + "</div>" +
      '<p class="hint">Paste it into the DM so it reaches him.</p></div>';
  }
  function wireFallback(root, text) {
    $$("[data-copy]", root).forEach(function (b) { b.addEventListener("click", function () { copy(text); b.textContent = "Copied"; }); });
    $$("[data-dm]", root).forEach(function (a) { a.addEventListener("click", function () { copy(text); }); });
  }

  /* ---------- bag ---------- */
  var bag = load(BAG_KEY, []).filter(function (id) { var p = byId(id); return p && isBuyable(p); });
  function bagTotal() { return bag.reduce(function (s, id) { return s + byId(id).price; }, 0); }
  function setBag(b) { bag = b; save(BAG_KEY, bag); renderBag(); updateCount(); $$("[data-pid]").forEach(syncButtons); }
  function updateCount() { $$("[data-bag-count]").forEach(function (n) { n.textContent = bag.length; }); }
  function inBag(id) { return bag.indexOf(id) > -1; }

  var drawer, scrim, pieceDlg, checkDlg;
  function mountChrome() {
    scrim = el('<div class="scrim" data-scrim></div>');
    drawer = el('<aside class="drawer" aria-label="Shopping bag" aria-hidden="true"><header><span class="disp h3">Your Bag</span><button class="x" data-close-bag aria-label="Close bag">&times;</button></header><div class="items" data-items></div><footer data-foot></footer></aside>');
    pieceDlg = el('<dialog aria-label="Piece details"><div class="dlg-head"><span class="mono" data-pno></span><button class="x" data-x aria-label="Close">&times;</button></div><div class="dlg-body" data-body></div></dialog>');
    checkDlg = el('<dialog aria-label="Checkout"><div class="dlg-head"><span class="mono">Checkout</span><button class="x" data-x aria-label="Close">&times;</button></div><div class="dlg-body" data-body></div></dialog>');
    [scrim, drawer, pieceDlg, checkDlg].forEach(function (n) { document.body.appendChild(n); });
    scrim.addEventListener("click", closeBag);
    $("[data-close-bag]", drawer).addEventListener("click", closeBag);
    [pieceDlg, checkDlg].forEach(function (d) {
      $("[data-x]", d).addEventListener("click", function () { d.close(); });
      d.addEventListener("click", function (e) { if (e.target === d) d.close(); });
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeBag(); });
    $$("[data-open-bag]").forEach(function (b) { b.addEventListener("click", openBag); });
    renderBag(); updateCount();
  }
  function openBag() { drawer.classList.add("open"); scrim.classList.add("open"); drawer.setAttribute("aria-hidden", "false"); }
  function closeBag() { if (!drawer) return; drawer.classList.remove("open"); scrim.classList.remove("open"); drawer.setAttribute("aria-hidden", "true"); }

  function renderBag() {
    var items = $("[data-items]", drawer), foot = $("[data-foot]", drawer);
    if (!bag.length) {
      items.innerHTML = '<p class="mute" style="margin-top:22px">Your bag is empty. Every piece is one of one, so when it\'s gone, it\'s gone.</p>';
      foot.innerHTML = '<a class="btn ghost" style="width:100%;text-align:center" href="shop.html">Browse the collection</a>';
      return;
    }
    items.innerHTML = bag.map(function (id) {
      var p = byId(id), im = p.images && p.images[0];
      return '<div class="line"><div class="th">' + (im ? '<img alt="" src="' + esc(imgPath(im)) + '">' : esc(p.id)) + "</div>" +
        "<div><div>" + esc(p.name) + '</div><div class="mono mute">' + esc([p.label, p.size && "Size " + p.size].filter(Boolean).join(" / ")) + '</div><button class="rm" data-rm="' + esc(id) + '">Remove</button></div>' +
        "<div>" + money(p.price) + "</div></div>";
    }).join("");
    foot.innerHTML = '<div class="total"><span>Total</span><strong>' + money(bagTotal()) + '</strong></div><button class="btn" style="width:100%" data-checkout>Check out with Venmo</button><p class="hint">One of one pieces. Shipping or pickup is arranged after you pay.</p>';
    $$("[data-rm]", items).forEach(function (b) { b.addEventListener("click", function () { setBag(bag.filter(function (i) { return i !== b.getAttribute("data-rm"); })); }); });
    $("[data-checkout]", foot).addEventListener("click", function () { closeBag(); openCheckout(); });
  }

  /* ---------- checkout / Venmo ---------- */
  function newOrderId() { return "WR-" + Date.now().toString(36).slice(-5).toUpperCase(); }
  function venmoLinks(amount, note) {
    var q = "txn=pay&recipients=" + encodeURIComponent(C.venmo) + "&amount=" + amount + "&note=" + encodeURIComponent(note);
    return { app: "venmo://paycharge?" + q, web: "https://venmo.com/u/" + encodeURIComponent(C.venmo) };
  }
  function openCheckout() {
    var body = $("[data-body]", checkDlg);
    var total = bagTotal();
    body.innerHTML =
      '<div class="piece"><form data-co novalidate><h2 class="disp h3" style="margin-bottom:16px">Your details</h2>' +
      '<div class="f"><label for="co-name">Name</label><input id="co-name" name="Name" type="text" autocomplete="name" required></div>' +
      '<div class="f"><label for="co-contact">Phone, email or Instagram</label><input id="co-contact" name="Contact" type="text" required></div>' +
      '<div class="f"><label for="co-del">Pickup or shipping</label><select id="co-del" name="Delivery"><option>Pickup at the showroom (by appointment)</option><option>Ship to me</option></select></div>' +
      '<div class="f" data-addr hidden><label for="co-addr">Shipping address</label><textarea id="co-addr" name="Address"></textarea></div>' +
      '<div class="f"><label for="co-notes">Notes (optional)</label><textarea id="co-notes" name="Notes"></textarea></div>' +
      '<p class="err" data-err hidden></p>' +
      '<button class="btn" type="submit">Continue to payment</button><p class="hint">' + esc(C.shipping || "") + "</p></form>" +
      '<div><h2 class="disp h3" style="margin-bottom:16px">Order summary</h2>' +
      bag.map(function (id) { var p = byId(id); return '<div class="line" style="grid-template-columns:1fr auto"><div>' + esc(p.name) + '<div class="mono mute">' + esc(p.id) + "</div></div><div>" + money(p.price) + "</div></div>"; }).join("") +
      '<div class="total" style="margin-top:14px"><span>Total</span><strong>' + money(total) + "</strong></div></div></div>";
    var form = $("[data-co]", body), del = $("#co-del", body);
    del.addEventListener("change", function () { $("[data-addr]", body).hidden = del.selectedIndex !== 1; });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var fd = new FormData(form), err = $("[data-err]", body);
      if (!fd.get("Name").trim() || !fd.get("Contact").trim()) { err.hidden = false; err.textContent = "Add your name and a way to reach you."; return; }
      if (del.selectedIndex === 1 && !String(fd.get("Address")).trim()) { err.hidden = false; err.textContent = "Add a shipping address."; return; }
      var orderId = newOrderId();
      var fields = { Order: orderId, Name: fd.get("Name"), Contact: fd.get("Contact"), Delivery: fd.get("Delivery"), Address: fd.get("Address"), Notes: fd.get("Notes"),
        Pieces: bag.map(function (id) { var p = byId(id); return p.id + " " + p.name + " (" + money(p.price) + ")"; }).join("; "), Total: money(total), Payment: "Awaiting Venmo to @" + C.venmo };
      var btn = $("button[type=submit]", form); btn.disabled = true; btn.textContent = "Sending...";
      deliver("New order " + orderId, fields).then(function (res) { showPay(orderId, total, fields, res, bag.slice()); });
    });
    checkDlg.showModal();
  }
  function showPay(orderId, total, fields, res, ids) {
    var body = $("[data-body]", checkDlg);
    var note = "Wear/Rare " + orderId + ": " + ids.join(", ");
    var links = venmoLinks(total, note);
    body.innerHTML =
      '<h2 class="disp h2">Pay with Venmo</h2><p class="lede">Order <strong>' + esc(orderId) + "</strong> for <strong>" + money(total) + "</strong>.</p>" +
      '<div class="notice"><p class="mono" style="margin:0 0 6px">Pay to</p><p style="margin:0;font-size:22px">@' + esc(C.venmo) + '</p><p class="hint" style="margin-top:8px">Amount <strong>' + money(total) + "</strong>. In the note, write <strong>" + esc(note) + "</strong>.</p></div>" +
      '<div class="row"><a class="btn" data-venmo href="' + esc(IS_MOBILE ? links.app : links.web) + '"' + (IS_MOBILE ? "" : ' target="_blank" rel="noopener"') + '>Open Venmo</a><button class="btn ghost" data-cp>Copy note</button></div>' +
      (IS_MOBILE ? '<p class="hint">Venmo not opening? <a href="' + esc(links.web) + '" target="_blank" rel="noopener">Use the Venmo website</a>.</p>' : "") +
      (res.sent ? '<p class="hint" style="margin-top:18px">Your order details were sent to him. After you pay, he confirms by message and holds your pieces.</p>' : fallbackHtml(res.text)) +
      '<hr class="rule" style="margin:22px 0"><button class="btn ghost" data-paid>I have paid</button>';
    $("[data-cp]", body).addEventListener("click", function (e) { copy(note); e.target.textContent = "Copied"; });
    if (!res.sent) wireFallback(body, res.text);
    if (IS_MOBILE) $("[data-venmo]", body).addEventListener("click", function () { setTimeout(function () { if (!document.hidden) window.open(links.web, "_blank"); }, 1400); });
    $("[data-paid]", body).addEventListener("click", function () {
      setBag([]);
      body.innerHTML = '<div class="ok"><h2 class="disp h2">Thank you.</h2><p class="lede">Order ' + esc(orderId) + ' is in. He will confirm your payment and message you about pickup or shipping.</p><p>Questions? Message <a href="' + dmLink() + '" target="_blank" rel="noopener">@' + esc(C.igHandle) + '</a>.</p><a class="btn" href="shop.html">Keep browsing</a></div>';
    });
  }

  /* ---------- pieces ---------- */
  var TAG = { available: "", hold: "On hold", sold: "Sold", archive: "Archive", coming: "Coming soon" };
  function plate(p) {
    var cover = p.images && p.images[0], alt = p.images && p.images[1];
    var live = p.status !== "coming";
    var html = '<div class="photo">' +
      (cover ? '<img src="' + esc(imgPath(cover)) + '" alt="' + esc(p.name) + '" loading="lazy">' + (alt ? '<img class="alt" src="' + esc(imgPath(alt)) + '" alt="" loading="lazy">' : "")
        : '<div class="ph"><div><b>' + esc(p.id) + '</b><span class="mono mute">Photo coming soon</span></div></div>') +
      (TAG[p.status] ? '<span class="tag">' + TAG[p.status] + "</span>" : "") + "</div>" +
      '<div class="meta"><div class="row2"><span class="name">' + esc(p.name) + "</span>" + (isBuyable(p) ? "<strong>" + money(p.price) + "</strong>" : "") + "</div>" +
      '<span class="mono mute">' + esc([p.label, p.era, p.size && "Size " + p.size].filter(Boolean).join("  /  ") || p.id) + "</span></div>";
    var n = el(live ? '<button class="plate ' + esc(p.status) + '" data-pid="' + esc(p.id) + '">' + html + "</button>" : '<div class="plate ' + esc(p.status) + '" data-pid="' + esc(p.id) + '" style="cursor:default">' + html + "</div>");
    if (live) n.addEventListener("click", function () { openPiece(p.id); });
    return n;
  }
  function syncButtons() { /* hook for future per-card state */ }
  function openPiece(id) {
    var p = byId(id), body = $("[data-body]", pieceDlg), imgs = p.images || [];
    $("[data-pno]", pieceDlg).textContent = "No. " + p.id;
    var spec = [["Label", p.label], ["Era", p.era], ["Size", p.size], ["Condition", p.condition], ["Category", p.category]].filter(function (r) { return r[1]; });
    var action;
    if (isBuyable(p)) action = inBag(p.id) ? '<button class="btn" data-viewbag>In your bag - view bag</button>' : '<button class="btn" data-add>Add to bag - ' + money(p.price) + "</button>";
    else if (p.status === "archive") action = '<p class="notice">This piece lives in The Archive and is not for sale. Curious about it? <a href="' + dmLink() + '" target="_blank" rel="noopener">Message him</a>.</p>';
    else action = '<button class="btn" disabled>' + (p.status === "sold" ? "Sold" : "On hold") + "</button>";
    body.innerHTML = '<div class="piece"><div><div class="big">' + (imgs[0] ? '<img data-big src="' + esc(imgPath(imgs[0])) + '" alt="' + esc(p.name) + '">' : "") + '</div>' +
      (imgs.length > 1 ? '<div class="thumbs">' + imgs.map(function (f, i) { return '<button data-th="' + i + '" aria-label="Photo ' + (i + 1) + '"><img src="' + esc(imgPath(f)) + '" alt=""></button>'; }).join("") + "</div>" : "") + "</div>" +
      '<div><h2 class="disp h2">' + esc(p.name) + "</h2>" + (isBuyable(p) ? '<p style="font-size:24px;margin:10px 0 0">' + money(p.price) + "</p>" : "") +
      (spec.length ? '<dl class="spec">' + spec.map(function (r) { return "<dt>" + r[0] + "</dt><dd>" + esc(r[1]) + "</dd>"; }).join("") + "</dl>" : "") +
      (p.story ? "<p>" + esc(p.story) + "</p>" : "") + '<div style="margin-top:20px">' + action + "</div></div></div>";
    $$("[data-th]", body).forEach(function (b) { b.addEventListener("click", function () { $("[data-big]", body).src = imgPath(imgs[+b.getAttribute("data-th")]); }); });
    var add = $("[data-add]", body); if (add) add.addEventListener("click", function () { setBag(bag.concat([p.id])); pieceDlg.close(); openBag(); });
    var vb = $("[data-viewbag]", body); if (vb) vb.addEventListener("click", function () { pieceDlg.close(); openBag(); });
    pieceDlg.showModal();
  }

  function mountPieces() {
    $$('[data-mount="shop"]').forEach(function (root) {
      var list = PRODUCTS.filter(function (p) { return p.status !== "archive" && p.category !== "Archive"; });
      var cats = []; list.forEach(function (p) { if (p.category && cats.indexOf(p.category) < 0) cats.push(p.category); });
      var state = { cat: "All", onlyAvail: false };
      var chips = el('<div class="chips" role="group" aria-label="Filter pieces"></div>');
      function chip(label, on, fn) { var b = el('<button class="chip" aria-pressed="' + on + '">' + esc(label) + "</button>"); b.addEventListener("click", fn); return b; }
      var grid = el('<div class="grid g3"></div>');
      function draw() {
        chips.innerHTML = "";
        ["All"].concat(cats).forEach(function (c) { chips.appendChild(chip(c, state.cat === c, function () { state.cat = c; draw(); })); });
        chips.appendChild(chip("Available only", state.onlyAvail, function () { state.onlyAvail = !state.onlyAvail; draw(); }));
        grid.innerHTML = "";
        var shown = list.filter(function (p) { return (state.cat === "All" || p.category === state.cat) && (!state.onlyAvail || p.status === "available"); });
        var order = { available: 0, hold: 1, coming: 2, sold: 3 };
        shown.sort(function (a, b) { return (order[a.status] || 0) - (order[b.status] || 0); });
        if (!shown.length) grid.appendChild(el('<p class="empty" style="grid-column:1/-1">Nothing here right now. New pieces land often, follow <a href="https://instagram.com/' + C.igHandle + '">@' + esc(C.igHandle) + "</a>.</p>"));
        shown.forEach(function (p) { grid.appendChild(plate(p)); });
      }
      root.appendChild(chips); root.appendChild(grid); draw();
    });
    $$('[data-mount="featured"]').forEach(function (root) {
      var n = +root.getAttribute("data-limit") || 3;
      var pool = PRODUCTS.filter(function (p) { return p.status === "available"; });
      if (pool.length < n) pool = pool.concat(PRODUCTS.filter(function (p) { return p.status === "coming" && p.category !== "Archive"; }));
      var grid = el('<div class="grid g3"></div>');
      pool.slice(0, n).forEach(function (p) { grid.appendChild(plate(p)); });
      root.appendChild(grid);
    });
    $$('[data-mount="archive"]').forEach(function (root) {
      var list = PRODUCTS.filter(function (p) { return p.status === "archive" || p.category === "Archive"; });
      var grid = el('<div class="grid g3"></div>');
      list.forEach(function (p) { grid.appendChild(plate(p)); });
      root.appendChild(grid);
    });
  }

  /* ---------- generic request forms (Sip & Thrift invite) ---------- */
  function googleEmbed(url, title, h) {
    var open = '<p style="margin:12px 0 0"><a class="btn sm ghost" href="' + esc(url) + '" target="_blank" rel="noopener">Open in a new tab</a></p>';
    var canFrame = /docs\.google\.com\/forms|calendar\.google\.com/.test(url);
    var src = url + (/docs\.google\.com\/forms/.test(url) && url.indexOf("embedded=true") < 0 ? (url.indexOf("?") < 0 ? "?" : "&") + "embedded=true" : "");
    return el('<div class="panel">' + (canFrame ? '<iframe title="' + esc(title) + '" src="' + esc(src) + '" style="width:100%;height:' + h + 'px;border:0;background:#fff" loading="lazy"></iframe>' : '<p>Tap below to open the form.</p>') + open + "</div>");
  }
  function mountForms() {
    $$("form[data-request]").forEach(function (form) {
      var gurl = C.google && C.google.forms && C.google.forms[form.getAttribute("data-gform")];
      if (gurl) { form.replaceWith(googleEmbed(gurl, form.getAttribute("data-request"), 820)); return; }
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (form.elements["company"] && form.elements["company"].value) return; // honeypot
        var err = $(".err", form); if (err) err.hidden = true;
        var missing = $$("[required]", form).filter(function (i) { return !String(i.value).trim(); });
        if (missing.length) { if (err) { err.hidden = false; err.textContent = "Please fill in: " + missing.map(function (m) { return m.getAttribute("data-label") || m.name; }).join(", "); } return; }
        var fields = {}; new FormData(form).forEach(function (v, k) { if (k !== "company") fields[k] = v; });
        var btn = $("button[type=submit]", form); btn.disabled = true; btn.textContent = "Sending...";
        deliver(form.getAttribute("data-request"), fields).then(function (res) {
          var box = el('<div class="ok"><h3 class="disp h3">' + (res.sent ? "Request received." : "Almost there.") + "</h3>" +
            "<p>" + esc(form.getAttribute("data-thanks") || "He will be in touch.") + "</p>" + (res.sent ? "" : fallbackHtml(res.text)) + "</div>");
          form.replaceWith(box); if (!res.sent) wireFallback(box, res.text);
        });
      });
    });
  }

  /* ---------- booking ---------- */
  function mountBooking() {
    var root = $('[data-mount="booking"]'); if (!root) return;
    var gb = C.google && C.google.bookingUrl;
    if (gb) {
      root.appendChild(el('<p class="lede" style="margin-bottom:18px">Pick a time that works. You will get a confirmation, and the showroom address is shared with confirmed guests. Booking a Closet Edit? Add the address he should travel to in the form.</p>'));
      root.appendChild(googleEmbed(gb, "Book an appointment", 780));
      return;
    }
    var S = { service: null, date: null, time: null };
    var wanted = new URLSearchParams(location.search).get("service");
    var svc = C.services || [];
    S.service = (svc.filter(function (s) { return s.id === wanted; })[0] || svc[0] || {}).id;
    var now = new Date();

    function slotsFor(d) {
      var h = C.hours[d.getDay()], out = [];
      if (!h) return out;
      var key = d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
      if ((C.closedDates || []).indexOf(key) > -1) return out;
      var a = h[0].split(":"), b = h[1].split(":");
      var t = new Date(d.getFullYear(), d.getMonth(), d.getDate(), +a[0], +a[1]);
      var end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), +b[0], +b[1]);
      var earliest = now.getTime() + (C.leadHours || 0) * 3600 * 1000;
      while (t.getTime() + C.slotMinutes * 60000 <= end.getTime()) {
        if (t.getTime() >= earliest) out.push(new Date(t));
        t = new Date(t.getTime() + (C.slotStep || C.slotMinutes) * 60000);
      }
      return out;
    }
    var days = [];
    for (var i = 0; i <= (C.daysAhead || 42); i++) { var d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i); if (slotsFor(d).length) days.push(d); }
    function fmtTime(t) { var h = t.getHours(), m = t.getMinutes(); return ((h % 12) || 12) + (m ? ":" + pad(m) : "") + " " + (h < 12 ? "AM" : "PM"); }
    var DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    root.innerHTML =
      '<form class="steps" novalidate>' +
      '<div class="step"><span class="lab">What would you like</span><div class="chips" data-svc></div><p class="hint" data-blurb></p></div>' +
      '<div class="step"><span class="lab">Pick a day</span>' + (days.length ? '<div class="days" data-days></div>' : '<div class="notice">Appointment days are being set. Send your preferred dates in the notes below and he will reply.</div>') + "</div>" +
      '<div class="step" data-timestep hidden><span class="lab">Pick a time</span><div class="slots" data-slots></div></div>' +
      '<div class="step"><span class="lab">Your details</span>' +
      '<div class="two"><div class="f"><label for="b-name">Name</label><input id="b-name" name="Name" type="text" autocomplete="name" required data-label="name"></div>' +
      '<div class="f"><label for="b-contact">Phone, email or Instagram</label><input id="b-contact" name="Contact" type="text" required data-label="contact"></div></div>' +
      '<div class="two"><div class="f"><label for="b-guests">Guests</label><select id="b-guests" name="Guests"></select></div>' +
      '<div class="f"><label for="b-email">Email (for your calendar invite)</label><input id="b-email" name="Email" type="email" autocomplete="email"></div></div>' +
      '<div class="f" data-travel hidden><label for="b-addr">Address he will travel to</label><textarea id="b-addr" name="Travel address" placeholder="Street, city, apartment or gate details"></textarea><p class="hint">He comes to you for this service. This goes to him only.</p></div>' +
      '<div class="f"><label for="b-notes">What are you looking for?</label><textarea id="b-notes" name="Notes" placeholder="Labels, eras, an occasion, sizes..."></textarea></div>' +
      '<input class="hp" type="text" name="company" tabindex="-1" autocomplete="off" aria-hidden="true">' +
      '<p class="err" data-err hidden></p><button class="btn" type="submit">Request this appointment</button>' +
      '<p class="hint">' + esc(C.showroomNote || "") + " Appointments are requests until he confirms.</p></div></form>";

    var form = $("form", root), svcBox = $("[data-svc]", root);
    var gs = $("#b-guests", root); for (var g = 1; g <= (C.maxGuests || 4); g++) gs.appendChild(el("<option>" + g + "</option>"));

    function drawSvc() {
      svcBox.innerHTML = "";
      svc.forEach(function (s) {
        var b = el('<button type="button" class="chip" aria-pressed="' + (S.service === s.id) + '">' + esc(s.name) + "</button>");
        b.addEventListener("click", function () { S.service = s.id; drawSvc(); }); svcBox.appendChild(b);
      });
      var cur = svc.filter(function (s) { return s.id === S.service; })[0];
      $("[data-blurb]", root).textContent = cur ? cur.blurb + (cur.price ? "  " + cur.price : "") : "";
      var tr = $("[data-travel]", root); if (tr) tr.hidden = !(cur && cur.travel);
    }
    function drawDays() {
      var box = $("[data-days]", root); if (!box) return; box.innerHTML = "";
      days.forEach(function (d) {
        var b = el('<button type="button" class="day" aria-pressed="' + (S.date && +S.date === +d) + '">' + DOW[d.getDay()] + "<b>" + d.getDate() + "</b>" + MON[d.getMonth()] + "</button>");
        b.addEventListener("click", function () { S.date = d; S.time = null; drawDays(); drawSlots(); }); box.appendChild(b);
      });
    }
    function drawSlots() {
      var step = $("[data-timestep]", root), box = $("[data-slots]", root);
      if (!S.date) { step.hidden = true; return; }
      step.hidden = false; box.innerHTML = "";
      slotsFor(S.date).forEach(function (t) {
        var b = el('<button type="button" class="slot" aria-pressed="' + (S.time && +S.time === +t) + '">' + fmtTime(t) + "</button>");
        b.addEventListener("click", function () { S.time = t; drawSlots(); }); box.appendChild(b);
      });
    }
    drawSvc(); drawDays();

    function ics(start, summary, desc) {
      var end = new Date(start.getTime() + C.slotMinutes * 60000);
      function f(d) { return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + "T" + pad(d.getHours()) + pad(d.getMinutes()) + "00"; }
      var stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
      return "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Wear Rare//EN\r\nBEGIN:VEVENT\r\nUID:" + Date.now() + "@wearrare\r\nDTSTAMP:" + stamp + "\r\nDTSTART:" + f(start) + "\r\nDTEND:" + f(end) +
        "\r\nSUMMARY:" + summary + "\r\nDESCRIPTION:" + desc.replace(/\n/g, "\\n") + "\r\nEND:VEVENT\r\nEND:VCALENDAR";
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (form.elements["company"].value) return;
      var err = $("[data-err]", root), name = form.elements["Name"].value.trim(), contact = form.elements["Contact"].value.trim();
      if (days.length && (!S.date || !S.time)) { err.hidden = false; err.textContent = "Pick a day and a time."; return; }
      if (!name || !contact) { err.hidden = false; err.textContent = "Add your name and a way to reach you."; return; }
      var cur = svc.filter(function (s) { return s.id === S.service; })[0] || { name: "Appointment" };
      var addr = form.elements["Travel address"].value.trim();
      if (cur.travel && !addr) { err.hidden = false; err.textContent = "Add the address he should travel to."; return; }
      err.hidden = true;
      var when = S.time ? DOW[S.time.getDay()] + " " + MON[S.time.getMonth()] + " " + S.time.getDate() + ", " + fmtTime(S.time) : "";
      var fields = { Service: cur.name, When: when, Name: name, Contact: contact, Email: form.elements["Email"].value, Guests: form.elements["Guests"].value, "Travel address": cur.travel ? addr : "", Notes: form.elements["Notes"].value, Status: "REQUESTED - confirm with guest" };
      var btn = $("button[type=submit]", form); btn.disabled = true; btn.textContent = "Sending...";
      deliver("Appointment request: " + cur.name + (when ? " - " + when : ""), fields).then(function (res) {
        var cal = "";
        if (S.time) {
          var data = ics(S.time, "Wear/Rare - " + cur.name + " (requested)", "Requested appointment. Wear/Rare will confirm. " + (C.showroomNote || ""));
          cal = '<a class="btn sm ghost" download="wear-rare-appointment.ics" href="data:text/calendar;charset=utf-8,' + encodeURIComponent(data) + '">Add to my calendar</a>';
        }
        var box = el('<div class="ok"><h2 class="disp h2">' + (res.sent ? "Request sent." : "Almost there.") + "</h2><p class=\"lede\">" + esc(cur.name) + (when ? " &middot; " + esc(when) : "") + "</p>" +
          "<p>It's a request until he confirms. Watch for his message" + (fields.Email ? " at " + esc(fields.Email) : "") + ".</p>" + (res.sent ? "" : fallbackHtml(res.text)) + '<div class="row" style="margin-top:14px">' + cal + "</div></div>");
        form.replaceWith(box); if (!res.sent) wireFallback(box, res.text);
        box.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    });
  }

  /* ---------- services list (Stylist page) ---------- */
  function mountServices() {
    $$('[data-mount="services"]').forEach(function (root) {
      var ul = el('<ul class="list"></ul>');
      (C.services || []).forEach(function (s) {
        ul.appendChild(el('<li><span class="disp h3">' + esc(s.name) + '</span><span><span class="mono mute" style="margin-right:14px">' + esc(s.price || "Inquire") + '</span><a class="btn sm" href="book.html?service=' + encodeURIComponent(s.id) + '">Book</a></span><p>' + esc(s.blurb) + "</p></li>"));
      });
      root.appendChild(ul);
    });
  }

  /* ---------- nav / year ---------- */
  function mountNav() {
    var here = location.pathname.split("/").pop() || "index.html";
    $$(".nav li a").forEach(function (a) { if (a.getAttribute("href") === here) a.setAttribute("aria-current", "page"); });
    $$("[data-year]").forEach(function (n) { n.textContent = new Date().getFullYear(); });
    $$("[data-sip-date]").forEach(function (n) { var s = C.sipThrift || {}; n.textContent = s.date ? s.date + (s.time ? ", " + s.time : "") : "Date announced soon"; });
  }

  mountChrome(); mountNav(); mountPieces(); mountServices(); mountForms(); mountBooking();
})();
