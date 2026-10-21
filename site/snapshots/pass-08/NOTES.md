Pass 8, 2026-10-18. Direction change on the owner's instruction: extremely minimal, light only, one sans for everything, a handwriting accent, one or two lines per project, the figures as the only illustration. Working tree only, not committed.

## Handwriting font: Kalam 400
- Compared "with precision." at 64 px in Caveat, Caveat Brush, Gochi Hand, Kalam 400 and 700, Nanum Pen Script, Permanent Marker, Reenie Beanie and Shadows Into Light, then Kalam 400, Kalam 700 and Caveat 600 at the sample's size beside the sample.
- Kalam matches the sample best: the same forward slant, the angular flicked r, the open-bowl p with a long straight descender, the loose joined w, and a marker stroke with rounded ends. Caveat is closer to a fine pen and too condensed; Gochi Hand and Caveat Brush are upright and rounder; Reenie Beanie and Nanum Pen are too thin and scratchy.
- The sample's stroke sits between Kalam 400 and 700. 400 was chosen: at display size next to Instrument Sans 500 it reads as handwriting rather than a second heavy face, and only one file is preloaded.
- Self-hosted as site/assets/fonts/Kalam-Regular.woff2 (Google Fonts latin subset, 14 KB, SIL OFL 1.1). Used in exactly two places on the page: "with precision." in the hero and the closing line in Contact.

## Copy
- Hero: "Software engineer. I build systems that run businesses, with precision." Sub: "Graduating from the University at Buffalo in Summer 2027. Open to new grad software roles in the US." Text buttons Email and GitHub. An HTML comment marks where the résumé link returns.
- Contact closing line: "Let's build something that runs."
- Projects, one sentence each plus one meta line; see index.html.

## Removed
- Fraunces from the page (files kept on disk), the engraved plates and emblems from the markup (files kept), the Braille engraving script, the accordion cards, the scroll reveals and their fallback, the fixed mobile CTA bar, dark mode (page and all four figures), the "How I work" section, the StoreKit swatch grid, vial renders and token excerpt, the EggFlow illustrative ledger, the Agriful service blueprint SVG, every facts list and long paragraph, the "Follow on X" button.
- app.js is now two parts: copy email, and the lazy figure loader (each slot observed directly with a 600 px margin instead of its section).

## Palette and type
- Background #FAFAF9 everywhere (page, header, figure frames). Ink #111111, secondary #6B6B6B, hairline #E6E6E3, accent cobalt #1F4E9E for link hover and focus only.
- Instrument Sans for all text including titles. Hero 52 px desktop, 34 px at 390. Section titles 22 px, project titles 24 px (22 on phones). Body 16.5 px, project sentence 17 px, captions 14 px. Max width 880 px, 24 px gutters.

## Figures
- Each build.mjs retuned and rerun: card and paper to #FAFAF9, rules to #E6E6E3, faces to white, the cream iso shades shifted to neutral warm greys (#DDDCD8 to #F5F5F3), ink and muted to the page values. Bronze stays as the warm machine colour (Peptiful vial caps, StoreKit roller, EggFlow header), cobalt stays the single accent. StoreKit's real brand colours untouched. Fraunces inside the figures replaced with Instrument Sans. Dark blocks and the unused DARK constants deleted.
- Figures run full column width. StoreKit and Healthpedia draw their labels inside the SVG, which scaled to 25 px at 832 px wide, so on desktop the slot itself carries the hairline frame and the drawing sits centred inside it (StoreKit 600 px with smaller label sizes, Healthpedia 720 px). On phones both fill the column as before.
- Placeholder heights re-measured for the new widths (1280: 582, 525, 672, 513; 390: 312, 298, 498, 242).

## QA (headless Chrome over CDP, true 390 px mobile viewport and 1280)
- No horizontal overflow at 390 or 1280. No console errors or warnings at either width.
- All four figures reach ready when scrolled to and their markup changes over 3.5 s in view (animations run).
- Every link and button at least 24 px tall; header name raised to 32 px.
- index.html 7.9 KB, styles.css 7.4 KB, app.js 1.7 KB. Instrument Sans and Kalam preloaded. No img elements on the page; favicon is an inline SVG data URI.
- No em dash, en dash or middle dot in index.html, styles.css, app.js, 404.html, fonts.css or any figure embed or figure page.
- OG image regenerated: white card, name and hero line, 1200x630, assets/og.jpg.

## Imperfect
- The four figures still label themselves in four styles (Fig 2 in sans, FIG 3 mono with bronze, FIG 04 mono, Peptiful none). They come from separate builds; unifying them is a figure pass.
- On desktop the Healthpedia drawing leaves generous empty frame either side; the alternative was 17 px mono labels.
- The Peptiful link label "The order flow, drawn" points at the Agriful story's Peptiful anchor, as before.
- The mobile hero has a tall top margin; deliberate whitespace, but worth a look on a real phone.

## Files here
full-1280.png, full-390.png, crop-1280-hero.png, crop-1280-peptiful.png, crop-1280-storekit.png, crop-1280-eggflow.png, crop-1280-healthpedia.png, crop-1280-more.png, crop-1280-contact.png, crop-390-hero.png and one crop-390 per figure.
