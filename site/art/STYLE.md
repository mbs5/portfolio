# Project art: style contract (pass 10, 2026-10-21)

Four static images, one per project, that read as one printed set. Retro screen-printed poster: flat, two inks on a tangerine ground, hand-drawn line, slight grain, slightly off registration. They must look made by a person with intent, not generated. No animation.

## Canvas
- Plain SVG file, `viewBox="0 0 800 600"`, `width="800" height="600"`, no external references, no scripts, no `<text>`, no embedded raster.
- Full-bleed ground: `<rect width="800" height="600" fill="#FF5C34"/>`.
- One subject, centred, with generous ground around it: keep every mark inside x 90 to 710, y 70 to 540.

## Inks (exact, nothing else)
- Ground: Tangerine `#FF5C34`.
- Ink 1, line and solid accents: Black Cherry `#351E28`.
- Ink 2, flat fill planes: Cool Blue `#D7EFFF`.
- No gradients, no opacity tints, no shadows, no other colours. Shading, if any, is done with Black Cherry hatching or stipple dots, as a printer would.

## How it is drawn
- Order: Cool Blue fill planes first, then Black Cherry linework on top.
- Misregistration: wrap all Cool Blue fills in `<g transform="translate(4 3)">` so the fill sits a few pixels off the line, like a two-pass screen print.
- Line: strokes in Black Cherry, `stroke-width` 6 for outlines, 3.5 for interior detail, `stroke-linecap="round" stroke-linejoin="round" fill="none"`. Draw shapes as hand-plotted paths with slight irregularity (no perfect rects or circles for main forms; nudge points by 1 to 3 px). Fill closed areas that need it with Cool Blue in the fill layer, not on the line path.
- Apply the wobble filter to the linework group and the fill group, and the grain to the whole picture (snippets below, copy them exactly so the four images match).
- Style reference: mid-century jazz poster illustration. Confident contour, a few interior lines, big simple shapes, some areas of solid Black Cherry for weight. Front or three-quarter view. NOT isometric, NOT technical, NOT cute cartoon, NOT clip art.
- No words, letters, numbers, logos or brand marks anywhere. Abstract marks (dots, bars, circles, triangles) are fine where text would be.

## Shared defs (copy verbatim)
```xml
<defs>
  <filter id="wobble" x="-5%" y="-5%" width="110%" height="110%">
    <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="3.2" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
  <filter id="grain" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" result="noise"/>
    <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0.208  0 0 0 0 0.118  0 0 0 0 0.157  3.5 0 0 0 -2.1" result="specks"/>
    <feComposite in="specks" in2="SourceGraphic" operator="in" result="ink"/>
    <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="ink"/></feMerge>
  </filter>
</defs>
```
Structure:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600" role="img" aria-label="...">
  <defs>...</defs>
  <g filter="url(#grain)">
    <rect width="800" height="600" fill="#FF5C34"/>
    <g filter="url(#wobble)">
      <g transform="translate(4 3)" fill="#D7EFFF" stroke="none"> ...fills... </g>
      <g fill="none" stroke="#351E28" stroke-linecap="round" stroke-linejoin="round"> ...lines and solid cherry accents... </g>
    </g>
  </g>
</svg>
```
The grain adds fine Black Cherry specks over everything (tested 2026-10-21, reads as screen-print grain). Do not change it.

## Claims
Each image only shows what notes/facts.md says. No numbers, no brand names, no revenue, no logos.
