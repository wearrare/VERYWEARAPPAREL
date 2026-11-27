/* ============================================================
   THE COLLECTION  -  one entry per piece.

   FASTEST WAY (many pieces): fill the tee spreadsheet, then run tools/import_pieces.py (see README section 11).
   The block between IMPORTED:START and IMPORTED:END is managed by that tool.

   HOW TO ADD ONE PIECE BY HAND
   1. Upload photos to the images/pieces/ folder (on GitHub: Add file > Upload files).
   2. Copy one block below, paste it at the TOP of the list, and fill it in.
   3. Commit. The site updates in about a minute.

   status:
     "available"  - for sale, can be added to the bag
     "hold"       - reserved, shown but not buyable
     "sold"       - shown as sold (good for proof of the collection)
     "archive"    - NOT for sale. Lives in The Archive as part of the art collection.
     "coming"     - placeholder frame ("photo coming soon")

   price: a number like 120 (US dollars). Leave null for archive / coming pieces.
   images: file names inside images/pieces/. First one is the cover.

   EXAMPLE (copy me):
   {
     id: "WR-007",
     name: "Faded Tour Tee, Single Stitch",
     label: "Hanes",
     category: "Tees",           // Tees, Outerwear, Designer, Accessories, Bottoms, Other
     era: "1989",
     size: "L",
     condition: "Excellent, light fade",
     price: 140,
     status: "available",
     story: "One or two lines about where it came from and why it matters.",
     images: ["wr-007-front.jpg", "wr-007-tag.jpg"]
   },
   ============================================================ */
