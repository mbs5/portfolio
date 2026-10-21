# StoreKit figure: the token proof press

Fig 2 for section 02 (StoreKit). An isometric SVG of a small proof press.

## Concept

- **The forme is the component set.** Eight type-high blocks are locked in a chase: hero, catalog, product page, cart, checkout, account, proof of testing, compliance gate. Each block carries the relief of its surface. These blocks never change.
- **The token cards are the token sheet.** A rack on the left holds eight cards, one per demo brand. Each card has an index tab with three colour stripes (brand, ground, tint) and is marked `tokens.css`. An index lever on a notched quadrant (eight notches, one per card) lifts one card out of the rack.
- **The ink roller reads the card.** The roller takes the lifted card's brand colour, rolls across the forme, and the proof on the delivery board re-inks behind it with that card's three colours and its corner radius (Lumen is square at 0px, the others are 12px). The blocks stay identical on every pull, and the old look never shows through the new one.
- The caption says the stores are being moved onto the contract one at a time. It does not claim they have all migrated (see `notes/facts.md`).

Token values: brand and ground are the swatch hexes the site already shows for each live demo. Tint is each app's `--accent-tertiary` (Vector has none, so its `--bg-primary`). Radius is each app's `--radius-lg`. The tint and radius come from `apps/*/src/styles/design-system.css` in the StoreKit repo.

## Parts

68 solids and about 870 paths. Base on four feet with corner screws, groove, ruler strip and maker's plate. Card rack: tray, cheeks, back stop, 8 cards with 8 tabs, detent quadrant, pivot boss, lever arm, knob and hub. Two rails with four end stops. Bed, four chase bars, quoin, 8 forme blocks. Carriage: two cheeks, ink roller, rider roller, crossbar, axle caps and knurled cap. Delivery board with two fences, the proof sheet and two grippers.

## Behaviour

- An idle tour pulls the next card every few seconds. Clicking or tapping the figure pulls the next card, and clicking a card tab pulls that card. Arrow keys, Home, End, Enter and Space work when the SVG has focus.
- Each pull: the lever swings to its notch, the card lifts, the roller re-inks, the carriage crosses the forme while the proof wipes to the new colours, and the carriage returns. A pull takes about 3.6 s.
- The readout in the bottom right shows the brand name, its radius and its three hex values. It is `aria-live`, and the SVG's `aria-valuetext` carries the same values.
- With `prefers-reduced-motion`, there is no tour and each pull snaps to the new state. Animation runs only while the figure is on screen (IntersectionObserver).
- Light theme is the default. Dark follows `prefers-color-scheme` unless `:root[data-theme="light"]` is set, and `:root[data-theme="dark"]` forces it, the same way as the site's `styles.css`.

## Files

- `build.mjs`: `node build.mjs` writes both outputs. It uses the copied kit in `kit/` (`iso-kit.mjs`, `lathe.mjs`, from the anatomy skill) and has no other dependencies.
- `embed.html`: the figure itself, one `<svg class="skf">` with a scoped `<style>` inside, followed by one `<script>`. No external files, fonts or libraries.
- `figure.html`: a standalone preview page with the embed and the caption. `?theme=light|dark` forces a theme and `?b=0..7` opens on a brand. These are for screenshots only and the embed ignores them.
- `preview.png`: 1100x760, light theme, Caldera. `preview-phone.png`: 390 px wide, light theme, Lumen (radius 0).

## Embedding

Paste the contents of `embed.html` into the StoreKit `<div class="media">` in `site/index.html`, replacing or sitting above the swatches. The script finds its SVG as its previous sibling, so keep the two together. Fonts come from the site (Fraunces, Instrument Sans, JetBrains Mono), with system fallbacks. Paste it as static HTML. Inserting it with `innerHTML` will not run the script.

## Checks run

- The skill's line-end check (`scripts/lines.mjs`) passes in both themes: 0 floating ends.
- Console is clean. I captured a motion contact sheet across one full pull.
- I checked 4x close-ups of the rack, lever, carriage and proof in light and dark. The fixes from that pass: the label is on the active card, and the maker's plate moved to the front left.
- There are no em dashes, en dashes or middle dots in any output. The build fails if one appears.

## Unfinished or worth knowing

- `embed.html` is about 228 KB, because the proof's print layer is pre-projected four times (old and new slot, two radius variants). Minifying the path numbers or building the print paths at runtime would cut it roughly in half.
- The kit's geometry audit (`audit.mjs`) was not run. The figure has no pipes, cables or turned bodies that cross each other, and the painter's order is set by hand from separating planes.
- At 390 px the drawing works but the cards' colour stripes are small. The readout below carries the colours in full.
- Headless Chrome's `--window-size=390,700` still lays out at about 500 px wide. `preview-phone.png` was taken through the skill's `drive.mjs`, which sets a true 390 px viewport. The shot came out 398 px wide and I cropped it to 390.
