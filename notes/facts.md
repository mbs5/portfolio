# Verified facts for copy (collected 2026-10-05)

Rule: nothing on the site may claim more than what is written here. Qualitative over invented numbers.

## Identity
- Muhammad Bin Sohail. CTO / founding engineer at Built By Design (BBD). CS at University at Buffalo, graduating Summer 2027. Owner of Closed Loop Intelligence LLC (NY).
- Email for the site: muhammad@closedloopintel.com. Instagram @muhammadbsohail, 16.5k followers (figure given by MBS). GitHub mbs5. X @mbsdot (memory: X dashboard). Based in Buffalo, New York, and Lahore (memory).
- Peptiful revenue figure: "$12M a year" is OPERATOR-REPORTED. Always qualify.

## StoreKit (headline, local repo ~/Desktop/Workspace/storekit, committed 2026-10-05, no remote yet)
- VERIFIED 2026-10-05 against the repo: none of the eight apps imports @storekit/ui (no package.json dep, no preset, no CSS import). Each app ships its own src/styles/design-system.css with hex values. The shared package holds the written contract (preset.js, tokens.css, fonts.ts). Honest claim: eight themed storefronts + one image pipeline + a written token contract they are being moved onto. Never claim shared components or "no hex in components" as shipped.
- Built October 2 to 4, 2026 (BUILD-ORDER.md). Solo by MBS. Vanta Bio demo is deployed on the ash-rahmans Vercel team, the rest on personal projects.
- Tokenized e-commerce component system ("shadcn for ecommerce") + 8 fully working demo storefronts, each a distinct brand, each live on Vercel.
- Stack: Next.js 15 App Router, React, TypeScript, Tailwind, pnpm workspaces, Turborepo. Node 20.19 pinned.
- Design contract: @storekit/ui = Tailwind preset + tokens.css (RGB triplets as CSS vars, 50 to 900 brand ramp + neutral ramp + semantic surfaces, dark via data-variant). Reskin = edit ONE tokens.css. No hex in components.
- 8 brands: Vanta Bio (cobalt), Halcyon Labs (gold/graphite), Caldera Peptides (oxblood/gold), Solace Bio (sage), Lumen Peptides (violet), Keystone Peptides (amber), Nucleus (lime/black), Vector Peptides (magenta/black).
- 114 product images generated through a logo-locked image pipeline (mark as reference image so the logo renders on glass, not a sticker). 24 logo-locked bases.
- Each demo stands alone: local catalog snapshot replaces the backend read path, no cross-brand data leak.
- Live: vanta-bio-ash-rahmans-projects-c41122ac.vercel.app, halcyon-labs-tau.vercel.app, caldera-peptides.vercel.app, solace-bio-ten.vercel.app, lumen-peptides-ruddy.vercel.app, keystone-peptides-ten.vercel.app, nucleus-peptides-two.vercel.app, vector-peptides-beta.vercel.app (all 200 on 2026-10-05).
- Honest caveat: packages/storekit today is the preset + tokens + fonts; the component variants live inside the apps. "Component library" is the direction, the shipped proof is 8 themed stores on one contract.

## Peptiful engine (BBD)
- Timeline: central BBD build from October 2025 through 2026 (wiki). "2025 to now" is accurate.
- Multi-tenant commerce + telehealth platform: one product list, one stock count, many branded storefronts; patient intake, physician matching, fulfillment/pharmacy backend, SMS automation, multi-tenant subaccounts. MBS owned UI + integration; backend by Advait. New brand goes live in days because the engine exists.
- "Eight brands" was used in the Farhan deck; the portfolio currently says five white-label brands. Use "multiple white-label health brands" unless MBS confirms a number.

## Agriful + EggFlow
- EggFlow first commit and go-live 2026-07-24 (git log + memory: real data entered the same day). Agriful story built September 2026. "The farm vet" is the person the family calls the doctor, who sends production reports.
- EggFlow: lean ERP for the family's 3 layer farms (~100k birds each). Replaces WhatsApp'd Excel screenshots and handwritten Urdu registers. Next.js 16 + Tailwind v4 + Supabase. Live at eggflow-three.vercel.app (private logins, do not link publicly; link the Agriful story instead). AI bill scan: photo of a handwritten memo to a prefilled form (vision model + strict JSON schema), verified against a real memo. Sales settlement split cash/online/credit, aging per customer, day closes only when numbers reconcile. 87 tests pin the paper numbers. PWA.
- Agriful: the operating model for feed mills, presented as a service blueprint (Need, Order, Credit check, Dispatch, Delivery, Payment, Plan). It is a PROPOSAL, say so. Story: agriful-story.vercel.app.

## Kaizen (kaizeniq.vercel.app)
- Stack verified from the live page: Next.js and Clerk sign-in. Landing is a Clerk sign-in page in development mode.
- BYO-key console wrapping two swarm-simulation engines (MiroShark, MiroFish) for traders: scenarios, calibration, engine comparison, hit-rate over time, reports. One OpenRouter key drives every model slot; keys never leave the browser. Built first for a friend's father; aspiration: a gateway for prediction models. Do NOT list MiroShark/MiroFish as separate projects.

## Healthpedia (healthpedia-beta.vercel.app)
- Git: 2026-08-07 to 2026-08-15, solo. README: MCP server via mcp-handler with bearer auth; full version log on the record.
- Family health record humans can read and AI agents can safely write to. Origin: hand-maintained PDF for a 76-year-old grandmother in Lahore, three doctors, conflicting plans. Agents propose, humans publish: MCP server, every proposed field carries confidence + evidence (cropped source image or the exact voice-note sentence), confirmation queue. Next.js, Postgres, Vercel Blob, mcp-handler.

## Longevity OS (longevityos.builtbydesign.io)
- Live page lists "AI coach" among the coach views. Claim only that it sits beside the human coach.
- Coach and client operating system: intake in 60 seconds from biometrics, review queue, plans, daily logs, AI coach, labs, protocols, sleep, workouts, analytics. Built at BBD.

## Peptides, a Closed Loop Intelligence property (peptides.closedloopintel.com)
- Live page text: naming, logo, brand book, packaging and label systems; conversion-tuned store with COA proof; paid social, creative engine, email and SMS; scale and operations loop.
- Brand site: "We build and scale peptide brands. Operations that run themselves." Sense, Build, Act, Learn loop. It is a service brand site, not a CLI tool; the old label "Peptides CLI" meant Closed Loop Intelligence.

## Worn (worn-vault.vercel.app)
- Git: 2026-09-14 to 2026-09-22, solo.
- Private wardrobe app + MCP connector for ChatGPT and Claude. Expo/React Native, stateless Node API, Supabase auth/Postgres/private photo storage. 15 MCP tools, OAuth consent, PKCE, dynamic client registration. Brand lookup, bulk photo import, weather-based outfit suggestions, wear logging, conflict detection, guarded undo.

## Llama Launch (launch.codingden.co, github.com/mbs5/llama-launch)
- Meta Llama Impact Hackathon (lablab.ai), finalist for Best Developer-Productivity Tool. Llama-3 copilot: rough idea to PRD, architecture diagram, tech-stack plan and Figma prototype in under five minutes. Next.js + Together AI + LlamaIndex + Restack. Built during the semester away from school.

## Removed by MBS's instruction
ICS Coach MCP (encode), MiroShark engine, MiroShark Trader, MiroFish Trader, Rewire, Kolb's tracker, all research framing.
