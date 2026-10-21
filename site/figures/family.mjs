// One self-labelling style for all four figures (site pass 9). Every embed wraps its drawing in
// div.fig-fam with the same head (figure number left, title right) and the same foot
// (live readout in mono first, the interaction hint in sans after it). Each build imports this
// and inlines FAMILY_CSS into its embed, so the embeds stay self-contained.

export const FAMILY_CSS = `.fig-fam{background:var(--surface,#FAFAF9);border:1px solid var(--rule,#E6E6E3);border-radius:6px;padding:12px 16px 12px;color:var(--ink,#111111);font-family:var(--sans,"Instrument Sans","Helvetica Neue",Helvetica,Arial,sans-serif)}
.fig-fam .fig-head{display:flex;justify-content:space-between;align-items:baseline;gap:12px;font-size:13px;line-height:1.4;color:var(--muted,#6B6B6B)}
.fig-fam .fig-no{font-variant-numeric:tabular-nums;letter-spacing:.02em}
.fig-fam .fig-title{color:var(--ink,#111111);font-size:14px;font-weight:500}
.fig-fam .fig-foot{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;gap:4px 20px;margin-top:8px;padding-top:10px;border-top:1px solid var(--rule,#E6E6E3)}
.fig-fam .fig-read{margin:0;font-family:var(--mono,"JetBrains Mono",ui-monospace,SFMono-Regular,Menlo,monospace);font-size:12.5px;line-height:1.5;color:var(--ink,#111111);font-variant-numeric:tabular-nums}
.fig-fam .fig-read b{font-weight:600;color:var(--cobalt,#1F4E9E)}
.fig-fam .fig-hint{margin:0;font-size:13px;line-height:1.45;color:var(--muted,#6B6B6B)}
@media (max-width:600px){.fig-fam{padding:10px 10px 10px}.fig-fam .fig-head{font-size:12px}.fig-fam .fig-title{font-size:13px}.fig-fam .fig-read{font-size:11.5px}.fig-fam .fig-hint{font-size:12px}}`;

export const head = (no, title) =>
  `<div class="fig-head"><span class="fig-no">Fig ${no}</span><span class="fig-title">${title}</span></div>`;
