// EggFlow figure: a day-close counting bench.
// Three farm hoppers feed one ledger drum; a shop balance weighs produced
// against sold plus stock plus broken; the day-close lever only passes its
// latch when the beam sits level.
//
// node build.mjs   writes figure.html (standalone page) and embed.html (paste-in markup)

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "./kit/iso-kit.mjs";
import * as G from "./kit/lathe.mjs";
import { FAMILY_CSS, head } from "../family.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------- model
// Units are petti (1 petti = 12 trays = 360 eggs). Numbers are illustrative.
const START = [
  { p: 52, s: 40, k: 11, b: 1 },
  { p: 49, s: 36, k: 12, b: 1 },
  { p: 61, s: 44, k: 15, b: 2 },
];
const PER_CRATE = 20; // petti per crate drawn on a pan
const MAX_CRATES = 10;
const LOG = 12; // petti per production entry
const SALE = 10; // petti per sale
const SPLIT = [0.28, 0.42, 0.3]; // cash, online, credit share of a sale
const DEG_PER_PETTI = 0.55;
const MAX_TILT = 9;

// ---------------------------------------------------------------- frame
const W = 520;
const H = 330;
const PLATE = { x: -114, y: -82, w: 228, d: 160, r: 8 };
const PLATE_H = 10;
const FOOT_H = 4;

const HOPPERS = [-88, -52, -16].map((x) => ({ x, y: -62 }));
const TROUGH = { x0: -104, x1: 22, y: -46, d: 10 };
const DRUM = { x: 38, y: -52, r: 17, z0: 4, z1: 34 };
const PIVOT = [0, 38, 18];
const ARM = 38;
const BEAM_HALF = 46;
const PAN_Z = 31;
const CRATE_H = 3.6;
const RACK = { x: -106, y: 44, w: 42, d: 22 };
const TILL = { x: 2, y: 54, w: 50, d: 18 };
const LEVER = { x: 78, y: 40, w: 20, d: 30, top: 20 };
const LEVER_PIVOT = [88, 48, 14];
const LEVER_LEN = 36;

const tallest = PAN_Z + 3 + MAX_CRATES * CRATE_H;
const P = k.fitProjection(
  [...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), [-40, 38, tallest + 4], [40, 38, tallest + 4], [-88, -62, 46], [0, 38, 62], [88, 52, 54]],
  W,
  H,
  { pad: 14, azimuth: 45, elevation: 30 },
);

const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (pts, style) => k.dotsSvg(pts, style);
const depth = ([x, y, z = 0]) => k.depthOf([x, y, z], P);
const byDepth = (pts) => [...pts].sort((a, b) => depth(a) - depth(b));
let parts = 0;
const part = (svg) => {
  parts++;
  return svg;
};

