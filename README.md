# Very Wear Apparel

Storefront, archive, stylist services, Sip & Thrift invites and appointment booking for **@very_wear_apparel**. Plain HTML, CSS and JavaScript. No build tools needed to run it.

Live address (once Pages is on): `https://wearrare.github.io/verywearapparel/`

## 1. Turn the site on (one time)

1. Repo **Settings > Pages**
2. Source: **Deploy from a branch**. Branch: **main**, folder **/ (root)**. Save.
3. Wait about a minute. The address appears at the top of that page.

## 2. The files you will actually edit

| File | What it controls |
|---|---|
| `config.js` | Venmo handle, links, showroom hours, services, Sip & Thrift date, where requests are delivered |
| `products.js` | Every piece in the shop and the Archive |
| `images/pieces/` | Photos of pieces |
| `tools/build.py` | Page copy (headlines, paragraphs). Run `python3 tools/build.py` after editing, then commit the changed `.html` files |

Edit any file on GitHub with the pencil icon, then **Commit changes**. The site updates in about a minute.

## 3. Adding pieces and photos

1. Upload photos to `images/pieces/` (**Add file > Upload files**). Name them clearly, like `wr-007-front.jpg`.
2. Open `products.js`, copy the EXAMPLE block at the top, paste it at the top of the list, and fill it in.
3. Commit.

Statuses: `available` (buyable), `hold`, `sold`, `archive` (not for sale, shown in The Archive), `coming` (placeholder frame). To fill the empty frames, change `status` to `available` or `archive`, add a price and photos, and fill in the details.

Tip: crop photos to 4:5 portrait and keep each under about 500 KB so the site stays fast.

## 4. Checkout (Venmo)

Pieces go into a bag. At checkout the buyer enters details, then taps **Open Venmo**. On a phone this opens the Venmo app with the amount and note filled in. On a computer it opens his Venmo profile and shows the exact amount and note to enter. He confirms payment in the Venmo app, then arranges pickup or shipping with the buyer.

Because every piece is one of one, mark a piece `sold` in `products.js` as soon as it is paid for.

**Venmo and business sales:** Venmo has a separate business profile for sellers. Reported fees are 1.9% + $0.10 per payment received (first 30 days free). It may come with its own @username, so if he switches, update `venmo` in `config.js`.

## 5. Google booking and forms (free)

**Appointments: Google Calendar booking page**
1. Google Calendar > **Create > Appointment schedule**.
2. Set his open days and hours, the length of a visit, and a buffer between visits. Add a question or two (what are you looking for?).
3. Open **Share** and copy the booking link. If there is an Embed option, copy the address inside `src="..."` instead.
4. Paste it into `config.js` as `google.bookingUrl`, commit, and the Book page switches to his live Google calendar. Google blocks double bookings, so no two guests get the same slot.

A free Google account gets one booking page, so use one schedule with a "service" question (showroom visit, styling, closet edit, sourcing). Add an **Address** question for closet edits, since he travels to those.

**Invites: Google Form**
1. Make a form at forms.google.com for Sip & Thrift: name, Instagram, email, plus one?, drink, anything to know.
2. In the form: **Responses > bell icon > Get email notifications for new responses**.
3. **Send > the `<>` tab**, copy the address inside `src="..."`, and paste it into `config.js` as `google.forms.sipThrift`.

Until you paste links, the built-in versions of both work, and requests go to his Instagram DM (or to email if you add one in `config.js`).

## 6. Orders
When someone pays, Venmo notifies him with the amount and the note, which lists the order number and the piece numbers, for example `VWA VWA-4K2QX: VWA-001, VWA-004`. He messages the buyer to arrange pickup or shipping, and marks those pieces `sold` in `products.js`.

## 7. Sip & Thrift

Fill in `sipThrift` in `config.js` once the date is set. The page is built for an invitation-only event: guests request an invite, he selects who comes, and the address is shared only with those he invites.

## 8. Password entry

Turn on: `python3 tools/set_password.py "the password"` (needs Python; or send the password to whoever manages the site). It stores only a scrambled version in `config.js`. Turn off: `python3 tools/set_password.py --off`. Commit `config.js` to publish. Every page is locked, including the QR landing page (`links.html`). To leave a page open, add its file name to `gate.exempt` in `config.js`.

Honest limits: this is a front door for a static site. It keeps casual visitors out. Anyone determined can read the page files, so don't treat it as bank-grade security, and pick a password that isn't a common word.

## 9. Music

1. Upload mp3 files to the `music/` folder (keep each under about 10 MB).
2. In `config.js`, under `music.tracks`, add `{ title: "Track name", src: "music/track-name.mp3" }` for each one.
3. Commit. A small player bar appears at the bottom of every page and starts when a visitor enters. Phones sometimes block sound until one tap on the play button.

## 10. Email sign-up ("The list")

A sign-up box sits above the footer on every page. It stays hidden until `signup.action` in `config.js` has an address. Make an account with an email tool (see below), create a sign-up form there, and copy two things from its embed code: the form's `action="..."` address and the name of its email field. Paste them into `signup.action` and `signup.emailField`. Some tools also need hidden fields; paste those into `signup.extra`.

Send updates from that same tool, not from a personal inbox. It handles unsubscribe links and spam rules for you, which the law requires for marketing email.
