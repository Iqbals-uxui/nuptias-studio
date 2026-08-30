/* ==========================================================================
   Nuptias — product configuration
   Every price and every personalisation question lives in this one file.
   Loaded by index.html and by each product page BEFORE nuptias.js.

     base   = price per unit before options
     min    = minimum order quantity
     tiers  = [[quantity, multiplier], …] volume pricing
     delta  = added to the price of EACH unit
     flat   = one-off charge added once
   ========================================================================== */

window.NUPTIAS_PRODUCTS = {

  "welcome-sign": {
    name: "Acrylic welcome sign",
    blurb: "A2 £95 · A1 £125 · ready 3 weeks after proof approval",
    base: 95, min: 1, unit: "signs", unitSingular: "sign", qtyLabel: "How many signs",
    fields: [
      { key: "size", label: "Size", type: "select", options: [
        { label: "A2 — 595 × 420mm" },
        { label: "A1 — 841 × 594mm", delta: 30 }
      ]},
      { key: "acrylic", label: "Acrylic", type: "select", options: [
        { label: "Clear" }, { label: "Frosted", delta: 12 }, { label: "White", delta: 12 },
        { label: "Black", delta: 12 }, { label: "Gold mirror", delta: 25 }
      ]},
      { key: "lettering", label: "Lettering colour", type: "select", options: [
        { label: "White vinyl" }, { label: "Black vinyl" }, { label: "Sage vinyl" },
        { label: "Burgundy vinyl" }, { label: "Gold vinyl", delta: 6 }
      ]},
      { key: "easel", label: "Easel", type: "select", options: [
        { label: "No easel — I have my own" },
        { label: "Add a gold easel", flat: 38 }
      ]}
    ]
  },

  "table-numbers": {
    name: "Acrylic table numbers",
    blurb: "£6 each, minimum 5 · numbers or table names",
    base: 6, min: 5, unit: "numbers", unitSingular: "number", qtyLabel: "How many tables",
    fields: [
      { key: "material", label: "Material", type: "select", options: [
        { label: "Clear acrylic" }, { label: "Frosted acrylic", delta: 1 }, { label: "Black acrylic", delta: 1 }
      ]},
      { key: "style", label: "Numbers or names", type: "select", options: [
        { label: "Numbers (1, 2, 3…)" },
        { label: "Table names", delta: 0.5 }
      ], hint: "If you are using names, list them in the notes box below." },
      { key: "stand", label: "Stands", type: "select", options: [
        { label: "No stand" }, { label: "Matching acrylic stand", delta: 2.5 }
      ]}
    ]
  },

  "invitations": {
    name: "Wedding invitation suite",
    blurb: "From £2.95 per suite · invitation, RSVP card and two envelopes",
    base: 2.95, min: 30, unit: "suites", unitSingular: "suite", qtyLabel: "How many suites",
    tiers: [[30,1],[50,0.94],[75,0.90],[100,0.86]],
    notesPlaceholder: "Your full invitation wording, RSVP-by date, and any detail cards you need.",
    fields: [
      { key: "format", label: "Format", type: "select", options: [
        { label: "Flat single card" }, { label: "Folded", delta: 0.6 }, { label: "Trifold", delta: 0.95 }
      ]},
      { key: "size", label: "Size", type: "select", options: [
        { label: "A6 — 105 × 148mm" }, { label: "DL — 99 × 210mm", delta: -0.15 },
        { label: "A5 — 148 × 210mm", delta: 0.45 }
      ]},
      { key: "stock", label: "Card stock", type: "select", options: [
        { label: "300gsm smooth" }, { label: "350gsm textured", delta: 0.2 },
        { label: "400gsm cotton", delta: 0.55 }, { label: "Pearlescent", delta: 0.4 }
      ]},
      { key: "envelope", label: "Envelope colour", type: "select", options: [
        { label: "Ivory" }, { label: "Kraft" }, { label: "Sage", delta: 0.1 },
        { label: "Burgundy", delta: 0.1 }, { label: "Navy", delta: 0.1 }
      ]},
      { key: "names", label: "Guest name printing", type: "select", options: [
        { label: "No — I will handwrite them" },
        { label: "Yes, print each household name", delta: 0.3 }
      ], hint: "If yes, send your list as a spreadsheet when we email you." }
    ]
  },

  "seating-plan": {
    name: "Acrylic seating plan",
    blurb: "From £110 · arranged by table or alphabetically",
    base: 110, min: 1, unit: "plans", unitSingular: "plan", qtyLabel: "How many plans",
    notesPlaceholder: "How you would like it arranged, plus your table names or numbers if you have them.",
    fields: [
      { key: "capacity", label: "Guest numbers", type: "select", options: [
        { label: "Up to 80 guests (A2)" },
        { label: "Up to 150 guests (A1)", delta: 35 },
        { label: "Over 150 guests (A1, two panels)", delta: 70 }
      ]},
      { key: "acrylic", label: "Acrylic", type: "select", options: [
        { label: "Clear" }, { label: "Frosted", delta: 12 }, { label: "White", delta: 12 },
        { label: "Black", delta: 12 }, { label: "Gold mirror", delta: 25 }
      ]},
      { key: "order", label: "Arrangement", type: "select", options: [
        { label: "Grouped by table" },
        { label: "Alphabetical by surname" }
      ]},
      { key: "easel", label: "Easel", type: "select", options: [
        { label: "No easel — I have my own" },
        { label: "Add a gold easel", flat: 38 }
      ]}
    ]
  },

  "stickers": {
    name: "Personalised stickers",
    blurb: "From £0.32 each · minimum 100 · Arabic and bilingual welcome",
    base: 0.55, min: 100, unit: "stickers", unitSingular: "sticker", qtyLabel: "How many stickers",
    tiers: [[100,1],[200,0.82],[350,0.69],[500,0.58]],
    notesPlaceholder: "The exact wording, any Arabic text, and where they are going (bottles, boxes, bags…).",
    fields: [
      { key: "size", label: "Size", type: "select", options: [
        { label: "37mm" }, { label: "45mm", delta: 0.05 },
        { label: "51mm", delta: 0.1 }, { label: "60mm", delta: 0.18 }
      ]},
      { key: "material", label: "Material", type: "select", options: [
        { label: "Kraft" }, { label: "Matt white" },
        { label: "Clear", delta: 0.06 }, { label: "Gold foil", delta: 0.2 }
      ]},
      { key: "shape", label: "Shape", type: "select", options: [
        { label: "Round" }, { label: "Square" }, { label: "Scalloped", delta: 0.03 }
      ]},
      { key: "script", label: "Arabic or bilingual setting", type: "select", options: [
        { label: "English only" },
        { label: "Arabic calligraphy", delta: 0.04 },
        { label: "Bilingual English and Arabic", delta: 0.04 }
      ], hint: "We always proof the Arabic with you before printing." }
    ]
  },

  "favours": {
    name: "Personalised wedding favours",
    blurb: "From £2.44 each · minimum 50 · bottle, sticker and tag",
    base: 3.25, min: 50, unit: "favours", unitSingular: "favour", qtyLabel: "How many favours",
    tiers: [[50,1],[100,0.91],[200,0.82],[350,0.75]],
    notesPlaceholder: "The message for the tag, any Arabic text, and your colour preferences for twine and tags.",
    fields: [
      { key: "vessel", label: "What are we personalising", type: "select", options: [
        { label: "50ml glass bottle for Zam Zam water (you fill)" },
        { label: "Date or sweet box", delta: -0.3 },
        { label: "Small sweet jar", delta: -0.15 },
        { label: "Stickers and tags only — I have my own vessels", delta: -1.95 }
      ]},
      { key: "tag", label: "Tag", type: "select", options: [
        { label: "Kraft tag with twine" },
        { label: "Printed message tag with twine", delta: 0.4 },
        { label: "No tag — sticker only", delta: -0.45 }
      ]},
      { key: "sticker", label: "Sticker size", type: "select", options: [
        { label: "37mm sticker" }, { label: "45mm sticker", delta: 0.05 }, { label: "51mm sticker", delta: 0.1 }
      ]},
      { key: "script", label: "Arabic or bilingual setting", type: "select", options: [
        { label: "English only" },
        { label: "Arabic calligraphy", delta: 0.04 },
        { label: "Bilingual English and Arabic", delta: 0.04 }
      ]},
      { key: "assembly", label: "Assembly", type: "select", options: [
        { label: "Flat-packed — we assemble them ourselves" },
        { label: "Fully assembled and boxed by Nuptias", delta: 0.35 }
      ], hint: "Threading 300 tags by hand takes an evening. Worth thinking about." }
    ]
  }

};
