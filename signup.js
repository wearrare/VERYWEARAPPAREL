/* Very Wear Apparel - email sign-up ("The Drop List"). A box above the footer, plus a small prompt that slides in after
   a little scrolling. With config.js signup.action set it posts to your email tool (Google Forms, MailerLite, Mailchimp,
   Brevo, Formspree and similar). Until then it copies the request and opens an Instagram DM, so nothing is lost. */
(function () {
  var S = (window.WR && WR.signup) || {};
  var dmUrl = "https://ig.me/m/" + ((window.WR && WR.igHandle) || "very_wear_apparel");
  var JOINED = "wr_su_joined", SEEN = "wr_su_seen";
  function get(k, st) { try { return window[st].getItem(k); } catch (e) { return null; } }
  function set(k, v, st) { try { window[st].setItem(k, v); } catch (e) {} }

  function wire(box) {
    var form = box.querySelector("form"), msg = box.querySelector(".su-msg"), btn = form.querySelector("button");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (form.querySelector('[name="website"]').value) return;           // honeypot: bots fill this in
      var email = form.querySelector('[name="email"]').value.trim();
      var name = (form.querySelector('[name="name"]') || {}).value || "";
      if (!/^\S+@\S+\.\S+$/.test(email)) { msg.textContent = "Check the email address and try again."; return; }
      if (!S.action) {                                                     // no email tool connected yet: DM fallback
        var text = "Please add me to the Very Wear Apparel drop list. " + (name ? "Name: " + name + ". " : "") + "Email: " + email;
        try { navigator.clipboard.writeText(text); } catch (err) {}
        msg.innerHTML = 'Almost done. Your request is copied. <a href="' + dmUrl + '" target="_blank" rel="noopener">Open Instagram</a>, paste it, and send.';
        set(JOINED, "1", "localStorage");
        return;
      }
      var body = new URLSearchParams();
      body.append(S.emailField || "email", email);
      if (S.nameField && name) body.append(S.nameField, name);
      Object.keys(S.extra || {}).forEach(function (k) { body.append(k, S.extra[k]); });
      btn.disabled = true; msg.textContent = "Adding you...";
      fetch(S.action, { method: "POST", mode: "no-cors", body: body })
        .then(function () { form.reset(); btn.disabled = false; set(JOINED, "1", "localStorage"); msg.textContent = S.thanks || "You're on the list. Watch your inbox."; })
        .catch(function () { btn.disabled = false; msg.innerHTML = 'That didn\'t go through. Try again, or <a href="' + dmUrl + '" target="_blank" rel="noopener">message us on Instagram</a>.'; });
    });
  }

  var main = document.querySelector("[data-signup]");
  if (!main) return;
  wire(main);

  // slide-in prompt after a little scrolling (once per visit, never after someone has joined)
  if (get(JOINED, "localStorage") || get(SEEN, "sessionStorage")) return;
  var pop, shown = false, timer;
  function show() {
    if (shown || document.documentElement.classList.contains("wr-locked")) return;
    if (get(JOINED, "localStorage")) return;
    shown = true; clearTimeout(timer); window.removeEventListener("scroll", onScroll);
    pop = document.createElement("aside");
    pop.className = "su-pop"; pop.setAttribute("aria-label", "Join the drop list");
    pop.innerHTML = '<button class="su-x" type="button" aria-label="Close">&times;</button>' + main.querySelector(".su-box").innerHTML;
    document.body.appendChild(pop);
    wire(pop);
    requestAnimationFrame(function () { pop.classList.add("in"); });
    pop.querySelector(".su-x").addEventListener("click", function () { set(SEEN, "1", "sessionStorage"); pop.remove(); });
    set(SEEN, "1", "sessionStorage");
  }
  function onScroll() {
    var h = document.documentElement.scrollHeight - innerHeight;
    if (h > 0 && scrollY / h > 0.22 || scrollY > 500) show();
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  timer = setTimeout(show, 14000);
  document.addEventListener("wr:unlocked", function () { clearTimeout(timer); timer = setTimeout(show, 14000); });
})();
