# EggFlow figure: the day-close bench

## Concept

EggFlow is drawn as a counting bench. Three hoppers, one per farm, each have a counter. They drop egg tokens into a trough that feeds one ledger drum, which shows the running total. In front sits a shop balance. Its left pan carries crates for everything produced. Its right pan carries crates for everything sold, counted into stock or broken. Production pushes the left pan down. A sale and a stock count bring the right pan back up.

At the right is the day-close lever. A level-sense rod runs to it from the balance. While the beam is off level, a latch block sits across the lever slot, so a pull stops short and springs back ("refused"). When produced equals sold plus stock plus broken, the latch slides clear, the lever goes all the way through, and a cobalt flag rises. That is the day closed.

The till at the front has three dishes, for cash, online and credit, and each sale splits across them. Every credit sale also files a slip in the ageing rack at the front left. The rack has three slots for 0 to 30, 31 to 60 and over 60 days, marked with one, two and three dots.

The claims stay inside notes/facts.md: three farms, petti as the unit (360 eggs), cash, online and credit split, ageing buckets, and a day that closes only when the numbers reconcile. The label plate reads the go-live date, 24.07.26. All counts are illustrative, and the hint says so.

## Size

This is a Figure: about 75 parts, counted in `build.mjs` (`parts`). It is pure SVG, with no WebGL and no 3D. Repeated pieces (14 crates per pan, 24 coins, 15 slips, 9 tokens) are drawn once in `<defs>` and placed with `<use>`.

## Interaction

- Tap a hopper, or press 1, 2 or 3, to log 12 petti at that farm. Three tokens roll into the drum, the counters step up and the left pan drops.
- Tap the till, or press S, to sell 10 petti from the farm with the most on hand. The coins split and a credit slip is filed.
- Tap the right pan, or press C, to count the stock. Every unaccounted petti goes to stock, plus one broken when ten or more are open.
- Tap the lever, or press L, Enter or Space, to pull. When the beam is off level it refuses. When level it closes the day, and pulling again opens a new day.
- The button row under the readout does the same things, for touch and keyboard users.
- An idle tour runs only while the figure is on screen. It covers production, a refused pull, the stock count, a sale, the close and a new day. It pauses for 12 s after any input.
- With `prefers-reduced-motion`, there is no tour and every move snaps.
- Animation runs only while the figure is on screen and something is moving.

## Files

- `build.mjs`: run `node build.mjs`. It writes `figure.html` and `embed.html`. It has no dependencies beyond the vendored kit in `kit/`, which is a copy of the anatomy skill's `iso-kit.mjs` and `lathe.mjs`.
- `figure.html`: a standalone preview page with the site tokens. It is light by default and goes dark under `prefers-color-scheme: dark` or `:root[data-theme="dark"]`.
- `embed.html`: one `<style>`, one `<div class="ef">` holding an inline SVG plus a small HTML readout and buttons, and one `<script>`.
- `preview.png` is 1100x760 and `preview-phone.png` is 390x700, both in the light theme.

## Embedding

Paste the whole contents of `embed.html` inside the EggFlow `<div class="media">` in `site/index.html`, replacing or following the current `ul.ledger`. It reads the site's own `--surface`, `--ink`, `--muted`, `--rule`, `--bronze`, `--bronze-deep`, `--cobalt` and `--mono` variables, with fallbacks, so it follows the site's light and dark themes. The script finds its figure as the element just before it. Run it only once per page, since the `<defs>` ids (`ef-crate`, `ef-slip`, `ef-coin`, `ef-token`) are global.

## Checks done

- The anatomy line-end check (`scripts/lines.mjs`) reports `line ends: 0`.
- 4x close-ups were checked in light: hoppers and counters, drum, balance and scale, lever and latch, rack and till. Full views were checked in dark, at desktop and at 390 px. No sideways scroll, and the console is clean.
- The first draft was iterated. The pans covered the farm counters, so they were moved forward and the stacks shortened. The beam was too thin to read, so it was made chunkier. The lever rod started above the slot, so it was fixed. The rack's dividers and slips were in the wrong paint order. The label plate text overflowed. Floating line ends were fixed on the drum spokes, the counter windows and the scale ticks.

## Unfinished or known limits

- The embed is about 194 KB raw, about 41 KB gzipped. Most of it is detail paths (the egg-tray cups, the knurls and the feet). Removing the egg cups would save about 25 KB.
- The beam is a solid rotated about one pivot. The parallel link of a real Roberval scale is not drawn, and the pans simply move straight up and down.
- The kit's `audit.mjs` was not run, since the figure has no tubes or turned pipework. Depth order was checked by eye at 4x.
- The tokens are visual only. The counters update at the moment of the tap, not when a token lands.
- The figure says "Fig 3". Change the text in `build.mjs` if the numbering on the site differs.
