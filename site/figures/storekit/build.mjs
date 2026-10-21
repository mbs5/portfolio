// StoreKit figure: a token proof press.
// One forme of eight blocks (the storefront parts) never changes. An index lever lifts one
// token card out of a rack of eight; the ink roller takes that card's colours, rolls across
// the forme, and the proof on the delivery board re-inks in the new look.
// node build.mjs  ->  figure.html (standalone page) + embed.html (inline SVG + script)
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "./kit/iso-kit.mjs";
import * as G from "./kit/lathe.mjs";
import { FAMILY_CSS, head } from "../family.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------- truth
// brand, ground: the swatch values the site's StoreKit section shows for each live demo.
// tint: each app's --accent-tertiary (Vector has none, so its --bg-primary).
// radius: each app's --radius-lg in apps/*/src/styles/design-system.css.
const BRANDS = [
  { name: "Vanta Bio", c: ["#2749CB", "#F4F6FB", "#EEF3FF"], r: 12 },
  { name: "Halcyon Labs", c: ["#B8862B", "#1F1F22", "#FBF6EA"], r: 12 },
  { name: "Caldera Peptides", c: ["#7A1F1F", "#C9A24A", "#F8ECEE"], r: 12 },
  { name: "Solace Bio", c: ["#7D8F6A", "#F3F1EA", "#E7EDE4"], r: 12 },
  { name: "Lumen Peptides", c: ["#7E60FC", "#FAF8FF", "#EAE8FF"], r: 0 },
  { name: "Keystone Peptides", c: ["#DE9D55", "#2D3139", "#EAF3EE"], r: 12 },
  { name: "Nucleus", c: ["#81AE23", "#0E0E0E", "#EEF7D8"], r: 12 },
  { name: "Vector Peptides", c: ["#91285E", "#232326", "#F5F6F7"], r: 12 },
];
const SURFACES = ["hero", "catalog", "product page", "cart", "checkout", "account", "proof of testing", "compliance gate"];

// ---------------------------------------------------------------- frame and camera
const W = 440;
const DRAW = { top: 36, bottom: 282 }; // drawing band between the header and footer rows
// Site pass 7: the press sat small in its card, so the art is scaled up 15% about its measured
// centre (getBBox of [data-art] at scale 1: x 33 to 408, y 49 to 277) and the footer moves down to make room.
const ART_SCALE = 1.15;
const ART_C = [220.5, 163]; // measured centre of the art at scale 1
const ART_AT = [220.5, 169]; // where that centre sits after scaling (art spans about y 38 to 300)
const GROW = 14; // extra height for the footer row
const H = 352 + GROW;
const FOOT = DRAW.bottom + GROW; // footer rows hang off this instead of DRAW.bottom

const BASE = { x: -146, y: -94, w: 276, d: 188, r: 7 };
const BASE_H = 9;
const FOOT_H = 4;

const MAG = { x: -138, y: -36, w: 52, d: 72, r: 2.5 }; // card rack
const MAG_Z = 7; // rack tray height
const CARD = { x0: -130.5, step: 5.6, t: 2, y: -29, d: 58, h: 30 }; // card plates
const TAB = { d: 7.4, h: 7, y0: -29, gap: 7.2 };
const LIFT = 11;
const CHEEK_H = 24;

const RAIL_Y = [-83, 76];
const RAIL = { x: -78, w: 100, d: 7, h: 4 };
const BED = { x: -66, y: -75, w: 84, d: 150, r: 2 };
const BED_H = 7;
const CHASE_H = 4;
const CELL = { x0: -59, y0: -66, w: 31, d: 30, gx: 3.5, gy: 4 };
const TYPE_H = 11; // block height above the bed
const TYPE_TOP = BED_H + TYPE_H;

const ROLL_R = 7;
const ROLL_Z = TYPE_TOP + ROLL_R;
const HOME = -70;
const END = 0;

const TRAY = { x: 32, y: -80, w: 90, d: 160, r: 2 };
const TRAY_H = 3;
const SHEET_DX = 103; // the proof is the forme, moved onto the board
const SHEET = { x: CELL.x0 - 4 + SHEET_DX, y: CELL.y0 - 4, w: 2 * CELL.w + CELL.gx + 8, d: 4 * CELL.d + 3 * CELL.gy + 8, r: 0.6 };
const SHEET_Z = TRAY_H + 0.6;

const AZ = 45;
const PIVOT = [-112, 36, 21];
const ARM = 25;
const angleOf = (i) => (-33 + i * (66 / 7)) * Math.PI / 180;

const P = k.fitProjection(
  [...k.boxCorners(BASE, -BASE_H - FOOT_H, 0), [MAG.x, MAG.y, MAG_Z + CARD.h + TAB.h + LIFT + 2], [PIVOT[0] + 14, PIVOT[1], PIVOT[2] + ARM + 4], [HOME, RAIL_Y[0], 44]],
  W,
  DRAW.bottom - DRAW.top,
  { pad: 6, azimuth: AZ },
);
P.origin = [P.origin[0], P.origin[1] + DRAW.top];

const at = (point) => k.iso(point, P);
const cam = k.cameraOf(P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const poly = (pts) => k.pathOf(pts.map(at), true);
const byDepth = (points) => [...points].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
const rr = (plan, z, steps = 6) => k.pathOf(k.ringOf(plan, steps).map(([x, y]) => at([x, y, z])), true);

// ---------------------------------------------------------------- base
function base() {
  const out = [`<path class="iso-halo" d="${k.haloOf(BASE, -BASE_H - FOOT_H, BASE_H, P)}"/>`];
  for (const [x, y] of byDepth(k.corners(BASE, 20))) {
    out.push(S(k.cylinder(x, y, 6.4, -BASE_H - FOOT_H, 1.4, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 5, -BASE_H - FOOT_H + 1.4, FOOT_H - 1.4, P, 28), { tone: "mid" }));
  }
  out.push(S(k.slabOf(BASE, -BASE_H, BASE_H, P, 8, 1.4), { tone: "mid", inner: L(k.sideSeam(BASE, -3, P, 8), { tone: "faint" }) }));
  out.push(L(k.planOutline(k.insetPlan(BASE, 4.5), 0, P), { tone: "faint" }));
  const screws = k.corners(BASE, 9);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));
  return out.join("");
}

