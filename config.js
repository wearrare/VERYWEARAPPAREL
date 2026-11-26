/* ============================================================
   WEAR / RARE  -  site settings
   Everything you are likely to change lives in this one file.
   Edit it right on GitHub (pencil icon), then "Commit changes".
   ============================================================ */
window.WR = {
  // ---- identity / links ----
  igHandle: "very_wear_apparel",
  personalIg: "sagejoygold",
  depop: "illa9",
  venmo: "very_wear_apparel",

  // ---- Google tools (free) ---------------------------------
  // Paste links here once you've made them. Leave blank to use the built-in versions.
  google: {
    // Google Calendar > Create > Appointment schedule > Share > copy the link
    // (if there is an "Embed" option, paste the iframe's src="..." address instead)
    bookingUrl: "https://calendar.google.com/calendar/appointments/schedules/AcZssZ2RsmKbqpzy1UbAosu6HWI1T3j0ClpU-2kRZZfbTWWAeNbjuSJMGHRMOG9DVUAM7zPpKy5DvvMD",
    // Google Forms > Send > "<>" tab > copy ONLY the address inside src="..."
    forms: {
      sipThrift: "https://docs.google.com/forms/d/e/1FAIpQLSdEb_EjwLRTHg3ydALOu8Zy63ywxeTXyZQisp8lLdnJtukSdg/viewform"    // the Sip & Thrift invite request form
    }
  },


  // ---- password entry --------------------------------------
  // Turn on:  python3 tools/set_password.py "the password"   (turn off: --off)
  // This is a front door for a static site. It keeps casual visitors out; it is not bank-grade security.
  gate: {
    enabled: true,
    passwordHash: "44006c6a6787a04c62b5b365cee25950b237b8bdfe864bbd9f332f94c050e6e8",          // filled in by tools/set_password.py (blank = no password screen)
    salt: "wear-rare-7f3a",
    remember: true,            // stay unlocked on this device (false = ask every visit)
    hint: "",                  // optional line under the box, e.g. "Check your invite."
    exempt: []                 // pages that stay open without the password (none: everything is locked)
  },

  // ---- music -----------------------------------------------
  // 1) Put mp3 files in the music/ folder  2) list them here. Keep each under about 10 MB.
  // The player starts when a visitor enters, and shows a small bar at the bottom of every page.
  music: {
    enabled: true,
    volume: 0.6,
    tracks: [
      // { title: "Track name", src: "music/track-name.mp3" },
    ]
  },

  // ---- email sign-up ("The list") --------------------------
  // Leave action blank and the sign-up box stays hidden. Paste the form's POST address from your email tool.
  // Google Form: action = the form's .../formResponse address, emailField = "entry.123456789" (find it in the form's pre-filled link)
  // MailerLite / Mailchimp / Brevo: action = the embedded form's action="..." address, emailField = its email input name
  signup: {
    action: "",
    emailField: "email",
    nameField: "",             // optional, same idea
    extra: {},                 // any hidden fields the tool needs, e.g. { u: "...", id: "..." }
    thanks: "You're on the list. Watch your inbox."
  },

  // ---- where requests go ----------------------------------
  // Option A (recommended): a free form service that emails you every request.
  //   Web3Forms  -> formEndpoint: "https://api.web3forms.com/submit", formAccessKey: "YOUR_KEY"
  //   Formspree  -> formEndpoint: "https://formspree.io/f/XXXXXXXX"
  // Option B: leave both blank and put an email below (opens the guest's email app),
  //   or leave everything blank and requests go to his Instagram DM.
  formEndpoint: "",
  formAccessKey: "",
  email: "",

  // ---- showroom (appointment only) -------------------------
  showroomNote: "The showroom address is shared with confirmed guests only.",
  slotMinutes: 60,        // length of one appointment
  leadHours: 24,          // earliest bookable time from now
  daysAhead: 42,          // how far ahead people can request
  maxGuests: 4,
  slotStep: 30,           // appointments can start every 30 minutes
  // Opening hours by weekday (0 = Sunday ... 6 = Saturday), 24h "HH:MM". null = closed.
  hours: {
    0: ["12:00", "21:30"],
    1: ["12:00", "21:30"],
    2: ["12:00", "21:30"],
    3: ["12:00", "21:30"],
    4: ["12:00", "21:30"],
    5: ["12:00", "21:30"],
    6: ["12:00", "21:30"]
  },
  closedDates: [],        // e.g. ["2026-12-25", "2026-12-31"]

  // ---- services (shown on Stylist + Book pages) -------------
  // travel: true = he goes to the guest, so the booking asks for an address
  // price: leave "" to show "Inquire"
  services: [
    { id: "showroom", name: "Showroom Visit", blurb: "Private shopping in the showroom. Browse the racks with him on hand, and buy pieces right there (Venmo works).", price: "" },
    { id: "styling", name: "Styling Session", blurb: "One-on-one styling for a look, a season, or a whole identity.", price: "" },
    { id: "closet", name: "Closet Edit", blurb: "He comes to you. Go through what you own: keep, restyle, release, and find the gaps.", price: "", travel: true },
    { id: "sourcing", name: "Sourcing Request", blurb: "Looking for a specific label, era, or grail? He hunts it.", price: "" }
  ],
  // ---- Sip & Thrift ----------------------------------------
  sipThrift: {
    date: "",             // e.g. "Saturday, December 13"
    time: "",             // e.g. "6 - 9 PM"
    where: "Showroom, address sent to invited guests",
    note: "By invitation. Guests are selected, then invited."
  },

  // ---- checkout notes --------------------------------------
  shipping: "Pickup at the showroom by appointment, or shipping. Shipping is quoted after you pay and he confirms by message."
};
