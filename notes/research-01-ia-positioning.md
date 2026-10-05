# Research 01: portfolio IA, library positioning, naming (2026-10-05)

Sources: leerob.com, rauno.me, brittanychiang.com, paco.me, emilkowal.ski, jhey.dev, manuarora.in, mxkaske.dev, delba.dev, ped.ro, ui.shadcn.com registry docs, magicui.design, ui.aceternity.com, cult-ui.com, coss.com/ui, tweakcn, vercel/commerce, hydrogen.shopify.dev, medusajs.com, Vercel "design engineering" post, Linear design engineer posting, 216digital + Hassell Inclusion accordion guides.

## IA patterns that held across every top site
- First line is one declarative sentence with a verb and an employer. Never a headline, never "passionate".
- Featured count 3 to 5. Nobody features more.
- Order: intro, projects, writing, now/about, connect.
- Archive is a separate flat list or table (Year, Project, Made at, Built with, Link). No categories.
- About is folded into the intro, not a page.
- Proof is specific numbers or employer names. leerob, emil, rauno, paco show zero metrics; their proof is the employer and the library name.
- Live demos live one layer down; the home page uses static thumbnails that load fast.
- Vercel funds "polished interactions, no dropped frames, accessibility" and autonomy. Linear asks for "a portfolio showing range, creative use of code, prototyping skills".

## Framing a kit as infrastructure
- Taglines claim the layer below, not the artifact. shadcn: "The Foundation for your Design System". Hydrogen: "CLI to URL in minutes". Medusa: "composable building blocks".
- Templates are never the headline.
- Count plus compatibility is the subhead ("150+ components, drop into any shadcn project").
- The one-command install IS the demo: command on the left, live URL on the right.
- Range is shown as one engine, N skins (tweakcn preset switcher, Vercel Commerce over 11 backends). The 8 live stores are exactly this asset.

## Accordion on mobile
- No surveyed top-tier portfolio uses an accordion on the home page.
- If used: native details/summary first, multi-open, first panel open by default, panels stay in DOM, grid-template-rows 0fr to 1fr, reduced-motion respected, button inside a heading with aria-expanded.

## Naming candidates
- Category for the business-automation work: Operations that run themselves; Back office on autopilot; Businesses that run without me; Family businesses, systemized; The boring parts, automated.
- Trading console: Kaizen Desk; Paper Floor; Model Pit; Kaizen Sandbox; Open Book.
- Component system: StoreKit (keep); Shelf; Checkout Primitives; Storefront Engine; Commerce Blocks.

## Hero spines (candidates)
1. Founding engineer on a commerce engine that runs many brands from one codebase.
2. I build the store once and ship it eight times.
3. One component system, eight live storefronts, two family businesses on it.
4. I build storefronts for brands and operating systems for farms and mills.
5. I make the same code wear eight different brands.
6. I build the software a family business runs on, from checkout to feed mill.

## 15 rules
1 one-sentence first line with verb + employer. 2 max 4 featured. 3 flat archive table. 4 about folded into intro. 5 one number per featured item, only real ones. 6 StoreKit led by install command + live URL. 7 range via a brand switcher over one storefront. 8 name the kit for the layer it owns. 9 nav: components, blocks, stores. 10 outcome names for family-business work. 11 static thumbnails on home. 12 details/summary first, multi-open. 13 panels in DOM. 14 a writing section even with 3 posts. 15 Install or Deploy as a first-class CTA.
