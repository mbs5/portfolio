// Peptiful figure: one stock count behind many storefronts.
// A dispensing cabinet with one brand hatch per bay. Every bay's readout is a number
// drum on ONE shared shaft, so a sale at any hatch turns the shaft one tooth and every
// window rolls together. The stock itself is one tray of vials on top of the cabinet.
// A blank bay module waits on rails and slides in to show a new brand going live.
//
// node build.mjs  -> writes figure.html (standalone) and embed.html (paste into .media)
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "./kit/iso-kit.mjs";
import * as G from "./kit/lathe.mjs";
import { FAMILY_CSS, head } from "../family.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));

// ---- truth: the model ------------------------------------------------------------
const STOCK = 24; // vials in the one shared tray; also the number of ratchet teeth
const BRANDS = ["A", "B", "C", "New"];

// ---- world ---------------------------------------------------------------------
const WIDTH = 600;
const HEIGHT = 400;

const PLATE = { x: -150, y: -50, w: 300, d: 116, r: 8 };
const PLATE_H = 10;
const FOOT_H = 5;

const CAB = { x: -132, y: -36, w: 264, d: 36, r: 2 };
const FRONT = 0;
const SIDE = CAB.x + CAB.w;
const PLINTH_H = 6;
const TOP = 86;
const CORNICE = { x: -134, y: -38, w: 268, d: 40, r: 2.5 };
const CORNICE_TOP = 90;

const TRAY = { x: -126, y: -33, w: 252, d: 28, r: 3 };
const TRAY_TOP = CORNICE_TOP + 3;
const VIAL_R = 3.6;
const VIALS = [];
for (const y of [-25, -13]) for (let i = 0; i < 12; i++) VIALS.push([-110 + i * 20, y]);

const BX = [-32, 32, 96, -96];
const PANEL_D = 2.4;
const PF = FRONT + PANEL_D; // front plane of a hatch panel
const PANEL_Z = [10, 82];
const WIN = { w: 32, z0: 54, z1: 76, r: 2, depth: 3 };
const POCKET = { w: 32, z0: 16, z1: 38, r: 3, depth: 7 };
const BTN_Z = 46;
const PITCH = 26; // drum pitch on the window plane
const DIGIT = 16.5;

const OPEN = { x0: BX[3] - 27, x1: BX[3] + 27, z0: 11, z1: 81, r: 2, depth: 16 };
const SHAFT_Z = 65;
const PARK = 34; // how far out the blank module waits on its rails
const RAILS = [BX[3] - 20, BX[3] + 16];
const CARRIAGE = { x: BX[3] - 26, y: FRONT, w: 52, d: 20, r: 2 };
const CAR_Z = [3, 10];

const RATCHET = { y: -18, z: 52, r: 11, boss: 15 };

const P = k.fitProjection(
  [...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), ...k.boxCorners(CORNICE, 0, TRAY_TOP + 18)],
  WIDTH,
  HEIGHT,
  { pad: 14, azimuth: 63, elevation: 30 },
);

