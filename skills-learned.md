# Skills Learned — Portfolio Build (started 2026-10-04)

Small, compounding skills picked up while learning to build this portfolio right.
Final report goes to the user with the finished site.

## 1. Template choice (decided)
**Magic Portfolio for Next.js** (free) — the browser survey found no natively
Roman/Greek templates on 21st.dev, so the pick is the best *base for transformation*.
Magic Portfolio's type-led, restrained minimalism maps directly onto Roman editorial
design (inscriptions, stone tablets, manuscripts). Restyle = ivory/stone palette +
classical serif (Cinzel/Cormorant) + Greek-key/rule ornaments. Less structural work
than the dark dramatic option, cleaner fit than the dev-grid.

## 2. Intaglio/engraving prompt vocabulary
Core trigger keywords: intaglio-style, drypoint, engraving, mezzotint, aquatint,
etched lines, cross-hatching, tonal depth, fine linework, etched textures.
Prompt pattern: "A [subject] created in the intaglio etching technique, showing
[detail1] and [detail2]." (source: tensor.art intaglio guide)

## 3. The black-and-white + recolor trick
Image models can't hit an exact brand hex, but they're brilliant at pure black
and white. So: generate every emblem as black ink on plain white, then recolor
in post (black → deep bronze, white → ivory). (source: fionntobin.com,
"You're the art director, not the designer")

## 4. Consistency = reference as constraint
Don't re-describe the style each time — generate ONE master style reference,
then feed it into every subsequent generation as a style reference (GPT Image
2.5 treats the reference as a constraint, not inspiration). Identify each input
by index and role ("Image 1: style reference; apply its style to the subject"),
restate invariants every turn, change one or two things per turn.
(sources: marqeable.com on GPT Image 2.5 references; fangx-ai/awesome-image2.5 craft guide)

## 5. Prompt structure discipline
Subject + Setting + Style + Lighting + Composition + Technical. Always specify
aspect ratio. Never put complex text inside a generated image (overlay in HTML
instead). Avoid-lists short and targeted (e.g. "avoid gradients, avoid
photomosaic clutter"). (sources: ai-hands-engineer marketing-image-production
skill; tech-insider.org prompting guide)

## 6. kie.ai image API (from docs research)
- Auth: `Authorization: Bearer <KIE_API_KEY>`
- Create: POST https://api.kie.ai/api/v1/jobs/createTask with
  {model: "gpt-image-2-text-to-image", input: {prompt, aspect_ratio, ...}}
- Poll: GET https://api.kie.ai/api/v1/jobs/recordInfo?taskId={id} until state=success
- NOTE (2026-10-04): api.kie.ai unreachable from this VM (egress approval
  timeouts). Retry at build time; fallback is the built-in media pipeline.

## 7. Portfolio brand-design research — COMPLETE (2026-10-04)
15 opinionated principles from best-in-class teardowns (report: research_notes/portfolio-brand-design-20261004-1523/report.md).
The ones that change this build:
- One identity spine ("I build systems that run businesses"), never "passionate full-stack developer" — specific beats polished.
- Projects framed as problems solved, not things built.
- Featured case studies (deep) + archive list (thin) — matches our structure.
- Captions-first: a reader who only reads captions must get the whole story.
- Restraint: one grid, max two typefaces, text-led hero. Exemplars: leerob.io, Brittany Chiang.
- Exactly one signature interaction, never an effect grab-bag.
- Tables/lists over card-everything; break perfect regularity (varied dividers, uneven padding, sub-degree rotations).
- Purge every AI tell: purple/blue gradient hero, glassmorphism, blobs, gradient headline text, uniform border-radius, pills everywhere, Inter-as-display, fabricated stats.
- Conversational first-person voice; live links + real READMEs beat adjectives.
- Never invent metrics — honest qualitative statements only.
- Portfolio as locked visual brief (design system), maintained as a living asset.