// ---------------------------------------------------------------- base
function base() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`];
  for (const [x, y] of byDepth(k.corners(PLATE, 20))) {
    out.push(part(S(k.cylinder(x, y, 7, -PLATE_H - FOOT_H, 1.6, P, 28), { tone: "lo" })));
    out.push(S(k.cylinder(x, y, 5.2, -PLATE_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28), { tone: "mid" }));
  }
  const seam = k.sideSeam(PLATE, -4, P, 8);
  out.push(part(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.4), { tone: "mid", inner: L(seam, { tone: "faint" }) })));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "lo" }));
  const screws = k.corners(PLATE, 10);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));
  // ruler strip along the front-right edge
  const strip = { x: PLATE.x + PLATE.w - 13, y: -62, w: 6, d: 84, r: 1 };
  out.push(part(S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" })));
  const ticks = k.topTicks(strip.y + 3, strip.y + strip.d - 3, 4, 5, strip.x + 0.6, 0.6, [1.8, 3.4], P, "y");
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  out.push(D([at([strip.x + 3, strip.y + 1.5, 0.6]), at([strip.x + 3, strip.y + strip.d - 1.5, 0.6])], { size: 0.4 }));
  // label plate, front-left corner
  const label = { x: -60, y: 66, w: 42, d: 8, r: 1 };
  out.push(part(S(k.slabOf(label, 0, 0.8, P, 3), { tone: "mid", crease: "none" })));
  out.push(L(k.planOutline(k.insetPlan(label, 1.2), 0.8, P, 3), { tone: "faint" }));
  out.push(k.faceTextSvg(k.topMatrix([label.x + 4, label.y + 5.3], 0.8, P, "x"), "EGGFLOW 24.07.26", { size: 2.6, tone: "lo" }));
  return out.join("");
}

// ---------------------------------------------------------------- hoppers
function hopper(cx, cy, index) {
  const out = [];
  const housing = { x: cx - 14, y: cy - 12, w: 28, d: 24, r: 2 };
  const front = cy + 12;
  out.push(`<path class="iso-halo" d="${k.haloOf(housing, 0, 2, P)}" style="filter:blur(4px)"/>`);
  out.push(part(S(k.slabOf(housing, 0, 24, P, 3, 0.6), { tone: "mid", inner: L(k.sideSeam(housing, 4, P, 3), { tone: "faint" }) })));
  // counter bezel and window on the front face
  const bezel = { x: cx - 9.5, y: front, w: 19, d: 1.2, r: 0.6 };
  out.push(part(S(k.slabOf(bezel, 9, 10, P, 2), { tone: "hi", crease: "none" })));
  out.push(L(k.segment([cx - 9.5, front + 1.2, 10.2], [cx + 9.5, front + 1.2, 10.2], P) + k.segment([cx - 9.5, front + 1.2, 17.8], [cx + 9.5, front + 1.2, 17.8], P), { tone: "faint" }));
  out.push(L([-2.7, 2.7].map((dx) => k.segment([cx + dx, front + 1.2, 10.2], [cx + dx, front + 1.2, 17.8], P)).join(""), { tone: "faint" }));
  out.push(
    `<text class="iso-face-text ef-digits" data-tone="hi" data-counter="${index}" transform="${k.sideMatrix([cx, front + 1.25], 11.3, P, "left")}" font-size="6.6" text-anchor="middle" letter-spacing="1.6">${String(START[index].p).padStart(3, "0")}</text>`,
  );
  // screws on the front face
  out.push(D([at([cx - 11.5, front, 21]), at([cx + 11.5, front, 21]), at([cx - 11.5, front, 3]), at([cx + 11.5, front, 3])], { size: 0.45 }));
  // spout into the trough
  const spout = { x: cx - 3, y: front, w: 6, d: 6.5, r: 1 };
  out.push(part(S(k.slabOf(spout, 5.6, 3.2, P, 2, 0.3), { tone: "mid" })));
  // neck, hopper body and rim
  out.push(S(k.slabOf(k.insetPlan(housing, 4), 24, 3, P, 3), { tone: "mid", crease: "none" }));
  const body = { x: cx - 16, y: cy - 14, w: 32, d: 28, r: 2.5 };
  out.push(part(S(k.slabOf(body, 27, 13, P, 4, 0.5), { tone: "mid", inner: L(k.sideSeam(body, 33.5, P, 4), { tone: "faint" }) })));
  const rim = { x: cx - 17, y: cy - 15, w: 34, d: 30, r: 3 };
  out.push(part(S(k.slabOf(rim, 40, 2, P, 4, 0.6), { tone: "mid" })));
  // egg tray on top: 5 x 4 cups
  const tray = k.insetPlan(rim, 3);
  out.push(L(k.planOutline(tray, 42, P, 3), { tone: "lo" }));
  const cups = [];
  for (let i = 0; i < 5; i++) for (let j = 0; j < 4; j++) cups.push([tray.x + 2.8 + i * 5.6, tray.y + 3 + j * 6]);
  out.push(L(cups.map(([x, y]) => k.ring(x, y, 1.9, 42, P, 12)).join(""), { tone: "faint" }));
  out.push(D(cups.map(([x, y]) => at([x, y - 0.4, 42.6])), { size: 1.05, tone: "lo" }));
  // knurled reset knob on the right face
  const knob = [cx + 14, cy + 4];
  out.push(part(S(G.disc(0, 2.4, 3, G.frameOf([knob[0], knob[1], 15], [1, 0, 0], [0, 1, 0], [0, 0, 1]), P), { tone: "mid" })));
  out.push(L(G.ribsOf(G.frameOf([knob[0], knob[1], 15], [1, 0, 0], [0, 1, 0], [0, 0, 1]), 0, 2.4, 3, 18, P, { seams: true }), { tone: "lo" }));
  return out.join("");
}

// ---------------------------------------------------------------- trough
function trough() {
  const out = [];
  const { x0, x1, y, d } = TROUGH;
  out.push(part(S(k.slabOf({ x: x0, y, w: x1 - x0, d, r: 1 }, 0, 1.4, P, 2), { tone: "lo", crease: "none" })));
  out.push(part(S(k.slabOf({ x: x0, y, w: x1 - x0, d: 1.4, r: 0.4 }, 1.4, 4.2, P, 2, 0.3), { tone: "mid" })));
  out.push(L(k.lineOnTop([x0 + 1.4, y + d / 2], [x1, y + d / 2], 1.4, P), { tone: "faint" }));
  // brackets under the trough
  for (const x of [-96, -58, -20, 10]) {
    out.push(D([at([x, y + d - 0.7, 5.6])], { size: 0.45 }));
  }
  return out.join("");
}

function troughFront() {
  const { x0, x1, y, d } = TROUGH;
  const out = [];
  out.push(part(S(k.slabOf({ x: x0, y: y + d - 1.4, w: x1 - x0, d: 1.4, r: 0.4 }, 1.4, 4.2, P, 2, 0.3), { tone: "mid" })));
  out.push(part(S(k.slabOf({ x: x0 - 1.6, y: y - 0.4, w: 1.6, d: d + 0.8, r: 0.4 }, 0, 6.2, P, 2, 0.3), { tone: "mid" })));
  for (const x of [-96, -58, -20, 10]) out.push(D([at([x, y + d, 3.5])], { size: 0.45 }));
  return out.join("");
}

// ---------------------------------------------------------------- ledger drum
function drum() {
  const out = [];
  const { x, y, r, z0, z1 } = DRUM;
  const plinth = { x: x - 22, y: y - 22, w: 44, d: 44, r: 4 };
  out.push(`<path class="iso-halo" d="${k.haloOf(plinth, 0, 2, P)}" style="filter:blur(5px)"/>`);
  out.push(part(S(k.slabOf(plinth, 0, z0, P, 5, 0.6), { tone: "mid" })));
  out.push(D(k.corners(plinth, 4).map(([px, py]) => at([px, py, z0])), { size: 0.45 }));
  out.push(part(S(k.cylinder(x, y, r, z0, z1 - z0, P, 64, 0.8), { tone: "hi", crease: "lo", inner: L(k.sideArc(x, y, r, z0 + 9, P, 40) + k.sideArc(x, y, r, z0 + 19, P, 40), { tone: "faint" }) })));
  out.push(L(k.knurl(x, y, r, z1 - 4, z1, 72, P, 0.3), { tone: "lo" }));
  out.push(L(k.sideArc(x, y, r, z1 - 4, P, 40), { tone: "faint" }));
  out.push(L(k.ring(x, y, r - 2.4, z1, P, 64), { tone: "lo" }));
  const ticks = k.radialTicks(x, y, r - 3, 40, 5, z1, [1.1, 2.4], P);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  // total counter on the drum's front
  const box = { x: x - 11, y: y + r - 2.5, w: 22, d: 5.5, r: 1 };
  out.push(part(S(k.slabOf(box, 12, 12, P, 2, 0.4), { tone: "hi", crease: "lo" })));
  const face = box.y + box.d;
  out.push(
    `<text class="iso-face-text ef-digits" data-tone="hi" data-counter="ledger" transform="${k.sideMatrix([x, face + 0.05], 15.2, P, "left")}" font-size="7.4" text-anchor="middle" letter-spacing="1.4">${String(START.reduce((a, f) => a + f.p, 0)).padStart(3, "0")}</text>`,
  );
  out.push(D([at([x - 9.6, face, 18]), at([x + 9.6, face, 18])], { size: 0.4 }));
  return out.join("");
}

// ---------------------------------------------------------------- balance
function balanceBase() {
  const out = [];
  const Y = PIVOT[1];
  const Z = PIVOT[2];
  const housing = { x: -60, y: Y - 10, w: 120, d: 20, r: 3 };
  out.push(`<path class="iso-halo" d="${k.haloOf(housing, 0, 2, P)}" style="filter:blur(5px)"/>`);
  out.push(part(S(k.slabOf(housing, 0, 8, P, 4, 0.8), { tone: "mid", inner: L(k.sideSeam(housing, 2.6, P, 4), { tone: "faint" }) })));
  out.push(L(k.planOutline(k.insetPlan(housing, 3), 8, P, 3), { tone: "faint" }));
  out.push(D([[-56, Y - 6.5], [56, Y - 6.5], [-56, Y + 6.5], [56, Y + 6.5]].map(([x, y]) => at([x, y, 8])), { size: 0.45 }));
  // end stops: the beam rests on these at full tilt
  for (const x of [-52, 52]) {
    out.push(part(S(k.slabOf({ x: x - 3, y: Y - 4, w: 6, d: 8, r: 1 }, 8, 3, P, 2, 0.3), { tone: "mid" })));
  }
  // fulcrum pillar with knife block
  out.push(part(S(k.slabOf({ x: -6, y: Y - 6, w: 12, d: 12, r: 1.5 }, 8, 6.2, P, 3, 0.5), { tone: "mid" })));
  out.push(part(S(k.slabOf({ x: -2.4, y: Y - 4, w: 4.8, d: 8, r: 0.6 }, 14.2, 1.4, P, 2), { tone: "hi" })));
  // scale post and arc scale plate behind the beam
  const back = Y - 4.6;
  out.push(part(S(k.slabOf({ x: -1.6, y: back - 2.6, w: 3.2, d: 2.4, r: 0.6 }, 15, 30.5, P, 2), { tone: "mid", crease: "none" })));
  const F = G.frameOf([PIVOT[0], back - 0.2, Z], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  const arc = [];
  const SPAN = 14;
  for (let i = 0; i <= 14; i++) {
    const a = ((-SPAN + (2 * SPAN * i) / 14) * Math.PI) / 180;
    arc.push([Math.sin(a) * 41, Math.cos(a) * 41]);
  }
  for (let i = 14; i >= 0; i--) {
    const a = ((-SPAN + (2 * SPAN * i) / 14) * Math.PI) / 180;
    arc.push([Math.sin(a) * 31, Math.cos(a) * 31]);
  }
  out.push(part(S(G.prismOf(F, arc, 0, 1.2, P), { tone: "hi", crease: "lo" })));
  const faceY = back + 1.0;
  const R0 = 40.2;
  const tick = (deg, len) => {
    const a = (deg * Math.PI) / 180;
    return k.segment([Math.sin(a) * R0, faceY, Z + Math.cos(a) * R0], [Math.sin(a) * (R0 - len), faceY, Z + Math.cos(a) * (R0 - len)], P);
  };
  const minor = [];
  const major = [];
  for (let deg = -12; deg <= 12; deg += 2) if (deg) (deg % 6 === 0 ? major : minor).push(tick(deg, deg % 6 === 0 ? 4.4 : 2.6));
  const arcLine = [];
  for (let i = 0; i <= 24; i++) {
    const a = ((-13 + (26 * i) / 24) * Math.PI) / 180;
    arcLine.push(at([Math.sin(a) * R0, faceY, Z + Math.cos(a) * R0]));
  }
  out.push(L(k.pathOf(arcLine), { tone: "lo" }), L(minor.join(""), { tone: "lo", free: "end" }), L(major.join(""), { tone: "mid", free: "end" }));
  out.push(`<path class="iso-line ef-zero" d="${tick(0, 6.5)}"/>`);
  out.push(D([at([0, faceY, Z + 34]), at([-6.5, faceY, Z + 32.6]), at([6.5, faceY, Z + 32.6])], { size: 0.4 }));
  return out.join("");
}

function pan(x) {
  // built at rest, the group is moved vertically with the beam tip
  const out = [];
  const y = PIVOT[1];
  out.push(part(S(k.cylinder(x, y, 1.8, PIVOT[2] + 2.4, PAN_Z - PIVOT[2] - 4.2, P, 16), { tone: "mid", crease: "none" })));
  out.push(part(S(k.cylinder(x, y, 4, PAN_Z - 1.8, 1.8, P, 24), { tone: "mid" })));
  out.push(part(S(k.cylinder(x, y, 17, PAN_Z, 2.6, P, 64, 0.7), { tone: "hi", crease: "lo" })));
  out.push(L(k.ring(x, y, 14.6, PAN_Z + 2.6, P, 56), { tone: "faint" }));
  // crates
  for (let i = 0; i < MAX_CRATES; i++) {
    out.push(`<use href="#ef-crate" data-crate="${i}" transform="${k.translateAlong(P, [x, 0, i * CRATE_H])}"/>`);
  }
  parts += 2; // crates count as one kind per pan
  return out.join("");
}

// ---------------------------------------------------------------- level-sense rod
function senseRod() {
  const out = [];
  const y = PIVOT[1] - 1.2;
  out.push(part(S(k.slabOf({ x: 60, y, w: LEVER.x - 60, d: 2.4, r: 1 }, 3, 2.4, P, 2), { tone: "mid", crease: "none" })));
  out.push(part(S(k.cylinder(69, y + 1.2, 2.4, 2.4, 3.6, P, 20), { tone: "mid" })));
  return out.join("");
}

// ---------------------------------------------------------------- ageing rack
function rack() {
  const out = [];
  const tray = { x: RACK.x, y: RACK.y, w: RACK.w, d: RACK.d, r: 2 };
  out.push(`<path class="iso-halo" d="${k.haloOf(tray, 0, 2, P)}" style="filter:blur(4px)"/>`);
  out.push(part(S(k.slabOf(tray, 0, 3, P, 3, 0.5), { tone: "mid" })));
  out.push(L(k.planOutline(k.insetPlan(tray, 2.4), 3, P, 2), { tone: "faint" }));
  const slotW = RACK.w / 3;
  // back wall
  out.push(part(S(k.slabOf({ x: RACK.x, y: RACK.y, w: RACK.w, d: 1.6, r: 0.4 }, 3, 13, P, 2, 0.3), { tone: "mid" })));
  const slips = [];
  for (let s = 0; s < 3; s++) {
    for (let j = 0; j < 5; j++) {
      const sx = RACK.x + s * slotW + 2.2;
      const sy = RACK.y + 3.4 + j * 3.4;
      slips.push({ s, j, svg: `<use href="#ef-slip" data-slip="${s}-${j}" transform="${k.translateAlong(P, [sx, sy, 0])}"/>` });
    }
  }
  // dividers between slots, then slips back to front
  const dividers = [1, 2].map((n) => RACK.x + n * slotW - 0.6);
  for (let s = 0; s < 3; s++) {
    for (const slip of slips.filter((item) => item.s === s).sort((a, b) => a.j - b.j)) out.push(slip.svg);
    if (s < 2) out.push(part(S(k.slabOf({ x: dividers[s], y: RACK.y + 1.6, w: 1.2, d: RACK.d - 1.6, r: 0.3 }, 3, 6, P, 2), { tone: "mid" })));
  }
  parts += 1;
  // three small marks on the front lip: 1, 2 and 3 dots for the three age buckets
  const marks = [];
  for (let s = 0; s < 3; s++) for (let n = 0; n <= s; n++) marks.push(at([RACK.x + s * slotW + slotW / 2 - s * 1.2 + n * 2.4, RACK.y + RACK.d, 1.5]));
  out.push(D(marks, { size: 0.55, tone: "mid" }));
  return out.join("");
}

// ---------------------------------------------------------------- till
function till() {
  const out = [];
  const box = { x: TILL.x, y: TILL.y, w: TILL.w, d: TILL.d, r: 2.5 };
  out.push(`<path class="iso-halo" d="${k.haloOf(box, 0, 2, P)}" style="filter:blur(4px)"/>`);
  out.push(part(S(k.slabOf(box, 0, 8, P, 3, 0.6), { tone: "mid", inner: L(k.sideSeam(box, 4, P, 3), { tone: "faint" }) })));
  // drawer pull on the front face
  out.push(part(S(k.slabOf({ x: TILL.x + TILL.w / 2 - 6, y: TILL.y + TILL.d, w: 12, d: 1.4, r: 0.6 }, 2.4, 2.2, P, 2), { tone: "hi", crease: "none" })));
  const dishes = [0, 1, 2].map((n) => [TILL.x + 9 + n * 16, TILL.y + 10]);
  dishes.forEach(([x, y], n) => {
    out.push(part(S(k.cylinder(x, y, 6.2, 8, 1.6, P, 32, 0.4), { tone: "mid" })));
    out.push(L(k.ring(x, y, 5, 9.6, P, 28), { tone: "faint" }));
    for (let c = 0; c < 8; c++) {
      out.push(`<use href="#ef-coin" data-coin="${n}-${c}" transform="${k.translateAlong(P, [x, y, c * 1.25])}"/>`);
    }
  });
  parts += 1;
  // the credit dish has a slip post that files credit to the rack
  out.push(D(dishes.map(([x, y]) => at([x, TILL.y + TILL.d, 6])), { size: 0.5, tone: "mid" }));
  return out.join("");
}

// ---------------------------------------------------------------- lever
function leverHousing() {
  const out = [];
  const box = { x: LEVER.x, y: LEVER.y, w: LEVER.w, d: LEVER.d, r: 2 };
  out.push(`<path class="iso-halo" d="${k.haloOf(box, 0, 2, P)}" style="filter:blur(4px)"/>`);
  out.push(part(S(k.slabOf(box, 0, LEVER.top, P, 3, 0.6), { tone: "mid", inner: L(k.sideSeam(box, 5, P, 3), { tone: "faint" }) })));
  // slot the lever travels in
  const slot = { x: LEVER_PIVOT[0] - 1.8, y: LEVER.y + 4, w: 3.6, d: LEVER.d - 8, r: 1.6 };
  out.push(`<path class="ef-void" d="${k.pathOf(k.ringOf(slot, 4).map(([x, y]) => at([x, y, LEVER.top])), true)}"/>`);
  out.push(L(k.planOutline(slot, LEVER.top, P, 4), { tone: "lo" }));
  out.push(D(k.corners(box, 3).map(([x, y]) => at([x, y, LEVER.top])), { size: 0.45 }));
  // pivot boss on the right face
  const F = G.frameOf([LEVER.x + LEVER.w, LEVER_PIVOT[1], LEVER_PIVOT[2]], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
  out.push(part(S(G.disc(0, 1.6, 4.4, F, P), { tone: "mid" })));
  out.push(part(S(G.disc(1.6, 2.6, 2, F, P), { tone: "hi" })));
  // flag sleeve at the back
  return out.join("");
}

function latch() {
  // a sliding latch block that sits across the slot ahead of the lever
  const out = [];
  const block = { x: LEVER_PIVOT[0] - 4, y: LEVER.y + 15, w: 8, d: 4, r: 0.6 };
  out.push(part(S(k.slabOf(block, LEVER.top, 3.2, P, 2, 0.3), { tone: "hi", crease: "lo" })));
  out.push(L(k.lineOnTop([block.x + 1.4, block.y + 2], [block.x + block.w - 1.4, block.y + 2], LEVER.top + 3.2, P), { tone: "lo" }));
  return out.join("");
}

function latchGuide() {
  const out = [];
  // guide rail the latch slides on, beside the slot
  out.push(part(S(k.slabOf({ x: LEVER_PIVOT[0] + 3, y: LEVER.y + 14, w: 6, d: 6, r: 0.6 }, LEVER.top, 1.2, P, 2), { tone: "mid", crease: "none" })));
  return out.join("");
}

function flagSleeve() {
  const x = LEVER.x + 4;
  const y = LEVER.y + 4;
  return part(S(k.cylinder(x, y, 2.6, LEVER.top, 3, P, 20), { tone: "mid" })) + L(k.ring(x, y, 1.3, LEVER.top + 3, P, 14), { tone: "lo" });
}

function flag() {
  const x = LEVER.x + 4;
  const y = LEVER.y + 4;
  const out = [];
  out.push(S(k.cylinder(x, y, 0.9, LEVER.top + 2, 12, P, 12), { tone: "mid", crease: "none" }));
  const F = G.frameOf([x, y, LEVER.top + 14], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  out.push(`<g class="ef-flag">${S(G.prismOf(F, [[0.8, -6], [12, -6], [12, 0], [0.8, 0]], -0.4, 0.4, P), { tone: "hi", crease: "none" })}</g>`);
  parts += 2;
  return out.join("");
}

// ---------------------------------------------------------------- tokens
function token() {
  return `${S(k.cylinder(0, 0, 2.4, 0, 2.6, P, 18), { tone: "hi", crease: "none", lit: true })}`;
}

// ---------------------------------------------------------------- assemble
function defs() {
  const crate = { x: -8.5, y: PIVOT[1] - 6.5, w: 17, d: 13, r: 0.8 };
  const z = PAN_Z + 2.6;
  const slot = k.segment([-3, crate.y + crate.d, z + CRATE_H * 0.55], [3, crate.y + crate.d, z + CRATE_H * 0.55], P);
  const crateSvg = `${S(k.slabOf(crate, z, CRATE_H - 0.15, P, 2, 0.3), { tone: "mid", inner: L(slot, { tone: "lo" }) })}${L(k.planOutline(k.insetPlan(crate, 1.6), z + CRATE_H - 0.15, P, 2), { tone: "faint" })}`;
  const slipW = RACK.w / 3 - 4.4;
  const slip = { x: 0, y: 0, w: slipW, d: 0.8, r: 0.2 };
  const lines = [3.2, 5.8, 8.4].map((h, n) => k.segment([1.6, 0.8, 3 + 12.4 - h], [slipW - 1.6 - n * 2.4, 0.8, 3 + 12.4 - h], P)).join("");
  const slipSvg = `${S(k.slabOf(slip, 3, 12.4, P, 1), { tone: "hi", crease: "none" })}${L(lines, { tone: "faint", free: true })}`;
  const coinSvg = S(k.cylinder(0, 0, 3.8, 9.6, 1.1, P, 24), { tone: "hi", crease: "none" });
  return `<defs><g id="ef-crate">${crateSvg}</g><g id="ef-slip">${slipSvg}</g><g id="ef-coin">${coinSvg}</g><g id="ef-token">${token()}</g></defs>`;
}

const svgBody = [
  defs(),
  base(),
  ...HOPPERS.map((h, i) => hopper(h.x, h.y, i)),
  trough(),
  `<g data-part="tokens">${Array.from({ length: 9 }, (_, i) => `<use href="#ef-token" data-token="${i}" style="display:none"/>`).join("")}</g>`,
  troughFront(),
  drum(),
  `<path data-part="spoke" class="iso-line" data-tone="mid" d=""/>`,
  part(S(k.cylinder(DRUM.x, DRUM.y, 3, DRUM.z1, 2.2, P, 24), { tone: "mid" })),
  rack(),
  balanceBase(),
  `<g data-part="beam"></g>`,
  `<g data-part="pan-l">${pan(-ARM)}</g>`,
  `<path data-part="needle" class="iso-line" data-tone="lit" data-free="end" d="" style="stroke-width:1.2"/>`,
  `<g data-part="pan-r">${pan(ARM)}</g>`,
  `<path data-part="hub" class="ef-hub" d=""/>`,
  senseRod(),
  till(),
  leverHousing(),
  latchGuide(),
  `<g data-part="latch">${latch()}</g>`,
  flagSleeve(),
  `<g data-part="flag">${flag()}</g>`,
  `<g data-part="lever"><path class="ef-rod-o" d=""/><path class="ef-rod-i" d=""/><circle class="ef-knob" r="0"/><circle class="ef-knob-hi" r="0"/></g>`,
];
parts += 4; // beam, needle, lever, tokens

// hit areas over the parts a reader can press
function hull(points) {
  const pts = points.map(at).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper = [];
  for (const p of [...pts].reverse()) {
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  return k.pathOf([...lower.slice(0, -1), ...upper.slice(0, -1)], true);
}
const hits = [
  ...HOPPERS.map((h, i) => ({ act: `prod-${i}`, label: `Log ${LOG} petti at farm ${i + 1}`, pts: k.boxCorners({ x: h.x - 17, y: h.y - 15, w: 34, d: 38 }, 0, 42) })),
  { act: "count", label: "Count the stock onto the right pan", pts: k.boxCorners({ x: ARM - 17, y: PIVOT[1] - 17, w: 34, d: 34 }, PAN_Z - 6, PAN_Z + 40) },
  { act: "sale", label: `Sell ${SALE} petti at the till`, pts: k.boxCorners(TILL, 0, 20) },
  { act: "lever", label: "Pull the day-close lever", pts: [...k.boxCorners({ x: LEVER.x, y: LEVER.y, w: LEVER.w, d: LEVER.d + 14 }, 0, LEVER.top + LEVER_LEN + 6)] },
];
svgBody.push(`<g class="ef-hits">${hits.map((h) => `<path data-act="${h.act}" d="${hull(h.pts)}"><title>${h.label}</title></path>`).join("")}</g>`);

const LABEL =
  "A counting bench for an egg business. Three hoppers, one per farm, drop production through counters into one ledger drum. A shop balance weighs what was produced against what was sold, counted into stock or broken. A day-close lever on the right only passes its latch when the beam sits level, and an ageing rack at the front left files unpaid credit slips by age.";

const svg = `<svg class="iso-svg ef-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${LABEL}" xmlns="http://www.w3.org/2000/svg">${svgBody.join("")}</svg>`;

// ---------------------------------------------------------------- styles
const ISO_RULES = k.ISO_CSS.split("\n")
  .filter((line) => line.startsWith(".iso-") && !/iso-(figure|plate|legend|keys|key|swatch|page)/.test(line))
  .join("\n");

const CSS = `
.ef{
  --anatomy-paper:var(--ef-surface);--anatomy-face:#FFFFFF;--anatomy-top:#FFFFFF;
  --anatomy-shade-0:#DDDCD8;--anatomy-shade-1:#E6E5E1;--anatomy-shade-2:#EEEDEA;--anatomy-shade-3:#F5F5F3;
  --anatomy-lit-top:#FFFFFF;--anatomy-lit-shade:#EEEDEA;
  --anatomy-hi:#262626;--anatomy-mid:#8A8986;--anatomy-lo:#B8B7B3;--anatomy-faint:#DCDBD7;--anatomy-lit:#111111;
  --anatomy-halo:#7A7873;--anatomy-halo-opacity:.3;--anatomy-dot:#333333;
  --anatomy-weight:.6px;--anatomy-mono:var(--mono,"JetBrains Mono",ui-monospace,SFMono-Regular,Menlo,monospace);
  --ef-surface:var(--surface,#FAFAF9);--ef-ink:var(--ink,#111111);--ef-muted:var(--muted,#6B6B6B);--ef-rule:var(--rule,#E6E6E3);
  --ef-bronze:var(--bronze-deep,#6E5230);--ef-accent:var(--cobalt,#1F4E9E);--ef-void:#D6D5D1;
  position:relative;color:var(--ef-ink);
  font-family:var(--sans,"Instrument Sans","Helvetica Neue",Helvetica,Arial,sans-serif);
}
${ISO_RULES}
.ef .ef-svg{display:block;width:100%;height:auto;overflow:visible;margin:6px 0 4px;outline:none;-webkit-tap-highlight-color:transparent}
.ef .ef-svg:focus-visible{outline:2px solid var(--ef-accent);outline-offset:2px;border-radius:4px}
.ef .ef-hits path{fill:transparent;stroke:none;cursor:pointer;pointer-events:all}
.ef .ef-void{fill:var(--ef-void);stroke:none}
.ef .ef-zero{stroke:var(--anatomy-hi);stroke-width:.9px}
.ef .ef-hub{fill:var(--anatomy-paper);stroke:var(--anatomy-hi);stroke-width:.6px}
.ef .ef-beam-face{stroke:var(--anatomy-mid);stroke-width:.6px;stroke-linejoin:round}
.ef .ef-rod-o{fill:none;stroke:var(--anatomy-hi);stroke-width:3.6px;stroke-linecap:round}
.ef .ef-rod-i{fill:none;stroke:var(--anatomy-shade-3);stroke-width:2.2px;stroke-linecap:round}
.ef .ef-knob{fill:var(--anatomy-top);stroke:var(--anatomy-hi);stroke-width:.7px}
.ef .ef-knob-hi{fill:var(--anatomy-shade-0);stroke:none}
.ef .ef-flag .iso-shade,.ef .ef-flag .iso-top,.ef .ef-flag .iso-fill{transition:fill .5s}
.ef[data-closed] .ef-flag .iso-shade,.ef[data-closed] .ef-flag .iso-top,.ef[data-closed] .ef-flag .iso-fill{fill:var(--ef-accent)}
.ef[data-closed] .ef-flag .iso-edge{stroke:var(--ef-accent)}
.ef .ef-digits{font-weight:500}
.ef .ef-foot{display:block}
.ef .ef-read{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px 10px;margin:0;font-variant-numeric:tabular-nums}
.ef .ef-read div{display:flex;flex-direction:column;gap:1px;min-width:0}
.ef .ef-read dt{font-size:12px;color:var(--ef-muted)}
.ef .ef-read dd{margin:0;font-family:var(--anatomy-mono);font-size:13px;color:var(--ef-ink)}
.ef .ef-status{margin:10px 0 0}
.ef[data-closed] .ef-status{color:var(--ef-accent)}
.ef .ef-ctl{display:flex;flex-wrap:wrap;gap:5px;margin:10px 0 8px}
.ef .ef-ctl button{font:inherit;font-family:var(--anatomy-mono);font-size:10.5px;letter-spacing:.02em;color:var(--ef-ink);background:transparent;border:1px solid var(--ef-rule);border-radius:4px;padding:6px 7px;min-height:32px;cursor:pointer}
.ef .ef-ctl button:hover{border-color:var(--ef-bronze)}
.ef .ef-ctl button:focus-visible{outline:2px solid var(--ef-accent);outline-offset:1px}
.ef .ef-ctl button[data-act="lever"]{border-color:var(--ef-bronze)}
.ef .fig-hint{margin-top:6px}
.ef .ef-shake{animation:ef-shake .42s}
@keyframes ef-shake{20%{transform:translateX(-2px)}45%{transform:translateX(2px)}70%{transform:translateX(-1px)}}
@media (prefers-reduced-motion:reduce){.ef .ef-shake{animation:none}.ef .ef-flag *{transition:none}}
@media (max-width:420px){.ef .ef-read{gap:6px 6px}.ef .ef-read dd{font-size:12.5px}.ef .ef-read dt{font-size:11px}}
`;

// ---------------------------------------------------------------- live script
const LIGHT = G.lightOf(P);
const VIEW = G.viewOf(P);
const LIVE = `(() => {
const root = document.currentScript ? document.currentScript.previousElementSibling : null;
const fig = root && root.classList.contains("ef") ? root : document.querySelector(".ef");
if (!fig || fig.dataset.ready) return;
fig.dataset.ready = "1";
const P = ${JSON.stringify(P)};
const C = { sa: Math.sin(P.azimuth * Math.PI / 180), ca: Math.cos(P.azimuth * Math.PI / 180), se: Math.sin(P.elevation * Math.PI / 180), ce: Math.cos(P.elevation * Math.PI / 180), k: P.scale * ${k.iso([1, 0, 0], { origin: [0, 0], scale: 1, azimuth: 90, elevation: 0 })[0]} };
const iso = ([x, y, z]) => [P.origin[0] + (x * C.sa - y * C.ca) * C.k, P.origin[1] + ((x * C.ca + y * C.sa) * C.se - z * C.ce) * C.k];
const r1 = (v) => Math.round(v * 10) / 10;
const path = (pts, close) => pts.map((p, i) => (i ? "L" : "M") + r1(p[0]) + " " + r1(p[1])).join("") + (close ? "Z" : "");
const shift = ([x, y, z]) => { const a = iso([x, y, z]), o = iso([0, 0, 0]); return "translate(" + r1(a[0] - o[0]) + " " + r1(a[1] - o[1]) + ")"; };
const LIGHT = ${JSON.stringify(LIGHT)}, VIEW = ${JSON.stringify(VIEW)};
const BANDS = [0, 0.2, 0.42, 0.62];
const band = (n) => { const s = n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2]; let t = 0; while (t < 4 && s >= BANDS[t]) t++; return t; };
const START = ${JSON.stringify(START)};
const PER_CRATE = ${PER_CRATE}, MAX_CRATES = ${MAX_CRATES}, LOG = ${LOG}, SALE = ${SALE}, SPLIT = ${JSON.stringify(SPLIT)};
const DEG = ${DEG_PER_PETTI}, MAX_TILT = ${MAX_TILT}, PIVOT = ${JSON.stringify(PIVOT)}, ARM = ${ARM}, HALF = ${BEAM_HALF};
const HOPPERS = ${JSON.stringify(HOPPERS)}, TROUGH = ${JSON.stringify(TROUGH)};
const LP = ${JSON.stringify(LEVER_PIVOT)}, LLEN = ${LEVER_LEN};
const still = matchMedia("(prefers-reduced-motion: reduce)");
const $ = (s) => fig.querySelector(s);
const svg = $(".ef-svg");
const beamG = $('[data-part="beam"]'), needle = $('[data-part="needle"]'), hub = $('[data-part="hub"]'), spoke = $('[data-part="spoke"]');
const panL = $('[data-part="pan-l"]'), panR = $('[data-part="pan-r"]');
const latchG = $('[data-part="latch"]'), flagG = $('[data-part="flag"]');
const leverO = $(".ef-rod-o"), leverI = $(".ef-rod-i"), knob = $(".ef-knob"), knobHi = $(".ef-knob-hi");
const tokens = [...fig.querySelectorAll("[data-token]")];
const counters = [...fig.querySelectorAll("[data-counter]")];
const crates = (g) => [...g.querySelectorAll("[data-crate]")];
const cratesL = crates(panL), cratesR = crates(panR);
const coins = [0, 1, 2].map((n) => [...fig.querySelectorAll('[data-coin^="' + n + '-"]')]);
const slips = [0, 1, 2].map((n) => [...fig.querySelectorAll('[data-slip^="' + n + '-"]')]);
const out = (name) => fig.querySelector('[data-out="' + name + '"]');
const status = $(".ef-status");

let farms, money, ages, closed, msg;
function reset() {
  farms = START.map((f) => ({ ...f }));
  money = [33, 50, 37];
  ages = [3, 2, 1];
  closed = false;
  msg = "";
}
reset();
const sum = (key) => farms.reduce((a, f) => a + f[key], 0);
const produced = () => sum("p");
const accounted = () => sum("s") + sum("k") + sum("b");
const diff = () => produced() - accounted();

// motion state
let tilt = 0, tiltV = 0, lever = -16, leverV = 0, leverTarget = -16, latchOut = 0, flagUp = 0, drumTurn = 0, drumV = 0;
let leverPhase = "rest", leverHold = 0;
const flying = [];
let frame = 0, last = 0, visible = false;

function beamTarget() { return Math.max(-MAX_TILT, Math.min(MAX_TILT, diff() * DEG)); }

function render() {
  const t = tilt * Math.PI / 180;
  const b = [Math.cos(t), 0, Math.sin(t)], n = [-Math.sin(t), 0, Math.cos(t)], yv = [0, 1, 0];
  const c = PIVOT;
  const at = (u, v, w) => [c[0] + b[0] * u + n[0] * w, c[1] + v, c[2] + b[2] * u + n[2] * w];
  const box = [[HALF, 2.6, 2.4], [HALF, -2.6, 2.4], [-HALF, -2.6, 2.4], [-HALF, 2.6, 2.4], [HALF, 2.6, -2.4], [HALF, -2.6, -2.4], [-HALF, -2.6, -2.4], [-HALF, 2.6, -2.4]].map(([u, v, w]) => at(u, v, w));
  const faces = [
    [[0, 1, 2, 3], n], [[4, 7, 6, 5], n.map((x) => -x)], [[0, 3, 7, 4], yv], [[1, 5, 6, 2], [0, -1, 0]], [[0, 4, 5, 1], b], [[3, 2, 6, 7], b.map((x) => -x)],
  ];
  let html = "";
  for (const [idx, nn] of faces) {
    if (nn[0] * VIEW[0] + nn[1] * VIEW[1] + nn[2] * VIEW[2] <= 1e-6) continue;
    const t2 = band(nn);
    const cls = t2 === 4 ? "iso-top" : "iso-shade";
    html += '<path class="' + cls + ' ef-beam-face"' + (t2 === 4 ? "" : ' data-shade="' + t2 + '"') + ' d="' + path(idx.map((i) => iso(box[i])), true) + '"/>';
  }
  // end hooks where the pan posts sit
  beamG.innerHTML = html;
  const tip = [c[0] - Math.sin(t) * 39, c[1] + 3.2, c[2] + Math.cos(t) * 39];
  const tail = [c[0], c[1] + 3.2, c[2]];
  needle.setAttribute("d", path([iso(tail), iso(tip)]));
  const h = iso([c[0], c[1] + 3.2, c[2]]);
  hub.setAttribute("d", "M" + r1(h[0] - 1.6) + " " + r1(h[1]) + "a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0 -3.2 0Z");
  panL.setAttribute("transform", shift([0, 0, -ARM * Math.sin(t)]));
  panR.setAttribute("transform", shift([0, 0, ARM * Math.sin(t)]));
  const nl = Math.min(MAX_CRATES, Math.round(produced() / PER_CRATE)), nr = Math.min(MAX_CRATES, Math.round(accounted() / PER_CRATE));
  cratesL.forEach((g, i) => (g.style.display = i < nl ? "" : "none"));
  cratesR.forEach((g, i) => (g.style.display = i < nr ? "" : "none"));
  coins.forEach((list, n) => list.forEach((g, i) => (g.style.display = i < Math.min(list.length, Math.ceil(money[n] / 8)) ? "" : "none")));
  slips.forEach((list, n) => list.forEach((g, i) => (g.style.display = i < ages[n] ? "" : "none")));
  // drum spoke
  const D = ${JSON.stringify(DRUM)};
  const a = drumTurn;
  spoke.setAttribute("d", [0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((q) => { const cx = Math.cos(a + q), cy = Math.sin(a + q); return path([iso([D.x + cx * 3, D.y + cy * 3, D.z1]), iso([D.x + cx * (D.r - 2.4), D.y + cy * (D.r - 2.4), D.z1])]); }).join(""));
  // lever
  const la = lever * Math.PI / 180;
  const la0 = Math.max(-80, Math.min(80, lever)) * Math.PI / 180, rise = (${LEVER.top} - LP[2]) / Math.cos(la0);
  const base = iso([LP[0], LP[1] + Math.sin(la) * rise, LP[2] + Math.cos(la) * rise]), end = [LP[0], LP[1] + Math.sin(la) * LLEN, LP[2] + Math.cos(la) * LLEN];
  const e = iso(end);
  const d = path([base, e]);
  leverO.setAttribute("d", d);
  leverI.setAttribute("d", d);
  knob.setAttribute("cx", r1(e[0])); knob.setAttribute("cy", r1(e[1])); knob.setAttribute("r", r1(4.2 * C.k));
  knobHi.setAttribute("cx", r1(e[0] + 1.1 * C.k)); knobHi.setAttribute("cy", r1(e[1] + 1.4 * C.k)); knobHi.setAttribute("r", r1(2.2 * C.k));
  latchG.setAttribute("transform", shift([latchOut * 7, 0, 0]));
  flagG.setAttribute("transform", shift([0, 0, flagUp * 10 - 4]));
  // tokens
  tokens.forEach((g, i) => {
    const f = flying[i];
    if (!f) { g.style.display = "none"; return; }
    g.style.display = "";
    g.setAttribute("transform", shift(f.pos));
  });
  // counters and readout
  counters.forEach((el) => {
    const v = el.dataset.counter === "ledger" ? produced() : farms[+el.dataset.counter].p;
    const s = String(Math.min(999, v)).padStart(3, "0");
    if (el.textContent !== s) el.textContent = s;
  });
  const set = (name, v) => { const el = out(name); if (el && el.textContent !== String(v)) el.textContent = v; };
  farms.forEach((f, i) => set("f" + i, f.p));
  set("ledger", produced());
  set("sold", sum("s")); set("stock", sum("k")); set("broken", sum("b"));
  const off = diff();
  set("off", off === 0 ? "0, level" : off > 0 ? off + " short" : -off + " over");
  let text;
  if (closed) text = "Day closed. " + produced() + " petti in, " + accounted() + " accounted for. Pull again for a new day.";
  else if (msg) text = msg;
  else if (off !== 0) text = "Off by " + Math.abs(off) + " petti. The beam is not level, so the latch holds the lever.";
  else text = "Level. Produced equals sold plus stock plus broken. Pull the lever to close the day.";
  if (status.textContent !== text) status.textContent = text;
  if (closed) fig.setAttribute("data-closed", ""); else fig.removeAttribute("data-closed");
}

function spawn(farm) {
  for (let n = 0; n < 3; n++) {
    const slot = tokens.findIndex((_, i) => !flying[i]);
    if (slot < 0) return;
    const h = HOPPERS[farm];
    flying[slot] = { t: -n * 0.22, x: h.x, pos: [h.x, h.y + 18, 7] };
  }
}

function step(dt) {
  const calm = still.matches;
  // beam spring
  const want = beamTarget();
  if (calm) { tilt = want; tiltV = 0; }
  else for (let i = 0; i < 4; i++) { tiltV += ((want - tilt) * 70 - tiltV * 7.5) * dt / 4; tilt += tiltV * dt / 4; }
  // latch follows the level
  const level = diff() === 0 && Math.abs(tilt) < 0.25 && Math.abs(tiltV) < 1;
  const latchWant = level ? 1 : 0;
  latchOut = calm ? latchWant : latchOut + (latchWant - latchOut) * (1 - Math.exp(-dt / 0.18));
  // lever
  if (leverPhase === "pull") {
    leverTarget = latchOut > 0.95 ? 38 : 4;
    if (lever >= leverTarget - 0.6) {
      if (leverTarget > 20) { closed = true; leverPhase = "hold"; leverHold = 0; msg = ""; }
      else { leverPhase = "bounce"; leverV = -60; msg = "Refused. Off by " + Math.abs(diff()) + " petti, the latch is still across the slot."; fig.querySelector('[data-part="latch"]').classList.remove("ef-shake"); void latchG.getBoundingClientRect(); latchG.classList.add("ef-shake"); }
    }
  } else if (leverPhase === "bounce" || leverPhase === "rest") leverTarget = -16;
  else if (leverPhase === "hold") leverTarget = 38;
  if (calm) { lever = leverPhase === "pull" ? leverTarget : leverTarget; leverV = 0; if (leverPhase === "bounce") leverPhase = "rest"; }
  else for (let i = 0; i < 4; i++) { leverV += ((leverTarget - lever) * 120 - leverV * 13) * dt / 4; lever += leverV * dt / 4; }
  if (leverPhase === "bounce" && Math.abs(lever - leverTarget) < 0.3) leverPhase = "rest";
  const flagWant = closed ? 1 : 0;
  flagUp = calm ? flagWant : flagUp + (flagWant - flagUp) * (1 - Math.exp(-dt / 0.3));
  // tokens: drop off the spout, roll along the trough into the drum
  for (let i = 0; i < flying.length; i++) {
    const f = flying[i];
    if (!f) continue;
    f.t += dt;
    if (f.t < 0) continue;
    const yMid = TROUGH.y + TROUGH.d / 2;
    if (f.t < 0.3) { const q = f.t / 0.3; f.pos = [f.x, yMid + 2.5 * (1 - q), 7 - 5.6 * q * q]; }
    else { const s = (f.t - 0.3); const x = f.x + s * s * 26 + s * 18; f.pos = [x, yMid, 1.4]; if (x > TROUGH.x1 + 4) { flying[i] = null; drumV += 1.4; } }
  }
  drumTurn += drumV * dt; drumV *= Math.exp(-dt / 0.5);
}

function busy() {
  return flying.some(Boolean) || leverPhase !== "rest" && leverPhase !== "hold" || Math.abs(tiltV) > 0.02 || Math.abs(beamTarget() - tilt) > 0.02 || Math.abs(lever - leverTarget) > 0.05 || Math.abs((diff() === 0 ? 1 : 0) - latchOut) > 0.01 || Math.abs((closed ? 1 : 0) - flagUp) > 0.01 || drumV > 0.01;
}

function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  step(dt);
  render();
  frame = visible && (busy() || touring) ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };

function act(name, fromTour) {
  if (!fromTour) pause();
  if (name === "lever") {
    if (closed) { reset(); leverPhase = "rest"; }
    else if (leverPhase === "rest") { leverPhase = "pull"; msg = ""; }
    run(); render(); return;
  }
  if (closed) { msg = ""; status.textContent = "The day is closed. Pull the lever to open a new day."; return; }
  msg = "";
  if (name.startsWith("prod-")) {
    const i = +name.slice(5);
    if (produced() + LOG > MAX_CRATES * PER_CRATE) { msg = "The pans are full. Close the day first."; }
    else { farms[i].p += LOG; spawn(i); msg = "Farm " + (i + 1) + " logged " + LOG + " petti. The left pan drops until the rest is accounted for."; }
  } else if (name === "count") {
    let found = 0;
    farms.forEach((f) => { const open = f.p - f.s - f.k - f.b; if (open > 0) { const broke = open >= 10 ? 1 : 0; f.b += broke; f.k += open - broke; found += open; } });
    msg = found ? "Stock counted. " + found + " petti put into stock or broken, so the right pan catches up." : "Stock already matches the count.";
  } else if (name === "sale") {
    const f = farms.reduce((best, f, i) => (f.p - f.s - f.b > farms[best].p - farms[best].s - farms[best].b ? i : best), 0);
    const farm = farms[f];
    const onHand = farm.p - farm.s - farm.b;
    if (onHand < SALE) msg = "Nothing left to sell.";
    else {
      const open = Math.max(0, farm.p - farm.s - farm.k - farm.b);
      const fromStock = Math.max(0, SALE - open);
      farm.k -= fromStock; farm.s += SALE;
      SPLIT.forEach((s, i) => (money[i] += Math.round(SALE * s * 10) / 10 * 10 / 10));
      ages[0] = Math.min(5, ages[0] + 1);
      msg = "Sold " + SALE + " petti from farm " + (f + 1) + ". Cash, online and credit split into the dishes, and the credit slip is filed under 0 to 30 days.";
    }
  }
  run(); render();
}

// idle tour
const TOUR = ["prod-1", "lever", "count", "sale", "lever", "", "lever", "", "prod-0", "prod-2", "count", "lever", "", "lever"];
let touring = !still.matches, tourAt = 0, tourTimer = 0, idleTimer = 0;
function tourStep() {
  if (!touring || !visible) return;
  const name = TOUR[tourAt % TOUR.length];
  tourAt++;
  if (name) act(name, true);
  tourTimer = setTimeout(tourStep, 2300);
}
function pause() {
  touring = false;
  clearTimeout(tourTimer); clearTimeout(idleTimer);
  if (!still.matches) idleTimer = setTimeout(() => { touring = true; tourStep(); }, 12000);
}

fig.addEventListener("click", (e) => {
  const t = e.target.closest("[data-act]");
  if (!t || !fig.contains(t)) return;
  act(t.dataset.act);
});
svg.addEventListener("keydown", (e) => {
  const map = { 1: "prod-0", 2: "prod-1", 3: "prod-2", s: "sale", S: "sale", c: "count", C: "count", l: "lever", L: "lever", Enter: "lever", " ": "lever" };
  const name = map[e.key];
  if (!name) return;
  e.preventDefault();
  act(name);
});
new IntersectionObserver((entries) => {
  visible = entries[entries.length - 1].isIntersecting;
  if (visible) { run(); if (touring) { clearTimeout(tourTimer); tourTimer = setTimeout(tourStep, 1400); } }
  else { clearTimeout(tourTimer); }
}, { rootMargin: "80px 0px" }).observe(fig);
still.addEventListener("change", () => { if (still.matches) { touring = false; clearTimeout(tourTimer); } render(); });
tilt = beamTarget(); latchOut = diff() === 0 ? 1 : 0;
render();
})();`;

// ---------------------------------------------------------------- markup
const readCell = (name, label, value) => `<div><dt>${label}</dt><dd data-out="${name}">${value}</dd></div>`;
const tot = (key) => START.reduce((a, f) => a + f[key], 0);
const markup = `<div class="ef fig-fam" data-figure="eggflow">
${head("03", "Three farms, one ledger")}
${svg}
<div class="fig-foot ef-foot">
<dl class="ef-read" aria-live="polite">
${readCell("f0", "Farm 1", START[0].p)}${readCell("f1", "Farm 2", START[1].p)}${readCell("f2", "Farm 3", START[2].p)}${readCell("ledger", "Ledger", tot("p"))}
${readCell("sold", "Sold", tot("s"))}${readCell("stock", "Stock", tot("k"))}${readCell("broken", "Broken", tot("b"))}${readCell("off", "Off by", "0, level")}
</dl>
<p class="ef-status fig-read" role="status">Level. Produced equals sold plus stock plus broken. Pull the lever to close the day.</p>
<div class="ef-ctl" role="group" aria-label="Figure controls">
<button type="button" data-act="prod-0">Farm 1 +${LOG}</button><button type="button" data-act="prod-1">Farm 2 +${LOG}</button><button type="button" data-act="prod-2">Farm 3 +${LOG}</button><button type="button" data-act="sale">Sell ${SALE}</button><button type="button" data-act="count">Count stock</button><button type="button" data-act="lever">Pull lever</button>
</div>
<p class="fig-hint">Tap a hopper, the till, the right pan or the lever. Keys 1 2 3, S, C, L once the drawing has focus. Units are petti, 360 eggs each. Numbers are illustrative.</p>
</div>
</div>`;

const svgFocusable = markup.replace('<svg class="iso-svg ef-svg"', '<svg tabindex="0" class="iso-svg ef-svg"');
const embed = `<!-- EggFlow figure. Paste inside <div class="media">. Self-contained: styles, SVG and script. -->
<style>${FAMILY_CSS}
${CSS}</style>
${svgFocusable}
<script>${LIVE}</script>
`;
writeFileSync(join(HERE, "embed.html"), embed);

const page = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>EggFlow Day Close</title>
<meta name="description" content="Three farm hoppers feed one ledger drum; the day only closes when the balance sits level.">
<style>
:root{--bg:#FAFAF9;--surface:#FAFAF9;--ink:#111111;--muted:#6B6B6B;--rule:#E6E6E3;--bronze:#8C6A3F;--bronze-deep:#6E5230;--cobalt:#1F4E9E;
--display:"Instrument Sans","Helvetica Neue",Helvetica,Arial,sans-serif;--sans:"Instrument Sans","Helvetica Neue",Helvetica,Arial,sans-serif;--mono:"JetBrains Mono",ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color-scheme:light}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--sans);-webkit-font-smoothing:antialiased}
main{width:min(560px,100% - 32px);margin:28px auto 48px}
h1{font-family:var(--display);font-weight:500;font-size:22px;margin:0 0 4px;letter-spacing:-.01em}
.sub{margin:0 0 16px;color:var(--muted);font-size:14px;line-height:1.5}
</style></head><body><main>
<h1>Three farms, one ledger</h1>
<p class="sub">EggFlow closes the day only when what the farms produced equals what was sold, counted into stock or broken.</p>
${embed}
</main></body></html>
`;
writeFileSync(join(HERE, "figure.html"), page);
console.log(`wrote figure.html and embed.html, ${parts} parts, embed ${(embed.length / 1024).toFixed(1)} KB`);
