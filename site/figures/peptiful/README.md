# Peptiful figure: one stock count

The site's section 01 says Peptiful puts one catalog and one stock count under several white-label health brands. This figure turns that into a machine you can operate.

## The machine

It is a dispensing cabinet with one hatch per brand on the front. Each hatch has its own brand mark, push button, delivery pocket and readout window. Behind every window is a number drum, and all the drums sit on one shared shaft. Pressing any hatch's button turns that shaft one tooth of a 24 tooth ratchet on the side of the cabinet, so every window rolls to the same new number at once. The stock itself is one tray of 24 vials on top of the cabinet. A sale lifts the vial nearest the selling hatch out of the tray and drops one into that hatch's pocket. At zero every window reads 00 together and the buttons stop selling, so no shop sells what is not there.

The fourth bay is open, and you can see the shaft and a bare drum through it. A blank hatch module waits in front of it on a carriage and rails. Slide it in and it couples to the shaft and reads the shared count straight away. That is "a new brand goes live in days, because the engine already exists".

Claims stay inside `notes/facts.md`: no brand count, no revenue figure. The brands are labelled A, B, C and New.

## Interaction

- Tap or click a brand hatch to sell one vial. Tapping the parked blank hatch slides it in.
- Keys, with the figure focused: `1` to `4` sell at a hatch, `N` slides the new brand in or out, `R` restocks.
- The live readout under the drawing shows the shared stock and each brand's reading, for example `Stock 22. A 22, B 22, C 22, New --.`, and a polite live region announces each sale.
- An idle tour sells at random hatches, brings the new brand in after a few sales, runs down to zero, then restocks. It stops when you interact and resumes after 9 s of quiet.
- `prefers-reduced-motion`: no tour, and every change happens instantly. Off screen, an IntersectionObserver cancels the animation frame, and nothing runs while the figure is at rest.

## Parts

91 drawn parts: base plate, 4 feet (8 solids), 4 corner screws, label plate, 2 rails, 2 end stops, ruler strip, plinth, body, cornice, ratchet boss, ratchet wheel, toothed ring with pointer, pawl block, pawl finger, stock tray, 24 vials (body, neck, bronze cap), 4 hatch panels each with a readout window and drum, a delivery pocket, a flap hinge slot, screws and a push button with its bezel, the open bay's shaft, drum, two collars and two bearing blocks, and the carriage, two gussets and a knurled pull knob. That is 67 distinct parts plus the 24 identical vials. It is a little over the 40 to 80 range for a Figure because the vials are the stock you watch.

## Files

- `build.mjs`: the build. Run `node build.mjs` and it writes the two HTML files. It has no dependencies beyond Node. The kit it uses is copied into `kit/` (`iso-kit.mjs`, `lathe.mjs` from the anatomy skill).
- `figure.html`: a standalone preview page with a card, a legend and a caption. It defaults to light. Add `?theme=dark` to the URL to see dark.
- `embed.html`: the figure only. It is a `div.pf-fig` holding the inline SVG (with its own `<style>` inside), a hint and readout row, a visually hidden status line, and one `<script>`. It has no external dependencies and comes to about 157 KB uncompressed, most of it SVG path data, so it gzips well.
- `preview.png`: 1100x760, taken with the headless Chrome command from the brief.
- `preview-phone.png`: 390x700. Headless Chrome's `--window-size` will not lay out narrower than about 500 px, so the plain command clipped the page. This shot was taken through the anatomy skill's `drive.mjs` with a real 390 px viewport (`--width 390 --height 700`), after two sales, with reduced motion.

## Embedding on the site

Paste the contents of `embed.html` into section 01's `<div class="media">`, replacing the current `.dg` flat diagram:

```html
<div class="media">
  <!-- contents of site/figures/peptiful/embed.html -->
</div>
```

- Theme: the figure takes the light tokens by default. It switches to the dark tokens under `prefers-color-scheme: dark` unless the page root has `data-theme="light"`, and always when the root has `data-theme="dark"`. That is the same rule the site's `styles.css` uses.
- Fonts: the drum digits and readout use `JetBrains Mono` and the hint uses `Instrument Sans`, both of which the site already loads. System fonts stand in on their own.
- The only accent is cobalt (`#1F4E9E`, or `#7FA6E6` in dark), and it is used only for the shared count: the drum digits, the ratchet pointer and the stock number in the readout. The vial caps are a bronze tint.
- The script finds its figure through `document.currentScript.previousElementSibling`, so keep the `<script>` directly after the `div.pf-fig`. It runs once per figure.
- Global CSS: the kit's drawing rules use `.iso-*` class names and are not scoped. They have to stay unscoped because the vials and buttons are drawn through `<use>`, and `<use>` instances do not match ancestor selectors. The figure's own rules are all under `.pf-`.

## Checks done

- `scripts/lines.mjs` (through `drive.mjs`): 0 floating line ends, in light and dark, at rest, with the module docked and sold out.
- 4x close-ups of the side ratchet and pawl, a hatch (window, drum, button, pocket), the open bay with its shaft, and the vial tray. The first pass found a pawl floating above the wheel (it now has a finger on the teeth), neighbouring drum numbers bleeding into the window (the drum pitch is now larger), and the new drum showing nothing before docking (it now shows `--`).
- Console clean. The readout and drums were checked through a full sell-out (`00` everywhere, and a further sale is refused).

## Unfinished

- The geometry audit (`kit/audit.mjs`) is not wired in. The figure has no pipes or cables, and its painter's order is simple (base, cabinet, tray, front panels, then the module in front), so it was checked by eye at 4x instead.
- The drums are drawn as flat number strips seen through a shaded window, not as curved surfaces.
- The vial that lifts out of the tray fades out above it and does not travel visibly to the hatch. The pocket vial fades in at the selling hatch instead.