const at = (point) => k.iso(point, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const byDepth = (points) => [...points].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
const frontPlane = (y) => k.sideMatrix([0, y], 0, P, "left"); // plane coords (x, -z)
const sidePlane = (x) => k.sideMatrix([x, 0], 0, P, "right"); // plane coords (-y, -z)
const flat = (x0, z0, x1, z1, r, steps = 6) =>
  k.pathOf(k.roundedPlan({ x: x0, y: z0, w: x1 - x0, d: z1 - z0, r }, steps).map(([u, z]) => [u, -z]), true);
const vec = (by) => k.axisVector(P, by);
let parts = 0;
const part = (n = 1) => (parts += n);

let clips = 0;
// A rounded opening in a front-facing plane, with walls, a back face and content clipped to it.
function recess({ x0, x1, z0, z1, r, depth }, y, back = "", backClass = "pf-well", inside = "") {
  const id = `pf-clip-${clips++}`;
  const ring = k.roundedPlan({ x: x0, y: z0, w: x1 - x0, d: z1 - z0, r }, 6);
  const cx = (x0 + x1) / 2;
  const cz = (z0 + z1) / 2;
  const { sinA } = k.cameraOf(P);
  const tops = [];
  const sides = [[], [], [], []];
  ring.forEach(([ax, az], index) => {
    const [bx, bz] = ring[(index + 1) % ring.length];
    const length = Math.hypot(bx - ax, bz - az) || 1;
    let [nx, nz] = [(bz - az) / length, -(bx - ax) / length];
    if (nx * (cx - (ax + bx) / 2) + nz * (cz - (az + bz) / 2) < 0) [nx, nz] = [-nx, -nz];
    if (nx <= 0 && nz <= 0) return;
    const quad = k.pathOf([at([ax, y, az]), at([bx, y, bz]), at([bx, y - depth, bz]), at([ax, y - depth, az])], true);
    if (nz >= nx) tops.push(quad);
    else sides[Math.min(3, Math.max(0, Math.floor(((nx * -sinA + 1) / 2) * 4)))].push(quad);
  });
  const shape = flat(x0, z0, x1, z1, r);
  return [
    `<clipPath id="${id}"><path transform="${frontPlane(y)}" d="${shape}"/></clipPath>`,
    `<g clip-path="url(#${id})">`,
    `<g transform="${frontPlane(y - depth)}"><path class="${backClass}" d="${shape}"/>${back}<path class="iso-line" data-tone="faint" d="${shape}"/></g>`,
    inside,
    `<path class="iso-top" d="${tops.join("")}"/>`,
    ...sides.map((d, shade) => (d.length ? `<path class="iso-shade" data-shade="${shade}" d="${d.join("")}"/>` : "")),
    `</g>`,
    `<g transform="${frontPlane(y)}"><path class="iso-line" data-tone="lo" d="${shape}"/></g>`,
  ].join("");
}

// ---- base ----------------------------------------------------------------------
function base() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`];
  for (const [x, y] of byDepth(k.corners(PLATE, 20))) {
    out.push(S(k.cylinder(x, y, 7, -PLATE_H - FOOT_H, 1.6, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 5.4, -PLATE_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28), { tone: "mid" }));
    part(2);
  }
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.6), { tone: "mid" }));
  part();
  out.push(L(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "lo" }));
  const screws = k.corners(PLATE, 10);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));
  part(4);
  // label plate, front left
  const label = { x: 88, y: 44, w: 44, d: 11, r: 1.2 };
  out.push(S(k.slabOf(label, 0, 0.8, P, 3), { tone: "lo", crease: "none" }));
  out.push(L(k.planOutline(k.insetPlan(label, 1.4), 0.8, P, 3), { tone: "faint" }));
  out.push(L([30, 22, 14].map((w, i) => k.lineOnTop([label.x + 4, label.y + 3 + i * 2.6], [label.x + 4 + w, label.y + 3 + i * 2.6], 0.8, P)).join(""), { tone: "lo", free: true }));
  out.push(D([at([label.x + label.w - 3.2, label.y + 3, 0.8]), at([label.x + label.w - 3.2, label.y + label.d - 3, 0.8])], { size: 0.45 }));
  part();
  // rails for the blank module, with end stops and a ruler strip beside them
  for (const x of RAILS) {
    out.push(S(k.slabOf({ x, y: FRONT + 2, w: 4, d: 56, r: 1 }, 0, 3, P, 3, 0.4), { tone: "mid" }));
    out.push(D([FRONT + 8, FRONT + 52].map((y) => at([x + 2, y, 3])), { size: 0.4 }));
    out.push(S(k.slabOf({ x: x - 1.5, y: FRONT + 58, w: 7, d: 4, r: 1 }, 0, 6, P, 3, 0.4), { tone: "mid" }));
    part(2);
  }
  const strip = { x: RAILS[1] + 10, y: FRONT + 4, w: 6, d: 52, r: 1 };
  out.push(S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const ticks = k.topTicks(strip.y + 3, strip.y + strip.d - 3, 4, 5, strip.x + 0.6, 0.6, [1.8, 3.4], P, "y");
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  part();
  return out.join("");
}

// ---- the cabinet body -----------------------------------------------------------
function cabinet() {
  const out = [`<path class="iso-halo" d="${k.haloOf(CAB, 0, 10, P)}"/>`];
  out.push(S(k.slabOf(k.insetPlan(CAB, 3), 0, PLINTH_H, P, 4), { tone: "lo" }));
  const seam = k.sideSeam(CAB, 44, P, 4);
  out.push(S(k.slabOf(CAB, PLINTH_H, TOP - PLINTH_H, P, 4, 0.8), { tone: "mid" }));
  out.push(S(k.slabOf(CORNICE, TOP, CORNICE_TOP - TOP, P, 4, 0.8), { tone: "mid" }));
  part(3);
  // bay joints on the front face, edge to edge between plinth and cornice
  out.push(L([-64, 0, 64].map((x) => k.segment([x, FRONT, PLINTH_H], [x, FRONT, TOP], P)).join(""), { tone: "faint" }));
  // side vents, closed slots
  const slot = (y, z0, z1) => k.pathOf(k.roundedPlan({ x: y - 0.8, y: z0, w: 1.6, d: z1 - z0, r: 0.8 }, 4).map(([u, z]) => at([SIDE, u, z])), true);
  out.push(L(Array.from({ length: 8 }, (_, i) => slot(-33 + i * 3.4, 14, 28)).join(""), { tone: "faint" }));
  out.push(L(Array.from({ length: 8 }, (_, i) => slot(-33 + i * 3.4, 72, 82)).join(""), { tone: "faint" }));
  // ratchet assembly on the side face: boss, dial ticks, pawl block
  const F0 = G.frameOf([SIDE, RATCHET.y, RATCHET.z], [1, 0, 0], [0, -1, 0], [0, 0, 1]);
  out.push(S(G.disc(0, 1.5, RATCHET.boss, F0, P), { tone: "mid" }));
  part();
  const plane = sidePlane(SIDE + 1.5);
  const u = -RATCHET.y;
  const v = -RATCHET.z;
  const tick = [];
  for (let i = 0; i < STOCK; i++) {
    const a = (i / STOCK) * Math.PI * 2;
    const r0 = RATCHET.r + 1.4;
    const r1 = RATCHET.boss - (i % 6 === 0 ? 0 : 1.2);
    tick.push(`M${(u + Math.sin(a) * r0).toFixed(2)} ${(v - Math.cos(a) * r0).toFixed(2)}L${(u + Math.sin(a) * r1).toFixed(2)} ${(v - Math.cos(a) * r1).toFixed(2)}`);
  }
  out.push(`<g transform="${plane}"><path class="iso-line" data-tone="lo" d="${tick.join("")}"/></g>`);
  // ratchet wheel (a toothed disc) that the live code turns in its own plane
  out.push(S(G.disc(1.5, 3.5, RATCHET.r - 1.2, F0, P), { tone: "hi", crease: "lo" }));
  part();
  const teeth = [];
  for (let i = 0; i < STOCK; i++) {
    const a0 = (i / STOCK) * Math.PI * 2;
    const a1 = ((i + 1) / STOCK) * Math.PI * 2;
    const ro = RATCHET.r;
    const ri = RATCHET.r - 2.2;
    teeth.push([Math.sin(a0) * ri, -Math.cos(a0) * ri], [Math.sin(a1 - 0.02) * ro, -Math.cos(a1 - 0.02) * ro]);
  }
  const toothPath = k.pathOf(teeth, true);
  const pointer = `M0 0L0 ${-(RATCHET.r - 3.6)}`;
  out.push(
    `<g transform="${sidePlane(SIDE + 3.5)}"><g data-part="ratchet" transform="translate(${u} ${v}) rotate(0)">` +
      `<path class="pf-tooth" d="${toothPath}"/><circle class="pf-hub" r="3"/>` +
      `<path class="iso-line pf-count-line" d="${pointer}" data-free="end"/>` +
      `<circle class="pf-hubdot" r="0.9"/></g></g>`,
  );
  part();
  // pawl: a block above the wheel that holds it one tooth at a time
  const pawl = { x: SIDE, y: RATCHET.y - 3, w: 4.2, d: 6, r: 0.8 };
  out.push(S(k.slabOf(pawl, RATCHET.z + RATCHET.boss + 1, 5, P, 3, 0.3), { tone: "mid" }));
  // the pawl's finger drops from the block onto the wheel's teeth
  out.push(S(k.slabOf({ x: SIDE + 1.5, y: RATCHET.y - 1.3, w: 2.2, d: 2.6, r: 0.5 }, RATCHET.z + RATCHET.r - 2, RATCHET.boss - RATCHET.r + 3, P, 2, 0.2), { tone: "mid" }));
  part();
  out.push(D([at([SIDE + 4.2, RATCHET.y, RATCHET.z + RATCHET.boss + 3.5])], { size: 0.45 }));
  part();
  void seam;
  return out.join("");
}

// ---- shared definitions: one vial and one push button, placed with <use> ------------
const DEFS = [];
DEFS.push(
  `<g id="pf-vial">` +
    S(k.cylinder(0, 0, VIAL_R, 0, 11, P, 16, 0.4), { tone: "hi", crease: "lo", inner: L(k.sideArc(0, 0, VIAL_R, 7, P, 10), { tone: "faint" }) }) +
    S(k.cylinder(0, 0, 2, 11, 1.4, P, 10), { tone: "mid", crease: "none" }) +
    `<g class="pf-cap">${S(k.cylinder(0, 0, 2.9, 12.4, 3.4, P, 14, 0.3), { tone: "mid", crease: "faint" })}</g></g>`,
);
{
  const F = G.frameOf([0, PF, BTN_Z], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  DEFS.push(`<g id="pf-bezel">${S(G.disc(0, 1.2, 5.4, F, P, { steps: 28 }), { tone: "mid" })}</g>`);
  DEFS.push(`<g id="pf-btn">${S(G.solidOf([[-1.5, 3.8], [3.4, 3.8], [4.2, 3.2, 1], [4.4, 2.4, 1]], F, P, { steps: 28 }), { tone: "hi", crease: "lo", className: "pf-btn" })}</g>`);
}

// ---- the one tray of stock on top -----------------------------------------------
function tray() {
  const out = [];
  out.push(S(k.slabOf(TRAY, CORNICE_TOP, TRAY_TOP - CORNICE_TOP, P, 4, 0.5), { tone: "lo" }));
  out.push(L(k.planOutline(k.insetPlan(TRAY, 2.4), TRAY_TOP, P, 4), { tone: "faint" }));
  out.push(D(k.corners(TRAY, 5).map(([x, y]) => at([x, y, TRAY_TOP])), { size: 0.45 }));
  part();
  const order = VIALS.map((p, i) => [p, i]).sort((a, b) => k.depthOf([a[0][0], a[0][1], 0], P) - k.depthOf([b[0][0], b[0][1], 0], P));
  for (const [[x, y], i] of order) {
    const seat = L(k.ring(x, y, VIAL_R + 0.9, TRAY_TOP, P, 14), { tone: "faint" });
    out.push(seat, `<g data-vial="${i}"><use href="#pf-vial" transform="${k.translateAlong(P, [x, y, TRAY_TOP])}"/></g>`);
  }
  part(VIALS.length);
  return out.join("");
}

// ---- one hatch panel (a brand) --------------------------------------------------
const MARKS = [
  (cx, cz) => `M${cx - 3} ${-cz}a3 3 0 1 0 6 0a3 3 0 1 0 -6 0Z`,
  (cx, cz) => `M${cx} ${-(cz + 3.2)}L${cx + 3.2} ${-(cz - 2.4)}L${cx - 3.2} ${-(cz - 2.4)}Z`,
  (cx, cz) => `M${cx} ${-(cz + 3.4)}L${cx + 3.2} ${-cz}L${cx} ${-(cz - 3.4)}L${cx - 3.2} ${-cz}Z`,
  null,
];

function drumStrip(cx, index) {
  // a number drum seen through the window: STOCK down to 0, and a blank face below the top value
  const zc = (WIN.z0 + WIN.z1) / 2;
  const base = -zc + DIGIT * 0.36;
  const rows = [];
  for (let n = STOCK; n >= 0; n--) {
    const kk = STOCK - n;
    rows.push(`<text x="${cx}" y="${(base - kk * PITCH).toFixed(2)}">${String(n).padStart(2, "0")}</text>`);
  }
  rows.push(`<text x="${cx}" y="${(base + PITCH).toFixed(2)}" class="pf-blank">--</text>`);
  const start = index === 3 ? -1 : 0;
  return `<g class="pf-drum" data-drum="${index}" transform="translate(0 ${start * PITCH})" font-size="${DIGIT}">${rows.join("")}</g>`;
}

function drumShade(cx) {
  const zc = (WIN.z0 + WIN.z1) / 2;
  const half = (WIN.z1 - WIN.z0) / 2;
  return (
    `<path class="pf-drum-shade" d="${flat(cx - WIN.w / 2, zc + half - 4, cx + WIN.w / 2, zc + half, 0)}"/>` +
    `<path class="pf-drum-shade" d="${flat(cx - WIN.w / 2, zc - half, cx + WIN.w / 2, zc - half + 4, 0)}"/>` +
    `<path class="pf-index" d="M${cx - WIN.w / 2} ${-zc - 2}L${cx - WIN.w / 2 + 2.4} ${-zc}L${cx - WIN.w / 2} ${-zc + 2}Z"/>` +
    `<path class="pf-index" d="M${cx + WIN.w / 2} ${-zc - 2}L${cx + WIN.w / 2 - 2.4} ${-zc}L${cx + WIN.w / 2} ${-zc + 2}Z"/>`
  );
}

function button(cx, index, y) {
  const shift = k.translateAlong(P, [cx, y - PF, 0]);
  const bezel = `<use href="#pf-bezel" transform="${shift}"/>`;
  const cap = `<use href="#pf-btn" transform="${shift}"/>`;
  const v = vec([0, -1, 0]);
  return `${bezel}<g data-button="${index}" data-dir="${v[0].toFixed(3)} ${v[1].toFixed(3)}" transform="translate(0 0)">${cap}</g>`;
}

function hatch(index, y0 = FRONT) {
  const cx = BX[index];
  const pf = y0 + PANEL_D;
  const out = [];
  const plan = { x: cx - 28, y: y0, w: 56, d: PANEL_D, r: 1 };
  out.push(S(k.slabOf(plan, PANEL_Z[0], PANEL_Z[1] - PANEL_Z[0], P, 3, 0.5), { tone: "mid" }));
  part();
  // readout window with the drum behind it
  const win = { x0: cx - WIN.w / 2, x1: cx + WIN.w / 2, z0: WIN.z0, z1: WIN.z1, r: WIN.r, depth: WIN.depth };
  out.push(recess(win, pf, drumStrip(cx, index) + drumShade(cx), "pf-drumface"));
  part();
  // delivery pocket, with the vial that lands in it after a sale
  const pocket = { x0: cx - POCKET.w / 2, x1: cx + POCKET.w / 2, z0: POCKET.z0, z1: POCKET.z1, r: POCKET.r, depth: POCKET.depth };
  const py = pf - POCKET.depth / 2;
  const landed =
    `<g class="pf-landed" data-landed="${index}" style="opacity:0">` +
    `<use href="#pf-vial" transform="${k.translateAlong(P, [cx, py, POCKET.z0])}"/></g>`;
  out.push(recess(pocket, pf, "", "pf-well", landed));
  // flap hinge strip above the pocket, edge to edge of its slot
  out.push(`<g transform="${frontPlane(pf)}">${L(flat(cx - POCKET.w / 2 + 2, POCKET.z1 + 2, cx + POCKET.w / 2 - 2, POCKET.z1 + 3.6, 0.8, 3), { tone: "lo" })}</g>`);
  part();
  // brand mark, engraved; the new brand's panel is still blank
  if (MARKS[index]) out.push(`<g transform="${frontPlane(pf)}"><path class="iso-line" data-tone="mid" d="${MARKS[index](cx - 17, BTN_Z)}"/></g>`);
  else out.push(`<g transform="${frontPlane(pf)}"><path class="iso-line" data-tone="faint" d="${flat(cx - 21, BTN_Z - 3.5, cx - 13, BTN_Z + 3.5, 1, 3)}"/></g>`);
  // screws
  out.push(D([[cx - 24, 14], [cx + 24, 14], [cx - 24, 78], [cx + 24, 78]].map(([x, z]) => at([x, pf, z])), { size: 0.5 }));
  out.push(`<g transform="${frontPlane(pf)}">${L([[cx - 24, 14], [cx + 24, 14], [cx - 24, 78], [cx + 24, 78]].map(([x, z]) => `M${x - 1.6} ${-z}a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0 -3.2 0Z`).join(""), { tone: "lo" })}</g>`);
  part(2);
  // push button: the sale
  out.push(button(cx, index, pf));
  part(2);
  return `<g class="pf-bay" data-bay="${index}">${out.join("")}</g>`;
}

// ---- the open fourth bay, shaft visible ------------------------------------------
function openBay() {
  const ys = FRONT - 8;
  const F = G.frameOf([OPEN.x0 - 2, ys, SHAFT_Z], [1, 0, 0], [0, -1, 0], [0, 0, 1]);
  const shaft = S(G.solidOf([[0, 2], [OPEN.x1 - OPEN.x0 + 4, 2]], F, P), { tone: "hi", crease: "lo" });
  const Fd = G.frameOf([BX[3] - 9, ys, SHAFT_Z], [1, 0, 0], [0, -1, 0], [0, 0, 1]);
  const drum = S(G.disc(0, 18, 8, Fd, P), { tone: "hi", crease: "lo" });
  const dog = S(G.disc(-4, 0, 5, Fd, P), { tone: "mid" });
  const dog2 = S(G.disc(18, 22, 5, Fd, P), { tone: "mid" });
  const bearing = S(k.slabOf({ x: OPEN.x0 + 2, y: FRONT - OPEN.depth, w: 5, d: 10, r: 1 }, SHAFT_Z - 9, 8, P, 3), { tone: "lo" });
  const bearing2 = S(k.slabOf({ x: OPEN.x1 - 7, y: FRONT - OPEN.depth, w: 5, d: 10, r: 1 }, SHAFT_Z - 9, 8, P, 3), { tone: "lo" });
  const ribs = L(G.ribsOf(Fd, 0, 18, 8, 24, P, { seams: true }), { tone: "faint" });
  part(6);
  return recess(OPEN, FRONT, "", "pf-well", bearing + bearing2 + shaft + dog + drum + ribs + dog2);
}

// ---- the blank module on its carriage ---------------------------------------------
function module() {
  const out = [];
  out.push(`<path class="iso-halo" d="${k.haloOf(CARRIAGE, CAR_Z[0], 2, P)}" style="filter:blur(5px)"/>`);
  out.push(S(k.slabOf(CARRIAGE, CAR_Z[0], CAR_Z[1] - CAR_Z[0], P, 3, 0.6), { tone: "mid" }));
  out.push(D([-20, -6, 6, 20].map((dx) => at([BX[3] + dx, CARRIAGE.y + CARRIAGE.d - 2.4, CAR_Z[1]])), { size: 0.4, tone: "lo" }));
  part();
  // gussets tying the panel to the carriage
  for (const x of [CARRIAGE.x + 3, CARRIAGE.x + CARRIAGE.w - 6]) {
    out.push(S(k.slabOf({ x, y: PANEL_D, w: 3, d: 7, r: 0.6 }, CAR_Z[1], 8, P, 2, 0.3), { tone: "mid" }));
    part();
  }
  out.push(hatch(3));
  // pull knob on the carriage front
  const knob = [BX[3], CARRIAGE.y + CARRIAGE.d + 3];
  out.push(S(k.slabOf({ x: knob[0] - 2, y: CARRIAGE.y + CARRIAGE.d - 1, w: 4, d: 4, r: 1 }, CAR_Z[0] + 2, 3, P, 2), { tone: "mid", crease: "none" }));
  out.push(S(k.cylinder(knob[0], knob[1] + 1, 3, CAR_Z[0] + 1, 5, P, 20), { tone: "mid" }));
  out.push(L(k.knurl(knob[0], knob[1] + 1, 3, CAR_Z[0] + 1, CAR_Z[0] + 6, 18, P), { tone: "lo" }));
  part(2);
  return `<g data-part="module" transform="${k.translateAlong(P, [0, PARK, 0])}">${out.join("")}</g>`;
}

// ---- assemble ----------------------------------------------------------------------
const body = [`<defs>${DEFS.join("")}</defs>`, base(), cabinet(), tray(), openBay(), hatch(0), hatch(1), hatch(2), module()];

const label =
  "A dispensing cabinet with three brand hatches on its front and one tray of vials on top. Every hatch has a window onto a number drum, and all the drums sit on one shared shaft, so a sale at any hatch turns the shaft one tooth and every window reads the same new count. A blank fourth hatch waits on rails and slides into the empty bay to go live.";

const svg = k.figureSvg({ width: WIDTH, height: HEIGHT, label, body, className: "pf-svg" });

// ---- tokens -------------------------------------------------------------------------
const LIGHT = `
--anatomy-paper:#FAFAF9;--anatomy-face:#FFFFFF;--anatomy-top:#FFFFFF;
--anatomy-shade-0:#DDDCD8;--anatomy-shade-1:#E6E5E1;--anatomy-shade-2:#EEEDEA;--anatomy-shade-3:#F5F5F3;
--anatomy-lit-top:#FFFFFF;--anatomy-lit-shade:#EFEEEB;
--anatomy-hi:#262626;--anatomy-mid:#8A8986;--anatomy-lo:#B8B7B3;--anatomy-faint:#DCDBD7;--anatomy-lit:#111111;
--anatomy-halo:#7A7873;--anatomy-halo-opacity:.30;--anatomy-dot:#333333;
--pf-count:#1F4E9E;--pf-cap-top:#D9C4A1;--pf-cap-0:#B08E5E;--pf-cap-1:#BC9C6D;--pf-cap-2:#C7AA7E;--pf-cap-3:#D2B88F;
--pf-well:#E2E1DD;--pf-drumface:#FFFFFF;--pf-ink:#111111;--pf-muted:#6B6B6B;--pf-rule:#E6E6E3;--pf-surface:#FAFAF9;`;

const FIG_CSS = `
.pf-fig{${LIGHT}
--anatomy-weight:.6px;--anatomy-ease:cubic-bezier(.32,.72,0,1);
--anatomy-mono:"JetBrains Mono",ui-monospace,"SF Mono",Menlo,Consolas,monospace;
position:relative;color:var(--pf-ink)}
.pf-fig .iso-svg{display:block;width:100%;height:auto;overflow:visible}
.pf-stage{cursor:default;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
.pf-stage:focus{outline:none}
.pf-stage:focus-visible{outline:1px solid var(--pf-muted);outline-offset:4px;border-radius:4px}
.pf-well{fill:var(--pf-well)}
.pf-drumface{fill:var(--pf-drumface)}
.pf-drum text{fill:var(--pf-count);font-family:var(--anatomy-mono);font-weight:600;text-anchor:middle;letter-spacing:.02em}
.pf-drum text.pf-blank{fill:var(--anatomy-mid)}
.pf-drum-shade{fill:var(--anatomy-shade-0);opacity:.55}
.pf-index{fill:var(--anatomy-mid)}
.pf-tooth{fill:var(--anatomy-face);stroke:var(--anatomy-mid);stroke-width:var(--anatomy-weight);stroke-linejoin:round;vector-effect:non-scaling-stroke}
.pf-hub{fill:var(--anatomy-paper);stroke:var(--anatomy-mid);stroke-width:var(--anatomy-weight);vector-effect:non-scaling-stroke}
.pf-hubdot{fill:var(--pf-count)}
.pf-count-line{stroke:var(--pf-count);stroke-width:1.1px}
.pf-cap{--anatomy-top:var(--pf-cap-top);--anatomy-shade-0:var(--pf-cap-0);--anatomy-shade-1:var(--pf-cap-1);--anatomy-shade-2:var(--pf-cap-2);--anatomy-shade-3:var(--pf-cap-3)}
.pf-bay,[data-part="module"]{cursor:pointer}
.pf-fig .fig-read span{white-space:nowrap}
.pf-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
`;

// The kit's drawing rules (iso-* class names only). They stay unscoped because the shared
// vial and button are drawn through <use>, whose instances do not match ancestor selectors.
const scoped = k.ISO_CSS.replace(/\.iso\[data-theme="light"\]\{[^}]*\}/, "")
  .replace(/^\.iso\{[^}]*\}/m, "")
  .split("}")
  .map((rule) => {
    const [sel, decl] = rule.split("{");
    if (!decl) return "";
    if (!/^\.iso-(svg|fill|shade|top|solid|halo|line|dots|face-text|wire)/.test(sel.trim())) return "";
    return sel.trim() + "{" + decl + "}";
  })
  .join("");