function frontFurniture() {
  // ruler strip along the bed's run, and a label plate with three rule lines
  const out = [];
  const strip = { x: RAIL.x + 2, y: 84.5, w: RAIL.w - 4, d: 4.4, r: 1 };
  out.push(S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const ticks = k.topTicks(strip.x + 3, strip.x + strip.w - 3, 4, 5, strip.y + 0.6, 0.6, [1.8, 3.4], P);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  out.push(D([at([strip.x + 1.6, strip.y + 3, 0.6]), at([strip.x + strip.w - 1.6, strip.y + 3, 0.6])], { size: 0.4 }));
  return out.join("");
}

// ---------------------------------------------------------------- the card rack (token sheets)
const cardX = (i) => CARD.x0 + i * CARD.step;
const tabY = (i) => TAB.y0 + i * TAB.gap;

function rackBack() {
  const out = [];
  out.push(`<path class="iso-halo" d="${k.haloOf(MAG, 0, MAG_Z, P)}" style="opacity:.18"/>`);
  out.push(S(k.slabOf(MAG, 0, MAG_Z, P, 4, 0.6), { tone: "mid" }));

  // card slots: one groove per card on the tray top, ends on the tray's inner rails
  out.push(L(BRANDS.map((_, i) => k.lineOnTop([cardX(i) + CARD.t / 2, MAG.y + 5], [cardX(i) + CARD.t / 2, MAG.y + MAG.d - 5], MAG_Z, P)).join(""), { tone: "faint" }));
  out.push(L(k.lineOnTop([MAG.x + 3, MAG.y + 5], [MAG.x + MAG.w - 3, MAG.y + 5], MAG_Z, P) + k.lineOnTop([MAG.x + 3, MAG.y + MAG.d - 5], [MAG.x + MAG.w - 3, MAG.y + MAG.d - 5], MAG_Z, P), { tone: "lo" }));
  // back cheek
  const back = { x: MAG.x, y: MAG.y, w: MAG.w, d: 4, r: 1 };
  out.push(S(k.slabOf(back, MAG_Z, CHEEK_H, P, 3, 0.4), { tone: "mid" }));
  out.push(D([at([back.x + 4, back.y + 2, MAG_Z + CHEEK_H]), at([back.x + back.w - 4, back.y + 2, MAG_Z + CHEEK_H])], { size: 0.4 }));
  // back stop plate across the rack's far end
  const stop = { x: MAG.x, y: MAG.y + 4, w: 3, d: MAG.d - 8, r: 0.6 };
  out.push(S(k.slabOf(stop, MAG_Z, CHEEK_H - 6, P, 2, 0.3), { tone: "mid" }));
  return out.join("");
}

function card(i) {
  const x = cardX(i);
  const plan = { x, y: CARD.y, w: CARD.t, d: CARD.d, r: 0.4 };
  const tab = { x, y: tabY(i), w: CARD.t, d: TAB.d, r: 0.4 };
  const z0 = MAG_Z + 1;
  const ztop = z0 + CARD.h;
  const out = [];
  out.push(S(k.slabOf(plan, z0, CARD.h, P, 2), { tone: "hi", crease: "lo", className: "sk-card" }));
  out.push(S(k.slabOf(tab, ztop - 0.01, TAB.h, P, 2), { tone: "hi", crease: "lo", className: "sk-card" }));
  // three colour stripes on the tab's +x face: brand, ground, tint
  const fx = x + CARD.t + 0.02;
  const third = (TAB.d - 1.2) / 3;
  BRANDS[i].c.forEach((hex, n) => {
    const y0 = tab.y + 0.6 + n * third;
    out.push(`<path class="sk-ink" style="fill:${hex}" d="${poly([[fx, y0, ztop + 1.2], [fx, y0 + third, ztop + 1.2], [fx, y0 + third, ztop + TAB.h - 1.2], [fx, y0, ztop + TAB.h - 1.2]])}"/>`);
  });
  out.push(L(poly([[fx, tab.y + 0.6, ztop + 1.2], [fx, tab.y + TAB.d - 0.6, ztop + 1.2], [fx, tab.y + TAB.d - 0.6, ztop + TAB.h - 1.2], [fx, tab.y + 0.6, ztop + TAB.h - 1.2]]), { tone: "lo" }));
  // printed rule lines near the top of the card face, standing for the token names
  out.push(k.faceTextSvg(k.sideMatrix([x + CARD.t + 0.02, CARD.y + CARD.d - 5], ztop - 2.2, P, "right"), "tokens.css", { size: 3.4, tone: "mid" }));
  out.push(L([20, 15].map((len, n) => k.segment([x + CARD.t + 0.02, CARD.y + CARD.d - 5, ztop - 6.4 - n * 2.4], [x + CARD.t + 0.02, CARD.y + CARD.d - 5 - len, ztop - 6.4 - n * 2.4], P)).join(""), { tone: "lo", free: true }));
  // punched index holes along the card's top edge, one per position, this card's own hole open
  const holes = BRANDS.map((_, n) => [x + CARD.t / 2, CARD.y + 4 + n * 7, ztop]);
  out.push(D(holes.filter((_, n) => n !== i).map(at), { size: 0.35, tone: "lo" }));
  out.push(D([at(holes[i])], { size: 0.6, tone: "hi" }));
  return out.join("");
}

function rackFront() {
  const out = [];
  const front = { x: MAG.x, y: MAG.y + MAG.d - 4, w: MAG.w, d: 4, r: 1 };
  out.push(S(k.slabOf(front, MAG_Z, CHEEK_H, P, 3, 0.4), { tone: "mid", inner: L(k.sideSeam(front, MAG_Z + 5, P, 3), { tone: "faint" }) }));
  out.push(D([at([front.x + 4, front.y + 2, MAG_Z + CHEEK_H]), at([front.x + front.w - 4, front.y + 2, MAG_Z + CHEEK_H])], { size: 0.4 }));
  // detent quadrant behind the lever, eight notches, one per card
  const F = G.frameOf([PIVOT[0], front.y + front.d, PIVOT[2]], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  const sector = [[0, 0]];
  for (let a = -44; a <= 44; a += 4) sector.push([Math.sin(a * Math.PI / 180) * 19, Math.cos(a * Math.PI / 180) * 19]);
  out.push(S(G.prismOf(F, sector, 0, 1, P), { tone: "mid" }));
  const notches = BRANDS.map((_, i) => {
    const a = angleOf(i);
    const p0 = G.pointOf(F, 1, 0, 0);
    return k.segment([p0[0] + Math.sin(a) * 15, p0[1], p0[2] + Math.cos(a) * 15], [p0[0] + Math.sin(a) * 19, p0[1], p0[2] + Math.cos(a) * 19], P);
  });
  out.push(`<g data-part="notches">${notches.map((d, i) => `<path class="iso-line" data-tone="lo" data-i="${i}" d="${d}"/>`).join("")}</g>`);
  // pivot boss
  const FB = G.frameAlong([PIVOT[0], front.y + front.d + 1, PIVOT[2]], [0, 1, 0]);
  out.push(S(G.disc(0, 2.4, 4.2, FB, P), { tone: "mid" }));
  return out.join("");
}

function lever() {
  // the arm is redrawn live from its angle; the knob is a ball moved by a translate
  const y = MAG.y + MAG.d + 3.4;
  const tip0 = [PIVOT[0], y, PIVOT[2] + ARM];
  const knob = G.sphereOf(tip0, 3.4, P);
  const hub = G.disc(0, 1.6, 2.6, G.frameAlong([PIVOT[0], y + 0.6, PIVOT[2]], [0, 1, 0]), P);
  return `<g data-part="lever"><line class="sk-arm-o" x1="0" y1="0" x2="0" y2="0"/><line class="sk-arm" x1="0" y1="0" x2="0" y2="0"/><line class="sk-arm-hi" x1="0" y1="0" x2="0" y2="0"/><g data-part="knob">${S(knob, { tone: "mid" })}</g></g>${S(hub, { tone: "mid" })}${D([at([PIVOT[0], y + 2.2, PIVOT[2]])], { size: 0.55, tone: "hi" })}`;
}

// ---------------------------------------------------------------- rails, bed, forme
function rail(y) {
  const out = [];
  out.push(S(k.slabOf({ x: RAIL.x, y, w: RAIL.w, d: RAIL.d, r: 1 }, 0, RAIL.h, P, 3, 0.4), { tone: "mid" }));
  out.push(D([RAIL.x + 8, RAIL.x + RAIL.w / 2, RAIL.x + RAIL.w - 8].map((x) => at([x, y + RAIL.d / 2, RAIL.h])), { size: 0.4 }));
  for (const x of [RAIL.x - 4, RAIL.x + RAIL.w]) {
    out.push(S(k.slabOf({ x, y: y - 1, w: 4, d: RAIL.d + 2, r: 1 }, 0, 8, P, 3, 0.4), { tone: "mid" }));
    out.push(D([at([x + 2, y + RAIL.d / 2, 8])], { size: 0.45 }));
  }
  return out.join("");
}

function bed() {
  const out = [`<path class="iso-halo" d="${k.haloOf(BED, 0, BED_H, P)}" style="opacity:.2"/>`];
  out.push(S(k.slabOf(BED, 0, BED_H, P, 4, 0.8), { tone: "mid", inner: L(k.sideSeam(BED, 2.5, P, 4), { tone: "faint" }) }));
  return out.join("");
}

const CHASE = { x: BED.x + 3, y: BED.y + 3, w: BED.w - 6, d: BED.d - 6 };
const chaseBars = {
  back: { x: CHASE.x, y: CHASE.y, w: CHASE.w, d: 3, r: 0.6 },
  left: { x: CHASE.x, y: CHASE.y + 3, w: 3, d: CHASE.d - 6, r: 0.6 },
  right: { x: CHASE.x + CHASE.w - 3, y: CHASE.y + 3, w: 3, d: CHASE.d - 6, r: 0.6 },
  front: { x: CHASE.x, y: CHASE.y + CHASE.d - 3, w: CHASE.w, d: 3, r: 0.6 },
};
const bar = (plan) => S(k.slabOf(plan, BED_H, CHASE_H, P, 2, 0.3), { tone: "mid" });

function quoins() {
  // two quoins lock the forme against the chase, each with its key hole
  const out = [];
  for (const q of [{ x: 8.2, y: -14, w: 3, d: 28, r: 0.5 }]) {
    out.push(S(k.slabOf(q, BED_H, CHASE_H, P, 2, 0.2), { tone: "mid" }));
    out.push(L(k.ring(q.x + 1.5, 0, 0.9, BED_H + CHASE_H, P, 12), { tone: "lo" }));
  }
  return out.join("");
}

const cellPlan = (i, j, dx = 0) => ({ x: CELL.x0 + i * (CELL.w + CELL.gx) + dx, y: CELL.y0 + j * (CELL.d + CELL.gy), w: CELL.w, d: CELL.d });
// eight surfaces, laid out as page rows (along x) by two columns (along y)
const CELLS = [0, 1].flatMap((i) => [0, 1, 2, 3].map((j) => ({ i, j, n: i * 4 + j })));

// motif of each surface, in cell-local units: a along x (page top to bottom), b along y.
// role: 1 brand, 2 ground, 3 tint, p paper; R: takes the token radius
function motif(n) {
  const R = true;
  switch (n) {
    case 0: return [ // hero
      { a: 2, b: 2, la: 3.4, lb: 26, role: 2 },
      { a: 7, b: 2, la: 14, lb: 26, role: 1, R },
      { a: 10, b: 5, la: 1.4, lb: 14, role: "p" },
      { a: 13, b: 5, la: 1.4, lb: 10, role: "p" },
      { a: 23, b: 2, la: 5, lb: 11, role: 1, R },
      { a: 23, b: 15, la: 5, lb: 9, role: 2, R },
    ];
    case 1: return [ // catalog
      { a: 2, b: 2, la: 12, lb: 12, role: "p", R }, { a: 2, b: 16, la: 12, lb: 12, role: "p", R },
      { a: 16, b: 2, la: 12, lb: 12, role: "p", R }, { a: 16, b: 16, la: 12, lb: 12, role: "p", R },
      { a: 5, b: 6.5, la: 6, lb: 3, role: 1 }, { a: 5, b: 20.5, la: 6, lb: 3, role: 1 },
      { a: 19, b: 6.5, la: 6, lb: 3, role: 1 }, { a: 19, b: 20.5, la: 6, lb: 3, role: 1 },
    ];
    case 2: return [ // product page
      { a: 3, b: 3, la: 22, lb: 11, role: "p", R },
      { a: 7, b: 6.5, la: 14, lb: 4, role: 1 },
      { a: 3, b: 17, la: 1.6, lb: 10, role: 2 },
      { a: 7, b: 17, la: 1.4, lb: 8, role: 2 },
      { a: 11, b: 17, la: 1.4, lb: 9, role: 2 },
      { a: 20, b: 17, la: 5, lb: 10, role: 1, R },
    ];
    case 3: return [ // cart
      { a: 2, b: 2, la: 6, lb: 26, role: "p", R },
      { a: 9.5, b: 2, la: 6, lb: 26, role: "p", R },
      { a: 17, b: 2, la: 6, lb: 26, role: "p", R },
      { a: 3.5, b: 4, la: 3, lb: 3, role: 1 }, { a: 11, b: 4, la: 3, lb: 3, role: 1 }, { a: 18.5, b: 4, la: 3, lb: 3, role: 1 },
      { a: 24.5, b: 2, la: 4, lb: 26, role: 2, R },
    ];
    case 4: return [ // checkout
      { a: 2.5, b: 2, la: 5, lb: 26, role: "p", R },
      { a: 9.5, b: 2, la: 5, lb: 12, role: "p", R },
      { a: 9.5, b: 16, la: 5, lb: 12, role: "p", R },
      { a: 17, b: 2, la: 1.4, lb: 16, role: 2 },
      { a: 21, b: 2, la: 6, lb: 26, role: 1, R },
    ];
    case 5: return [ // account
      { a: 3, b: 3, la: 9, lb: 9, role: 1, round: true },
      { a: 4.5, b: 15, la: 1.6, lb: 12, role: 2 },
      { a: 8.5, b: 15, la: 1.4, lb: 8, role: 2 },
      { a: 15, b: 2, la: 4.6, lb: 26, role: "p", R },
      { a: 21, b: 2, la: 4.6, lb: 26, role: "p", R },
      { a: 16.6, b: 4, la: 1.4, lb: 1.4, role: 1 }, { a: 22.6, b: 4, la: 1.4, lb: 1.4, role: 1 },
    ];
    case 6: return [ // proof of testing: a certificate with its seal
      { a: 2, b: 4, la: 26, lb: 22, role: "p" },
      { a: 2, b: 4, la: 4, lb: 22, role: 2 },
      { a: 9, b: 7, la: 1.2, lb: 16, role: 3 },
      { a: 12, b: 7, la: 1.2, lb: 12, role: 3 },
      { a: 15, b: 7, la: 1.2, lb: 14, role: 3 },
      { a: 19, b: 15, la: 7, lb: 7, role: 1, round: true },
    ];
    default: return [ // compliance gate: a modal with an age checkbox and a button
      { a: 3, b: 3, la: 24, lb: 24, role: 2, alpha: 0.35 },
      { a: 6, b: 6, la: 18, lb: 18, role: "p", R },
      { a: 9, b: 9, la: 3, lb: 3, role: 1 },
      { a: 9.8, b: 14, la: 1.4, lb: 8, role: 2 },
      { a: 16, b: 9, la: 5, lb: 12, role: 1, R },
    ];
  }
}

const shapePlan = (cell, s, radius) => {
  const plan = { x: cell.x + s.a, y: cell.y + s.b, w: s.la, d: s.lb, r: 0 };
  if (s.round) plan.r = Math.min(s.la, s.lb) / 2;
  else if (s.R) plan.r = radius;
  else plan.r = Math.min(0.5, s.la / 2, s.lb / 2);
  return plan;
};

function block({ i, j, n }) {
  const plan = { ...cellPlan(i, j), r: 0.8 };
  const out = [];
  out.push(S(k.slabOf(plan, BED_H, TYPE_H, P, 3, 0.5), { tone: "hi", crease: "lo" }));
  // the relief: the same shapes the proof prints, cut into the face (radius neutral on metal)
  const relief = motif(n).map((s) => k.pathOf(k.ringOf(shapePlan(plan, s, s.round ? 0 : 0.5), s.round ? 10 : 2).map(([x, y]) => at([x, y, TYPE_TOP])), true));
  out.push(L(relief.join(""), { tone: "mid" }));
  return out.join("");
}

// ---------------------------------------------------------------- carriage
function carriageBack() {
  const out = [];
  const cheek = { x: HOME - 11, y: RAIL_Y[0] - 0.5, w: 22, d: 7, r: 2 };
  out.push(S(k.slabOf(cheek, RAIL.h, 40, P, 4, 0.5), { tone: "mid" }));
  return out.join("");
}

function rollers() {
  const out = [];
  // rider (distributor) roller, behind and above the ink roller
  const rider = G.frameAlong([HOME - 6, -75.5, ROLL_Z + 9.3], [0, 1, 0]);
  out.push(S(G.solidOf([[0, 3.2], [1.2, 4.2], [149.8, 4.2], [151, 3.2]], rider, P), { tone: "mid" }));
  // ink roller: steel body, the ink film painted over it in the active brand colour
  const F = G.frameAlong([HOME, -75.5, ROLL_Z], [0, 1, 0]);
  const body = G.solidOf([[0, 5.6], [1.2, ROLL_R], [149.8, ROLL_R], [151, 5.6]], F, P);
  const film = G.outlineOf([[3, ROLL_R + 0.05], [148, ROLL_R + 0.05]], F, P);
  const shine = G.ribsOf(F, 3, 148, ROLL_R + 0.06, 40, P, { phase: 0, least: 0.2 });
  out.push(S(body, { tone: "hi", crease: "lo" }));
  out.push(`<path class="sk-film" data-part="film" d="${film.fill}"/>`);
  out.push(L(G.arcOf(F, 3, ROLL_R + 0.06, P) + G.arcOf(F, 148, ROLL_R + 0.06, P), { tone: "lo" }));
  // crossbar handle across the cheek tops, knurled grips at each end
  const bar = G.frameAlong([HOME + 5, RAIL_Y[0] + 1, RAIL.h + 41.5], [0, 1, 0]);
  out.push(S(G.solidOf([[0, 2.2], [RAIL_Y[1] + RAIL.d - 1 - (RAIL_Y[0] + 1), 2.2]], bar, P), { tone: "mid" }));
  return out.join("") + (shine ? "" : "");
}

function carriageFront() {
  const out = [];
  const cheek = { x: HOME - 11, y: RAIL_Y[1] + 0.5, w: 22, d: 7, r: 2 };
  out.push(S(k.slabOf(cheek, RAIL.h, 40, P, 4, 0.5), { tone: "mid", inner: L(k.sideSeam(cheek, RAIL.h + 6, P, 4), { tone: "faint" }) }));
  const face = cheek.y + cheek.d;
  // axle caps on the outer face: ink roller, rider, crossbar
  for (const [x, z, r] of [[HOME, ROLL_Z, 4], [HOME - 6, ROLL_Z + 9.3, 3]]) {
    const F = G.frameAlong([x, face, z], [0, 1, 0]);
    out.push(S(G.disc(0, 1.4, r, F, P), { tone: "mid" }));
    out.push(D([at([x, face + 1.4, z])], { size: 0.5, tone: "hi" }));
  }
  const cap = G.frameAlong([HOME + 5, face, RAIL.h + 41.5], [0, 1, 0]);
  out.push(S(G.solidOf([[0, 2.6], [5, 2.6]], cap, P), { tone: "mid" }));
  out.push(L(G.ribsOf(cap, 0.4, 4.6, 2.6, 22, P), { tone: "lo" }));
  // grip shoe running on the rail
  out.push(D([at([HOME - 8, face, RAIL.h + 3]), at([HOME + 8, face, RAIL.h + 3])], { size: 0.45 }));
  return out.join("");
}

// ---------------------------------------------------------------- delivery board and the proof
function board() {
  const out = [`<path class="iso-halo" d="${k.haloOf(TRAY, 0, TRAY_H, P)}" style="opacity:.2"/>`];
  out.push(S(k.slabOf(TRAY, 0, TRAY_H, P, 4, 0.6), { tone: "mid" }));
  // back fence and side fence that square the sheet
  out.push(S(k.slabOf({ x: TRAY.x + 2, y: TRAY.y + 2, w: TRAY.w - 4, d: 2.4, r: 0.6 }, TRAY_H, 3, P, 2, 0.3), { tone: "mid" }));
  out.push(S(k.slabOf({ x: TRAY.x + 2, y: TRAY.y + 4.4, w: 2.4, d: TRAY.d - 6.4, r: 0.6 }, TRAY_H, 3, P, 2, 0.3), { tone: "mid" }));
  // the sheet
  out.push(S(k.slabOf(SHEET, TRAY_H, 0.6, P, 2), { tone: "hi", crease: "none", className: "sk-paper" }));
  return out.join("");
}

function printLayer(radius) {
  // every print fill reads var(--k1..3) on the layer, so a token swap re-inks without new geometry
  const out = [];
  for (const cell of CELLS) {
    const plan = cellPlan(cell.i, cell.j, SHEET_DX);
    out.push(`<path style="fill:var(--k3)" d="${rr({ ...plan, r: Math.min(radius, 3) }, SHEET_Z, 6)}"/>`);
    for (const s of motif(cell.n)) {
      const sp = shapePlan(plan, s, radius);
      const fill = s.role === "p" ? "#FFFFFF" : `var(--k${s.role})`;
      out.push(`<path style="fill:${fill}${s.alpha ? `;opacity:${s.alpha}` : ""}" d="${rr(sp, SHEET_Z, s.round ? 12 : 6)}"/>`);
    }
  }
  return out.join("");
}

function grippers() {
  const out = [];
  for (const y of [SHEET.y + 10, SHEET.y + SHEET.d - 16]) {
    const g = { x: SHEET.x - 3, y, w: 7, d: 6, r: 1 };
    out.push(S(k.slabOf(g, SHEET_Z, 1.6, P, 3, 0.3), { tone: "mid" }));
    out.push(D([at([g.x + 2, y + 3, SHEET_Z + 1.6])], { size: 0.45 }));
  }
  return out.join("");
}

// ---------------------------------------------------------------- assemble
const carriageMove = (x) => k.translateAlong(P, [x - HOME, 0, 0]);
const sheetCorners = [[SHEET.x, SHEET.y], [SHEET.x, SHEET.y + SHEET.d], [SHEET.x + SHEET.w, SHEET.y + SHEET.d], [SHEET.x + SHEET.w, SHEET.y]].map(([x, y]) => at([x, y, SHEET_Z]));
const radiusFor = (px) => (px ? 2.2 : 0);
const prints = (slot) => `<g class="sk-print" data-part="${slot}">${[...new Set(BRANDS.map((b) => b.r))].map((r) => `<g data-r="${r}">${printLayer(radiusFor(r))}</g>`).join("")}</g>`;

const cards = BRANDS.map((_, i) => `<g data-part="card" data-i="${i}" class="sk-hit">${card(i)}</g>`).join("");

const body = [
  base(),
  frontFurniture(),
  rackBack(),
  cards,
  rackFront(),
  lever(),
  rail(RAIL_Y[0]),
  `<g data-part="carriage-back" transform="${carriageMove(HOME)}">${carriageBack()}</g>`,
  bed(),
  bar(chaseBars.back),
  bar(chaseBars.left),
  ...[...CELLS].sort((a, b) => k.depthOf([cellPlan(a.i, a.j).x, cellPlan(a.i, a.j).y, 0], P) - k.depthOf([cellPlan(b.i, b.j).x, cellPlan(b.i, b.j).y, 0], P)).map(block),
  bar(chaseBars.right),
  quoins(),
  bar(chaseBars.front),
  `<g data-part="rollers" transform="${carriageMove(HOME)}">${rollers()}</g>`,
  rail(RAIL_Y[1]),
  `<g data-part="carriage-front" transform="${carriageMove(HOME)}">${carriageFront()}</g>`,
  board(),
  `<clipPath id="sk-wipe"><path data-part="wipe" d="M0 0Z"/></clipPath>`,
  prints("print-old"),
  `<g clip-path="url(#sk-wipe)">${prints("print-new")}</g>`,
  L(k.pathOf(sheetCorners, true), { tone: "mid" }),
  grippers(),
].join("");

// ---------------------------------------------------------------- card text (in the SVG, so the embed is one element)
const first = BRANDS[0];
const swatches = first.c
  .map((hex, n) => `<i class="sk-sw" data-sw="${n}" style="background:${hex}"></i><span data-hex="${n}">${hex}</span>`)
  .join(" ");
// pass 9: header and footer rows moved out to the shared HTML head and foot, so the viewBox
// crops to the art (scaled art spans about x 5 to 436, y 38 to 300)
const VB = [0, 30, W, 276];
const label =
  "A small proof press for storefronts. On the left, a rack of eight token cards, one per demo brand, each with three colour stripes on its tab. In the middle, one forme of eight identical blocks: hero, catalog, product page, cart, checkout, account, proof of testing and compliance gate. An index lever lifts one card; the ink roller takes its colours, rolls across the forme, and the proof on the right re-inks in that brand's colours and corner radius while the blocks stay the same.";

const STYLE = `
.skf{--sk-bg:#FAFAF9;--sk-surface:#FAFAF9;--sk-ink:#111111;--sk-muted:#6B6B6B;--sk-rule:#E6E6E3;--sk-bronze:#8C6A3F;--sk-bronze-deep:#6E5230;--sk-cobalt:#1F4E9E;
--anatomy-paper:var(--sk-surface);--anatomy-face:#FFFFFF;--anatomy-top:#FFFFFF;
--anatomy-shade-0:#DCDBD7;--anatomy-shade-1:#E6E5E1;--anatomy-shade-2:#EEEDEA;--anatomy-shade-3:#F3F3F1;
--anatomy-lit-top:#FFFFFF;--anatomy-lit-shade:#EFEEEB;
--anatomy-hi:#262626;--anatomy-mid:#8A8986;--anatomy-lo:#B8B7B3;--anatomy-faint:#DCDBD7;--anatomy-lit:var(--sk-bronze-deep);
--anatomy-halo:#7A7873;--anatomy-halo-opacity:.3;--anatomy-dot:#333333;--anatomy-weight:.6px;
display:block;width:100%;height:auto;overflow:visible;margin:4px 0 0;color:var(--sk-ink);-webkit-tap-highlight-color:transparent;cursor:pointer;outline:none}
.skf:focus-visible{box-shadow:0 0 0 2px var(--sk-bronze)}
.skf .sk-bg{fill:var(--sk-surface)}
.skf path,.skf circle{vector-effect:non-scaling-stroke}
.skf .iso-fill{fill:var(--anatomy-paper);stroke:none}
.skf .iso-solid[data-lit]>.iso-fill{fill:var(--anatomy-face)}
.skf .iso-shade,.skf .iso-top{stroke:none}
.skf .iso-shade[data-shade="0"]{fill:var(--anatomy-shade-0)}
.skf .iso-shade[data-shade="1"]{fill:var(--anatomy-shade-1)}
.skf .iso-shade[data-shade="2"]{fill:var(--anatomy-shade-2)}
.skf .iso-shade[data-shade="3"]{fill:var(--anatomy-shade-3)}
.skf .iso-top{fill:var(--anatomy-top)}
.skf .iso-solid[data-lit]>.iso-top{fill:var(--anatomy-lit-top)}
.skf .iso-solid[data-lit]>.iso-shade{fill:var(--anatomy-lit-shade)}
.skf .iso-solid[data-seamless]>.iso-shade,.skf .iso-solid[data-seamless]>.iso-top{stroke-width:.4;stroke-linejoin:round}
.skf .iso-solid[data-seamless]>.iso-shade[data-shade="0"]{stroke:var(--anatomy-shade-0)}
.skf .iso-solid[data-seamless]>.iso-shade[data-shade="1"]{stroke:var(--anatomy-shade-1)}
.skf .iso-solid[data-seamless]>.iso-shade[data-shade="2"]{stroke:var(--anatomy-shade-2)}
.skf .iso-solid[data-seamless]>.iso-shade[data-shade="3"]{stroke:var(--anatomy-shade-3)}
.skf .iso-solid[data-seamless]>.iso-top{stroke:var(--anatomy-top)}
.skf .iso-halo{fill:var(--anatomy-halo);stroke:none;filter:blur(7px);opacity:var(--anatomy-halo-opacity);transform:translateY(3px)}
.skf .iso-line{fill:none;stroke:var(--anatomy-lo);stroke-width:var(--anatomy-weight);stroke-linecap:round;stroke-linejoin:round}
.skf .iso-line[data-tone="hi"]{stroke:var(--anatomy-hi)}
.skf .iso-line[data-tone="mid"]{stroke:var(--anatomy-mid)}
.skf .iso-line[data-tone="lo"]{stroke:var(--anatomy-lo)}
.skf .iso-line[data-tone="faint"]{stroke:var(--anatomy-faint)}
.skf .iso-line[data-tone="lit"]{stroke:var(--anatomy-lit)}
.skf .iso-dots circle{fill:var(--anatomy-dot);stroke:none;opacity:.32}
.skf .iso-dots[data-tone="hi"] circle{opacity:.85}
.skf .iso-dots[data-tone="mid"] circle{opacity:.45}
.skf .iso-dots[data-tone="lo"] circle{opacity:.22}
.skf .iso-face-text{fill:var(--anatomy-mid);font-family:"JetBrains Mono",ui-monospace,Menlo,Consolas,monospace;letter-spacing:.04em}
.skf .iso-face-text[data-tone="lo"]{fill:var(--anatomy-lo)}
.skf .sk-card[data-on]>.iso-edge{stroke:var(--anatomy-lit);stroke-width:.9px}
.skf .sk-card[data-on]>.iso-top{fill:var(--anatomy-lit-top)}
.skf [data-part="card"] .iso-face-text{opacity:0;transition:opacity .4s}
.skf [data-part="card"][data-on] .iso-face-text{opacity:1}
@media (prefers-reduced-motion:reduce){.skf [data-part="card"] .iso-face-text{transition:none}}
.skf .sk-film{fill:var(--k1,#2749CB);opacity:.92}
.skf .sk-print path{stroke:none}
.skf .sk-arm-o{stroke:var(--anatomy-hi);stroke-linecap:round}
.skf .sk-arm{stroke:var(--anatomy-shade-1);stroke-linecap:round}
.skf .sk-arm-hi{stroke:var(--anatomy-top);stroke-linecap:round}
.skw .sk-sw{display:inline-block;width:10px;height:10px;border-radius:2px;box-shadow:inset 0 0 0 1px rgba(17,17,17,.12);margin:0 5px 0 10px;vertical-align:-1px}
.skw [data-hexes]{white-space:nowrap}
`;

const svg = `<svg class="skf" viewBox="${VB.join(" ")}" xmlns="http://www.w3.org/2000/svg" role="img" tabindex="0" aria-label="${label}" data-skf><style>${STYLE}</style>
<g transform="translate(${ART_AT[0]} ${ART_AT[1]}) scale(${ART_SCALE}) translate(${-ART_C[0]} ${-ART_C[1]})"><g data-art>${body}</g></g>
</svg>`;
const figure = `<style>${FAMILY_CSS}</style>
<div class="skw fig-fam">
${head("02", "One forme, eight inks")}
${svg}
<div class="fig-foot"><p class="fig-read" data-readout aria-live="polite"><span data-name>${first.name}, radius ${first.r}px.</span> <span data-hexes>${swatches}</span></p><p class="fig-hint">Tap to swap the card, or use the arrow keys.</p></div>
</div>`;

// ---------------------------------------------------------------- live
const LIVE = `(()=>{
const wrap=document.currentScript&&document.currentScript.previousElementSibling;
const svg=wrap&&wrap.querySelector?wrap.querySelector("svg[data-skf]"):document.querySelector("svg[data-skf]");
if(!svg)return;
const box=svg.parentNode;
const B=${JSON.stringify(BRANDS)};
const HOME=${HOME},END=${END},UX=${JSON.stringify([+(Math.sin(AZ * Math.PI / 180) * cam.k).toFixed(4), +(Math.cos(AZ * Math.PI / 180) * cam.sinE * cam.k).toFixed(4)])},RISE=${(cam.cosE * cam.k).toFixed(4)};
const SC=${JSON.stringify(sheetCorners.map(([x, y]) => [+x.toFixed(2), +y.toFixed(2)]))};
const PIV=${JSON.stringify(at([PIVOT[0], MAG.y + MAG.d + 3.4, PIVOT[2]]).map((v) => +v.toFixed(2)))},ARM=${ARM},AK=${JSON.stringify([+(Math.sin(AZ * Math.PI / 180) * cam.k).toFixed(4), +(Math.cos(AZ * Math.PI / 180) * cam.sinE * cam.k).toFixed(4), +(cam.cosE * cam.k).toFixed(4)])};
const ang=i=>(-33+i*(66/7))*Math.PI/180;
const q=s=>svg.querySelector(s),qa=s=>svg.querySelectorAll(s);
const moving=[q('[data-part="carriage-back"]'),q('[data-part="rollers"]'),q('[data-part="carriage-front"]')];
const film=q('[data-part="film"]'),wipe=q('[data-part="wipe"]'),pOld=q('[data-part="print-old"]'),pNew=q('[data-part="print-new"]');
const cards=[...qa('[data-part="card"]')],arm=[...qa('[data-part="lever"] line')],knob=q('[data-part="knob"]');
const nameT=box.querySelector('[data-name]'),hexes=box.querySelector('[data-hexes]');
const still=matchMedia("(prefers-reduced-motion: reduce)");
const mix=(a,b,t)=>{const p=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));const A=p(a),C=p(b);return"#"+A.map((v,i)=>Math.round(v+(C[i]-v)*t).toString(16).padStart(2,"0")).join("")};
const ease=t=>t<0?0:t>1?1:t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const paint=(g,b)=>{g.style.setProperty("--k1",b.c[0]);g.style.setProperty("--k2",b.c[1]);g.style.setProperty("--k3",b.c[2]);g.querySelectorAll("[data-r]").forEach(n=>n.style.display=+n.dataset.r===b.r?"":"none")};
const lerp=(a,b,t)=>a+(b-a)*t;
function setWipe(p){const x0=SC[0],x1=SC[1],y1=SC[2],y0=SC[3];const a=[lerp(x0[0],y0[0],p),lerp(x0[1],y0[1],p)],b=[lerp(x1[0],y1[0],p),lerp(x1[1],y1[1],p)];wipe.setAttribute("d","M"+x0+"L"+x1+"L"+b+"L"+a+"Z")}
function setCarriage(x){const dx=(x-HOME)*UX[0],dy=(x-HOME)*UX[1];const t="translate("+dx.toFixed(2)+" "+dy.toFixed(2)+")";moving.forEach(g=>g.setAttribute("transform",t))}
function setLever(a){const tx=PIV[0]+Math.sin(a)*ARM*AK[0],ty=PIV[1]+Math.sin(a)*ARM*AK[1]-Math.cos(a)*ARM*AK[2];const w=[3.6,2.4,.8];arm.forEach((l,n)=>{l.setAttribute("x1",PIV[0]);l.setAttribute("y1",PIV[1]);l.setAttribute("x2",tx.toFixed(2));l.setAttribute("y2",ty.toFixed(2));l.setAttribute("stroke-width",w[n])});
 const t0x=PIV[0],t0y=PIV[1]-ARM*AK[2];knob.setAttribute("transform","translate("+(tx-t0x).toFixed(2)+" "+(ty-t0y).toFixed(2)+")")}
const lift=new Array(B.length).fill(0);
function setCards(){cards.forEach((c,i)=>{c.setAttribute("transform","translate(0 "+(-lift[i]*${LIFT}*RISE).toFixed(2)+")")})}
function readout(b){nameT.textContent=b.name+", radius "+b.r+"px.";const sw=hexes.querySelectorAll("[data-sw]"),tx=hexes.querySelectorAll("[data-hex]");
 for(let n=0;n<3;n++){tx[n].textContent=b.c[n];sw[n].style.background=b.c[n]}
 svg.setAttribute("aria-valuetext",b.name+", "+b.c.join(", ")+", radius "+b.r+" px")}
// state
let cur=0,shown=0,t=0,run=false,frame=0,last=0,visible=false,x=HOME,x0=HOME,leverA=ang(0),leverFrom=ang(0),touring=!still.matches,tourAt=0,pause=0;
cards[0].setAttribute("data-on","");cards[0].querySelectorAll(".sk-card").forEach(n=>n.setAttribute("data-on",""));
lift[0]=1;
paint(pOld,B[0]);paint(pNew,B[0]);film.style.setProperty("--k1",B[0].c[0]);setWipe(0);
function select(i,user){i=(i+B.length)%B.length;if(user){touring=false;pause=9}
 paint(pOld,B[shown]);setWipe(0);paint(pNew,B[i]);
 cards.forEach((c,n)=>c.toggleAttribute("data-on",n===i));cards.forEach((c,n)=>c.querySelectorAll(".sk-card").forEach(m=>n===i?m.setAttribute("data-on",""):m.removeAttribute("data-on")));
 const from=cur;cur=i;readout(B[i]);
 if(still.matches){lift.fill(0);lift[i]=1;setCards();leverA=ang(i);setLever(leverA);film.setAttribute("style","fill:"+B[i].c[0]);setWipe(1);shown=i;paint(pOld,B[i]);x=HOME;setCarriage(x);return}
 x0=x;leverFrom=leverA;filmFrom=film.dataset.c||B[from].c[0];t=0;run=true;kick()}
let filmFrom=B[0].c[0];film.dataset.c=B[0].c[0];film.setAttribute("style","fill:"+B[0].c[0]);
// timeline (s): 0-0.7 lever, cards, carriage home; 0.7-1.0 ink; 1.0-2.5 pass and print; 2.5-3.6 return
function step(dt){
 if(run){t+=dt;
  const a=ease(t/.7);leverA=leverFrom+(ang(cur)-leverFrom)*a;
  for(let n=0;n<B.length;n++){const want=n===cur?1:0;lift[n]+=(want-lift[n])*(1-Math.exp(-dt/.12))}
  if(t<.7)x=x0+(HOME-x0)*a;
  const ink=ease((t-.7)/.3);const c=mix(filmFrom,B[cur].c[0],ink);film.setAttribute("style","fill:"+c);film.dataset.c=c;
  if(t>=1&&t<2.5){const p=ease((t-1)/1.5);x=HOME+(END-HOME)*p;setWipe(p)}
  if(t>=2.5){setWipe(1);if(shown!==cur){shown=cur;}const r=ease((t-2.5)/1.1);x=END+(HOME-END)*r}
  if(t>=3.6){x=HOME;run=false;paint(pOld,B[cur]);setWipe(0);lift.fill(0);lift[cur]=1}
  setLever(leverA);setCards();setCarriage(x)}
 if(touring&&!run){tourAt+=dt;if(tourAt>1.4){tourAt=0;select(cur+1,false)}}
 if(!touring&&!still.matches&&!run){pause-=dt;if(pause<=0){touring=true;tourAt=0}}
}
function tick(now){const dt=last?Math.min((now-last)/1000,1/20):1/60;last=now;step(dt);frame=visible?requestAnimationFrame(tick):0}
function kick(){if(!frame&&visible){last=0;frame=requestAnimationFrame(tick)}}
new IntersectionObserver(e=>{visible=e[e.length-1].isIntersecting;if(visible)kick()},{rootMargin:"80px 0px"}).observe(svg);
svg.addEventListener("click",e=>{const c=e.target.closest('[data-part="card"]');select(c?+c.dataset.i:cur+1,true)});
svg.addEventListener("keydown",e=>{let to=null;if(e.key==="ArrowRight"||e.key==="ArrowDown"||e.key==="Enter"||e.key===" ")to=cur+1;if(e.key==="ArrowLeft"||e.key==="ArrowUp")to=cur-1;if(e.key==="Home")to=0;if(e.key==="End")to=B.length-1;if(to===null)return;e.preventDefault();select(to,true)});
still.addEventListener&&still.addEventListener("change",()=>{touring=!still.matches;kick()});
setLever(leverA);setCards();setCarriage(x);readout(B[0]);
const jump=i=>{const m=still.matches;Object.defineProperty(still,"matches",{value:true,configurable:true});select(i,true);Object.defineProperty(still,"matches",{value:m,configurable:true})};
window.__skf={select,jump,state:()=>({cur,t,run,x})};
const pb=new URLSearchParams(location.search).get("b");if(pb!==null)jump(+pb);
})();`;

const embed = `${figure}\n<script>${LIVE}</script>\n`;
writeFileSync(join(HERE, "embed.html"), `<!-- StoreKit figure, built by build.mjs. Paste inside <div class="media">. -->\n${embed}`);

const caption =
  "A proof press for storefronts. The forme holds eight blocks, one per surface every store needs: hero, catalog, product page, cart, checkout, account, proof of testing, compliance gate. They never change. The index lever lifts one token card out of the rack; the roller takes that card's colours and the proof re-inks with them and with its corner radius. One token contract, eight looks, nothing carried over between brands. The stores are being moved onto the contract one at a time.";
const page = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Token proof press</title>
<script>const t=new URLSearchParams(location.search).get("theme");if(t)document.documentElement.dataset.theme=t;</script>
<style>
:root{--bg:#FAFAF9;--ink:#111111;--muted:#6B6B6B}
html,body{margin:0;background:var(--bg);color:var(--ink)}
body{font-family:"Instrument Sans",system-ui,-apple-system,"Segoe UI",sans-serif;display:flex;justify-content:center;padding:32px 16px;box-sizing:border-box}
.col{width:100%;max-width:520px}
.media{width:100%}
p.cap{color:var(--muted);font-size:13.5px;line-height:1.55;margin:12px 2px 0}
</style></head><body><div class="col"><div class="media">
${embed}</div>
<p class="cap">${caption}</p></div></body></html>
`;
writeFileSync(join(HERE, "figure.html"), page);

for (const text of [embed, page]) if (/[–—·]/.test(text)) throw new Error("forbidden dash or middle dot in output");
console.log("wrote figure.html and embed.html", { scale: +P.scale.toFixed(3), bytes: embed.length });
