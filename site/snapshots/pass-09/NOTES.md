Pass 9, 2026-10-18. Two fixes on top of pass 8, plus the résumé hook. Working tree only, not committed.

## One label family for the four figures
- New site/figures/family.mjs holds FAMILY_CSS and head(). Every build imports it, so all four embeds share one frame and the same labels. The frame is a #FAFAF9 card with a #E6E6E3 hairline, 6 px radius and 12/16 px padding. The head puts "Fig 0N" on the left in Instrument Sans 13 px muted, with the title on the right in 14 px weight 500 ink. Below the drawing sits a hairline, then the foot: the live readout first, in JetBrains Mono 12.5 px ink (the key number in cobalt), then the hint in Instrument Sans 13 px muted. Phones get 12, 13, 11.5 and 12 px.
- Titles: Fig 01 One stock count, Fig 02 One forme, eight inks, Fig 03 Three farms, one ledger, Fig 04 The confirmation desk. These match the page placeholders, which now style the title the same way.
- StoreKit and Healthpedia no longer draw text inside the SVG. Their head, readout and hint are HTML now, and the StoreKit swatches are HTML chips. Both scripts find their SVG inside the wrapper. Healthpedia's resize hook that swapped the hint text is gone. The single hint is "Tap the agent, the stamp or the pusher. Keys N, A, R."
- EggFlow lost its uppercase mono head and its bronze "Fig 3, day close". Readout labels are sans and the values mono.
- Peptiful gained the head it never had.
- styles.css: the per-figure frame overrides from pass 8 are gone (the Peptiful frame, the StoreKit and Healthpedia desktop frames, StoreKit font overrides, the 720 px Healthpedia cap). Only the EggFlow 8-column readout grid is still there.

## Healthpedia margins
- Labels came out of the SVG, so the 720 px cap is gone and the viewBox crops to the drawing (4 30 512 286). On desktop the drawing now runs 798 px wide inside the frame (was 720 px centred inside 832, with the labels taking more of the band). StoreKit got the same crop (0 30 440 276).

## Résumé
- The hero carries a commented Résumé button. Turning it on means copying the swe_web PDF into assets and uncommenting one line. It stays off until MBS confirms the five numbers in "SWE resume, verify these numbers.md".
- site/assets/Muhammad_Bin_Sohail_Resume.pdf (untracked) is still the general campus résumé. It has the phone number and "Available 20 hours a week". Do not commit it as is. Replace it with swe_web or leave it out of the commit.

## QA (headless Chrome over CDP, 1280 and a true 390 mobile viewport, reduced motion)
- All four figures reach ready. No horizontal overflow and no console errors at either width.
- Computed styles are identical across all four heads, readouts and hints at each width (qa.json).
- Placeholder heights re-measured: 1280 is 638, 589, 688, 553; 390 is 340, 330, 418, 307.
- No em dash, en dash or middle dot in the page files, figure embeds, figure pages or family.mjs.

## Imperfect
- The EggFlow readout grid sits left-packed at 1280 rather than spread across the frame. It reads fine but could be justified.
- Peptiful still has a tall empty band above the cabinet inside its frame (viewBox not cropped in this pass).

## Files here
full-1280.png, full-390.png, crop-{1280,390}-{hero,peptiful,storekit,eggflow,healthpedia}.png, qa.json.