const VY = vec([0, 1, 0]);
const VZ = vec([0, 0, 1]);

// ---- live ---------------------------------------------------------------------------
const live = `
(() => {
const root = document.currentScript ? document.currentScript.previousElementSibling : null;
const fig = root && root.classList.contains("pf-fig") ? root : document.querySelector(".pf-fig");
if (!fig || fig.dataset.live) return;
fig.dataset.live = "1";
const STOCK = ${STOCK}, PITCH = ${PITCH}, PARK = ${PARK};
const VIALS = ${JSON.stringify(VIALS)}, BX = ${JSON.stringify(BX)};
const NAMES = ${JSON.stringify(BRANDS)};
const VY = ${JSON.stringify(VY.map((n) => +n.toFixed(4)))}, VZ = ${JSON.stringify(VZ.map((n) => +n.toFixed(4)))};
const stage = fig.querySelector(".pf-stage");
const q = (s) => fig.querySelector(s);
const drums = [0, 1, 2, 3].map((i) => q('[data-drum="' + i + '"]'));
const buttons = [0, 1, 2, 3].map((i) => q('[data-button="' + i + '"]'));
const landed = [0, 1, 2, 3].map((i) => q('[data-landed="' + i + '"]'));
const vials = VIALS.map((_, i) => q('[data-vial="' + i + '"]'));
const ratchet = q('[data-part="ratchet"]');
const mod = q('[data-part="module"]');
const readout = fig.querySelector("[data-readout]");
const status = fig.querySelector("[data-status]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
const BTN_DIR = buttons[0].dataset.dir.split(" ").map(Number);

let stock = STOCK, shown = STOCK, newK = -1, dock = 0, dockTarget = 0, note = "";
const press = [0, 0, 0, 0], held = [0, 0, 0, 0], land = [0, 0, 0, 0], landHold = [0, 0, 0, 0];
const present = VIALS.map(() => 1), want = VIALS.map(() => 1);
let frame = 0, last = 0, visible = false, touring = !still.matches, idle = 0;
let tour = { wait: 1.6, sales: 0 };

const engaged = (i) => i < 3 || dock > 0.98;
function say() {
  const reads = NAMES.map((n, i) => "<span>" + n + " " + (i === 3 && !(dockTarget === 1 && dock > 0.98) ? "--" : String(stock).padStart(2, "0")) + (i === 3 ? "." : ",") + "</span>");
  const html = (note ? note + " " : "") + "<span>Stock <b>" + String(stock).padStart(2, "0") + "</b>.</span> " + reads.join(" ");
  if (readout.innerHTML !== html) readout.innerHTML = html;
}
function sell(i) {
  if (i === 3 && !(dockTarget === 1 && dock > 0.98)) { note = "The new hatch is not in yet."; say(); return; }
  press[i] = 1; held[i] = 0.16;
  if (stock === 0) { note = NAMES[i] + " is sold out, so is every shop."; status.textContent = "Sold out everywhere."; say(); run(); return; }
  let best = -1, bestD = 1e9;
  VIALS.forEach(([x, y], v) => { if (!want[v]) return; const d = Math.abs(x - BX[i]) + (y < -20 ? 4 : 0); if (d < bestD) { bestD = d; best = v; } });
  if (best >= 0) want[best] = 0;
  stock -= 1; land[i] = 1; landHold[i] = 1.3;
  note = NAMES[i] + " sold one.";
  status.textContent = NAMES[i] + " sold one vial. Every shop now reads " + stock + ".";
  say(); run();
}
function restock() {
  stock = STOCK; want.fill(1); note = "Restocked.";
  status.textContent = "Restocked to " + STOCK + "."; say(); run();
}
function setDock(on) {
  dockTarget = on ? 1 : 0;
  note = on ? "New brand sliding in." : "New hatch parked.";
  status.textContent = on ? "A new brand hatch slides in and reads the shared count." : "The new hatch is parked.";
  say(); run();
}
const ease = (cur, target, dt, tau, calm) => (calm ? target : Math.abs(target - cur) < 0.002 ? target : cur + (target - cur) * (1 - Math.exp(-dt / tau)));
function tourStep(dt) {
  tour.wait -= dt;
  if (tour.wait > 0) return;
  if (stock === 0) {
    if (!tour.out) { tour.out = true; note = "Sold out at every shop at once."; say(); tour.wait = 2.6; return; }
    tour.out = false; restock(); setDock(false); tour.sales = 0; tour.wait = 2.2; return;
  }
  if (tour.sales === 5 && dockTarget === 0) { setDock(true); tour.wait = 2.4; tour.sales++; return; }
  const pool = dock > 0.98 ? [0, 1, 2, 3] : [0, 1, 2];
  sell(pool[Math.floor(Math.random() * pool.length)]);
  tour.sales++;
  tour.wait = 1.25 + Math.random() * 0.5;
}
function draw() {
  for (let i = 0; i < 4; i++) {
    const s = i === 3 ? newK : STOCK - shown;
    drums[i].setAttribute("transform", "translate(0 " + (s * PITCH).toFixed(2) + ")");
    const p = press[i] * 2.2;
    buttons[i].setAttribute("transform", "translate(" + (BTN_DIR[0] * p).toFixed(2) + " " + (BTN_DIR[1] * p).toFixed(2) + ")");
    landed[i].style.opacity = land[i].toFixed(3);
  }
  ratchet.setAttribute("transform", ratchet.getAttribute("transform").replace(/rotate\\([^)]*\\)/, "rotate(" + (-(STOCK - shown) * 15).toFixed(2) + ")"));
  const out = (1 - dock) * PARK;
  mod.setAttribute("transform", "translate(" + (VY[0] * out).toFixed(2) + " " + (VY[1] * out).toFixed(2) + ")");
  present.forEach((p, v) => {
    const lift = (1 - p) * 16;
    vials[v].setAttribute("transform", "translate(" + (VZ[0] * lift).toFixed(2) + " " + (VZ[1] * lift).toFixed(2) + ")");
    vials[v].style.opacity = p < 0.999 ? Math.max(0, p * p).toFixed(3) : "";
  });
}
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  const calm = still.matches;
  if (touring) tourStep(dt);
  shown = ease(shown, stock, dt, 0.22, calm);
  dock = ease(dock, dockTarget, dt, 0.45, calm);
  const newTarget = dockTarget === 1 && dock > 0.98 ? STOCK - shown : -1;
  newK = ease(newK, newTarget, dt, newTarget === -1 ? 0.15 : 0.18, calm);
  if (dock > 0.98 && dockTarget === 1 && note === "New brand sliding in.") { note = "New brand live, same count."; say(); }
  if (dock < 0.98 && dockTarget === 0) say();
  let busy = touring || Math.abs(shown - stock) > 0 || dock !== dockTarget || newK !== newTarget;
  for (let i = 0; i < 4; i++) {
    held[i] = Math.max(0, held[i] - dt);
    press[i] = ease(press[i], held[i] > 0 ? 1 : 0, dt, held[i] > 0 ? 0.03 : 0.09, calm);
    landHold[i] = Math.max(0, landHold[i] - dt);
    land[i] = landHold[i] > 0 ? ease(land[i], 1, dt, 0.08, calm) : ease(land[i], 0, dt, 0.35, calm);
    if (press[i] || land[i] || held[i]) busy = true;
  }
  present.forEach((p, v) => { present[v] = ease(p, want[v], dt, want[v] ? 0.25 + (v % 12) * 0.02 : 0.28, calm); if (present[v] !== want[v]) busy = true; });
  draw();
  frame = visible && busy ? requestAnimationFrame(tick) : 0;
}
function run() { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } }
function takeOver() {
  touring = false; tour.out = false;
  clearTimeout(idle);
  idle = setTimeout(() => { if (still.matches) return; touring = true; tour.wait = 0.8; run(); }, 9000);
}
new IntersectionObserver((e) => { visible = e[e.length - 1].isIntersecting; if (visible) run(); else if (frame) { cancelAnimationFrame(frame); frame = 0; } }, { rootMargin: "80px 0px" }).observe(stage);
still.addEventListener && still.addEventListener("change", () => { if (still.matches) touring = false; run(); });
stage.addEventListener("click", (e) => {
  const bay = e.target.closest("[data-bay]");
  if (!bay) return;
  takeOver();
  const i = Number(bay.dataset.bay);
  if (i === 3 && dockTarget === 0) setDock(true); else sell(i);
  stage.focus({ preventScroll: true });
});
stage.addEventListener("keydown", (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const n = "1234".indexOf(e.key);
  if (n >= 0) { e.preventDefault(); takeOver(); sell(n); return; }
  const key = e.key.toLowerCase();
  if (key === "n") { e.preventDefault(); takeOver(); setDock(dockTarget === 0); return; }
  if (key === "r") { e.preventDefault(); takeOver(); restock(); return; }
});
fig.pf = { sell, setDock, restock, stop: () => { touring = false; } };
say(); draw();
})();
`;

