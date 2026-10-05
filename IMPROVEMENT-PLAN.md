# Recursive improvement plan

How this file works: every pass through the loop (learn, build, audit, ship) reads this file first, does the highest-value open item, writes what changed under the pass log, and adds any new items it discovered. Nothing is deleted; done items move to the log with the date. The site is never "finished", it is the current best version.

Live: https://portfolio.closedloopintel.com (also portfolio-nine-silk-61.vercel.app)
Repo: github.com/mbs5/portfolio (push only from the mbs5 account)
Source of truth for claims: notes/facts.md. Research: notes/research-0*.md. Skills: skills-learned.md.

## Open items, ranked by impact (rewritten after pass 6, 2026-10-05)

### Needs MBS (blocks the biggest gains)
1. Publish StoreKit code, or record a 20-second unlisted clip of editing tokens.css and a store re-skinning. Both critics rank this first for design-engineering readers. Blocked on: StoreKit has no git remote; MBS decides whether and where.
2. Wire at least one StoreKit app to @storekit/ui so the "adopted store by store" sentence has a first store. That also lets the token excerpt stop being a target and become a fact.
3. Résumé PDF (hero button) and LinkedIn URL (social list).
4. Peptiful brand count, confirmed with Ash, replacing "several".
5. Kaizen: a public landing page so the card can show a product screen.
6. A one-sentence answer, rehearsed, for each interview challenge the critics flagged: share of the $12M that runs through his code; how stock is decremented across tenants; show one EggFlow test; why the Peptiful link lands on an Agriful URL; compliance framing for AI product renders on supplement demos.

### Design polish (next loop pass)
7. Dark mode review of the plates and the two-tone swatches; the multiply plates flip to screen but have not been judged in dark since pass 2.
8. Real iPhone check: safe-area padding on the CTA bar, rubber-band on the sticky mast, Fraunces hairlines at 300 nits.
9. Hero plate: the astrolabe reads well on desktop; consider a tighter crop on phones so the dividers are visible above the fold.
10. Ledger: consider one real anonymised day with MBS's approval, replacing the illustrative numbers.
11. OG image: regenerate as the eight swatch cards on cream rather than eight screenshots, to match the no-screenshot rule.
12. Writing section: still the one thing every senior site surveyed has and this page does not. Needs two posts.

### Performance
13. LCP sits at 2.9 to 3.4s on throttled mobile. Inline the critical CSS for the hero and defer the rest; consider serving the hero plate as AVIF.
14. Swatch cards could become a single inline SVG to avoid eight link paints.

### StoreKit product to-dos (for the dedicated agent)
15. Remote plus CI on Node 20 for all eight apps.
16. Pattern mining of top DTC and supplement storefronts into docs/master-catalog.md, then tokenized components in packages/storekit.
17. Brand onboarding script: brand book in, tokens.css and logo-locked bases out.
18. Hosted showcase with a brand switcher over one real app.

## Pass log
- 2026-10-05, passes 4 to 6. Direction change from MBS feedback (Peptiful first, Fraunces and Instrument Sans, engraved plates, no screenshots, no archive, no Bismillah, actionable footer), then two rounds of two-model review and finish work. Pass 5 scores: Fable 8/8/8, Opus 8/8/8. Pass 6 is the sign-off build; see site/snapshots/pass-0N/NOTES.md for each.
- 2026-10-05, pass 2. Fable 5.1 critic reviewed pass 1 (6/10 hiring manager, 7/10 founder, 6/10 typographer). Adopted 12 of its 14 fixes; see site/snapshots/pass-02/NOTES.md. New open items from the review: résumé PDF link (needs file), LinkedIn URL (needs MBS), publish StoreKit code (MBS decision), Kaizen public landing (unchanged).
- 2026-10-05, pass 1 (ground-up rebuild). Research: IA and positioning, ASCII, classical and Islamic visual language, mobile craft (four reports in notes/). Built: new single-page site, Pentelic palette, Cinzel + EB Garamond + JetBrains Mono + Amiri, hero with Braille engraving that resolves into the mark, StoreKit brand switcher with token panel and 8 real screenshots, three inline SVG diagrams, APG accordion for secondary work with blended thumbs, quotes, flat archive table, contact with copy button, mobile CTA bar, scroll-driven reveals with fallback, dark tokens. Six new engraved emblems generated on kie.ai. QA: no horizontal overflow at 390, no console errors, tap targets raised to 24px minimum, nav no longer wraps. Shipped to mbs5/portfolio.
