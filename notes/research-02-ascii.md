# Research 02: ASCII for an ivory/bronze classical site (2026-10-05)

## Techniques and cost
- Canvas image to ASCII (CPU, zero deps): downsample to cols x rows (rows = cols * h/w * 0.5), luminance 0.2126r+0.7152g+0.0722b, contrast/invert, map to ramp. 120x60 cells is trivial on phones. Ramps: " .:-=+*#%@" (10) or the 70-level one (reverse for light backgrounds).
- three.js AsciiEffect: DOM text per frame, showcase-grade only, heavy on mobile. Skip.
- WebGL ASCII shader: per-fragment constant cost, 60fps on phones; glyphs from an atlas or mattdesl's 25-bit procedural glyph trick. Add Sobel edges and draw | / \ _ by gradient angle to avoid blobs (Acerola, Codrops shape-aware renderer).
- Pure text scramble on hover: under 1KB.
- Donut-style math renders: ~2k points per frame, render to one pre via textContent.
- Noise fields (ASCIIGround, MIT) or hand-rolled sin/cos field at 8 to 12 fps.
- Braille spinners from cli-spinners, 80ms swap.

## Dithering to characters (engraved look)
- Atkinson (6/8 of error to 6 neighbours) reads like a woodcut; Floyd-Steinberg keeps smoother gradients.
- Character sets that read as engraving, not terminal: hatching " ˙·:;=≡#"; diagonal " ╱╲╳" chosen by Sobel angle; mosaic " ░▒▓█"; Braille U+2800..28FF (2x4 dots per cell) with Atkinson 1-bit looks like stipple engraving. Braille bits: left col 1,2,4,0x40; right col 8,0x10,0x20,0x80.

## Own builder (~150 lines vanilla)
state {ramp, cols, contrast, gamma, invert, dither, mode}; sample -> adjust -> dither -> encode -> frames(n, fn) perturbing threshold/noise/sweep; export JSON {cols, rows, fps, frames}; play by swapping pre.textContent at 6 to 12 fps. 24 frames of 100x50 gzips to ~15KB.

## Guardrails
- pre aria-hidden role=presentation with fixed width in ch and height in em, overflow hidden: zero CLS.
- prefers-reduced-motion: first frame only. Cap fps; pause offscreen (IntersectionObserver) and on hidden tab.
- Fonts: "Geist Mono","IBM Plex Mono","JetBrains Mono",ui-monospace,SFMono-Regular,Menlo,Consolas,monospace; font-variant-ligatures none; letter-spacing 0; line-height 1.2. Test Braille glyph width in the chosen font.
- Every effect has a static first frame that is finished art on its own. One glyph colour (bronze or warm grey), no green, no glow, no scanlines, slower than 12 fps.

## Six placements that fit ivory and bronze
1 Ionic capital in Atkinson Braille that cross-fades to the photo, cells dissolving with random delays. 2 Drifting meander frieze from box-drawing glyphs, one cell every 2s. 3 Breathing laurel wreath in Braille, threshold on a slow sine. 4 Tessera mosaic reveal with ░▒▓█ filling from the centre. 5 Inscription hover scramble through IVXLCDM. 6 Column-drum Braille loader.

## Tasteful references
efecto.app (Codrops 2026), ascii.theater (MSCHF), skills.sh typed logo, upvent.co, Davor G. Zelic portfolio (NINETHREE), asciify.org engine (Braille/Dither/Lines/Mosaic, reduced-motion built in), ascii-motion.app editor, FabianIMV self-healing portrait, Codrops Bayer dithering guide, Maxime Heckel dithering essay. Avoid eloyb.design-style glitch maximalism.
