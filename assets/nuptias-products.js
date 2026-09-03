/* ==========================================================================
   Nuptias — product configuration
   Every price and every personalisation question lives in this one file.
   Loaded by index.html and by each category page BEFORE nuptias.js.

     base   = price per unit before options
     min    = minimum order quantity
     tiers  = [[quantity, multiplier], …] volume pricing
     delta  = added to the price of EACH unit
     flat   = one-off charge added once

   ⚠️  PRICES ARE PLACEHOLDERS pending your component costings and
       competitor research. Change "base" and the option deltas here and
       every page, dialog and basket updates automatically.
   ========================================================================== */

window.NUPTIAS_PRODUCTS = {

  /* ---------------------------------------------------------------- BOTTLES */
  "bottles": {
    name: "Favour bottles",
    blurb: "From £1.31 each · minimum 50 · supplied empty",
    base: 1.60, min: 50, unit: "bottles", unitSingular: "bottle",
    qtyLabel: "How many bottles",
    tiers: [[50, 1], [100, 0.94], [250, 0.88], [500, 0.82]],
    notesPlaceholder: "Anything we should know — colours, how you plan to fill them, delivery deadlines.",
    fields: [
      { key: "style", label: "Bottle", type: "select", options: [
        { label: "50ml round glass — the Zam Zam classic" },
        { label: "50ml hexagonal glass", delta: 0.25 },
        { label: "50ml mini milk bottle", delta: 0.15 },
        { label: "100ml round glass", delta: 0.50 },
        { label: "50ml flask-shaped glass", delta: 0.30 },
        { label: "50ml clear plastic — lightweight", delta: -0.55 }
      ]},
      { key: "cap", label: "Cap", type: "select", options: [
        { label: "Silver screw cap" },
        { label: "Gold screw cap", delta: 0.08 },
        { label: "Cork stopper", delta: 0.18 }
      ]},
      { key: "sticker", label: "Add a personalised sticker", type: "select", options: [
        { label: "No sticker — bottles only" },
        { label: "Yes, 37mm sticker applied by us", delta: 0.50 },
        { label: "Yes, 45mm sticker applied by us", delta: 0.55 },
        { label: "Yes, supplied loose to apply myself", delta: 0.45 }
      ], hint: "Cheaper than ordering stickers separately, because it shares one setup." },
      { key: "tag", label: "Add a tag and twine", type: "select", options: [
        { label: "No tag" },
        { label: "Kraft tag and pre-cut twine", delta: 0.45 },
        { label: "Printed message tag and twine", delta: 0.75 }
      ]}
    ]
  },

  /* --------------------------------------------------------------- STICKERS */
  "stickers": {
    name: "Personalised stickers",
    blurb: "From £0.32 each · minimum 100 · Arabic and bilingual welcome",
    base: 0.55, min: 100, unit: "stickers", unitSingular: "sticker",
    qtyLabel: "How many stickers",
    tiers: [[100, 1], [200, 0.82], [350, 0.69], [500, 0.58]],
    notesPlaceholder: "Anything else — a du'a, a verse, colour preferences, where they are going.",
    fields: [
      { key: "design", label: "Design", type: "select", options: [
        { label: "Arabic calligraphy medallion" },
        { label: "Names and date" },
        { label: "Monogram initials" },
        { label: "Thank you" },
        { label: "Floral wreath", delta: 0.03 },
        { label: "Geometric border", delta: 0.03 }
      ]},
      { key: "text1", label: "Line one of your text", type: "text",
        placeholder: "e.g. Aneesah & Yusuf", hint: "Printed exactly as you type it." },
      { key: "text2", label: "Line two (optional)", type: "text",
        placeholder: "e.g. Zam Zam Water" },
      { key: "size", label: "Size", type: "select", options: [
        { label: "37mm" },
        { label: "45mm", delta: 0.05 },
        { label: "51mm", delta: 0.10 },
        { label: "60mm", delta: 0.18 }
      ]},
      { key: "material", label: "Material", type: "select", options: [
        { label: "Kraft" },
        { label: "Matt white" },
        { label: "Clear", delta: 0.06 },
        { label: "Gold foil", delta: 0.20 }
      ]},
      { key: "shape", label: "Shape", type: "select", options: [
        { label: "Round" },
        { label: "Square" },
        { label: "Scalloped", delta: 0.03 }
      ]},
      { key: "script", label: "Language", type: "select", options: [
        { label: "English only" },
        { label: "Arabic calligraphy", delta: 0.04 },
        { label: "Bilingual English and Arabic", delta: 0.04 }
      ], hint: "We always proof the Arabic with you before printing." }
    ]
  },

  /* ----------------------------------------------------------- INVITATIONS */
  "invitations": {
    name: "Wedding invitations",
    blurb: "From £2.54 each · minimum 30 · invitation, RSVP and two envelopes",
    base: 2.95, min: 30, unit: "suites", unitSingular: "suite",
    qtyLabel: "How many suites",
    tiers: [[30, 1], [50, 0.94], [75, 0.90], [100, 0.86]],
    notesPlaceholder: "Your full wording, the RSVP-by date, and any detail cards you need.",
    fields: [
      { key: "design", label: "Design", type: "select", options: [
        { label: "Classic script" },
        { label: "Modern minimal" },
        { label: "Nikah gold" },
        { label: "Floral" },
        { label: "Islamic geometric" },
        { label: "Bold monogram" }
      ]},
      { key: "format", label: "Format", type: "select", options: [
        { label: "Flat single card" },
        { label: "Folded", delta: 0.60 },
        { label: "Trifold", delta: 0.95 }
      ]},
      { key: "size", label: "Size", type: "select", options: [
        { label: "A6 — 105 × 148mm" },
        { label: "DL — 99 × 210mm", delta: -0.15 },
        { label: "A5 — 148 × 210mm", delta: 0.45 }
      ]},
      { key: "stock", label: "Card stock", type: "select", options: [
        { label: "300gsm smooth" },
        { label: "350gsm textured", delta: 0.20 },
        { label: "400gsm cotton", delta: 0.55 },
        { label: "Pearlescent", delta: 0.40 }
      ]},
      { key: "envelope", label: "Envelope colour", type: "select", options: [
        { label: "Ivory" }, { label: "Kraft" },
        { label: "Sage", delta: 0.10 }, { label: "Burgundy", delta: 0.10 },
        { label: "Navy", delta: 0.10 }
      ]},
      { key: "names", label: "Guest name printing", type: "select", options: [
        { label: "No — I will handwrite them" },
        { label: "Yes, print each household name", delta: 0.30 }
      ], hint: "If yes, send your list as a spreadsheet when we email you." },
      { key: "script", label: "Language", type: "select", options: [
        { label: "English only" },
        { label: "Bilingual English and Arabic", delta: 0.25 }
      ]}
    ]
  },

  /* ----------------------------------------------------------- FAVOUR TAGS */
  "favour-tags": {
    name: "Favour tags",
    blurb: "From £0.32 each · minimum 50 · twine included",
    base: 0.45, min: 50, unit: "tags", unitSingular: "tag",
    qtyLabel: "How many tags",
    tiers: [[50, 1], [100, 0.88], [250, 0.78], [500, 0.70]],
    notesPlaceholder: "The message for the tag, any Arabic text, and colour preferences.",
    fields: [
      { key: "shape", label: "Shape", type: "select", options: [
        { label: "Classic luggage tag" },
        { label: "Rectangle" },
        { label: "Scalloped rectangle", delta: 0.04 },
        { label: "Round", delta: 0.03 },
        { label: "Heart", delta: 0.06 },
        { label: "Arch", delta: 0.04 }
      ]},
      { key: "text1", label: "Line one of your text", type: "text",
        placeholder: "e.g. Aneesah & Yusuf", hint: "Printed exactly as you type it." },
      { key: "text2", label: "Line two (optional)", type: "text",
        placeholder: "e.g. 20th September 2026" },
      { key: "material", label: "Material", type: "select", options: [
        { label: "Kraft board" },
        { label: "Ivory board" },
        { label: "White board" },
        { label: "Pearlescent", delta: 0.09 }
      ]},
      { key: "printing", label: "Printing", type: "select", options: [
        { label: "One side" },
        { label: "Both sides — message on the reverse", delta: 0.12 }
      ]},
      { key: "twine", label: "Twine", type: "select", options: [
        { label: "Jute twine, pre-cut and supplied loose" },
        { label: "Satin ribbon, pre-cut", delta: 0.07 },
        { label: "Threaded through by us", delta: 0.10 },
        { label: "No twine — I have my own", delta: -0.05 }
      ]},
      { key: "bead", label: "Add a heart bead or charm", type: "select", options: [
        { label: "No bead" },
        { label: "Wooden heart bead", delta: 0.14 },
        { label: "Pearl bead", delta: 0.16 }
      ]}
    ]
  },

  /* -------------------------------------------------- JEWELLERY BOXES */
  "jewellery-boxes": {
    name: "Jewellery box",
    blurb: "From £12.76 each · sold individually · personalised lid",
    base: 14.50, min: 1, unit: "boxes", unitSingular: "box",
    qtyLabel: "How many boxes",
    tiers: [[1, 1], [4, 0.94], [8, 0.88]],
    notesPlaceholder: "Each recipient's name and role, and anything else we should engrave.",
    fields: [
      { key: "style", label: "Style", type: "select", options: [
        { label: "Single ring box" },
        { label: "Double ring box", delta: 2.50 },
        { label: "Moss-lined keepsake box", delta: 3.00 },
        { label: "Velvet-lined keepsake box", delta: 2.00 },
        { label: "Engraved lid box", delta: 3.50 },
        { label: "Deep trinket box", delta: 4.00 }
      ]},
      { key: "wood", label: "Finish", type: "select", options: [
        { label: "Natural oak" },
        { label: "Walnut", delta: 2.00 },
        { label: "White painted", delta: 1.00 },
        { label: "Black painted", delta: 1.00 }
      ]},
      { key: "lid", label: "What goes on the lid", type: "select", options: [
        { label: "Initials" },
        { label: "First name", delta: 1.00 },
        { label: "Name and role — e.g. Amina, Bridesmaid", delta: 1.50 },
        { label: "A short message", delta: 1.50 },
        { label: "Nothing — plain lid", delta: -2.00 }
      ]},
      { key: "lidtext", label: "Text for the lid", type: "text",
        placeholder: "e.g. Amina · Bridesmaid",
        hint: "One box per recipient — list every name in the notes below." },
      { key: "lining", label: "Lining", type: "select", options: [
        { label: "Velvet" },
        { label: "Satin", delta: 0.50 },
        { label: "Preserved moss", delta: 1.50 },
        { label: "Unlined", delta: -1.00 }
      ]}
    ]
  },

  /* --------------------------------------------- BRIDAL PARTY JEWELLERY */
  "bridal-jewellery": {
    name: "Bridal party jewellery",
    blurb: "From £10.80 each · sold individually · gift-pouched",
    base: 12.00, min: 1, unit: "pieces", unitSingular: "piece",
    qtyLabel: "How many pieces",
    tiers: [[1, 1], [4, 0.95], [8, 0.90]],
    notesPlaceholder: "Who each piece is for, and any initials or engraving.",
    fields: [
      { key: "piece", label: "Piece", type: "select", options: [
        { label: "Pearl stud earrings" },
        { label: "Initial pendant necklace", delta: 3.00 },
        { label: "Fine chain bracelet", delta: 1.50 },
        { label: "Pearl hair pin", delta: -2.50 },
        { label: "Earrings and necklace set", delta: 8.00 },
        { label: "Anklet", delta: 1.00 }
      ]},
      { key: "metal", label: "Metal", type: "select", options: [
        { label: "Gold plated" },
        { label: "Sterling silver", delta: 1.50 },
        { label: "Rose gold plated", delta: 1.00 }
      ]},
      { key: "engraving", label: "Personalisation", type: "select", options: [
        { label: "None" },
        { label: "Initial charm", delta: 2.00 },
        { label: "Engraved initials", delta: 3.00 }
      ]},
      { key: "engravetext", label: "Initials or engraving", type: "text",
        placeholder: "e.g. A.K.", hint: "Leave blank if you chose no personalisation." },
      { key: "packaging", label: "Packaging", type: "select", options: [
        { label: "Organza gift pouch" },
        { label: "Card gift box", delta: 1.20 },
        { label: "Place it inside a Nuptias jewellery box", delta: 0.00 }
      ], hint: "The last option needs a jewellery box on your order too — add one alongside." }
    ]
  }

};
