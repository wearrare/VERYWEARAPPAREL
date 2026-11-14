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
    bookingUrl: "",
    // Google Forms > Send > "<>" tab > copy ONLY the address inside src="..."
    forms: {
      sipThrift: ""    // the Sip & Thrift invite request form
    }
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
