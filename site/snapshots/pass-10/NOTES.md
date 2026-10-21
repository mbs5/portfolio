Pass 10, 2026-10-21 (overnight overhaul from MBS's brief, Business/Portfolio/Brief 2026-10-21 overhaul.md). Retro print poster in three inks: Tangerine #FF5C34, Black Cherry #351E28, Cool Blue #D7EFFF, on a warm paper #FFF8F1.

## What changed
- Type: League Gothic (OFL, self-hosted, 10 KB) for the name, section titles and project titles, matched to the "JAZZ CLUB" condensed lettering in the reference over Big Shoulders Display, Anton and Bebas Neue. Instrument Sans for body copy. Kalam kept only for the closing line in Contact.
- Hero is a tangerine poster band: "Software engineer" kicker, the name in Cool Blue at up to 184 px, the tagline "I build a system once and let brands, farms, or families wear it." (MBS's line, verbatim), the UB and Summer 2027 line, Email and GitHub pills. The Résumé button is still commented out until the five numbers are confirmed.
- Work is a 2 by 2 grid of four static poster illustrations (site/art/*.svg, 7 to 11 KB each). Each is hand-written SVG with tangerine ground, Black Cherry line, Cool Blue fills off-register by 4 by 3 px, a shared wobble filter and a shared print grain. The style contract is in site/art/STYLE.md. They were drawn by four Opus agents, each going through 3 to 5 render-critique rounds. No animation, no text in the images.
  - Peptiful: one stock jar feeds one shared pipe into shopfronts, with a fourth being built.
  - StoreKit: one rubber stamp, three prints of one layout, each inked differently. No swatches, no brand names, no brand pictures.
  - EggFlow: a hen on a level balance, egg tray against a ledger.
  - Healthpedia: a machine proposes a card, a family member ticks it with a pen, and it goes into the ring-bound record. The first draft used a stamp, which was swapped so it does not repeat StoreKit's.
- StoreKit copy is down to "Eight distinct storefronts and the one token contract they are moving onto." The link reads "A live demo", with no brand name.
- Removed: the four Anatomy figures from the page (site/figures kept on disk, not loaded), the figure loader in app.js, the Peptiful link to the Agriful anchor.
- Contact is a Black Cherry band with the Kalam line in tangerine. The 404 is a tangerine poster. The OG image was regenerated in the new style.
- Grain: the same feTurbulence tile at 55% on the poster bands, 18% on the paper, and inside every illustration.

## QA (headless Chrome over CDP, 1280 and a true 390 mobile viewport)
- No horizontal overflow and no console errors. All four images load, and League Gothic, Instrument Sans and Kalam all load. No link or button is under 24 px tall.
- Each SVG uses only #FF5C34, #351E28 and #D7EFFF, with no text elements.
- No em dash, en dash or middle dot in index.html, styles.css, app.js, 404.html, the SVGs or STYLE.md.

## Claims
Copy is unchanged from pass 9 except the StoreKit sentence (narrower than facts.md, not broader) and the tagline, which makes no factual claim.

## Open
- The hero's right half is empty tangerine on desktop. That is deliberate, poster style, but a small mark or the Peptiful jar could sit there if MBS wants weight.
- The Healthpedia sleeve is the heaviest dark shape in the set.
- .vercelignore keeps the untracked campus résumé (phone number) out of every upload.

## Files here
full-1280.png, full-390.png, crop-{1280,390}-{hero,work,peptiful,storekit,eggflow,healthpedia,more,contact}.png, qa.json.