window.WR_PRODUCTS = [
  /* IMPORTED:START */
  {
    id: "VWA-001",
    name: "Rurouni Kenshin",
    label: "ODM",
    category: "Tees",
    era: "2000 (Dated)",
    size: "XL",
    condition: "Pre-Loved",
    pit: 23,
    length: 28,
    price: 150,
    status: "available",
    images: ["vwa-001-1.jpg", "vwa-001-2.jpg", "vwa-001-3.jpg", "vwa-001-4.jpg", "vwa-001-5.jpg", "vwa-001-6.jpg", "vwa-001-7.jpg"],
    thumbs: true
  },
  {
    id: "VWA-002",
    name: "Asura Samurai Shodown 64 Warriors Rage",
    label: "Made in USA",
    category: "Tees",
    era: "1998",
    size: "2XL",
    condition: "Pre-Loved",
    pit: 25,
    length: 32,
    price: 165,
    status: "available",
    images: ["vwa-002-1.jpg", "vwa-002-2.jpg", "vwa-002-3.jpg", "vwa-002-4.jpg", "vwa-002-5.jpg", "vwa-002-6.jpg"],
    thumbs: true
  },
  {
    id: "VWA-003",
    name: "Heat Guy J Project (3M Print Graphic)",
    label: "Delta Magnum Weight",
    category: "Tees",
    era: "2002",
    size: "XL",
    condition: "Pre-Loved",
    pit: 23.5,
    length: 28,
    price: 95,
    status: "available",
    images: ["vwa-003-1.jpg", "vwa-003-2.jpg", "vwa-003-3.jpg", "vwa-003-4.jpg", "vwa-003-5.jpg"],
    thumbs: true
  },
  {
    id: "VWA-004",
    name: "An American Haunting",
    label: "Jerzees",
    category: "Tees",
    era: "2006",
    size: "XL",
    condition: "Pre-Loved",
    pit: 23.5,
    length: 30,
    price: 135,
    status: "available",
    images: ["vwa-004-1.jpg", "vwa-004-2.jpg", "vwa-004-3.jpg", "vwa-004-4.jpg", "vwa-004-5.jpg", "vwa-004-6.jpg", "vwa-004-7.jpg"],
    thumbs: true
  },
  {
    id: "VWA-005",
    name: "Call Of Duty Black Ops 2 X Bob Marley (Double Misprint)",
    label: "Faded Out Tag",
    category: "Tees",
    era: "2012",
    size: "XL",
    condition: "Pre-Loved",
    pit: 24,
    length: 28.5,
    price: 135,
    status: "available",
    images: ["vwa-005-1.jpg", "vwa-005-2.jpg", "vwa-005-3.jpg", "vwa-005-4.jpg", "vwa-005-5.jpg", "vwa-005-6.jpg"],
    thumbs: true
  },
  {
    id: "VWA-006",
    name: "Invader Zim Gir & Pig \"I Love This Pig\"",
    label: "Bay Island",
    category: "Tees",
    era: "Y2K",
    size: "L",
    condition: "Pre-Loved",
    pit: 21,
    length: 27.5,
    price: 65,
    status: "available",
    images: ["vwa-006-1.jpg", "vwa-006-2.jpg", "vwa-006-3.jpg", "vwa-006-4.jpg", "vwa-006-5.jpg"],
    thumbs: true
  },
  {
    id: "VWA-007",
    name: "Jesus He Loves You So Much It Hurts",
    label: "Witness Wear",
    category: "Tees",
    era: "1994",
    size: "L",
    condition: "Pre-Loved",
    pit: 23,
    length: 27.5,
    price: 75,
    status: "available",
    images: ["vwa-007-1.jpg", "vwa-007-2.jpg", "vwa-007-3.jpg", "vwa-007-4.jpg", "vwa-007-5.jpg", "vwa-007-6.jpg", "vwa-007-7.jpg"],
    thumbs: true
  },
  {
    id: "VWA-008",
    name: "The Amazing Spider-Man",
    label: "Fruit of the Loom",
    category: "Tees",
    era: "1990",
    size: "M",
    condition: "Pre-Loved",
    pit: 19,
    length: 25.5,
    price: 135,
    status: "available",
    images: ["vwa-008-1.jpg", "vwa-008-2.jpg", "vwa-008-3.jpg", "vwa-008-4.jpg", "vwa-008-5.jpg", "vwa-008-6.jpg"],
    thumbs: true
  },
  {
    id: "VWA-009",
    name: "Marlboro Unlimited",
    label: "Marlboro Unltd",
    category: "Tees",
    era: "Early 1990s",
    size: "XL",
    condition: "Pre-Loved",
    pit: 23,
    length: 28,
    price: 85,
    status: "available",
    images: ["vwa-009-1.jpg", "vwa-009-2.jpg", "vwa-009-3.jpg", "vwa-009-4.jpg", "vwa-009-5.jpg", "vwa-009-6.jpg", "vwa-009-7.jpg"],
    thumbs: true
  },
  {
    id: "VWA-010",
    name: "Mortal Kombat 3 \"Kombat Kodes\" Promo",
    label: "Made in Mexico",
    category: "Tees",
    era: "1995",
    size: "XL",
    condition: "Pre-Loved",
    pit: 23,
    length: 28,
    price: 75,
    status: "available",
    images: ["vwa-010-1.jpg", "vwa-010-2.jpg", "vwa-010-3.jpg", "vwa-010-4.jpg", "vwa-010-5.jpg"],
    thumbs: true
  },
  {
    id: "VWA-011",
    name: "The Ice Harvest",
    label: "M&O",
    category: "Tees",
    era: "2006",
    size: "XL",
    condition: "Pre-Loved",
    pit: 24,
    length: 30,
    price: 65,
    status: "available",
    images: ["vwa-011-1.jpg", "vwa-011-2.jpg", "vwa-011-3.jpg", "vwa-011-4.jpg", "vwa-011-5.jpg", "vwa-011-6.jpg", "vwa-011-7.jpg"],
    thumbs: true
  },
  {
    id: "VWA-012",
    name: "Inuyasha",
    label: "Choice Appeal",
    category: "Tees",
    era: "2003",
    size: "2XL",
    condition: "Pre-Loved",
    pit: 25,
    length: 32,
    price: 185,
    status: "available",
    images: ["vwa-012-1.jpg", "vwa-012-2.jpg", "vwa-012-3.jpg", "vwa-012-4.jpg", "vwa-012-5.jpg", "vwa-012-6.jpg", "vwa-012-7.jpg", "vwa-012-8.jpg", "vwa-012-9.jpg"],
    thumbs: true
  },
  {
    id: "VWA-013",
    name: "Inuyasha",
    label: "Gildan",
    category: "Tees",
    era: "2003",
    size: "XL",
    condition: "Pre-Loved",
    pit: 24,
    length: 30,
    price: 150,
    status: "available",
    images: ["vwa-013-1.jpg", "vwa-013-2.jpg", "vwa-013-3.jpg", "vwa-013-4.jpg", "vwa-013-5.jpg"],
    thumbs: true
  },
  {
    id: "VWA-014",
    name: "Star Wars Episode I",
    label: "Lee Sport",
    category: "Tees",
    era: "1999",
    size: "XL",
    condition: "Pre-Loved",
    pit: 24,
    length: 32,
    price: 150,
    status: "available",
    images: ["vwa-014-1.jpg", "vwa-014-2.jpg", "vwa-014-3.jpg", "vwa-014-4.jpg", "vwa-014-5.jpg", "vwa-014-6.jpg", "vwa-014-7.jpg", "vwa-014-8.jpg"],
    thumbs: true
  },
  {
    id: "VWA-015",
    name: "WWE Raw Roster: John Cena, Jeff Hardy, HHH, HBK Etc.",
    label: "WWE",
    category: "Tees",
    era: "2007",
    size: "L",
    condition: "Pre-Loved",
    pit: 21,
    length: 27,
    price: 65,
    status: "available",
    images: ["vwa-015-1.jpg", "vwa-015-2.jpg", "vwa-015-3.jpg", "vwa-015-4.jpg", "vwa-015-5.jpg"],
    thumbs: true
  },
  {
    id: "VWA-016",
    name: "WWF Rude, Crude & Full of Attitude",
    label: "Fruit of the Loom",
    category: "Tees",
    era: "1998",
    size: "3XL",
    condition: "Pre-Loved",
    pit: 27,
    length: 33,
    price: 155,
    status: "available",
    images: ["vwa-016-1.jpg", "vwa-016-2.jpg", "vwa-016-3.jpg", "vwa-016-4.jpg", "vwa-016-5.jpg", "vwa-016-6.jpg", "vwa-016-7.jpg"],
    thumbs: true
  },
  {
    id: "VWA-017",
    name: "WWF Road Dogg Jesse James",
    label: "Murina",
    category: "Tees",
    era: "1998",
    size: "L",
    condition: "Pre-Loved",
    pit: 21,
    length: 30,
    price: 125,
    status: "available",
    images: ["vwa-017-1.jpg", "vwa-017-2.jpg", "vwa-017-3.jpg", "vwa-017-4.jpg", "vwa-017-5.jpg", "vwa-017-6.jpg"],
    thumbs: true
  },
  {
    id: "VWA-018",
    name: "WWF Undertaker Deadman Inc. Rolling X3",
    label: "Cut Tag",
    category: "Tees",
    era: "2000",
    size: "3XL",
    condition: "Pre-Loved",
    pit: 28,
    length: 31,
    price: 140,
    status: "available",
    images: ["vwa-018-1.jpg", "vwa-018-2.jpg", "vwa-018-3.jpg", "vwa-018-4.jpg", "vwa-018-5.jpg", "vwa-018-6.jpg", "vwa-018-7.jpg", "vwa-018-8.jpg"],
    thumbs: true
  },
  /* IMPORTED:END */
  { id: "AR-001", name: "Archive Plate 001", status: "coming", category: "Archive" },
  { id: "AR-002", name: "Archive Plate 002", status: "coming", category: "Archive" },
  { id: "AR-003", name: "Archive Plate 003", status: "coming", category: "Archive" }
];
