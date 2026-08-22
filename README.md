# Nuptias Celebration Studio

Marketing and catalogue site for Nuptias Celebration Studio — personalised wedding
stationery, signage and bespoke wedding newspapers, handcrafted in the UK.

Static HTML, CSS and vanilla JavaScript. No build step, no dependencies, no framework.
Open `index.html` in a browser and it works.

## Structure

```
.
├── index.html                              Home: collections, catalogue, packages, FAQ, enquiry
├── assets/
│   ├── nuptias.css                         All styling. Design tokens live in :root
│   └── nuptias.js                          Nav, basket, configurator, gallery, form
├── products/
│   ├── invitations-and-rsvp-cards.html     Full product page with configurator
│   └── wedding-newspaper.html              Flagship product page
└── collections/
    └── sage-botanical.html                 Full collection page
```

## How the price configurator works

Product pages are driven entirely by data attributes — there is no per-page
JavaScript. To add a new product page, copy an existing one and change the markup.

On the `<form data-configurator>` element:

| Attribute | Purpose |
|---|---|
| `data-name` | Product name shown in the basket |
| `data-unit` / `data-unit-singular` | e.g. `suites` / `suite` |
| `data-base-unit` | Base price per unit |
| `data-base-flat` | Base one-off fee (design, setup) |
| `data-min` | Minimum order quantity |
| `data-breaks` | Volume pricing, e.g. `[[30,1],[50,0.94],[100,0.86]]` |

On each option input:

| Attribute | Purpose |
|---|---|
| `data-delta` | Adds to the per-unit price |
| `data-flat` | Adds a one-off fee |
| `data-label` | Text used in the basket summary |
| `data-group` | Groups labels in the summary |

Total = `(base-unit + Σ delta) × qty × volume multiplier + base-flat + Σ flat`

## Local development

No tooling required, but relative paths behave better over HTTP than `file://`:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deployment

Any static host works — GitHub Pages, Netlify, Cloudflare Pages, or plain FTP.
For GitHub Pages: Settings → Pages → deploy from `main` / root.

## Before going live

- [ ] Replace the Unsplash placeholder photography with real product shots
- [ ] Replace the placeholder testimonials in `#reviews` with real, verifiable reviews
- [ ] Add `Review` / `AggregateRating` structured data **only** once real reviews exist
      (fabricated review markup breaches Google's policy and risks a manual action)
- [ ] Point the enquiry form at a real endpoint (Formspree, Netlify Forms, or your own)
      — it currently falls back to `mailto:`
- [ ] Update canonical, Open Graph and JSON-LD URLs if the domain is not `nuptias.co.uk`
- [ ] Create the social share images referenced in the meta tags
- [ ] Add `robots.txt` and `sitemap.xml`
- [ ] Confirm all prices and turnaround times are commercially accurate

## Still to build

- Product pages for the remaining eight catalogue items
- Collection pages for Minimalist Monogram, Romantic Floral and Islamic & Nikah
- Real checkout, if the business moves beyond quote-based ordering
