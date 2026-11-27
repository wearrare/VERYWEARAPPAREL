/* ============================================================
   VERY WEAR APPAREL  -  site settings
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
    action: "https://docs.google.com/forms/d/e/1FAIpQLSfJONw23hjR0NnW20LlXwzbIFDPLAkBZQoMdyErp32dzQBzMg/formResponse",
    emailField: "entry.1323435284",
    nameField: "entry.728841704",             // optional, same idea
    extra: {},                 // any hidden fields the tool needs, e.g. { u: "...", id: "..." }
    thanks: "You're on the list. Watch your inbox."
  },

  // ---- offers ----------------------------------------------
  // Shows a "Make An Offer" button on every piece. Turn off for all: enabled:false.
  // Turn off for one piece: add  offers: false  to that piece in products.js (or leave it firm).
  offers: {
    enabled: true,
    replyHours: 24,
    note: "Offers are welcome. We reply within 24 hours.",
    terms: "A reasonable offer is any amount you would be happy to pay. If we accept, we message you and hold the piece for 24 hours while you pay on Venmo (shipping is added at checkout). Accepted offers are final. One of one pieces can sell to someone else before we reply.",
    after: "We reply within 24 hours. If we accept, we hold the piece for you for 24 hours so you can pay."
  },

  // ---- order inbox (Google Form -> Google Sheet) -------------
  // Every order is saved to a Google Sheet through a Google Form. See README section 12.
  // action: the form's  .../formResponse  address.  fields: the form's entry.NNNN ids.
  // fixUrl: the form's normal public link, shown after payment as "send or fix your shipping details".
  orderForm: {
    action: "https://docs.google.com/forms/d/e/1FAIpQLSfSXDgJrfUySA5CiNumeC4NlApNv_jxjRq1PbY3AAVFFv6Fcw/formResponse",
    fixUrl: "https://docs.google.com/forms/d/e/1FAIpQLSfSXDgJrfUySA5CiNumeC4NlApNv_jxjRq1PbY3AAVFFv6Fcw/viewform",
    fields: { order: "entry.1841083538", name: "entry.1142217048", email: "entry.1484649175", country: "entry.999358937", codes: "entry.2082389465", pieces: "entry.759118004", shipping: "entry.2027978990", total: "entry.1992119546", address: "entry.1928886644", notes: "entry.1730921516" }
  },

  // ---- where requests go ----------------------------------
  // Option A (recommended): a free form service that emails you every request.
  //   Web3Forms  -> formEndpoint: "https://api.web3forms.com/submit", formAccessKey: "YOUR_KEY"
  //   Formspree  -> formEndpoint: "https://formspree.io/f/XXXXXXXX"
  // Option B: leave both blank and put an email below (opens the guest's email app),
  //   or leave everything blank and requests go to his Instagram DM.
  formEndpoint: "",
  formAccessKey: "",
  email: "marzsoul@gmail.com",

  // ---- showroom (appointment only) -------------------------
  showroomNote: "South Carolina based. The showroom address is shared with confirmed guests only.",
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
    { id: "showroom", name: "Showroom Visit", blurb: "Private shopping in the showroom. Browse the racks with a stylist on hand, and buy pieces right there (Venmo works).", price: "" },
    { id: "styling", name: "Styling Session", blurb: "One-on-one styling for a look, a season, or a whole identity.", price: "" },
    { id: "closet", name: "Closet Edit", blurb: "We come to you. Go through what you own: keep, restyle, release, and find the gaps.", price: "", travel: true },
    { id: "sourcing", name: "Sourcing Request", blurb: "Looking for a specific label, era, or grail? We hunt it down.", price: "" }
  ],
  // ---- Sip & Thrift ----------------------------------------
  sipThrift: {
    date: "",             // e.g. "Saturday, December 13"
    time: "",             // e.g. "6 - 9 PM"
    where: "Showroom, address sent to invited guests",
    note: "By invitation. Guests are selected, then invited."
  },

  // ---- checkout notes --------------------------------------
  // ---- shipping (paid at checkout, before the Venmo step) ----
  // US: one price for 1 piece, one price for 2 or 3 pieces. 4 or more pieces: "message us for shipping".
  // International: priced by country straight from the USPS price list (First-Class Package International
  // Service, retail). 1 piece uses the up-to-1-lb price, 2 or 3 pieces use the up-to-3-lb price. 4 or more: message us.
  // Source: USPS Notice 123 (price list), Ground Advantage retail effective Oct 4, 2026.
  shipping: {
    us: { one: 14, few: 20, service: "USPS Ground Advantage" },
    intl: {
      service: "USPS First-Class Package International Service",
      // price group -> [up to 1 lb, up to 3 lb]
      groups: {"1": [26.0, 38.5], "2": [26.6, 39.0], "3": [37.35, 61.7], "4": [38.35, 59.75], "5": [38.3, 57.3], "6": [34.25, 56.95], "7": [29.95, 48.9], "8": [31.15, 50.1], "9": [35.9, 58.3], "10": [31.15, 50.15], "11": [40.45, 63.15], "12": [41.25, 65.25], "13": [37.4, 56.4], "14": [32.05, 48.8], "15": [29.4, 47.75], "16": [29.95, 48.6], "17": [33.95, 56.45], "18": [32.05, 51.65], "19": [31.8, 50.7], "20": [31.95, 49.25]},
      // country -> price group (USPS "Country Price Groups"). Delete a line to stop shipping to a country.
      countries: {"Afghanistan": 4,"Albania": 3,"Algeria": 5,"Andorra": 3,"Angola": 5,"Anguilla": 6,"Antigua and Barbuda": 6,"Argentina": 11,"Armenia": 3,"Aruba": 6,"Ascension": 5,"Australia": 12,"Austria": 9,"Azerbaijan": 3,"Bahamas": 6,"Bahrain": 4,"Bangladesh": 4,"Barbados": 6,"Belarus": 3,"Belgium": 9,"Belize": 6,"Benin": 5,"Bermuda": 6,"Bhutan": 4,"Bolivia": 6,"Bonaire, Sint Eustatius, and Saba": 6,"Bosnia-Herzegovina": 3,"Botswana": 5,"Brazil": 13,"British Virgin Islands": 6,"Brunei Darussalam": 4,"Bulgaria": 3,"Burkina Faso": 5,"Burma": 4,"Burundi": 5,"Cambodia": 4,"Cameroon": 5,"Canada": 1,"Cape Verde": 5,"Cayman Islands": 6,"Central African Republic": 5,"Chad": 5,"Chile": 11,"China": 14,"Colombia": 6,"Comoros": 5,"Congo, Democratic Republic of the": 5,"Congo, Republic of the": 5,"Costa Rica": 6,"Cote d'Ivoire": 5,"Croatia": 8,"Cuba": 6,"Curacao": 6,"Cyprus": 4,"Czech Republic": 7,"Denmark": 9,"Djibouti": 5,"Dominica": 6,"Dominican Republic": 6,"Ecuador": 6,"Egypt": 5,"El Salvador": 6,"Equatorial Guinea": 5,"Eritrea": 5,"Estonia": 9,"Eswatini": 5,"Ethiopia": 5,"Falkland Islands": 6,"Faroe Islands": 9,"Fiji": 4,"Finland": 9,"France": 15,"French Guiana": 15,"French Polynesia": 4,"Gabon": 5,"Gambia": 5,"Georgia, Republic of": 3,"Germany": 16,"Ghana": 5,"Gibraltar": 7,"Greece": 8,"Greenland": 9,"Grenada": 6,"Guadeloupe": 15,"Guatemala": 6,"Guinea": 5,"Guinea-Bissau": 5,"Guyana": 6,"Haiti": 6,"Honduras": 6,"Hong Kong": 18,"Hungary": 7,"Iceland": 7,"India": 10,"Indonesia": 4,"Iran": 4,"Iraq": 4,"Ireland": 9,"Israel": 8,"Italy": 9,"Jamaica": 6,"Japan": 17,"Jordan": 4,"Kazakhstan": 4,"Kenya": 5,"Kiribati": 4,"Kosovo": 3,"Kuwait": 4,"Kyrgyzstan": 4,"Laos": 4,"Latvia": 3,"Lebanon": 4,"Lesotho": 5,"Liberia": 5,"Libya": 5,"Liechtenstein": 7,"Lithuania": 7,"Luxembourg": 8,"Macao": 4,"Madagascar": 5,"Malawi": 5,"Malaysia": 10,"Maldives": 4,"Mali": 5,"Malta": 3,"Martinique": 15,"Mauritania": 5,"Mauritius": 5,"Mexico": 2,"Moldova": 3,"Mongolia": 4,"Montenegro": 3,"Montserrat": 6,"Morocco": 5,"Mozambique": 5,"Namibia": 5,"Nauru": 4,"Nepal": 4,"Netherlands": 9,"New Caledonia": 4,"New Zealand": 12,"Nicaragua": 6,"Niger": 5,"Nigeria": 5,"North Korea": 4,"North Macedonia": 3,"Norway": 9,"Oman": 4,"Pakistan": 4,"Panama": 6,"Papua New Guinea": 4,"Paraguay": 6,"Peru": 6,"Philippines": 4,"Pitcairn Island": 4,"Poland": 7,"Portugal": 7,"Qatar": 4,"Reunion": 15,"Romania": 3,"Russia": 19,"Rwanda": 5,"Saint Helena": 5,"Saint Kitts and Nevis": 6,"Saint Lucia": 6,"Saint Pierre and Miquelon": 15,"Saint Vincent and the Grenadines": 6,"Samoa": 4,"San Marino": 8,"Sao Tome and Principe": 5,"Saudi Arabia": 4,"Senegal": 5,"Serbia": 3,"Seychelles": 5,"Sierra Leone": 5,"Singapore": 10,"Sint Maarten": 6,"Slovakia": 3,"Slovenia": 8,"Solomon Islands": 4,"South Africa": 5,"South Korea": 18,"South Sudan": 5,"Spain": 8,"Sri Lanka": 4,"Sudan": 5,"Suriname": 6,"Sweden": 8,"Switzerland": 9,"Syria": 4,"Taiwan": 10,"Tajikistan": 4,"Tanzania": 5,"Thailand": 10,"Timor-Leste": 4,"Togo": 5,"Tonga": 4,"Trinidad and Tobago": 6,"Tristan da Cunha": 5,"Tunisia": 5,"Turkiye": 3,"Turkmenistan": 4,"Turks and Caicos Islands": 6,"Tuvalu": 4,"Uganda": 5,"Ukraine": 3,"United Arab Emirates": 10,"United Kingdom": 20,"Uruguay": 6,"Uzbekistan": 4,"Vanuatu": 4,"Vatican City": 9,"Venezuela": 11,"Vietnam": 4,"Wallis and Futuna Islands": 4,"Yemen": 4,"Zambia": 5,"Zimbabwe": 5}
    },
    handling: "Orders ship within 2 to 7 days after your payment is confirmed.",
    maxPieces: 3,
    // Free local pickup, United States checkout only.
    pickup: { area: "Columbia, SC and nearby towns", note: "Local pickup is free for Columbia, SC and nearby towns. After you pay, we email you to set a time and share the pickup address." }
  },
};
