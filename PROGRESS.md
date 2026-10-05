# How the site improved, pass by pass

Loop: learn, build, audit, ship. Every pass is reviewed by a different model from the one that built it (Fable 5.1 as the standing critic, Opus as the cross-check), then frozen as a snapshot at /snapshots/ on the live site so MBS can compare versions.

| Pass | Time (EDT) | What changed | Critic scores (HM / founder / typographer) | Lighthouse mobile (perf / a11y / BP / SEO) |
|---|---|---|---|---|
| 0 (before) | 2026-10-04 | Six equal sections, research projects first, text overflowed the viewport on phones, no contact beyond a mailto | not reviewed | not measured |
| 1 | 05-10 04:40 | Ground-up rebuild. Four research reports first. Pentelic palette, Cinzel + Garamond + mono + Amiri, hero engraving, StoreKit brand switcher with real screenshots, three diagrams, accordion, quotes, flat archive, contact with copy button, mobile CTA bar, dark tokens | Fable: 6 / 7 / 6 | 76 / 100 / 100 / 100, LCP 4.2s (Google Fonts render-blocking) |
| 2 | 05-10 05:20 | Six-word hero, Cinzel confined to headings, Garamond small caps everywhere else, emblem bug fixed, opaque mast on touch, honest token panel, EggFlow four-phone strip, blueprint strip with 12px labels, accordion thumbs engraved-to-colour, How I work rewritten as four practices, self-hosted fonts, OG image of eight stores, X link | Fable: 7 / 8 / 6. Opus: 7 / 8 / 7 | 91 / 97 / 100 / 100, LCP 3.1s |

| 3 | 05-10 06:10 | Real small caps from the source variable font, honest hero ("I build the system once, then let eight brands wear it"), StoreKit claims aligned to facts, ownership lines, $12M into prose, Peptiful mechanism diagram, accordion a11y fixes and Longevity OS first, phones cropped, diagrams scroll on phones, links in roman, old-style numerals, grain into background, engraving measures glyph advance | Fable: 7 / 8 / 7. Opus: 8 / 8 / 8 | 91 / 97 / 100 / 100, LCP 2.9s, CLS 0 |
| 4 | 05-10 07:30 | MBS feedback pass. Peptiful first. Fraunces + Instrument Sans + JetBrains Mono. Seven engraved plates behind sections (astrolabe, Cordoba market, Greek stoa, Punjab farm, Baghdad study, House of Wisdom, Pharos). All screenshots out: swatch cards for StoreKit, a day ledger for EggFlow. Archive, Peptides card, Bismillah, star removed. Footer is three actions. Copy matches the StoreKit repo truth. | pending | pending |

## What the critics changed my mind about
- Pass 1 to 2: I had treated "classical" as a license for ornament. The critic counted seven ornaments (numerals, friezes, star, wreath, Bismillah, Cinzel labels, scramble) and asked for two. The page got calmer and more credible with Garamond small caps doing the work Cinzel used to do.
- The hero was carrying two audiences in one sentence. Six words plus a lede that names the two systems reads faster and claims less.
- "Honestly" and "actually" are tells. State the status as Today / Next and move on.
- A token panel with a derived number is a fabricated number. Show only what was sampled from the live store.
- Pass 2 to 3: a CSS feature is only real if the font file carries it. The small caps looked fine in screenshots and were fake in the glyphs. Verify with fontTools, not with eyes.
- Pass 3 to 4: Fable grepped the StoreKit repo and found the apps do not import the shared package. The page now describes the shipped state and names the next step. A reviewer who can grep will always find the gap; say it first.
- MBS saw pass 3 and called it AI-looking: too many small ornaments, Cinzel, the Bismillah, the screenshots. One strong illustration per section and two typefaces did more than ten small marks.
- "Ship it eight times" was a sentence I liked more than the facts supported. The two critics disagreed on tone and agreed on that line, so it went.

## Open decisions for MBS
- Publish StoreKit code (the single biggest credibility lever for design-engineering readers).
- Résumé PDF and LinkedIn URL for the hero and contact.
- Confirm the Peptiful brand count with Ash before stating it.
- Kaizen: public landing page, or keep it as a sign-in-required card.
