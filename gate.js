/* Very Wear Apparel - password entry.
   Turned on when config.js has gate.passwordHash set. Set it with:  python3 tools/set_password.py "the password"
   Note: this is a front door for a static site. It keeps casual visitors out; it is not bank-grade security. */
(function () {
  var C = window.WR && WR.gate;
  if (!C || !C.enabled || !C.passwordHash) return;
  var page = location.pathname.split("/").pop() || "index.html";
  if ((C.exempt || []).indexOf(page) > -1) return;
  var KEY = "wr_unlocked", store = C.remember === false ? "sessionStorage" : "localStorage";
  try { if (window[store].getItem(KEY) === C.passwordHash) return; } catch (e) {}

  var root = document.documentElement;
  root.classList.add("wr-locked");
  var st = document.createElement("style");
  st.textContent = "html.wr-locked body > *:not(#wr-gate){display:none!important}html.wr-locked body{background:#faf8f3}";
  document.head.appendChild(st);

  function toHex(buf) { return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ("0" + b.toString(16)).slice(-2); }).join(""); }
  function hash(pw) {
    var enc = new TextEncoder();
    return crypto.subtle.importKey("raw", enc.encode(pw), "PBKDF2", false, ["deriveBits"]).then(function (k) {
      return crypto.subtle.deriveBits({ name: "PBKDF2", salt: enc.encode(C.salt || "wear-rare"), iterations: 200000, hash: "SHA-256" }, k, 256);
    }).then(toHex);
  }

  function build() {
    var ig = (WR.igHandle || "very_wear_apparel");
    var g = document.createElement("div");
    g.id = "wr-gate";
    g.innerHTML =
      '<form class="wr-box" autocomplete="off">' +
      '<span class="mono mute">Private showroom</span>' +
      '<h1 class="logo shoulders">Very Wear Apparel</h1>' +
      '<div class="mono mute wr-tag">The Holy Haberdashery</div>' +
      '<hr class="rule2">' +
      '<label class="mono" for="wr-pw">Enter password</label>' +
      '<input id="wr-pw" type="password" autocapitalize="off" autocorrect="off" spellcheck="false" required>' +
      '<button type="submit" class="wr-go">Enter</button>' +
      '<p class="wr-msg mono" role="alert" aria-live="polite"></p>' +
      (C.hint ? '<p class="mute wr-hint">' + C.hint.replace(/</g, "&lt;") + '</p>' : "") +
      '<p class="mono mute wr-ask">No password? <a href="https://ig.me/m/' + ig + '" target="_blank" rel="noopener">Ask on Instagram</a></p>' +
      '</form>';
    document.body.appendChild(g);
    var f = g.querySelector("form"), msg = g.querySelector(".wr-msg"), inp = g.querySelector("input");
    inp.focus();
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      msg.textContent = "";
      if (!(window.crypto && crypto.subtle)) { msg.textContent = "Open this page over https to enter."; return; }
      hash(inp.value.trim()).then(function (h) {
        if (h === C.passwordHash) {
          try { window[store].setItem(KEY, h); } catch (e) {}
          root.classList.remove("wr-locked");
          g.remove();
          document.dispatchEvent(new CustomEvent("wr:unlocked"));
        } else {
          msg.textContent = "That's not it. Try again.";
          inp.value = ""; inp.focus();
        }
      });
    });
  }
  if (document.body) build(); else document.addEventListener("DOMContentLoaded", build);
})();
