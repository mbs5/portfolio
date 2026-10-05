# Research 04: mobile-first craft (2026-10-05)

## Layout
- Fluid type: clamp with rem + vw, body near-fixed, headings fluid. --step-0: clamp(1rem, .95rem + .3vw, 1.125rem); --step-3: clamp(2rem, 1.2rem + 3.5vw, 3.5rem).
- Container queries for cards. 100svh for a hero that must fit on first paint. viewport-fit=cover + env(safe-area-inset-bottom) on any fixed bar.
- Overflow culprits: width:100vw, flex/grid children with min-width:auto (fix min-width:0 / minmax(0,1fr)), unbroken strings (overflow-wrap:anywhere), pre, images without max-width:100%, negative margins, absolutely positioned decorations (section overflow:clip), translateX reveals from outside the viewport. Never ship body{overflow-x:hidden} as the fix.
- Debug script at 390px: outline every element whose rect.right > clientWidth+1.
- Touch: 44px minimum, 48 for primary CTA, bump padding under (any-pointer: coarse).
- Sticky nav: direct child of scroller, opaque background, blur only on (hover:hover), no overflow:hidden on ancestors.
- Bottom CTA bar on mobile: one verb, 48px, safe-area padded, hidden via IntersectionObserver when the contact section is visible.

## Motion (Emil Kowalski / Rauno)
- --ease-out: cubic-bezier(.23,1,.32,1) for enter/exit; --ease-in-out: cubic-bezier(.77,0,.175,1) for on-screen moves; drawer: cubic-bezier(.32,.72,0,1).
- Press 100-160ms, tooltips 125-200, dropdowns 150-250, drawers 200-500, else under 300. Never ease-in on UI, never scale(0): start .95 + opacity 0. Animate transform/opacity only. Hover only under (hover:hover) and (pointer:fine). Interruptible. Frequent UI appears instantly.
- Scroll reveals: author visible state by default, animate inside @supports(animation-timeline: view()) and no-preference; translate 12-24px; IntersectionObserver fallback.
- Accordion: grid-template-rows 0fr to 1fr, child overflow:hidden; min-height:0; 280ms ease-out. Images: clip-path inset reveal.
- Reduced motion: reduce, do not remove; fades ~200ms, drop translate/scale.
- CLS: width/height on every img, metric-matched font fallbacks.

## Images
- Hero: picture with AVIF/WebP, preload with fetchpriority=high, no lazy. Below fold: loading=lazy decoding=async + dimensions.
- Blend: mask-image linear-gradient for fade; mix-blend-mode multiply sinks a photo into a light section, luminosity strips colour so text stays legible; isolation:isolate on the card.
- Budget for LCP < 1.5s on slow 4G: HTML + critical CSS < 30KB, hero AVIF < 60KB at 960w, one font subset < 40KB, JS deferred < 30KB, no third-party above the fold. Self-host fonts, font-display swap, size-adjust on fallback.

## Expandable cards (APG)
- h3 > button[aria-expanded][aria-controls]; panel role=region aria-labelledby hidden. replaceState for #hash deep links, hashchange opens and scrolls. Category image behind expanded content: card::before with background var(--img), mask gradient, luminosity blend, opacity 0 to .3 when :has([aria-expanded=true]).

## Contact
- Follower count as one muted line, never a stat block. Email: visible mailto + Copy button (clipboard, "Copied" 2s, aria-live). On coarse pointers the mailto is primary. Status line: present tense with a time bound, no fake green dot.

## 25-item QA checklist (run with headless Chrome)
1 scrollWidth <= clientWidth+1 at 320/360/390/430. 2 no element past the right edge. 3 hero fits 100svh. 4 bottom CTA clears home indicator. 5 tap targets >= 44. 6 8px gaps. 7 axe color-contrast zero. 8 200% zoom ok. 9 body >= 16px at 320. 10 LCP<1.5s CLS<.05 TBT<100. 11 LCP is the hero img, fetchpriority high. 12 hero < 60KB, total < 300KB. 13 fonts swap + fallback metrics. 14 img dims. 15 sticky nav no flicker. 16 no hover-only taps. 17 accordion a11y. 18 deep link works. 19 reduced motion. 20 content visible with JS off. 21 both colour schemes. 22 copy button announces. 23 no console errors/404s. 24 lang, one h1, heading order. 25 same content order mobile vs desktop.
Commands: lighthouse URL --preset=mobile --only-categories=performance,accessibility,best-practices --chrome-flags="--headless=new"; npx axe URL --rules color-contrast,target-size,link-name.