const hint = "Tap a hatch to sell a vial, or the blank one to bring it in. Keys: 1 to 4 sell, N new brand, R restock.";
const embed = `<style>${FAMILY_CSS}</style>
<div class="pf-fig fig-fam">
${head("01", "One stock count")}
<div class="pf-stage" tabindex="0" role="group" aria-label="Interactive figure. One shared stock count behind several brand storefronts. Press 1, 2 or 3 to sell a vial at a brand, N to slide in a new brand, which you can then sell from with 4, and R to restock.">${svg.replace(/^<svg /, `<svg `).replace(/(<svg[^>]*>)/, `$1<style>${scoped}${FIG_CSS}</style>`)}</div>
<div class="fig-foot"><p class="fig-read" data-readout><span>Stock <b>${STOCK}</b>.</span> <span>A ${STOCK},</span> <span>B ${STOCK},</span> <span>C ${STOCK},</span> <span>New --.</span></p><p class="fig-hint">${hint}</p></div>
<span class="pf-sr" role="status" aria-live="polite" data-status></span>
</div>
<script>${live}</script>
`;

const page = `<!doctype html>
<html lang="en" data-theme="light"><head>
<script>if (/[?&]theme=dark/.test(location.search)) document.documentElement.dataset.theme = "dark";</script><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>One stock count</title>
<meta name="description" content="Peptiful, drawn as a dispensing cabinet: several brand hatches read one shared stock count.">
<style>
:root{--bg:#FAFAF9;--surface:#FAFAF9;--ink:#111111;--muted:#6B6B6B;--rule:#E6E6E3;--bronze:#8C6A3F;color-scheme:light}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.55 "Instrument Sans",ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif}
main{max-width:600px;margin:0 auto;padding:28px 16px 40px}
.caption{margin:12px 2px 0;color:var(--muted);font-size:13.5px}
.keys{list-style:none;margin:10px 2px 0;padding:0;font-size:12.5px;color:var(--muted);display:grid;gap:3px}
.keys i{display:inline-block;width:9px;height:9px;border-radius:2px;margin-right:8px;vertical-align:baseline}
</style></head>
<body><main>
${embed}
<ul class="keys">
<li><i style="background:#1F4E9E"></i>The shared count: one shaft, one drum per brand window, one ratchet tooth per vial</li>
<li><i style="background:#C7AA7E"></i>The stock: one tray of vials that every hatch draws from</li>
</ul>
<p class="caption">Peptiful as a machine. Several white-label brands sit on the front of one cabinet, each with its own hatch, mark and window. Behind the windows every number drum is keyed to the same shaft, so when any hatch sells a vial the shaft turns one tooth and every window drops together. When the tray is empty, every hatch reads zero at once, so no shop sells what is not there. The blank hatch on the rails is a new brand: it slides into the empty bay, couples to the shaft and reads the same count straight away.</p>
</main></body></html>
`;

writeFileSync(join(HERE, "embed.html"), embed);
writeFileSync(join(HERE, "figure.html"), page);
console.log(`wrote figure.html and embed.html, ${parts} parts, embed ${(embed.length / 1024).toFixed(1)} KB`);
