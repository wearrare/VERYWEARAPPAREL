/* Wear / Rare - email sign-up box. Shows only when config.js has signup.action set.
   Works with Google Forms, MailerLite, Mailchimp, Brevo, Formspree and similar: the box posts to the address you paste. */
(function () {
  var S = window.WR && WR.signup;
  document.querySelectorAll("[data-signup]").forEach(function (box) {
    if (!S || !S.action) { box.hidden = true; return; }
    box.hidden = false;
    var form = box.querySelector("form"), msg = box.querySelector(".su-msg"), btn = form.querySelector("button");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (form.querySelector('[name="website"]').value) return;           // honeypot: bots fill this in
      var email = form.querySelector('[name="email"]').value.trim();
      var name = (form.querySelector('[name="name"]') || {}).value || "";
      if (!/^\S+@\S+\.\S+$/.test(email)) { msg.textContent = "Check the email address and try again."; return; }
      var body = new URLSearchParams();
      body.append(S.emailField || "email", email);
      if (S.nameField && name) body.append(S.nameField, name);
      Object.keys(S.extra || {}).forEach(function (k) { body.append(k, S.extra[k]); });
      btn.disabled = true; msg.textContent = "Adding you...";
      fetch(S.action, { method: "POST", mode: "no-cors", body: body })
        .then(function () { form.reset(); btn.disabled = false; msg.textContent = S.thanks || "You're on the list. Watch your inbox."; })
        .catch(function () { btn.disabled = false; msg.textContent = "That didn't go through. Try again, or message him on Instagram."; });
    });
  });
})();