## 9. Things I thought I knew but didn't (honest)
- Assumed `npx skills add https://kie.ai` was a standard installer — it hung 20+ min with zero output; killed it. Lesson: run third-party install CLIs with timeouts, in a sandbox, and always have a fallback path.
- Assumed 21st.dev package names from community docs (`21st`, `@21st-dev/mcp`) — both 404 on npm. Real package: `@21st-dev/cli`, auth via TWENTYFIRST_TOKEN env. Lesson: verify package names against the npm registry, never docs.
- Assumed "consistent AI image style" meant repeating a style description — actually it means one master reference image treated as a constraint + a locked prompt suffix. Re-describing drifts; referencing holds.
- Assumed the template's code was the asset — when the API was unreachable, learned the STRUCTURE is the asset. Rebuilding Magic Portfolio's structure natively (static HTML) was faster and gave full control of the Greek aesthetic anyway.

## 10. Emblem production pipeline (executed 2026-10-04)
Master mark (Ionic column + laurel, verified visually) → 6 section marks, each
generated with the master as an image reference + locked style suffix
("same intaglio engraving technique, same black ink cross-hatching, plain white").
The B&W→brand recolor trick implemented in CSS, not file post-processing:
`mix-blend-mode:multiply` melts the white into the ivory page,
`sepia(.32)` shifts ink toward bronze. 7/7 emblems, one consistent hand.

## 11. Deployment (executed 2026-10-04)
Vercel static deploy (`deploy.py --name portfolio --target production --wait`) →
domain via API (portfolio.closedloopintel.com, verified) → GoDaddy CNAME
(portfolio → cname.vercel-dns.com) → live HTTP 200 after ~1 min DNS propagation.
10/11 project links verified live; longeivxmd.com down on all variants, omitted
until back. Established pattern held — no surprises.
## 8. kie.ai technical reference — COMPLETE (2026-10-04)
- Create: POST https://api.kie.ai/api/v1/jobs/createTask —
  {model:"gpt-image-2-text-to-image", input:{prompt, aspect_ratio, resolution:"1K"|"2K"|"4K", nsfw_checker:false, background}, callBackUrl}
  aspect ratios: 1:1,16:9,9:16,3:2,2:3,4:3,3:4,4:5,5:4,21:9. 1:1 can't be 4K; auto AR forces 1K.
- Poll: GET https://api.kie.ai/api/v1/jobs/recordInfo?taskId= — states waiting|queuing|generating|success|fail;
  resultJson is double-encoded {"resultUrls":[...]}. 200 on create = accepted, not done.
- Balance: GET https://api.kie.ai/api/v1/chat/credit. Costs 6/10/16 credits per 1K/2K/4K (~$0.03/$0.05/$0.08). Failed tasks not charged. 20 creates/10s rate limit.
- Uploads: POST https://kieai.redpandaai.co/api/file-{stream,url,base64}-upload — FREE, auto-deleted after 24h. Never send local paths in createTask.
- CRITICAL: result URLs expire ~24h, records ~14 days → copy every result to durable storage immediately.
- Chaining: edit via gpt-image-2-image-to-image + input_urls[] (≤16 refs); upscale via grok-imagine/upscale (kie images only, pass taskId).
- No seed param — consistency via reference images + locked "brand fingerprint" prompt suffix.
- Workflow: iterate cheap at 1K, upscale the winner.

## 12. Rebuild pass, 2026-10-05 (what changed my mind)
- The research killed the accordion-first idea: no top-tier portfolio uses one on the home page. Secondary work gets the accordion; featured work gets full sections.
- "One engine, N skins" is the asset, not eight screenshots. A switcher over one frame with the token values changing is the whole StoreKit argument in one interaction.
- Braille plus Atkinson dithering reads as stipple engraving, which belongs in an ivory and bronze world. Plain ASCII ramps read as terminal and do not.
- A Muslim identity on a professional site is carried by one small mark and by geometry, never by iconography. Bismillah in Amiri at 18px, an eight-point star at 5% opacity, a meander frieze: that is the whole budget.
- Sampling the brand accent from each live store's own pixels gave honest token values for the switcher without inventing anything.
- Full-page screenshots lie when scroll-driven animations are on; shoot viewport by viewport with reducedMotion set.
- Never fix overflow with body overflow-x hidden; outline every element past the right edge and fix the cause (min-width 0 on grid children was the usual one).
