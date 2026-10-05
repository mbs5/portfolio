# Recursive improvement plan

How this file works: every pass through the loop (learn, build, audit, ship) reads this file first, does the highest-value open item, writes what changed under the pass log, and adds any new items it discovered. Nothing is deleted; done items move to the log with the date. The site is never "finished", it is the current best version.

Live: https://portfolio.closedloopintel.com (also portfolio-nine-silk-61.vercel.app)
Repo: github.com/mbs5/portfolio (push only from the mbs5 account)
Source of truth for claims: notes/facts.md. Research: notes/research-0*.md. Skills: skills-learned.md.

## Open items, ranked by impact

### A. Proof and content
1. StoreKit install demo. The strongest signal in every library site surveyed is the one-command install next to a live URL. Today the shared package is only a token contract. Publish @storekit/ui to npm (even v0.1 with preset + tokens + fonts), then show `pnpm add @storekit/ui` on the card. Blocked on: StoreKit repo needs a remote first (no git remote today).
2. StoreKit component extraction. Move the catalog card, PDP, cart drawer, checkout and COA block into packages/storekit as tokenized components, so the sentence "a brand is one file" is literally true. Then record the 60-second video: new tokens.css, run dev, new store. This is the X launch asset.
3. Kaizen needs a public landing. Its live URL is a Clerk sign-in page in development mode. Either add a marketing page at / with a demo video, or feature a diagram thumbnail instead of the screenshot. Until then the card says sign-in required.
4. EggFlow screenshots. The farm ERP is the most human story on the page and has no image. Capture the mobile entry screens with seeded demo data (never the real logins) and add a 3-phone strip to the Operations feature.
5. Writing section. Every senior site surveyed has one even with 3 posts. Candidates already written elsewhere: the Agriful blueprint essay, "one engine many brands", the Healthpedia confidence-and-evidence design. Add a Writing section between More work and How I work once two posts exist.
6. Real numbers where honest. Each featured item should carry one number. Have: 8 stores, 114 images, 87 tests, operator-reported $12M. Missing: EggFlow daily entries since July, Healthpedia proposals approved, Peptiful brands count (confirm with Ash before stating).
7. Peptiful section says "several white-label brands". Confirm the number with Ash and state it.

### B. Design and craft
8. Hero image art direction. The laurel-and-star mark is good; a second option is the Ionic column with girih base (already generated in assets/gen) as a tall mobile hero with the Braille engraving effect at larger scale.
9. Category emblems. Four new engraved emblems exist (commerce ship, farm, health, column) but are not placed yet. Place them as small marks beside section heads at 72px, multiply blend, and retire the old owl/bull/lamp set.
10. Blended image behind expanded cards. Dark screenshots turn muddy under luminosity blend. Option: generate an engraved "category plate" per card instead of using the screenshot, and keep the screenshot in the thumb only.
11. Service blueprint diagram is small on phones. Make it a horizontally scrollable strip at 390px or split into two rows.
12. Self-host fonts with subsetting (Cinzel, EB Garamond, JetBrains Mono, Amiri) and add size-adjust fallbacks. Current Google Fonts link costs a round trip and a FOUT.
13. AVIF variants for the store screenshots and emblems with picture fallbacks.
14. Dark mode pass. Tokens exist (oiled walnut) but nobody has reviewed the screenshots in dark. Check the store screenshots' borders and the multiply/screen blend on emblems.
15. A second signature interaction is tempting; resist it. The brand switcher is the one. Only improve its polish (keyboard focus ring, swipe on touch, pause on hover).
16. Meander frieze: verify at 1px it reads as a fret on retina and non-retina.

### C. ASCII
17. Build the ASCII builder tool (notes/research-02-ascii.md section 4) as tools/ascii-builder.html in this repo: image in, Braille or hatch ramp out, frames export. Use it to pre-render the hero engraving so the runtime does no canvas work.
18. Breathing laurel: 20 pre-rendered Braille frames of the mark at 6 fps, threshold on a slow sine, reduced-motion shows frame 0.
19. Inscription hover scramble exists on desktop; consider removing if it reads gimmicky after a week.

### D. Mobile QA (from the 25-item list in notes/research-04)
20. Test on a real iPhone: safe-area padding on the CTA bar, rubber-band behaviour of the sticky masthead, Braille glyph width in the system mono fallback.
21. Lighthouse mobile run and record LCP, CLS, TBT in the pass log. Target LCP under 1.5s on slow 4G.
22. axe run for colour contrast in both schemes (muted text on ivory is close to the 4.5 line).

### E. Distribution
23. X launch thread for StoreKit: 8 screenshots, the token switch GIF, the one-file claim, link to the portfolio section. Draft lives in notes/x-launch.md once the video exists.
24. OG image: generate a 1200x630 plate (mark + name + line) instead of the square emblem.
25. Submit to a few curated portfolio lists once the writing section exists.

### F. StoreKit product to-dos (for the dedicated agent)
26. Give StoreKit a remote (mbs5 private repo) and CI that builds all 8 apps on Node 20.
27. Pattern mining: browse top DTC and supplement storefronts, catalog every distinct component variant (hero, PDP, cart, proof, FAQ, footer), and map each to a tokenized component. Keep docs/master-catalog.md as the registry.
28. Brand onboarding script: a CLI that takes a brand book (colors, fonts, mark) and emits tokens.css plus the logo-locked product bases.
29. A hosted showcase with the brand switcher over one real app, not screenshots.

## Pass log
- 2026-10-05, pass 2. Fable 5.1 critic reviewed pass 1 (6/10 hiring manager, 7/10 founder, 6/10 typographer). Adopted 12 of its 14 fixes; see site/snapshots/pass-02/NOTES.md. New open items from the review: résumé PDF link (needs file), LinkedIn URL (needs MBS), publish StoreKit code (MBS decision), Kaizen public landing (unchanged).
- 2026-10-05, pass 1 (ground-up rebuild). Research: IA and positioning, ASCII, classical and Islamic visual language, mobile craft (four reports in notes/). Built: new single-page site, Pentelic palette, Cinzel + EB Garamond + JetBrains Mono + Amiri, hero with Braille engraving that resolves into the mark, StoreKit brand switcher with token panel and 8 real screenshots, three inline SVG diagrams, APG accordion for secondary work with blended thumbs, quotes, flat archive table, contact with copy button, mobile CTA bar, scroll-driven reveals with fallback, dark tokens. Six new engraved emblems generated on kie.ai. QA: no horizontal overflow at 390, no console errors, tap targets raised to 24px minimum, nav no longer wraps. Shipped to mbs5/portfolio.
