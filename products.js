/* ============================================================
   THE COLLECTION  -  one entry per piece.

   HOW TO ADD A PIECE
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
  { id: "WR-001", name: "Piece 001", status: "coming", category: "Tees" },
  { id: "WR-002", name: "Piece 002", status: "coming", category: "Designer" },
  { id: "WR-003", name: "Piece 003", status: "coming", category: "Outerwear" },
  { id: "WR-004", name: "Piece 004", status: "coming", category: "Accessories" },
  { id: "WR-005", name: "Piece 005", status: "coming", category: "Tees" },
  { id: "WR-006", name: "Piece 006", status: "coming", category: "Designer" },
  { id: "AR-001", name: "Archive Plate 001", status: "coming", category: "Archive" },
  { id: "AR-002", name: "Archive Plate 002", status: "coming", category: "Archive" },
  { id: "AR-003", name: "Archive Plate 003", status: "coming", category: "Archive" }
];
