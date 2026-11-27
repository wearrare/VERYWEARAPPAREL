/* VERY WEAR APPAREL - site behaviour. No build step, no dependencies. */
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
    var body = Object.assign({ subject: subject, from_name: "Very Wear Apparel website" }, fields);
    if (C.formAccessKey) body.access_key = C.formAccessKey;
    return fetch(C.formEndpoint, { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(body) })
      .then(function (r) { return { sent: r.ok, text: text }; })
      .catch(function () { return { sent: false, text: text }; });
  }
  function fallbackHtml(text) {
    var mail = C.email ? '<a class="btn sm ghost" href="mailto:' + esc(C.email) + "?subject=" + encodeURIComponent(text.split("\n")[0]) + "&body=" + encodeURIComponent(text) + '">Email it</a>' : "";
    return '<div class="notice"><p class="mono" style="margin:0 0 8px">One more step</p>' +
      "<p style=\"margin:0 0 12px\">Your request is ready. Send it to the shop and we'll confirm.</p>" +
      '<textarea readonly rows="7" aria-label="Your request text">' + esc(text) + "</textarea>" +
      '<div class="row" style="margin-top:12px"><button type="button" class="btn sm" data-copy>Copy request</button>' +
      '<a class="btn sm ghost" target="_blank" rel="noopener" href="' + dmLink() + '" data-dm>Open Instagram DM</a>' + mail + "</div>" +
      '<p class="hint">Paste it into the DM so it reaches us.</p></div>';
  }
  function wireFallback(root, text) {
    $$("[data-copy]", root).forEach(function (b) { b.addEventListener("click", function () { copy(text); b.textContent = "Copied"; }); });
    $$("[data-dm]", root).forEach(function (a) { a.addEventListener("click", function () { copy(text); }); });
  }

  /* ---------- bag ---------- */
  var bag = load(BAG_KEY, []).filter(function (id) { var p = byId(id); return p && isBuyable(p); });
  function bagTotal() { return bag.reduce(function (s, id) { return s + byId(id).price; }, 0); }
  var SH = C.shipping || {};
  // price for n pieces to a region ("us" or "intl"; intl needs the country). null = message us for shipping.
  function shipFor(region, n, country) {
    if (n < 1 || n > (SH.maxPieces || 3)) return null;
    if (region === "us") return n === 1 ? +SH.us.one : +SH.us.few;
    var g = SH.intl && SH.intl.countries && SH.intl.countries[country], row = g && SH.intl.groups[g];
    return row ? row[n === 1 ? 0 : 1] : null;
  }
  function sendOrder(fields, subject) {
    var F = C.orderForm || {};
    if (!F.action) return deliver(subject, fields);
    var map = { order: fields.Order, name: fields.Name, email: fields.Email, country: fields.Country, codes: fields.Codes, pieces: fields.Pieces, shipping: fields.ShippingPaid, total: fields.Total, address: fields.Address, notes: fields.Notes };
    var body = new URLSearchParams();
    Object.keys(map).forEach(function (k) { if (F.fields && F.fields[k]) body.append(F.fields[k], map[k] == null ? "" : String(map[k])); });
    return fetch(F.action, { method: "POST", mode: "no-cors", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: body.toString() })
      .then(function () { return { sent: true, text: "" }; })
      .catch(function () { return deliver(subject, fields); });
  }
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
    foot.innerHTML = '<div class="total"><span>Subtotal</span><strong>' + money(bagTotal()) + '</strong></div><p class="hint" style="margin:-4px 0 12px">Shipping is added at checkout.</p>' +
      (bag.length > (SH.maxPieces || 3) ? '<div class="notice" style="margin:0 0 12px"><p style="margin:0 0 10px">For 4 or more pieces, message us for shipping.</p><a class="btn sm" href="' + dmLink() + '" target="_blank" rel="noopener">Message Us On Instagram</a></div>' :
        '<button class="btn" style="width:100%" data-checkout>Check Out - United States</button><a class="btn ghost" style="width:100%;text-align:center;margin-top:10px" href="international.html">Check Out - International</a>') +
      '<p class="hint">One of one pieces. Shipping is paid with your order. All sales are final.</p>';
    $$("[data-rm]", items).forEach(function (b) { b.addEventListener("click", function () { setBag(bag.filter(function (i) { return i !== b.getAttribute("data-rm"); })); }); });
    var co = $("[data-checkout]", foot); if (co) co.addEventListener("click", function () { closeBag(); openCheckout(); });
  }

  /* ---------- checkout / Venmo ---------- */
  function newOrderId() { return "VWA-" + Date.now().toString(36).slice(-5).toUpperCase(); }
  function venmoLinks(amount, note) {
    var q = "txn=pay&recipients=" + encodeURIComponent(C.venmo) + "&amount=" + amount + "&note=" + encodeURIComponent(note);
    return { app: "venmo://paycharge?" + q, web: "https://venmo.com/u/" + encodeURIComponent(C.venmo) };
  }
  function openCheckout() { renderCheckout($("[data-body]", checkDlg), "us"); checkDlg.showModal(); }
  function renderCheckout(body, region) {
    var intl = region === "intl", n = bag.length, sub = bagTotal();
    if (!n) { body.innerHTML = '<div class="ok"><h2 class="disp h2">Your Bag Is Empty</h2><p class="lede">Add a piece first.</p><a class="btn" href="shop.html">Browse The Collection</a></div>'; return; }
    var countries = intl ? Object.keys(SH.intl.countries).sort() : [];
    body.innerHTML =
      '<div class="piece"><form data-co novalidate><h2 class="disp h3" style="margin-bottom:16px">' + (intl ? "International Order" : "Your Details") + '</h2>' +
      '<div class="f"><label for="co-name">Name</label><input id="co-name" name="Name" type="text" autocomplete="name" required></div>' +
      '<div class="f"><label for="co-email">Email</label><input id="co-email" name="Email" type="email" autocomplete="email" required></div>' +
      (!intl && SH.pickup ? '<div class="f"><label for="co-del">Delivery</label><select id="co-del" name="Delivery"><option value="ship">Ship it to me</option><option value="pickup">Local pickup (' + esc(SH.pickup.area) + ')</option></select><p class="hint" data-pickhint hidden>' + esc(SH.pickup.note) + '</p></div>' : "") +
      (intl ? '<div class="f"><label for="co-country">Country</label><select id="co-country" name="Country" autocomplete="country-name"><option value="">Choose your country</option>' + countries.map(function (c) { return "<option>" + esc(c) + "</option>"; }).join("") + '</select></div>' : "") +
      '<div class="f" data-shipaddr><label for="co-addr">Shipping address' + (intl ? " (full address, local format)" : "") + '</label><textarea id="co-addr" name="Address" rows="4" autocomplete="street-address" required></textarea></div>' +
      '<div class="f" data-pickaddr hidden><label for="co-town">Your town</label><input id="co-town" name="Town" type="text"></div>' +
      '<div class="f"><label for="co-notes">Notes (optional)</label><textarea id="co-notes" name="Notes"></textarea></div>' +
      '<p class="err" data-err hidden></p>' +
      '<div class="notice" data-dm hidden style="margin:0 0 14px"><p style="margin:0 0 10px">For 4 or more pieces, message us for shipping.</p><a class="btn sm" href="' + dmLink() + '" target="_blank" rel="noopener">Message Us On Instagram</a></div>' +
      '<button class="btn" type="submit" data-go>Continue To Payment</button>' +
      '<p class="hint"><strong>' + esc(SH.handling || "") + '</strong></p><p class="hint">' + (intl ? "Ships by " + esc(SH.intl.service) + ". Delivery time varies by destination and is not guaranteed. Tracking is available to select countries only. The destination country may charge import duties, taxes and fees. If they are not prepaid, the buyer usually pays them. Other restrictions may apply by country." : "Ships by " + esc(SH.us.service) + ".") + '</p>' +
      '<p class="hint"><strong>All sales are final. No returns.</strong> Questions? <a href="' + dmLink() + '" target="_blank" rel="noopener">Message us on Instagram</a>.</p>' +
      (intl ? "" : '<p class="hint">Shipping outside the United States? <a href="international.html">Use the international order page</a>.</p>') + '</form>' +
      '<div><h2 class="disp h3" style="margin-bottom:16px">Order Summary</h2>' +
      bag.map(function (id) { var p = byId(id); return '<div class="line" style="grid-template-columns:1fr auto"><div>' + esc(p.name) + '<div class="mono mute">' + esc(p.id) + "</div></div><div>" + money(p.price) + "</div></div>"; }).join("") +
      '<div class="line" style="grid-template-columns:1fr auto"><div>Subtotal</div><div>' + money(sub) + '</div></div>' +
      '<div class="line" style="grid-template-columns:1fr auto"><div>Shipping <span class="mono mute" data-shipname></span></div><div data-shipamt></div></div>' +
      '<div class="total" style="margin-top:14px"><span>Total</span><strong data-total></strong></div>' +
      (intl ? '<p class="hint" style="margin-top:14px"><a href="shop.html">Back to the shop</a></p>' : "") + '</div></div>';
    var form = $("[data-co]", body), sel = intl ? $("#co-country", body) : null;
    var delSel = $("#co-del", body);
    function pick() { return !!delSel && delSel.value === "pickup"; }
    function cur() { return pick() ? 0 : shipFor(region, n, intl ? sel.value : ""); }
    function sync() {
      var sc = cur(), tooMany = !pick() && n > (SH.maxPieces || 3), go = $("[data-go]", body);
      var pk = pick(); $("[data-shipaddr]", body).hidden = pk; $("[data-pickaddr]", body).hidden = !pk; var ph = $("[data-pickhint]", body); if (ph) ph.hidden = !pk;
      $("[data-dm]", body).hidden = !tooMany;
      $("[data-shipname]", body).textContent = pk ? "Local pickup" : (intl ? (sel.value || "") : "United States");
      $("[data-shipamt]", body).textContent = tooMany ? "Message us" : (pk ? "Free" : (sc == null ? "Choose country" : money(sc)));
      $("[data-total]", body).textContent = sc == null ? "-" : money(sub + sc);
      go.disabled = sc == null;
    }
    if (sel) sel.addEventListener("change", sync); if (delSel) delSel.addEventListener("change", sync); sync();
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var fd = new FormData(form), err = $("[data-err]", body), sc = cur();
      var email = String(fd.get("Email")).trim();
      if (sc == null) { err.hidden = false; err.textContent = intl ? "Choose your country so we can price shipping." : "Message us for shipping on 4 or more pieces."; return; }
      if (!fd.get("Name").trim()) { err.hidden = false; err.textContent = "Add your name."; return; }
      if (!/^\S+@\S+\.\S+$/.test(email)) { err.hidden = false; err.textContent = "Add a valid email so we can send your confirmation and tracking."; return; }
      var pk = pick(), town = String(fd.get("Town") || "").trim();
      if (pk && !town) { err.hidden = false; err.textContent = "Add your town so we can confirm pickup is local."; return; }
      if (!pk && !String(fd.get("Address")).trim()) { err.hidden = false; err.textContent = "Add your shipping address."; return; }
      var total = sub + sc, orderId = newOrderId(), country = intl ? sel.value : "United States";
      var fields = { Order: orderId, Name: fd.get("Name"), Email: email, Country: country, Codes: bag.join(", "), ShippingPaid: pk ? "$0 (local pickup)" : money(sc), Address: pk ? "LOCAL PICKUP - town: " + town : fd.get("Address"), Notes: fd.get("Notes"),
        Pieces: bag.map(function (id) { var p = byId(id); return p.id + " " + p.name + " (" + money(p.price) + ")"; }).join("; "), Subtotal: money(sub), Total: money(total), Payment: "Awaiting Venmo to @" + C.venmo };
      var btn = $("[data-go]", form); btn.disabled = true; btn.textContent = "Sending...";
      sendOrder(fields, "New order " + orderId + " " + money(total)).then(function (res) { fields._sub = sub; fields._ship = sc; showPay(body, orderId, total, fields, res, bag.slice()); });
    });
  }
  function showPay(body, orderId, total, fields, res, ids) {
    var note = "Order " + orderId + ", shirt " + ids.join(", ");
    var links = venmoLinks(total, note);
    body.innerHTML =
      '<h2 class="disp h2">Pay with Venmo</h2><p class="lede">Order <strong>' + esc(orderId) + "</strong> for <strong>" + money(total) + "</strong> <span class=\"mono mute\">(" + money(fields._sub) + " pieces + " + money(fields._ship) + " shipping)</span>.</p>" +
      '<div class="notice"><p class="mono" style="margin:0 0 6px">Pay to</p><p style="margin:0;font-size:22px">@' + esc(C.venmo) + '</p><p class="hint" style="margin-top:8px">Amount <strong>' + money(total) + "</strong>. Keep the shirt " + (ids.length > 1 ? "codes" : "code") + " in the Venmo note so we can match your payment: <strong>" + esc(note) + "</strong></p></div>" +
      '<div class="row"><a class="btn" data-venmo href="' + esc(IS_MOBILE ? links.app : links.web) + '"' + (IS_MOBILE ? "" : ' target="_blank" rel="noopener"') + '>Open Venmo</a><button class="btn ghost" data-cp>Copy note</button></div>' +
      (IS_MOBILE ? '<p class="hint">Venmo not opening? <a href="' + esc(links.web) + '" target="_blank" rel="noopener">Use the Venmo website</a>.</p>' : "") +
      (res.sent ? '<p class="hint" style="margin-top:18px">Your order details were sent. After you pay, we confirm by message and hold your pieces.</p>' : fallbackHtml(res.text)) +
      '<hr class="rule" style="margin:22px 0"><button class="btn ghost" data-paid>I have paid</button>';
    $("[data-cp]", body).addEventListener("click", function (e) { copy(note); e.target.textContent = "Copied"; });
    if (!res.sent) wireFallback(body, res.text);
    if (IS_MOBILE) $("[data-venmo]", body).addEventListener("click", function () { setTimeout(function () { if (!document.hidden) window.open(links.web, "_blank"); }, 1400); });
    $("[data-paid]", body).addEventListener("click", function () {
      setBag([]);
      body.innerHTML = '<div class="ok"><h2 class="disp h2">Thank you.</h2><p class="lede">Order ' + esc(orderId) + ' is in.</p><div class="notice"><p class="mono" style="margin:0 0 8px">What Happens Next</p><ol style="margin:0;padding-left:20px"><li>We see your Venmo payment and match it to your shirt code.</li><li>We email you to confirm your order.</li><li>We pack it and ship it by USPS within 2 to 7 days of your payment, and email your tracking number. Local pickup: we email you to set a time and share the pickup address.</li></ol></div>' + ((C.orderForm && C.orderForm.fixUrl) ? '<p>Need to fix your address? <a href="' + esc(C.orderForm.fixUrl) + '" target="_blank" rel="noopener">Send your shipping details again</a>.</p>' : "") + '<p>Questions? Message <a href="' + dmLink() + '" target="_blank" rel="noopener">@' + esc(C.igHandle) + '</a>. All sales are final.</p><a class="btn" href="shop.html">Keep browsing</a></div>';
    });
  }

  /* ---------- pieces ---------- */
  var TAG = { available: "", hold: "On hold", sold: "Sold", archive: "Archive", coming: "Coming soon" };
  function thumb(f) { return /^https?:/.test(f) ? f : f.replace(/\.jpg$/, "-t.jpg"); }
  function plate(p) {
    var cover = p.images && p.images[0], alt = p.images && p.images[1];
    if (p.thumbs) { cover = cover && thumb(cover); alt = alt && thumb(alt); }
    var live = p.status !== "coming";
    var html = '<div class="photo">' +
      (cover ? '<img src="' + esc(imgPath(cover)) + '" alt="' + esc(p.name) + '" loading="lazy">' + (alt ? '<img class="alt" src="' + esc(imgPath(alt)) + '" alt="" loading="lazy">' : "")
        : '<div class="ph"><div><b>' + esc(p.id) + '</b><span class="mono mute">Photo coming soon</span></div></div>') +
      (TAG[p.status] ? '<span class="tag">' + TAG[p.status] + "</span>" : "") + "</div>" +
      '<div class="meta"><div class="row2"><span class="name">' + esc(p.name) + "</span>" + (isBuyable(p) ? "<strong>" + money(p.price) + "</strong>" : "") + "</div>" +
      '<span class="mono mute">' + esc([p.label, p.era, p.size && "Size " + p.size].filter(Boolean).join("  /  ") || p.id) + "</span></div>";
    var hasPage = live && p.status !== "archive" && p.category !== "Archive" && p.images && p.images.length;
    var n = el(hasPage ? '<a class="plate ' + esc(p.status) + '" data-pid="' + esc(p.id) + '" href="piece-' + esc(p.id.toLowerCase()) + '.html">' + html + "</a>" : live ? '<button class="plate ' + esc(p.status) + '" data-pid="' + esc(p.id) + '">' + html + "</button>" : '<div class="plate ' + esc(p.status) + '" data-pid="' + esc(p.id) + '" style="cursor:default">' + html + "</div>");
    if (live) n.addEventListener("click", function (e) { if (e.metaKey || e.ctrlKey || e.shiftKey || e.button) return; e.preventDefault(); openPiece(p.id); });
    return n;
  }
  function syncButtons() { /* hook for future per-card state */ }
  function openPiece(id) {
    var p = byId(id), body = $("[data-body]", pieceDlg), imgs = p.images || [];
    $("[data-pno]", pieceDlg).textContent = "No. " + p.id;
    var spec = [["Label", p.label], ["Era", p.era], ["Size", p.size], ["Condition", p.condition], ["Category", p.category],
      ["Pit to pit", p.pit && p.pit + " in"], ["Length", p.length && p.length + " in"], ["Shoulder", p.shoulder && p.shoulder + " in"], ["Sleeve", p.sleeve && p.sleeve + " in"]].filter(function (r) { return r[1]; });
    var action;
    var OF = C.offers || {}, canOffer = OF.enabled !== false && p.offers !== false && isBuyable(p);
    if (isBuyable(p)) action = (inBag(p.id) ? '<button class="btn" data-viewbag>In your bag - view bag</button>' : '<button class="btn" data-add>Add to bag - ' + money(p.price) + "</button>") +
      (canOffer ? ' <button class="btn ghost" data-offer>Make An Offer</button><p class="hint">' + esc(OF.note || "") + "</p>" : "") +
      (isBuyable(p) && SH.us ? '<p class="hint">US shipping: ' + money(SH.us.one) + " for one piece, " + money(SH.us.few) + " for 2 to 3. International shipping is priced by country at checkout. All sales are final.</p>" : "");
    else if (p.status === "archive") action = '<p class="notice">This piece lives in The Archive and is not for sale. Curious about it? <a href="' + dmLink() + '" target="_blank" rel="noopener">Message us</a>.</p>';
    else action = '<button class="btn" disabled>' + (p.status === "sold" ? "Sold" : "On hold") + "</button>";
    body.innerHTML = '<div class="piece"><div><div class="big">' + (imgs[0] ? '<img data-big src="' + esc(imgPath(imgs[0])) + '" alt="' + esc(p.name) + '" draggable="false">' : "") + (imgs.length > 1 ? '<button class="gal-nav prev" data-prev aria-label="Previous photo">&#8249;</button><button class="gal-nav next" data-next aria-label="Next photo">&#8250;</button><span class="gal-count mono" data-count>1 / ' + imgs.length + '</span>' : "") + '</div>' +
      (imgs.length > 1 ? '<div class="thumbs">' + imgs.map(function (f, i) { return '<button data-th="' + i + '" aria-label="Photo ' + (i + 1) + '"><img src="' + esc(imgPath(f)) + '" alt=""></button>'; }).join("") + "</div>" : "") + "</div>" +
      '<div><h2 class="disp h2">' + esc(p.name) + "</h2>" + (isBuyable(p) ? '<p style="font-size:24px;margin:10px 0 0">' + money(p.price) + "</p>" : "") +
      (spec.length ? '<dl class="spec">' + spec.map(function (r) { return "<dt>" + r[0] + "</dt><dd>" + esc(r[1]) + "</dd>"; }).join("") + "</dl>" : "") +
      (p.story ? "<p>" + esc(p.story) + "</p>" : "") + '<div style="margin-top:20px">' + action + "</div></div></div>";
    var cur = 0, big = $("[data-big]", body), cnt = $("[data-count]", body), ths = $$("[data-th]", body);
    function show(i) {
      if (imgs.length < 2) return;
      cur = (i + imgs.length) % imgs.length;
      big.src = imgPath(imgs[cur]);
      if (cnt) cnt.textContent = (cur + 1) + " / " + imgs.length;
      ths.forEach(function (t, k) { t.classList.toggle("on", k === cur); if (k === cur && t.scrollIntoView) t.scrollIntoView({ block: "nearest", inline: "nearest" }); });
      var nx = new Image(); nx.src = imgPath(imgs[(cur + 1) % imgs.length]);
    }
    ths.forEach(function (b) { b.addEventListener("click", function () { show(+b.getAttribute("data-th")); }); });
    if (ths[0]) ths[0].classList.add("on");
    var pv = $("[data-prev]", body), nxb = $("[data-next]", body);
    if (pv) pv.addEventListener("click", function () { show(cur - 1); });
    if (nxb) nxb.addEventListener("click", function () { show(cur + 1); });
    var bigBox = $(".big", body), sx = null, sy = null;
    if (bigBox && imgs.length > 1) {
      bigBox.addEventListener("touchstart", function (e) { var t = e.touches[0]; sx = t.clientX; sy = t.clientY; }, { passive: true });
      bigBox.addEventListener("touchend", function (e) {
        if (sx === null) return;
        var t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy; sx = null;
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2) show(cur + (dx < 0 ? 1 : -1));
      }, { passive: true });
    }
    pieceDlg.onkeydown = function (e) {
      if (!$("[data-big]", body) || imgs.length < 2) return;
      if (e.key === "ArrowRight") { show(cur + 1); e.preventDefault(); }
      else if (e.key === "ArrowLeft") { show(cur - 1); e.preventDefault(); }
    };
    var add = $("[data-add]", body); if (add) add.addEventListener("click", function () { setBag(bag.concat([p.id])); pieceDlg.close(); openBag(); });
    var ob = $("[data-offer]", body); if (ob) ob.addEventListener("click", function () { openOffer(p); });
    var vb = $("[data-viewbag]", body); if (vb) vb.addEventListener("click", function () { pieceDlg.close(); openBag(); });
    pieceDlg.showModal();
  }

  function openOffer(p) {
    var OF = C.offers || {}, body = $("[data-body]", pieceDlg);
    body.innerHTML = '<div style="max-width:520px"><h2 class="disp h2">Make An Offer</h2><p class="lede">' + esc(p.name) + ' <span class="mono mute">' + esc(p.id) + ' / listed ' + money(p.price) + '</span></p>' +
      '<form data-of novalidate><div class="f"><label for="of-amt">Your offer ($)</label><input id="of-amt" type="text" name="Offer" inputmode="decimal" required></div>' +
      '<div class="f"><label for="of-name">Your name</label><input id="of-name" type="text" name="Name" required></div>' +
      '<div class="f"><label for="of-c">Instagram or phone</label><input id="of-c" type="text" name="Contact" required></div>' +
      '<div class="f"><label for="of-n">Note (optional)</label><textarea id="of-n" name="Notes"></textarea></div>' +
      '<p class="err" data-err hidden></p><button class="btn" type="submit">Send Offer</button> <button class="btn ghost" type="button" data-back>Back</button>' +
      '<p class="hint">' + esc(OF.terms || "") + '</p></form></div>';
    $("[data-back]", body).addEventListener("click", function () { openPiece(p.id); });
    var form = $("[data-of]", body);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var fd = new FormData(form), err = $("[data-err]", body), amt = parseFloat(String(fd.get("Offer")).replace(/[^0-9.]/g, ""));
      if (!amt || !fd.get("Name").trim() || !fd.get("Contact").trim()) { err.hidden = false; err.textContent = "Add your offer, your name, and a way to reach you."; return; }
      var fields = { Piece: p.id + " " + p.name, Listed: money(p.price), Offer: money(amt), Name: fd.get("Name"), Contact: fd.get("Contact"), Notes: fd.get("Notes") };
      var btn = $("button[type=submit]", form); btn.disabled = true; btn.textContent = "Sending...";
      deliver("Offer on " + p.id + ": " + money(amt), fields).then(function (res) {
        body.innerHTML = '<div class="ok" style="max-width:520px"><h2 class="disp h2">Offer Sent</h2><p class="lede">Your offer of ' + money(amt) + ' on ' + esc(p.name) + ' is in. ' + esc(OF.after || "We will reply by message.") + '</p>' +
          (res.sent ? "" : fallbackHtml(res.text)) + '<p><a class="btn" href="shop.html">Keep Browsing</a></p></div>';
        if (!res.sent) wireFallback(body, res.text);
      });
    });
  }

  function mountPieces() {
    $$('[data-mount="shop"]').forEach(function (root) {
      var list = PRODUCTS.filter(function (p) { return p.status !== "archive" && p.category !== "Archive"; });
      var cats = []; list.forEach(function (p) { if (p.category && cats.indexOf(p.category) < 0) cats.push(p.category); });
      var state = { cat: "All", onlyAvail: false, sizes: [] };
      var SZ = ["XXS", "XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"], sizes = [];
      list.forEach(function (p) { var z = (p.size || "").toUpperCase().replace("XXL", "2XL"); if (z && sizes.indexOf(z) < 0) sizes.push(z); });
      sizes.sort(function (x, y) { var i = SZ.indexOf(x), j = SZ.indexOf(y); return (i < 0 ? 99 : i) - (j < 0 ? 99 : j) || (x < y ? -1 : 1); });
      var sizeRow = el('<div class="chips" role="group" aria-label="Filter by size"></div>'), count = el('<p class="mono mute" role="status" style="margin:-8px 0 18px"></p>');
      function sz(p) { return (p.size || "").toUpperCase().replace("XXL", "2XL"); }
      var chips = el('<div class="chips" role="group" aria-label="Filter pieces"></div>');
      function chip(label, on, fn) { var b = el('<button class="chip" aria-pressed="' + on + '">' + esc(label) + "</button>"); b.addEventListener("click", fn); return b; }
      var grid = el('<div class="grid g3"></div>');
      function draw() {
        chips.innerHTML = "";
        ["All"].concat(cats).forEach(function (c) { chips.appendChild(chip(c, state.cat === c, function () { state.cat = c; draw(); })); });
        chips.appendChild(chip("Available only", state.onlyAvail, function () { state.onlyAvail = !state.onlyAvail; draw(); }));
        sizeRow.innerHTML = "";
        if (sizes.length > 1) {
          sizeRow.appendChild(el('<span class="mono mute" style="align-self:center;margin-right:4px">Size</span>'));
          sizeRow.appendChild(chip("All sizes", !state.sizes.length, function () { state.sizes = []; draw(); }));
          sizes.forEach(function (z) { sizeRow.appendChild(chip(z, state.sizes.indexOf(z) > -1, function () { var i = state.sizes.indexOf(z); if (i > -1) state.sizes.splice(i, 1); else state.sizes.push(z); draw(); })); });
        }
        grid.innerHTML = "";
        var shown = list.filter(function (p) { return (state.cat === "All" || p.category === state.cat) && (!state.onlyAvail || p.status === "available") && (!state.sizes.length || state.sizes.indexOf(sz(p)) > -1); });
        count.textContent = shown.length + (shown.length === 1 ? " piece" : " pieces") + (state.sizes.length ? " in " + state.sizes.join(", ") : "");
        var order = { available: 0, hold: 1, coming: 2, sold: 3 };
        shown.sort(function (a, b) { return (order[a.status] || 0) - (order[b.status] || 0); });
        if (!shown.length) grid.appendChild(el('<p class="empty" style="grid-column:1/-1">Nothing here right now. New pieces land often, follow <a href="https://instagram.com/' + C.igHandle + '">@' + esc(C.igHandle) + "</a>.</p>"));
        shown.forEach(function (p) { grid.appendChild(plate(p)); });
      }
      root.appendChild(chips); root.appendChild(sizeRow); root.appendChild(count); root.appendChild(grid); draw();
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
            "<p>" + esc(form.getAttribute("data-thanks") || "We will be in touch.") + "</p>" + (res.sent ? "" : fallbackHtml(res.text)) + "</div>");
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
      root.appendChild(el('<p class="lede" style="margin-bottom:18px">Pick a time that works. You will get a confirmation, and the showroom address is shared with confirmed guests. Booking a Closet Edit? Add the address we should travel to in the form.</p>'));
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
      '<div class="step"><span class="lab">Pick a day</span>' + (days.length ? '<div class="days" data-days></div>' : '<div class="notice">Appointment days are being set. Send your preferred dates in the notes below and we will reply.</div>') + "</div>" +
      '<div class="step" data-timestep hidden><span class="lab">Pick a time</span><div class="slots" data-slots></div></div>' +
      '<div class="step"><span class="lab">Your details</span>' +
      '<div class="two"><div class="f"><label for="b-name">Name</label><input id="b-name" name="Name" type="text" autocomplete="name" required data-label="name"></div>' +
      '<div class="f"><label for="b-contact">Phone, email or Instagram</label><input id="b-contact" name="Contact" type="text" required data-label="contact"></div></div>' +
      '<div class="two"><div class="f"><label for="b-guests">Guests</label><select id="b-guests" name="Guests"></select></div>' +
      '<div class="f"><label for="b-email">Email (for your calendar invite)</label><input id="b-email" name="Email" type="email" autocomplete="email"></div></div>' +
      '<div class="f" data-travel hidden><label for="b-addr">Address we will travel to</label><textarea id="b-addr" name="Travel address" placeholder="Street, city, apartment or gate details"></textarea><p class="hint">We come to you for this service. This stays private.</p></div>' +
      '<div class="f"><label for="b-notes">What are you looking for?</label><textarea id="b-notes" name="Notes" placeholder="Labels, eras, an occasion, sizes..."></textarea></div>' +
      '<input class="hp" type="text" name="company" tabindex="-1" autocomplete="off" aria-hidden="true">' +
      '<p class="err" data-err hidden></p><button class="btn" type="submit">Request this appointment</button>' +
      '<p class="hint">' + esc(C.showroomNote || "") + " Appointments are requests until we confirm.</p></div></form>";

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
      return "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Very Wear Apparel//EN\r\nBEGIN:VEVENT\r\nUID:" + Date.now() + "@verywearapparel\r\nDTSTAMP:" + stamp + "\r\nDTSTART:" + f(start) + "\r\nDTEND:" + f(end) +
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
      if (cur.travel && !addr) { err.hidden = false; err.textContent = "Add the address we should travel to."; return; }
      err.hidden = true;
      var when = S.time ? DOW[S.time.getDay()] + " " + MON[S.time.getMonth()] + " " + S.time.getDate() + ", " + fmtTime(S.time) : "";
      var fields = { Service: cur.name, When: when, Name: name, Contact: contact, Email: form.elements["Email"].value, Guests: form.elements["Guests"].value, "Travel address": cur.travel ? addr : "", Notes: form.elements["Notes"].value, Status: "REQUESTED - confirm with guest" };
      var btn = $("button[type=submit]", form); btn.disabled = true; btn.textContent = "Sending...";
      deliver("Appointment request: " + cur.name + (when ? " - " + when : ""), fields).then(function (res) {
        var cal = "";
        if (S.time) {
          var data = ics(S.time, "Very Wear Apparel - " + cur.name + " (requested)", "Requested appointment. Very Wear Apparel will confirm. " + (C.showroomNote || ""));
          cal = '<a class="btn sm ghost" download="very-wear-apparel-appointment.ics" href="data:text/calendar;charset=utf-8,' + encodeURIComponent(data) + '">Add to my calendar</a>';
        }
        var box = el('<div class="ok"><h2 class="disp h2">' + (res.sent ? "Request sent." : "Almost there.") + "</h2><p class=\"lede\">" + esc(cur.name) + (when ? " &middot; " + esc(when) : "") + "</p>" +
          "<p>It's a request until we confirm. Watch for our message" + (fields.Email ? " at " + esc(fields.Email) : "") + ".</p>" + (res.sent ? "" : fallbackHtml(res.text)) + '<div class="row" style="margin-top:14px">' + cal + "</div></div>");
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

  $$("[data-cfg]").forEach(function (n) { var v = n.getAttribute("data-cfg").split(".").reduce(function (o, k) { return o && o[k]; }, SH); if (v != null) n.textContent = money(v); });
  mountChrome(); mountNav(); $$('[data-mount="intl"]').forEach(function (r) { renderCheckout(r, "intl"); }); mountPieces(); (function () { var h = decodeURIComponent(location.hash.slice(1)); if (h && byId(h) && $('[data-mount="shop"]')) openPiece(h); })(); mountServices(); mountForms(); mountBooking();
})();
