Pass 7, 2026-10-18. Integration and theme pass for new grad software hiring. Working tree only, not committed.

## What changed

Figures
- Sections 01 (Peptiful) and 04 (Healthpedia): the flat landscape and portrait SVG box diagrams are gone. Each media column now holds a framed placeholder (Fig number plus the figure's title in Fraunces italic, min-height set to the measured figure height) that app.js swaps for the isometric figure.
- Sections 02 (StoreKit) and 03 (EggFlow): the figure sits at the top of the media column. The swatch links, vial renders and token excerpt (02) and the one-day ledger (03) stay underneath, because they carry the live demo links and the illustrative day.
- app.js part 6: an IntersectionObserver with a 600 px root margin watches each figure section. When it fires, `figures/<name>/embed.html` is fetched once (promise cached per figure), parsed in a template, every script tag is re-created as a real script element in its original position (directly after the figure markup, so `previousElementSibling` and `document.currentScript` still work), and the result replaces the placeholder. If the fetch fails the placeholder stays and a later intersection can retry.
- One-line caption under each figure in the site's muted `.cap` style, condensed from each figure's own caption.
- StoreKit: build.mjs now scales the drawing 15% about its measured centre and grows the card 14 units so the footer row clears it; `node build.mjs` rerun.
- EggFlow: readout held to one row (eight columns on desktop; on phones the three farm cells hide, since the hopper counters show them, leaving five). The six-button row is hidden for fine pointers, where the hint line already names taps and keys; touch devices keep it.
- Peptiful: the embed has no card of its own, so it gets the same surface, rule and radius as the other three.
- All four follow the site's prefers-color-scheme tokens; checked in dark.

Theme
- Hero: "Software engineer. I build systems that run businesses." Subline about multi-tenant commerce, a farm ERP, an agent-safe health record, Summer 2027, new grad roles in the US. Buttons: Résumé (assets/Muhammad_Bin_Sohail_Resume.pdf, the general campus résumé) and Email. The old "Now: open to product engineering roles" status line was removed since the subline says it.
- Meta description and og:description match the new subline.
- Section 01: "Built By Design, 2025 to 2026", "I owned the UI and the integration layer; a teammate owned the backend."
- Contact: "Hiring new grad engineers for 2027? Write to me." Copy button and mobile CTA bar unchanged.
- notes/facts.md: identity line now reads software engineer, founding team at BBD, July 2025 to October 2026; the Peptiful timeline note no longer says "2025 to now".

## Sizes

- index.html before (HEAD): 30,666 bytes. After: 25,574 bytes. The figures (about 160 + 228 + 199 + 251 KB raw) load on demand and are not in index.html.

## QA (headless Chrome via CDP, true 390 px viewport, prefers-color-scheme emulated)
- No horizontal overflow at 390 or 1280 (scrollWidth equals clientWidth), light and dark.
- No console errors or warnings on the after page at 1280 or 390.
- All four figures reach `ready` after scrolling and their markup changes over 4 s (the idle tours run).
- With figures/ missing, all four placeholders stay in place (404s are the only log lines).

## Files here
- before-1280-full-light.png, before-1280-full-dark.png, before-390-full-light.png, before-390-full-dark.png: HEAD served from a temp dir.
- after-1280-full-light.png, after-1280-full-dark.png, after-390-full-light.png, after-390-full-dark.png.
- after-1280-fig01-peptiful-*.png, after-1280-fig02-storekit-*.png, after-1280-fig03-operations-*.png, after-1280-fig04-healthpedia-*.png: close crops of each feature block, light and dark.
- Full-page shots were taken with reduced motion so reveals are settled; the fixed mobile CTA bar shows mid-page in the 390 shots, which is a capture artefact.
