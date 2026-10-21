# Fig 04, Healthpedia: the confirmation desk

An isometric figure for section 04. It is pure SVG with no WebGL and no 3D, built with the Anatomy kit.

## Concept

The figure is a confirmation desk: a bench that turns "agents propose, a human approves, every entry carries its source" into a machine.

- **Sources.** Three prescription spikes (one per doctor) and a pocket voice recorder are wired into a box engraved `MCP`. That box is the agent. Its wire flows when a card is filed.
- **Proposals.** The agent drops proposal cards out of a slot in its side into an intake tray. Each card has a source tab. A left tab with a waveform is a voice note, and the card shows the quoted sentence as a waveform strip. A right tab with a frame and one to three dots is a prescription photo from doctor 1, 2 or 3, and the card shows a cropped region.
- **The human.** The top card moves onto a platen under a hand stamp. Pressing the stamp (approve) inks a cobalt mark on the card. Only stamped cards travel on into a book press that holds the bound record.
- **Reject.** A pusher on the platen sweeps the card off the back edge into a reject bin. A rejected card never reaches the press.

The readout shows pending, approved and rejected counts, plus the source of the card under the stamp. Every claim stays inside `notes/facts.md`: agents propose through MCP, a family member approves, and every field carries its evidence, either a crop of the photo or the exact sentence from the note.

## Interaction

- `N` (or `F`, or tapping the agent box) files a new proposal. The tray holds at most 6.
- `A` (or tapping the stamp) approves the card on the platen.
- `R` (or Delete or Backspace, or tapping the pusher or the bin) rejects it.
- The three tap targets are focusable buttons, so Enter and Space work on them.
- When nobody touches the figure, an idle tour runs. It resumes 6 s after the last input.
- The loop stops when the figure is off screen (IntersectionObserver) and when it has nothing left to do.
- Under `prefers-reduced-motion`, the tour is off and every action jumps straight to its end state.
- On widths under 460 px, the corner text grows to stay legible (about 10 px on a 390 px phone), and the hint changes to "tap agent, stamp, pusher".

## Part count

- About 85 solids in the machine:
  - bench with feet, ruler and label plate
  - bin with five walls and a card holder
  - agent box with lid, slot, lip, lamp and four sockets
  - three spikes with slips, and the recorder
  - tray
  - platen with mat and pusher
  - stamp pillar, arm, housing, plunger, spring and knob
  - press: base, bed, columns, crossbar, nuts, plate with guide ears, screw, and a capstan with four balls
- Up to 23 cards on top of that: 6 in the tray, 10 in the record, 5 in the bin, and 2 moving.
- That is a little over the Figure tier's 40 to 80 once the cards are counted.

## Files

- `build.mjs` is the framework-free build. Run `node build.mjs` to write both outputs. It imports the copies of the Anatomy kit in `kit/` (`iso-kit.mjs`, `lathe.mjs`), so the folder builds on its own.
- `figure.html` is a standalone preview page. It uses light by default; add `?theme=dark` for dark.
- `embed.html` is the paste-in. It contains one inline `<svg class="hpf">` (its own scoped `<style>` and `<defs>`) followed by one classic `<script>` that finds the SVG as its previous sibling. It has no external dependencies.
- `preview.png` is 1100x760 and `preview-phone.png` is a 390 px viewport.

## How to embed

Replace the contents of section 04's `<div class="media">` with the contents of `embed.html` (drop the first comment line if you like). The figure reads the site's tokens (`--surface`, `--ink`, `--muted`, `--rule`, `--cobalt`, `--mono`), so it follows the site theme. That covers `prefers-color-scheme` and `:root[data-theme]`. The SVG scales to the column width.

All ids are prefixed `hp`/`hpf`, and every CSS rule is scoped to `.hpf`. Embed it once per page: the ids are not unique across two copies.

## Checks done

- The skill's line-end check (`scripts/lines.mjs`) passes at 0 floating ends. One floating highlight on the stamp arm was found and removed.
- 4x close-ups were taken of the stamp, agent box and press, and of mid-reject and mid-approve frames, in light and dark.
- Contact sheets were taken of approve, reject and file.
- Reduced motion was run with key input.
- The console is clean.

## Unfinished or known limits

- `embed.html` is about 245 KB raw and about 45 KB gzipped. Static cards are `<use>` copies of one drawn card, but the bench, press and parts are still plain paths. Fewer facets on the small cylinders would cut it further.
- The pipe and depth audit (`kit/audit.mjs`) was not run. The figure has no pipes or turned bodies apart from two `lathe` parts, so the painter's order was set by hand, zone by zone, and checked by eye at 4x in moving frames.
- The line check does not see inside `<use>` copies. The card artwork was checked visually instead.
- Cards stay flat when they drop into the bin or onto the record. There is no tilt.
- The record shows at most 10 sheets and the bin at most 5. The counts keep going past that.
