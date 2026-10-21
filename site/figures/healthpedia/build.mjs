// Healthpedia, Fig 04: the confirmation desk.
// node build.mjs  -> writes figure.html (standalone page) and embed.html (inline SVG plus one script).
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "./kit/iso-kit.mjs";
import * as G from "./kit/lathe.mjs";
import { FAMILY_CSS, head } from "../family.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------- frame
const W = 520;
const H = 352;
// pass 9: labels moved out to the shared HTML head and foot, so the viewBox crops to the drawing
const VB = [4, 30, 512, 286];
const TOP = 26;
const BOTTOM = 22;

// ---------------------------------------------------------------- world (1 unit is about 1 px of the real desk)
const PLATE = { x: -190, y: -72, w: 282, d: 136, r: 8 };
const PLATE_H = 10;
const FOOT_H = 5;

const AG = { x: -176, y: -40, w: 46, d: 66, r: 3 }; // agent box: x -176..-130, y -40..26
const AG_H = 44;
const SLOT_X = AG.x + AG.w; // -130, the +x face
const SLOT_Z = 21.2; // card bottom as it leaves the slot

const SB = { x: -184, y: 38, w: 44, d: 22, r: 2 }; // spike board, three doctors
const SPIKES = [-174, -162, -150].map((x) => [x, 49]);
const REC = { x: -136, y: 40, w: 16, d: 24, r: 3 }; // voice recorder

const TR = { x: -118, y: -22, w: 50, d: 48, r: 2 }; // intake tray
const TRAY_Z = 3;
const PILE_AT = [-92, 0];
const PILE_MAX = 6;

const PL = { x: -52, y: -21, w: 52, d: 46, r: 2 }; // platen block
const PL_H = 10;
const MAT = { x: -49, y: -19, w: 46, d: 43, r: 1.5 };
const MAT_TOP = 10.6;
const PLATEN_AT = [-26, 0];
const PUSH_TRAVEL = 39.5;

const BIN = { x: -50, y: -66, w: 50, d: 42, r: 2 };
const BIN_WALL = 1.5;
const BIN_H = 9;
const BIN_AT = [-26, -46.5];
const BIN_MAX = 5;
const BIN_JIT = [[0, 0], [1.2, -0.8], [-1, 0.6], [0.8, 0.9], [-0.6, -0.5]];

const PILLAR = [-64, -32];
const STAMP_TRAVEL = 12;
const HEAD_BOTTOM = MAT_TOP + 1.2 + STAMP_TRAVEL; // 23.8
const HOUSING_Z = [50, 60];
const COLLAR_TOP = 61.5;
const SPRING_TOP = 77.5;
const SPRING_STATES = 12;

const PRESS_X = 52;
const PRESS_BASE = { x: 24, y: -35, w: 56, d: 73, r: 3 };
const BED = { x: 28, y: -22, w: 48, d: 46, r: 1.5 };
const BED_TOP = 7;
const COLS = [[PRESS_X, -29.5], [PRESS_X, 31.5]];
const COL_R = 3.2;
const CROSS = { x: 44, y: -35, w: 16, d: 73, r: 2 };
const CROSS_Z = [46, 52];
const SCREW = [PRESS_X, 1];
const STACK_MAX = 10;
const CARD_T = 1.2;
const LAYER = 1.3;
const PRESS_LIFT = 14;

const CARD = { w: 40, d: 30 };

// ---------------------------------------------------------------- camera
const fitPoints = [
  ...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0),
  ...k.boxCorners(AG, 0, AG_H + 2),
  [-26, 0, 83],
  [PRESS_X, SCREW[1], 82],
  [PILLAR[0], PILLAR[1], 60],
];
const P0 = k.fitProjection(fitPoints, W, H - TOP - BOTTOM, { pad: 8, azimuth: 55 });
const P = { ...P0, origin: [P0.origin[0], P0.origin[1] + TOP] };

const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const depth = ([x, y, z = 0]) => k.depthOf([x, y, z], P);
const byDepth = (list, key = (v) => v) => [...list].sort((a, b) => depth(key(a)) - depth(key(b)));
const r1 = (v) => Math.round(v * 10) / 10;
const path = (pts, closed = false) => k.pathOf(pts.map(at), closed);
const halo = (plan, z, h, blur) => `<path class="iso-halo" d="${k.haloOf(plan, z, h, P)}"${blur ? ` style="filter:blur(${blur}px)"` : ""}/>`;
const EX = k.axisVector(P, [1, 0, 0]);
const EY = k.axisVector(P, [0, 1, 0]);
const EZ = k.axisVector(P, [0, 0, 1]);

function rotRect(cx, cy, w, d, angle) {
  const c = Math.cos(angle), s = Math.sin(angle);
  return [[-w / 2, -d / 2], [w / 2, -d / 2], [w / 2, d / 2], [-w / 2, d / 2]].map(([x, y]) => [cx + x * c - y * s, cy + x * s + y * c]);
}
function stadium(a, b, r, n = 14) {
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = ang - Math.PI / 2 - (Math.PI * i) / n;
    pts.push([a[0] + r * Math.cos(t), a[1] + r * Math.sin(t)]);
  }
  for (let i = 0; i <= n; i++) {
    const t = ang + Math.PI / 2 - (Math.PI * i) / n;
    pts.push([b[0] + r * Math.cos(t), b[1] + r * Math.sin(t)]);
  }
  return pts;
}
function hull(points) {
  const s = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], up = [];
  for (const p of s) { while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
  for (let i = s.length - 1; i >= 0; i--) { const p = s[i]; while (up.length >= 2 && cross(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
  return [...lo.slice(0, -1), ...up.slice(0, -1)];
}
const hullPath = (world) => {
  const h = hull(world.map(at));
  return "M" + h.map(([x, y]) => `${r1(x)} ${r1(y)}`).join("L") + "Z";
};
// A coil spring around a vertical axis, split into the half behind the rod and the half in front.
function coilZ(cx, cy, r, z0, z1, turns, perTurn = 14) {
  const [vx, vy] = k.towardViewer(P);
  const n = Math.round(turns * perTurn);
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = (i / perTurn) * Math.PI * 2 + Math.PI / 2;
    pts.push({ p: [cx + r * Math.cos(t), cy + r * Math.sin(t), z0 + ((z1 - z0) * i) / n], front: Math.cos(t) * vx + Math.sin(t) * vy >= 0 });
  }
  const runs = { front: [], back: [] };
  let run = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    if (pts[i].front !== run[0].front) {
      run.push(pts[i]);
      runs[run[0].front ? "front" : "back"].push(run);
      run = [pts[i]];
    } else run.push(pts[i]);
  }
  runs[run[0].front ? "front" : "back"].push(run);
  const d = (list) => list.map((rn) => k.pathOf(rn.map((q) => at(q.p)))).join("");
  return { front: d(runs.front), back: d(runs.back) };
}
// A face-plane slot on a vertical face (closed outline): y fixed face, along x.
const faceSlotY = (y, x0, x1, z0, z1) => path([[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]], true);


// A thin prism (cards, slips): the same picture as k.extrude, written compactly. Fill is the top and bottom
// polygons plus one polygon per run of side facets in the same light bucket, all wound the same way.
function thinSolid(ring, z, h) {
  const [vx, vy] = k.towardViewer(P);
  const a = (P.azimuth * Math.PI) / 180;
  const [lx, ly] = [-Math.sin(a), Math.cos(a)];
  const n = ring.length;
  let area = 0;
  for (let i = 0; i < n; i++) { const [ax, ay] = ring[i], [bx, by] = ring[(i + 1) % n]; area += ax * by - bx * ay; }
  const ccw = area > 0;
  const info = ring.map(([ax, ay], i) => {
    const [bx, by] = ring[(i + 1) % n];
    const len = Math.hypot(bx - ax, by - ay) || 1;
    const [nx, ny] = ccw ? [(by - ay) / len, -(bx - ax) / len] : [-(by - ay) / len, (bx - ax) / len];
    const facing = nx * vx + ny * vy > 1e-9;
    const shade = Math.min(3, Math.max(0, Math.floor(((nx * lx + ny * ly + 1) / 2) * 4)));
    return { facing, shade };
  });
  const top = ring.map(([x, y]) => at([x, y, z + h]));
  const bot = ring.map(([x, y]) => at([x, y, z]));
  const sarea = (pts) => pts.reduce((s2, [x1, y1], i) => { const [x2, y2] = pts[(i + 1) % pts.length]; return s2 + x1 * y2 - x2 * y1; }, 0);
  const poly = (pts) => { const o = sarea(pts) < 0 ? [...pts].reverse() : pts; return k.pathOf(o, true); };
  const start = info.findIndex((f, i) => f.facing !== info[(i + n - 1) % n].facing || f.shade !== info[(i + n - 1) % n].shade);
  const runs = [];
  let run = null;
  for (let s2 = 0; s2 < n; s2++) {
    const i = (Math.max(0, start) + s2) % n;
    const key = info[i].facing ? info[i].shade : -1;
    if (!run || run.key !== key) { run = { key, idx: [i] }; runs.push(run); } else run.idx.push(i);
  }
  const shades = [[], [], [], []], sides = [], outline = [], crease = [];
  for (const r of runs) {
    const idx = [...r.idx, (r.idx[r.idx.length - 1] + 1) % n];
    if (r.key < 0) { outline.push(k.pathOf(idx.map((i) => top[i]))); continue; }
    const pg = poly([...idx.map((i) => top[i]), ...idx.slice().reverse().map((i) => bot[i])]);
    shades[r.key].push(pg); sides.push(pg);
    crease.push(k.pathOf(idx.map((i) => top[i])));
    outline.push(k.pathOf(idx.map((i) => bot[i])));
  }
  for (let i = 0; i < n; i++) if (info[(i + n - 1) % n].facing !== info[i].facing) outline.push(k.pathOf([top[i], bot[i]]));
  return { fill: poly(top) + poly(bot) + sides.join(""), outline: outline.join(""), crease: crease.join(""), top: poly(top), shades: shades.map((l) => l.join("")) };
}

// ---------------------------------------------------------------- the proposal card
// Local plan: x -20..20, y -15..15, with a source tab on the +y edge. Voice tabs sit left, photo tabs right.
const TABS = { voice: [-16, -4], photo: [4, 16] };
function cardRing(tab, off) {
  const [x0, x1, y0, y1, ty] = [-20, 20, -15, 15, 20];
  const r = 1.4, tr = 1.1, n = 3;
  const pts = [];
  const arc = (cx, cy, rad, a0, a1) => {
    for (let i = 0; i <= n; i++) {
      const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
      pts.push([cx + rad * Math.cos(a), cy + rad * Math.sin(a)]);
    }
  };
  arc(x1 - r, y0 + r, r, -90, 0);
  arc(x1 - r, y1 - r, r, 0, 90);
  pts.push([tab[1], y1]);
  arc(tab[1] - tr, ty - tr, tr, 0, 90);
  arc(tab[0] + tr, ty - tr, tr, 90, 180);
  pts.push([tab[0], y1]);
  arc(x0 + r, y1 - r, r, 90, 180);
  arc(x0 + r, y0 + r, r, 180, 270);
  return pts.map(([x, y]) => [x + off[0], y + off[1]]);
}
const WAVE = [1, 2.4, 3.8, 2, 4.6, 3, 1.4, 3.4, 2.2, 1];
function cardSvg(off, { stamp = "toggle", detail = true, solid = true, tone = "hi", docs = true, pieces = false } = {}) {
  const z = off[2], top = z + CARD_T;
  const o = ([x, y]) => [x + off[0], y + off[1]];
  const onTop = (pts, closed) => k.onTop(pts.map(o), top, P, closed);
  const variant = (src) => {
    const tab = TABS[src];
    const out = solid ? [S(thinSolid(cardRing(tab, off), z, CARD_T), { tone, crease: "lo" })] : [];
    if (!detail) return out.join("");
    const c = (tab[0] + tab[1]) / 2;
    if (src === "voice") {
      out.push(L([[c - 3.2, 1.2], [c - 1.6, 2.4], [c, 1.6], [c + 1.6, 2.8], [c + 3.2, 1.4]].map(([x, h]) => onTop([[x, 17.5 - h / 2], [x, 17.5 + h / 2]])).join(""), { tone: "mid", free: true }));
      out.push(L(onTop([[3.5, 1], [17.5, 1]]), { tone: "faint", free: true }));
      out.push(L(WAVE.map((h, i) => onTop([[4.5 + i * 1.4, 1 - h], [4.5 + i * 1.4, 1 + h]])).join(""), { tone: "mid", free: true }));
    } else {
      out.push(L(onTop([[c - 4.6, 16.1], [c - 1.4, 16.1], [c - 1.4, 18.9], [c - 4.6, 18.9]], true), { tone: "mid" }));
      if (docs) out.push(`<g class="hp-docs">${[1, 2, 3].map((n) => `<g class="hp-doc${n}">${D([at([o([c + 0.4 + n * 1.5, 17.5])[0], o([0, 17.5])[1], top])], { size: 0.5, tone: "hi" })}</g>`).join("")}</g>`);
      out.push(L(onTop([[4, -7], [17, -7], [17, 8], [4, 8]], true), { tone: "mid" }));
      out.push(L(onTop([[5.5, -4], [7, -5], [8.5, -3.6], [10, -5.2], [11.5, -3.8], [13, -5]]) + onTop([[5.5, 0], [7.2, -1], [9, 0.4], [10.6, -0.8], [12.4, 0.6]]) + onTop([[5.5, 4], [7.4, 3], [9.4, 4.6], [11.2, 3.2]]), { tone: "lo", free: true }));
    }
    return out.join("");
  };
  const common = !detail
    ? ""
    : L(onTop([[-20, -10], [20, -10]]), { tone: "faint" }) +
      L([[-6, -1], [-2, -5], [-4, -3], [-8, -7]].map(([y, end], i) => onTop([[-17, -6 + i * 4], [-14, -6 + i * 4]])).join(""), { tone: "lo", free: true }) +
      L([-1, -5, -3, -8].map((end, i) => onTop([[-12.5, -6 + i * 4], [end, -6 + i * 4]])).join(""), { tone: "mid", free: true });
  const ink = stamp === "none" || !detail
    ? ""
    : `<g class="hp-stamp"><path class="hp-ink" d="${k.onTop(k.circleRing(off[0], off[1], 6.4, 40), top, P, true)}${k.onTop(k.circleRing(off[0], off[1], 5, 36), top, P, true)}"/><path class="hp-ink hp-ink-w" d="${onTop([[-2.8, 0.2], [-0.8, 2.3], [3, -2.2]])}"/></g>`;
  if (pieces) return { voice: variant("voice"), photo: variant("photo"), common, ink };
  return `<g class="hp-v">${variant("voice")}</g><g class="hp-p">${variant("photo")}</g>${common}${ink}`;
}

// <use> copies are not reached by the page's class selectors, so the card parts carry their paint inline,
// written with the theme tokens (custom properties do inherit into the copies).
const LINE_STYLE = "fill:none;stroke-width:.6px;stroke-linecap:round;stroke-linejoin:round;vector-effect:non-scaling-stroke";
const DOT_OPACITY = { hi: 0.85, mid: 0.45, lo: 0.22, faint: 0.12 };
function inlinePaint(markup) {
  return markup
    .replace(/<path class="iso-fill"/g, '<path style="fill:var(--anatomy-paper)"')
    .replace(/<path class="iso-shade" data-shade="(\d)"/g, '<path style="fill:var(--anatomy-shade-$1)"')
    .replace(/<path class="iso-top"/g, '<path style="fill:var(--anatomy-top)"')
    .replace(/<path class="iso-line( [\w-]+)?" data-tone="(\w+)"((?: data-free(?:="[^"]*")?)?)/g, (m, c, tone, free) => `<path style="stroke:var(--anatomy-${tone});${LINE_STYLE}"${free}`)
    .replace(/<g class="iso-dots" data-tone="(\w+)">/g, (m, tone) => `<g style="fill:var(--anatomy-dot);opacity:${DOT_OPACITY[tone] ?? 0.32}">`)
    .replace(/<path class="hp-ink hp-ink-w"/g, '<path style="fill:none;stroke:var(--hp-cobalt);stroke-width:1.4px;stroke-linecap:round;stroke-linejoin:round;vector-effect:non-scaling-stroke"')
    .replace(/<path class="hp-ink"/g, '<path style="fill:none;stroke:var(--hp-cobalt);stroke-width:1.1px;vector-effect:non-scaling-stroke"');
}
// Static cards (pile, record, bin) are <use> copies of one card drawn at the origin, moved by a translate.
const SOL = cardSvg([0, 0, 0], { detail: false, pieces: true });
const DET = cardSvg([0, 0, 0], { solid: false, docs: false, pieces: true });
const CARD_DEFS = inlinePaint(`<g id="hpf-cv">${SOL.voice}</g><g id="hpf-cp">${SOL.photo}</g><g id="hpf-dv">${DET.voice}</g><g id="hpf-dp">${DET.photo}</g><g id="hpf-dc">${DET.common}</g><g id="hpf-dk" class="hp-ink-set">${DET.ink.replace(/^<g class="hp-stamp">|<\/g>$/g, "")}</g>`);
const DOC_DOTS = (() => {
  const c = (TABS.photo[0] + TABS.photo[1]) / 2;
  return `<g class="hp-p">${[1, 2, 3].map((n) => `<g class="hp-doc${n}">${D([at([c + 0.4 + n * 1.5, 17.5, CARD_T])], { size: 0.5, tone: "hi" })}</g>`).join("")}</g>`;
})();
const trS = ([x, y, z]) => `translate(${r1(x * EX[0] + y * EY[0] + z * EZ[0])} ${r1(x * EX[1] + y * EY[1] + z * EZ[1])})`;
function cardUse(pos, attrs, { solid = true, detail = false, stamp = false } = {}) {
  const parts = [];
  if (solid) parts.push(`<use class="hp-v" href="#hpf-cv"/><use class="hp-p" href="#hpf-cp"/>`);
  if (detail) parts.push(`<use class="hp-v" href="#hpf-dv"/><use class="hp-p" href="#hpf-dp"/>${DOC_DOTS}<use href="#hpf-dc"/>`);
  if (stamp) parts.push(`<use class="hp-stamp" href="#hpf-dk"/>`);
  return `<g class="hp-card" data-base="${trS(pos)}" transform="${trS(pos)}"${attrs}>${parts.join("")}</g>`;
}
const cardEl = (off, attrs = "", opts = {}) => `<g class="hp-card"${attrs}>${cardSvg(off, opts)}</g>`;

// ---------------------------------------------------------------- bench
function bench() {
  const out = [halo(PLATE, -PLATE_H - FOOT_H, PLATE_H)];
  for (const [x, y] of byDepth(k.corners(PLATE, 22), (p) => [p[0], p[1], 0])) {
    out.push(S(k.cylinder(x, y, 7, -PLATE_H - FOOT_H, 1.6, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 5.4, -PLATE_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28), { tone: "mid" }));
  }
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.6), { tone: "mid", inner: L(k.sideSeam(PLATE, -4, P, 8), { tone: "faint" }) }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "lo" }));
  const screws = k.corners(PLATE, 10);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));
  const strip = { x: -96, y: 50, w: 148, d: 7, r: 1 };
  out.push(S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const ticks = k.topTicks(strip.x + 4, strip.x + strip.w - 4, 4, 5, strip.y, 0.6, [2, 3.6], P);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  out.push(D([at([strip.x + 2, strip.y + 3.5, 0.6]), at([strip.x + strip.w - 2, strip.y + 3.5, 0.6])], { size: 0.45 }));
  const label = { x: 60, y: 45, w: 27, d: 13, r: 1 };
  out.push(S(k.slabOf(label, 0, 0.8, P, 4), { tone: "lo" }));
  out.push(L(k.planOutline(k.insetPlan(label, 1.6), 0.8, P, 4), { tone: "faint" }));
  out.push(L([16, 11, 19].map((len, i) => k.lineOnTop([label.x + 4, label.y + 4 + i * 2.6], [label.x + 4 + len, label.y + 4 + i * 2.6], 0.8, P)).join(""), { tone: "lo", free: true }));
  out.push(D([at([label.x + label.w - 2.6, label.y + 2.6, 0.8]), at([label.x + label.w - 2.6, label.y + label.d - 2.6, 0.8])], { size: 0.4 }));
  return out.join("");
}

// ---------------------------------------------------------------- reject bin (open box behind the platen)
function binBack() {
  const out = [halo(BIN, 0, 1, 5)];
  out.push(S(k.slabOf(BIN, 0, BIN_WALL, P, 4, 0.4), { tone: "lo" }));
  out.push(L(k.planOutline(k.insetPlan(BIN, 5), BIN_WALL, P, 3), { tone: "faint" }));
  out.push(S(k.slabOf({ x: BIN.x, y: BIN.y, w: BIN.w, d: BIN_WALL, r: 0.5 }, BIN_WALL, BIN_H - BIN_WALL, P, 2), { tone: "mid" }));
  out.push(S(k.slabOf({ x: BIN.x, y: BIN.y, w: BIN_WALL, d: BIN.d, r: 0.5 }, BIN_WALL, BIN_H - BIN_WALL, P, 2), { tone: "mid" }));
  return out.join("");
}
function binFront() {
  const out = [];
  out.push(S(k.slabOf({ x: BIN.x + BIN.w - BIN_WALL, y: BIN.y, w: BIN_WALL, d: BIN.d, r: 0.5 }, BIN_WALL, BIN_H - BIN_WALL, P, 2), { tone: "mid" }));
  const front = { x: BIN.x, y: BIN.y + BIN.d - BIN_WALL, w: BIN.w, d: BIN_WALL, r: 0.5 };
  out.push(S(k.slabOf(front, BIN_WALL, BIN_H - BIN_WALL, P, 2), { tone: "mid" }));
  // card-holder clip on the front wall: a small frame with a blank card
  const y = front.y + BIN_WALL;
  out.push(L(faceSlotY(y, -32, -20, 3.2, 7.4), { tone: "lo" }));
  out.push(L(path([[-30.5, y, 5.3], [-21.5, y, 5.3]]), { tone: "faint" }));
  out.push(D([at([-34, y, 5.3]), at([-18, y, 5.3])], { size: 0.4 }));
  return out.join("");
}
const binLayers = BIN_JIT.map(([jx, jy], i) =>
  cardUse([BIN_AT[0] + jx, BIN_AT[1] + jy, BIN_WALL + i * LAYER], ` data-bin="${i}" data-src="voice" style="display:none"`),
).join("") + cardUse([BIN_AT[0], BIN_AT[1], BIN_WALL], ` data-over="bin" data-src="voice" style="display:none"`, { solid: false, detail: true });

// ---------------------------------------------------------------- agent box with its slot
function agentBox() {
  const out = [halo(AG, 0, AG_H)];
  const y = AG.y + AG.d; // front face, +y
  out.push(S(k.slabOf(AG, 0, AG_H, P, 6, 1.2), { tone: "mid", inner: L(k.sideSeam(AG, 4, P, 6), { tone: "faint" }) }));
  const lid = k.insetPlan(AG, 1.6);
  out.push(S(k.slabOf(lid, AG_H, 2, P, 5, 0.6), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(lid, 3.4), AG_H + 2, P, 4), { tone: "faint" }));
  const screws = k.corners(lid, 4.4);
  out.push(L(screws.map(([x, yy]) => k.ring(x, yy, 1.6, AG_H + 2, P, 14)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, yy]) => at([x, yy, AG_H + 2])), { size: 0.45 }));
  out.push(L([-24, -14, -4, 6].map((yy) => k.planOutline({ x: AG.x + 12, y: yy, w: 20, d: 3, r: 1.5 }, AG_H + 2, P, 4)).join(""), { tone: "lo" }));
  // front face: engraved label, vents, lamp, sockets
  out.push(k.faceTextSvg(k.sideMatrix([AG.x + 6, y], 33, P, "left"), "MCP", { size: 6, tone: "mid" }));
  out.push(L(faceSlotY(y, AG.x + 4, AG.x + 22, 31.2, 39.2), { tone: "faint" }));
  out.push(L([0, 1, 2, 3, 4].map((i) => faceSlotY(y, AG.x + 6 + i * 4.4, AG.x + 8 + i * 4.4, 14, 26)).join(""), { tone: "lo" }));
  const lampF = G.frameAlong([AG.x + 38, y, 34], [0, 1, 0]);
  out.push(S(G.disc(0, 1.4, 2.6, lampF, P), { tone: "mid" }));
  out.push(`<circle class="hp-lamp" cx="${r1(at([AG.x + 38, y + 1.4, 34])[0])}" cy="${r1(at([AG.x + 38, y + 1.4, 34])[1])}" r="1.5"/>`);
  out.push(D(k.corners({ x: AG.x, y: 0, w: AG.w, d: AG_H }, 3).map(([x, z]) => at([x, y, z])), { size: 0.45 }));
  for (const x of [...SPIKES.map(([sx]) => sx), -136]) {
    out.push(S(k.slabOf({ x: x - 2, y, w: 4, d: 2, r: 0.5 }, 3, 4, P, 2), { tone: "mid" }));
  }
  // the slot on the +x face, with a lip the cards slide out over
  const sy0 = -17, sy1 = 22, sz0 = SLOT_Z, sz1 = SLOT_Z + 4.2;
  out.push(`<path class="hp-void" d="${path([[SLOT_X, sy0, sz0], [SLOT_X, sy1, sz0], [SLOT_X, sy1, sz1], [SLOT_X, sy0, sz1]], true)}"/>`);
  out.push(`<path class="iso-top" style="opacity:.55" d="${path([[SLOT_X, sy0, sz0], [SLOT_X, sy1, sz0], [SLOT_X - 3, sy1, sz0], [SLOT_X - 3, sy0, sz0]], true)}"/>`);
  out.push(L(path([[SLOT_X, sy0, sz0], [SLOT_X, sy1, sz0], [SLOT_X, sy1, sz1], [SLOT_X, sy0, sz1]], true), { tone: "lo" }));
  out.push(S(k.slabOf({ x: SLOT_X, y: sy0 - 1, w: 3.5, d: sy1 - sy0 + 2, r: 0.6 }, SLOT_Z - 1.6, 1.6, P, 2, 0.3), { tone: "mid" }));
  out.push(D([at([SLOT_X + 1.7, sy0 + 1, SLOT_Z]), at([SLOT_X + 1.7, sy1 - 1, SLOT_Z])], { size: 0.4 }));
  return out.join("");
}

// ---------------------------------------------------------------- sources: three doctors' spikes and a voice recorder
const WIRES = [];
function sources() {
  const out = [];
  // wires first: they lie on the bench between the sources and the box sockets
  const y = AG.y + AG.d;
  SPIKES.forEach(([x], i) => {
    WIRES.push(`<g data-wire="${i + 1}">${k.wireSvg(at([x, SB.y, 1.5]), at([x, y + 2, 5]), { via: [at([x, SB.y - 2.5, 0.3]), at([x, y + 5, 0.3]), at([x, y + 3, 1.2])], tone: "lo", size: 0.9 })}</g>`);
  });
  WIRES.push(`<g data-wire="0">${k.wireSvg(at([-136, REC.y, 2.5]), at([-136, y + 2, 5]), { via: [at([-136, REC.y - 3, 0.3]), at([-136, y + 5, 0.3]), at([-136, y + 3, 1.2])], tone: "lo", size: 0.9 })}</g>`);
  out.push(WIRES.join(""));
  out.push(halo(SB, 0, 1, 4));
  out.push(S(k.slabOf(SB, 0, 3, P, 4, 0.6), { tone: "mid" }));
  out.push(D(k.corners(SB, 2.6).map(([x, yy]) => at([x, yy, 3])), { size: 0.4 }));
  const slipAngles = [[0.14, -0.2], [-0.12, 0.22], [0.25, -0.05]];
  for (const [i, [x, yy]] of byDepth(SPIKES.map((p, i) => [i, p]), (e) => [e[1][0], e[1][1], 0])) {
    out.push(S(k.cylinder(x, yy, 3.4, 3, 1.4, P, 24), { tone: "mid" }));
    slipAngles[i].forEach((a, j) => {
      const ring = rotRect(x + (j ? 0.6 : -0.4), yy + (j ? -0.3 : 0.4), 9, 7, a);
      out.push(S(k.extrude(ring, 4.4 + j * 0.45, 0.4, P), { tone: "hi", crease: "faint" }));
    });
    const topZ = 4.4 + 0.9;
    const c = Math.cos(slipAngles[i][1]), s = Math.sin(slipAngles[i][1]);
    out.push(L([-1.6, 0.6].map((dy) => k.lineOnTop([x + 0.6 - 3.2 * c - dy * s, yy - 0.3 - 3.2 * s + dy * c], [x + 0.6 - 0.8 * c - dy * s, yy - 0.3 - 0.8 * s + dy * c], topZ, P)).join(""), { tone: "lo", free: true }));
    out.push(S(k.cylinder(x, yy, 0.55, topZ, 20, P, 10), { tone: "mid", crease: "none" }));
    out.push(D([at([x, yy, topZ + 20])], { size: 0.55, tone: "hi" }));
  }
  // voice recorder
  out.push(halo(REC, 0, 1, 4));
  out.push(S(k.slabOf(REC, 0, 5, P, 5, 0.8), { tone: "mid", inner: L(k.sideSeam(REC, 2.2, P, 5), { tone: "faint" }) }));
  const grille = k.dotGrid(REC.x + 4, REC.y + 3.4, 4, 3, 2.3, 5, P);
  out.push(D(grille, { size: 0.42, tone: "lo" }));
  out.push(L(k.planOutline({ x: REC.x + 3, y: REC.y + 10.5, w: 10, d: 5, r: 0.8 }, 5, P, 3), { tone: "lo" }));
  out.push(L(k.lineOnTop([REC.x + 4.4, REC.y + 13], [REC.x + 9, REC.y + 13], 5, P), { tone: "faint", free: true }));
  out.push(S(k.cylinder(REC.x + 8, REC.y + 20, 1.8, 5, 0.8, P, 16), { tone: "mid" }));
  out.push(D([at([REC.x + 8, REC.y + 20, 5.8])], { size: 0.6, tone: "hi" }));
  out.push(S(k.slabOf({ x: REC.x + REC.w - 0.4, y: REC.y + 7, w: 1.2, d: 4, r: 0.4 }, 1.6, 2, P, 2), { tone: "mid" }));
  return out.join("");
}

// ---------------------------------------------------------------- stamp pillar (behind) and press back half
function pillar() {
  const [x, y] = PILLAR;
  const out = [halo({ x: x - 7, y: y - 7, w: 14, d: 14, r: 7 }, 0, 1, 4)];
  out.push(S(k.cylinder(x, y, 7, 0, 2, P, 32, 0.5), { tone: "mid" }));
  out.push(D([0, 2, 4].map((i) => { const a = (i / 6) * Math.PI * 2 + 0.5; return at([x + 5.2 * Math.cos(a), y + 5.2 * Math.sin(a), 2]); }), { size: 0.42 }));
  out.push(S(k.cylinder(x, y, 3.6, 2, HOUSING_Z[0] - 2, P, 24), { tone: "mid", crease: "none", inner: L([14, 30].map((z) => k.sideArc(x, y, 3.6, z, P, 14)).join(""), { tone: "faint" }) }));
  return out.join("");
}
function pressBack() {
  const out = [halo(PRESS_BASE, 0, 1)];
  out.push(S(k.slabOf(PRESS_BASE, 0, 3, P, 5, 0.8), { tone: "mid" }));
  const screws = k.corners(PRESS_BASE, 4);
  out.push(D(screws.map(([x, y]) => at([x, y, 3])), { size: 0.45 }));
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 1.6, 3, P, 14)).join(""), { tone: "lo" }));
  const [cx, cy] = COLS[0];
  out.push(S(k.cylinder(cx, cy, 4.8, 3, 1.8, P, 28), { tone: "mid" }));
  out.push(S(k.cylinder(cx, cy, COL_R, 4.8, CROSS_Z[0] - 4.8, P, 24), { tone: "mid", crease: "none" }));
  out.push(S(k.slabOf(BED, 3, BED_TOP - 3, P, 4, 0.6), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(BED, 2.4), BED_TOP, P, 3), { tone: "faint" }));
  return out.join("");
}
const stackLayers = Array.from({ length: STACK_MAX }, (_, i) =>
  cardUse([PRESS_X, 0, BED_TOP + i * LAYER], ` data-stack="${i}" data-src="voice" style="display:none"`),
).join("") + cardUse([PRESS_X, 0, BED_TOP], ` data-over="stack" data-src="voice" data-stamped="" style="display:none"`, { solid: false, detail: true, stamp: true });

// ---------------------------------------------------------------- intake tray
function trayBack() {
  const out = [halo(TR, 0, 1, 5)];
  out.push(S(k.slabOf(TR, 0, TRAY_Z, P, 4, 0.6), { tone: "mid" }));
  out.push(L([0, 1, 2].map((i) => k.planOutline({ x: TR.x + 10 + i * 12, y: TR.y + 6, w: 6, d: TR.d - 12, r: 2 }, TRAY_Z, P, 3)).join(""), { tone: "faint" }));
  out.push(S(k.slabOf({ x: TR.x, y: TR.y, w: TR.w, d: 3, r: 1 }, TRAY_Z, 6, P, 3, 0.4), { tone: "mid" }));
  out.push(D([TR.x + 4, TR.x + TR.w - 4].map((x) => at([x, TR.y + 1.5, TRAY_Z + 6])), { size: 0.4 }));
  return out.join("");
}
function trayFront() {
  const rail = { x: TR.x, y: TR.y + TR.d - 3, w: TR.w, d: 3, r: 1 };
  return S(k.slabOf(rail, TRAY_Z, 3.5, P, 3, 0.4), { tone: "mid" }) + D([TR.x + 4, TR.x + TR.w - 4].map((x) => at([x, rail.y + 1.5, TRAY_Z + 3.5])), { size: 0.4 });
}
const pileLayers = Array.from({ length: PILE_MAX }, (_, i) =>
  cardUse([PILE_AT[0], PILE_AT[1], TRAY_Z + i * LAYER], ` data-pile="${i}" data-src="voice" style="display:none"`),
).join("") + cardUse([PILE_AT[0], PILE_AT[1], TRAY_Z], ` data-over="pile" data-src="voice" style="display:none"`, { solid: false, detail: true });

// slot card: built at the origin, moved by transform, clipped to the half-space outside the box's +x face
const SLOT_CLIP = (() => {
  const a = at([SLOT_X, -400, SLOT_Z + 0.6]), b = at([SLOT_X, 400, SLOT_Z + 0.6]);
  const far = [EX[0] * 600, EX[1] * 600];
  return [a, b, [b[0] + far[0], b[1] + far[1]], [a[0] + far[0], a[1] + far[1]]].map(([x, y]) => `${r1(x)} ${r1(y)}`).join("L");
})();

// ---------------------------------------------------------------- platen and pusher
function platen() {
  const out = [halo(PL, 0, 1)];
  out.push(S(k.slabOf(PL, 0, PL_H, P, 4, 1), { tone: "mid", inner: L(k.sideSeam(PL, 3, P, 4), { tone: "faint" }) }));
  out.push(S(k.slabOf(MAT, PL_H, MAT_TOP - PL_H, P, 3), { tone: "lo", crease: "none" }));
  out.push(L(k.planOutline(k.insetPlan(MAT, 2), MAT_TOP, P, 3), { tone: "faint" }));
  out.push(D([[PL.x + 1.5, PL.y + 1.5], [PL.x + PL.w - 1.5, PL.y + 1.5]].map(([x, y]) => at([x, y, PL_H])), { size: 0.4 }));
  return out.join("");
}
function pusher() {
  const bar = { x: -46, y: 20.5, w: 40, d: 3, r: 1 };
  const out = [S(k.slabOf(bar, MAT_TOP, 3.4, P, 3, 0.5), { tone: "mid" })];
  out.push(D([bar.x + 3, bar.x + bar.w - 3].map((x) => at([x, bar.y + 1.5, MAT_TOP + 3.4])), { size: 0.4 }));
  out.push(S(k.cylinder(-26, 22, 1.2, MAT_TOP + 3.4, 3.6, P, 14), { tone: "mid", crease: "none" }));
  out.push(S(k.cylinder(-26, 22, 2.8, MAT_TOP + 7, 2.2, P, 24, 0.4), { tone: "hi", crease: "lo" }));
  out.push(L(k.knurl(-26, 22, 2.8, MAT_TOP + 7, MAT_TOP + 9.2, 18, P), { tone: "lo" }));
  return out.join("");
}

// ---------------------------------------------------------------- stamp: arm, housing, plunger, spring, knob
const [SX, SY] = PLATEN_AT;
function stampArm() {
  const out = [];
  out.push(S(k.extrude(stadium(PILLAR, [SX, SY], 3.4), 52, 5, P), { tone: "mid", crease: "faint" }));
  const [x, y] = PILLAR;
  out.push(S(k.cylinder(x, y, 5, 49, 10, P, 28, 0.6), { tone: "mid", inner: L(k.sideArc(x, y, 5, 54, P, 20), { tone: "faint" }) }));
  out.push(L(k.ring(x, y, 1.8, 59, P, 14), { tone: "lo" }));
  out.push(D([at([x, y, 59])], { size: 0.45 }));
  // thumb screw on the clamp collar
  const tx = x + 5 * Math.cos(1.25), ty = y + 5 * Math.sin(1.25);
  out.push(S(k.cylinder(tx + 0.9, ty + 2.2, 1.6, 52.5, 3, P, 14), { tone: "mid" }));
  return out.join("");
}
function stampHead() {
  const out = [];
  out.push(S(k.cylinder(SX, SY, 6.2, HEAD_BOTTOM, 1.5, P, 40), { tone: "lo" }));
  out.push(S(k.cylinder(SX, SY, 7, HEAD_BOTTOM + 1.5, 5, P, 44, 0.6), { tone: "mid", inner: L(k.sideArc(SX, SY, 7, HEAD_BOTTOM + 3.6, P, 24), { tone: "faint" }) }));
  out.push(L(k.ring(SX, SY, 3.4, HEAD_BOTTOM + 6.5, P, 24), { tone: "faint" }));
  out.push(D([0, 1, 2, 3].map((i) => { const a = (i / 4) * Math.PI * 2 + 0.4; return at([SX + 5.2 * Math.cos(a), SY + 5.2 * Math.sin(a), HEAD_BOTTOM + 6.5]); }), { size: 0.4 }));
  return out.join("");
}
const ROD = (tone) => S(k.cylinder(SX, SY, 1.4, HEAD_BOTTOM + 6.5, SPRING_TOP - HEAD_BOTTOM - 6.5, P, 16), { tone, crease: "none" });
function housing() {
  const out = [];
  out.push(S(k.cylinder(SX, SY, 6, HOUSING_Z[0], HOUSING_Z[1] - HOUSING_Z[0], P, 40, 0.8), { tone: "mid", inner: L([53, 57].map((z) => k.sideArc(SX, SY, 6, z, P, 24)).join(""), { tone: "faint" }) }));
  out.push(S(k.cylinder(SX, SY, 2.8, HOUSING_Z[1], COLLAR_TOP - HOUSING_Z[1], P, 20), { tone: "mid" }));
  return out.join("");
}
const springStates = Array.from({ length: SPRING_STATES + 1 }, (_, i) => coilZ(SX, SY, 2.7, COLLAR_TOP, SPRING_TOP - (STAMP_TRAVEL * i) / SPRING_STATES, 5.5));
function knob() {
  const out = [];
  out.push(S(k.cylinder(SX, SY, 2, SPRING_TOP, 1, P, 16), { tone: "mid" }));
  out.push(S(k.cylinder(SX, SY, 5, SPRING_TOP + 1, 3.6, P, 40, 0.6), { tone: "hi", crease: "lo" }));
  out.push(L(k.knurl(SX, SY, 5, SPRING_TOP + 1, SPRING_TOP + 4.6, 36, P), { tone: "lo" }));
  out.push(L(k.ring(SX, SY, 2.6, SPRING_TOP + 4.6, P, 20), { tone: "faint" }));
  return out.join("");
}
const ROD_CLIP = (() => {
  const [cx, cy] = at([SX, SY, COLLAR_TOP]);
  const ell = k.onTop(k.circleRing(SX, SY, 1.45, 24), COLLAR_TOP, P, true);
  return `<path d="M${r1(cx - 300)} ${r1(cy - 400)}L${r1(cx + 300)} ${r1(cy - 400)}L${r1(cx + 300)} ${r1(cy)}L${r1(cx - 300)} ${r1(cy)}Z"/><path d="${ell}"/>`;
})();

// ---------------------------------------------------------------- press front half: plate, front column, crossbar, screw and capstan
function pressPlate() {
  const plate = { x: 31, y: -22, w: 42, d: 46, r: 1.5 };
  const z = BED_TOP;
  const out = [];
  out.push(S(k.slabOf({ x: PRESS_X - 4, y: COLS[0][1] + COL_R, w: 8, d: plate.y - COLS[0][1] - COL_R + 1, r: 0.6 }, z + 0.6, 3, P, 2), { tone: "mid" }));
  out.push(S(k.slabOf(plate, z, 4, P, 4, 0.8), { tone: "mid", inner: L(k.sideSeam(plate, z + 2, P, 4), { tone: "faint" }) }));
  out.push(S(k.slabOf({ x: PRESS_X - 4, y: plate.y + plate.d - 1, w: 8, d: COLS[1][1] - COL_R - plate.y - plate.d + 1, r: 0.6 }, z + 0.6, 3, P, 2), { tone: "mid" }));
  out.push(D(k.corners(plate, 3).map(([x, y]) => at([x, y, z + 4])), { size: 0.42 }));
  out.push(S(k.cylinder(SCREW[0], SCREW[1], 3.6, z + 4, 1.6, P, 24), { tone: "mid" }));
  out.push(screwRod());
  return out.join("");
}
const SCREW_TOP = 57.5;
function screwRod() {
  const z0 = BED_TOP + 5.6;
  const ribs = [];
  for (let z = z0 + 1.5; z < SCREW_TOP - 0.5; z += 1.5) ribs.push(k.sideArc(SCREW[0], SCREW[1], 2, z, P, 10));
  return S(k.cylinder(SCREW[0], SCREW[1], 2, z0, SCREW_TOP - z0, P, 18), { tone: "mid", crease: "none", inner: L(ribs.join(""), { tone: "faint" }) });
}
function pressFront() {
  const out = [];
  const [cx, cy] = COLS[1];
  out.push(S(k.cylinder(cx, cy, 4.8, 3, 1.8, P, 28), { tone: "mid" }));
  out.push(S(k.cylinder(cx, cy, COL_R, 4.8, CROSS_Z[0] - 4.8, P, 24), { tone: "mid", crease: "none" }));
  out.push(S(k.slabOf(CROSS, CROSS_Z[0], CROSS_Z[1] - CROSS_Z[0], P, 4, 0.8), { tone: "mid", inner: L(k.sideSeam(CROSS, CROSS_Z[0] + 2, P, 4), { tone: "faint" }) }));
  for (const [x, y] of byDepth(COLS, (p) => [p[0], p[1], 0])) {
    out.push(S(k.cylinder(x, y, 4, CROSS_Z[1], 2.2, P, 6), { tone: "mid" }));
    out.push(D([at([x, y, CROSS_Z[1] + 2.2])], { size: 0.5 }));
  }
  out.push(S(k.cylinder(SCREW[0], SCREW[1], 4.6, CROSS_Z[1], 2.6, P, 32, 0.4), { tone: "mid" }));
  return out.join("");
}
const BOSS_TOP = CROSS_Z[1] + 2.6;
const SCREW_CLIP = (() => {
  const [cx, cy] = at([SCREW[0], SCREW[1], BOSS_TOP]);
  const ell = k.onTop(k.circleRing(SCREW[0], SCREW[1], 2.05, 24), BOSS_TOP, P, true);
  return `<path d="M${r1(cx - 300)} ${r1(cy - 400)}L${r1(cx + 300)} ${r1(cy - 400)}L${r1(cx + 300)} ${r1(cy)}L${r1(cx - 300)} ${r1(cy)}Z"/><path d="${ell}"/>`;
})();
function capstan() {
  const [x, y] = SCREW;
  const z = SCREW_TOP - 2;
  const arms = [0.25, 0.75, 1.25, 1.75].map((t) => t * Math.PI).map((a) => {
    const end = [x + 10 * Math.cos(a), y + 10 * Math.sin(a)];
    const mid = [x + 5.6 * Math.cos(a), y + 5.6 * Math.sin(a)];
    const svg = S(k.extrude(rotRect(mid[0], mid[1], 9, 1.6, a), z + 0.8, 1.6, P), { tone: "mid" }) + S(G.sphereOf([end[0], end[1], z + 1.6], 1.9, P), { tone: "hi", crease: "lo" });
    return { end, svg };
  });
  const sorted = byDepth(arms, (a) => [a.end[0], a.end[1], 0]);
  const hub = S(k.cylinder(x, y, 3, z, 3.2, P, 24, 0.5), { tone: "mid" }) + L(k.ring(x, y, 1.2, z + 3.2, P, 12), { tone: "lo" });
  return sorted.slice(0, 2).map((a) => a.svg).join("") + hub + sorted.slice(2).map((a) => a.svg).join("");
}

// ---------------------------------------------------------------- hit regions
const hitFile = hullPath([...k.boxCorners(AG, 0, AG_H + 2)]);
const hitApprove = hullPath([
  ...k.boxCorners({ x: SX - 7, y: SY - 7, w: 14, d: 14 }, HEAD_BOTTOM - 4, SPRING_TOP + 5),
]);
const hitReject = hullPath([...k.boxCorners({ x: -48, y: 18, w: 44, d: 9 }, MAT_TOP - 1, MAT_TOP + 11)]) + hullPath([...k.boxCorners(BIN, 0, BIN_H)]);

// ---------------------------------------------------------------- assemble the SVG
const body = [
  bench(),
  binBack(),
  `<g data-zone="bin">${binLayers}</g>`,
  binFront(),
  agentBox(),
  sources(),
  pillar(),
  pressBack(),
  `<g data-zone="stack">${stackLayers}</g>`,
  trayBack(),
  `<g data-zone="pile">${pileLayers}</g>`,
  `<g clip-path="url(#hp-slot)"><g data-part="slot-card" class="hp-card" data-src="voice" style="display:none">${cardSvg([0, 0, 0], { stamp: "none" })}</g></g>`,
  trayFront(),
  platen(),
  `<g data-zone="platen"><g data-part="live-card" class="hp-card" data-src="voice" style="display:none">${cardSvg([0, 0, 0])}</g></g>`,
  `<g data-part="pusher">${pusher()}</g>`,
  stampArm(),
  `<g data-part="head">${stampHead()}${ROD("mid")}</g>`,
  housing(),
  `<path class="iso-line" data-tone="mid" data-part="spring-back" d="${springStates[0].back}"/>`,
  `<g clip-path="url(#hp-rod)"><g data-part="rod">${ROD("mid")}</g></g>`,
  `<path class="iso-line" data-tone="hi" data-part="spring-front" d="${springStates[0].front}"/>`,
  `<g data-part="knob">${knob()}</g>`,
  `<g data-part="plate">${pressPlate()}</g>`,
  pressFront(),
  `<g clip-path="url(#hp-screw)"><g data-part="screw">${screwRod()}${capstan()}</g></g>`,
  `<g class="hp-hits">`,
  `<g class="hp-hit" role="button" tabindex="0" data-act="file" aria-label="File a new proposal: the agent drops a card into the intake tray"><title>File a proposal (N)</title><path d="${hitFile}"/></g>`,
  `<g class="hp-hit" role="button" tabindex="0" data-act="approve" aria-label="Approve: stamp the card under the stamp and bind it into the record"><title>Approve (A)</title><path d="${hitApprove}"/></g>`,
  `<g class="hp-hit" role="button" tabindex="0" data-act="reject" aria-label="Reject: push the card off the platen into the reject bin"><title>Reject (R)</title><path d="${hitReject}"/></g>`,
  `</g>`,
].join("");

const defs = `<defs>${CARD_DEFS}<clipPath id="hp-slot"><path d="M${SLOT_CLIP}Z"/></clipPath><clipPath id="hp-rod">${ROD_CLIP}</clipPath><clipPath id="hp-screw">${SCREW_CLIP}</clipPath></defs>`;

// ---------------------------------------------------------------- CSS: the kit's styles scoped to .hpf, with the site's tokens
const LIGHT = `--anatomy-paper:var(--hp-card);--anatomy-face:#FFFFFF;--anatomy-top:#FFFFFF;--anatomy-shade-0:#DCDBD7;--anatomy-shade-1:#E6E5E1;--anatomy-shade-2:#EEEDEA;--anatomy-shade-3:#F3F3F1;--anatomy-lit-top:#FFFFFF;--anatomy-lit-shade:#EFEEEB;--anatomy-hi:#262626;--anatomy-mid:#8A8986;--anatomy-lo:#B8B7B3;--anatomy-faint:#E6E6E3;--anatomy-lit:#111111;--anatomy-halo:#7A7873;--anatomy-halo-opacity:.3;--anatomy-dot:#333333;`;
let kitCss = k.ISO_CSS.replace(/\.iso\{[^}]*\}/, "").replace(/\.iso\[data-theme="light"\]\{[^}]*\}/, "");
kitCss = kitCss
  .split("\n")
  .filter((line) => line.trim() && !/^\.iso-(figure|plate|legend|keys|key|swatch)|^@media \(max-width/.test(line))
  .join("\n")
  .replace(/\.iso-svg/g, "@@ROOT@@")
  .replace(/(^|,|\{)\.iso-/gm, "$1.hpf .iso-")
  .replace(/(^|,|\{)\.tb-/gm, "$1.hpf .tb-")
  .replace(/@@ROOT@@/g, ".hpf.iso-svg");
const CSS = `
.hpf{--hp-card:var(--surface,#FAFAF9);--hp-ink:var(--ink,#111111);--hp-muted:var(--muted,#6B6B6B);--hp-rule:var(--rule,#E6E6E3);--hp-cobalt:var(--cobalt,#1F4E9E);--anatomy-weight:.6px;--anatomy-mono:var(--mono,"JetBrains Mono",ui-monospace,SFMono-Regular,Menlo,monospace);${LIGHT}}
${kitCss}
.hpf{touch-action:manipulation;-webkit-tap-highlight-color:transparent}
.hpf:focus{outline:none}.hpf:focus-visible{outline:1px solid var(--hp-muted);outline-offset:4px}
.hpf .hp-void{fill:var(--anatomy-mid);opacity:.55}
.hpf{display:block;width:100%;height:auto;margin:4px 0 0}
.hpf .iso-face-text{font-size:6px;letter-spacing:.14em}
.hpf .hp-ink{fill:none;stroke:var(--hp-cobalt);stroke-width:1.1px;stroke-linecap:round;stroke-linejoin:round}
.hpf .hp-ink-w{stroke-width:1.4px}
.hpf .hp-stamp{opacity:0;transition:opacity .18s ease-out}
.hpf .hp-card[data-stamped] .hp-stamp{opacity:.9}
.hpf .hp-card[data-src="voice"] .hp-p,.hpf .hp-card[data-src="photo"] .hp-v{display:none}
.hpf .hp-card .hp-doc2,.hpf .hp-card .hp-doc3{display:none}
.hpf .hp-card[data-doc="2"] .hp-doc2,.hpf .hp-card[data-doc="3"] .hp-doc2,.hpf .hp-card[data-doc="3"] .hp-doc3{display:inline}
.hpf .hp-lamp{fill:var(--anatomy-dot);opacity:.2;transition:opacity .25s}
.hpf .hp-lamp[data-on]{opacity:1}
.hpf .hp-hit{cursor:pointer;outline:none}
.hpf .hp-hit path{fill:transparent;stroke:none;pointer-events:all}
.hpf .hp-hit:focus-visible path{stroke:var(--hp-muted);stroke-width:1px;stroke-dasharray:3 3}
@media (hover:hover){.hpf .hp-hit:hover path{stroke:var(--anatomy-faint);stroke-width:1px;stroke-dasharray:2 4}}
@media (prefers-reduced-motion:reduce){.hpf .hp-stamp,.hpf .hp-lamp{transition:none}}
`;

// ---------------------------------------------------------------- live script (no dependencies)
const LIVE = `(function(){
var wrap=document.currentScript&&document.currentScript.previousElementSibling;
var svg=wrap&&wrap.querySelector&&wrap.querySelector("svg.hpf");
if(!svg)return;
var EX=${JSON.stringify(EX.map(r1x))},EY=${JSON.stringify(EY.map(r1x))},EZ=${JSON.stringify(EZ.map(r1x))};
var SPRING=${JSON.stringify(springStates)};
var C=${JSON.stringify({ PILE_AT, TRAY_Z, PLATEN_AT, MAT_TOP, BIN_AT, BIN_WALL, BIN_JIT, PRESS_X, BED_TOP, LAYER, PILE_MAX, BIN_MAX, STACK_MAX, SLOT_X, SLOT_Z, PUSH_TRAVEL, STAMP_TRAVEL, PRESS_LIFT })};
var q=function(s){return svg.querySelector(s)};
var parts={slot:q('[data-part="slot-card"]'),live:q('[data-part="live-card"]'),pusher:q('[data-part="pusher"]'),head:q('[data-part="head"]'),rod:q('[data-part="rod"]'),knob:q('[data-part="knob"]'),sb:q('[data-part="spring-back"]'),sf:q('[data-part="spring-front"]'),plate:q('[data-part="plate"]'),screw:q('[data-part="screw"]'),lamp:q('.hp-lamp')};
var zones={bin:q('[data-zone="bin"]'),stack:q('[data-zone="stack"]'),platen:q('[data-zone="platen"]')};
var pile=[].slice.call(svg.querySelectorAll("[data-pile]")),stack=[].slice.call(svg.querySelectorAll("[data-stack]")),bin=[].slice.call(svg.querySelectorAll("[data-bin]"));
var readout=wrap.querySelector("[data-readout]"),source=wrap.querySelector("[data-source]");
var still=window.matchMedia("(prefers-reduced-motion: reduce)");
function tr(x,y,z){return "translate("+(x*EX[0]+y*EY[0]+z*EZ[0]).toFixed(2)+" "+(x*EX[1]+y*EY[1]+z*EZ[1]).toFixed(2)+")"}
function show(el,on){el.style.display=on?"":"none"}
function dress(el,c){el.setAttribute("data-src",c.src);if(c.doc)el.setAttribute("data-doc",String(c.doc));else el.removeAttribute("data-doc")}
function lit(el,on){el.querySelectorAll(".iso-solid").forEach(function(s){if(on)s.setAttribute("data-lit","");else s.removeAttribute("data-lit")})}
var FEED=[{src:"photo",doc:1},{src:"voice"},{src:"photo",doc:2},{src:"photo",doc:3},{src:"voice"},{src:"photo",doc:2}],feedAt=0;
var S={pile:[{src:"voice"},{src:"photo",doc:3}],platen:{src:"photo",doc:2},approved:4,rejected:1,ledger:[{src:"photo",doc:1},{src:"voice"},{src:"photo",doc:3},{src:"voice"}],binned:[{src:"photo",doc:1}],stamp:0,press:0,note:"",noteT:0};
var label=function(c){return c.src==="voice"?"source: voice note, quoted sentence":"source: Rx photo from doctor "+c.doc+", crop"};
var stackTop=function(){return C.BED_TOP+Math.min(S.ledger.length,C.STACK_MAX)*C.LAYER};
function layers(els,list,over,jit){
  els.forEach(function(el,i){var c=list[i];show(el,!!c);if(c)dress(el,c)});
  var n=list.length;show(over,n>0);
  if(n){dress(over,list[n-1]);var j=jit?jit[n-1]:[0,0];over.setAttribute("transform",over.getAttribute("data-base")+" "+tr(j[0],j[1],(n-1)*C.LAYER))}
}
function render(){
  layers(pile,S.pile,q('[data-over="pile"]'));
  layers(stack,S.ledger.slice(-C.STACK_MAX),q('[data-over="stack"]'));
  layers(bin,S.binned.slice(-C.BIN_MAX),q('[data-over="bin"]'),C.BIN_JIT);
  say();
}
function say(){
  var pending=S.pile.length+(S.platen||S.transit?1:0);
  readout.textContent="pending "+pending+", approved "+S.approved+", rejected "+S.rejected;
  source.textContent=S.note||(S.platen?label(S.platen):S.transit?"next card: "+label(S.transit).replace("source: ",""):(S.pile.length?"next card coming up":"queue empty, the agent has nothing filed"));
}
function note(t){S.note=t;S.noteT=1.8;say()}
function setStamp(u){S.stamp=u;var t=tr(0,0,-C.STAMP_TRAVEL*u);parts.head.setAttribute("transform",t);parts.rod.setAttribute("transform",t);parts.knob.setAttribute("transform",t);var s=SPRING[Math.round(u*(SPRING.length-1))];parts.sb.setAttribute("d",s.back);parts.sf.setAttribute("d",s.front)}
function setPress(z){S.press=z;var t=tr(0,0,z-C.BED_TOP);parts.plate.setAttribute("transform",t);parts.screw.setAttribute("transform",t)}
function place(el,p){el.setAttribute("transform",tr(p[0],p[1],p[2]))}
var ease={io:function(u){return u<.5?4*u*u*u:1-Math.pow(-2*u+2,3)/2},in:function(u){return u*u},out:function(u){return 1-(1-u)*(1-u)}};
function mv(el,a,b,dur,e,start){return{d:dur,s:start,f:function(u){var v=ease[e||"io"](u);place(el,[a[0]+(b[0]-a[0])*v,a[1]+(b[1]-a[1])*v,a[2]+(b[2]-a[2])*v])}}}
function seg(dur,f,s,e){return{d:dur,f:f,s:s,e:e}}
// ---- actions
function actFile(){
  if(S.pile.length>=C.PILE_MAX){note("tray full, approve or reject first");return null}
  var c=FEED[feedAt++%FEED.length];
  var wire=svg.querySelector('[data-wire="'+(c.src==="voice"?0:c.doc)+'"] .iso-line');
  var z=C.TRAY_Z+S.pile.length*C.LAYER;
  var from=[C.SLOT_X-22,C.PILE_AT[1],C.SLOT_Z],mid=[C.PILE_AT[0],C.PILE_AT[1],C.SLOT_Z],to=[C.PILE_AT[0],C.PILE_AT[1],z];
  return[
    seg(.55,function(){},function(){wire.setAttribute("data-flow","");parts.lamp.setAttribute("data-on","");dress(parts.slot,c);place(parts.slot,from);show(parts.slot,true)}),
    mv(parts.slot,from,mid,.85,"io"),
    mv(parts.slot,mid,to,.3,"in"),
    seg(.05,function(){},null,function(){show(parts.slot,false);wire.removeAttribute("data-flow");parts.lamp.removeAttribute("data-on");S.pile.push(c);render()})
  ];
}
function actAdvance(){
  if(S.platen||!S.pile.length)return null;
  var c=S.pile[S.pile.length-1],z=C.TRAY_Z+(S.pile.length-1)*C.LAYER;
  var a=[C.PILE_AT[0],C.PILE_AT[1],z],b=[C.PILE_AT[0],C.PILE_AT[1],C.MAT_TOP+3],d=[C.PLATEN_AT[0],C.PLATEN_AT[1],C.MAT_TOP+3],e=[C.PLATEN_AT[0],C.PLATEN_AT[1],C.MAT_TOP];
  return[
    mv(parts.live,a,b,.3,"out",function(){S.transit=S.pile.pop();dress(parts.live,c);parts.live.removeAttribute("data-stamped");lit(parts.live,true);place(parts.live,a);zones.platen.appendChild(parts.live);show(parts.live,true);render()}),
    mv(parts.live,b,d,.75,"io"),
    mv(parts.live,d,e,.22,"in"),
    seg(.05,function(){},null,function(){S.transit=null;S.platen=c;say()})
  ];
}
function actApprove(){
  if(!S.platen){note("nothing under the stamp yet");return null}
  var c=S.platen,top=stackTop(),full=S.ledger.length>=C.STACK_MAX,land=full?top-C.LAYER:top;
  var carry=Math.max(C.MAT_TOP,top)+2.5;
  var p0=[C.PLATEN_AT[0],C.PLATEN_AT[1],C.MAT_TOP],p1=[C.PLATEN_AT[0],C.PLATEN_AT[1],carry],p2=[C.PRESS_X,0,carry],p3=[C.PRESS_X,0,land];
  return[
    seg(.38,function(u){setStamp(ease.in(u))}),
    seg(.16,function(){},function(){parts.live.setAttribute("data-stamped","")}),
    seg(.42,function(u){setStamp(1-ease.out(u))}),
    seg(.45,function(u){setPress(top+C.PRESS_LIFT*ease.io(u))}),
    mv(parts.live,p0,p1,.25,"out"),
    seg(.95,function(u){var v=ease.io(u);place(parts.live,[p1[0]+(p2[0]-p1[0])*v,0,carry]);if(p1[0]+(p2[0]-p1[0])*v>20&&parts.live.parentNode!==zones.stack)zones.stack.appendChild(parts.live)}),
    mv(parts.live,p2,p3,.25,"in"),
    seg(.05,function(){},null,function(){S.platen=null;S.ledger.push(c);if(S.ledger.length>40)S.ledger.shift();S.approved++;show(parts.live,false);lit(parts.live,false);zones.platen.appendChild(parts.live);render()}),
    seg(.5,function(u){var t=stackTop();setPress(t+C.PRESS_LIFT*(1-ease.io(u)))})
  ];
}
function actReject(){
  if(!S.platen){note("nothing on the platen to reject");return null}
  var c=S.platen,n=Math.min(S.binned.length,C.BIN_MAX-1),j=C.BIN_JIT[n];
  var z=C.BIN_WALL+n*C.LAYER;
  var p0=[C.PLATEN_AT[0],0,C.MAT_TOP],p1=[C.PLATEN_AT[0],-C.PUSH_TRAVEL,C.MAT_TOP],p2=[C.BIN_AT[0]+j[0],C.BIN_AT[1]+j[1],C.MAT_TOP],p3=[p2[0],p2[1],z];
  return[
    seg(.85,function(u){var v=ease.io(u);parts.pusher.setAttribute("transform",tr(0,-C.PUSH_TRAVEL*v,0));place(parts.live,[p0[0],-C.PUSH_TRAVEL*v,C.MAT_TOP])},function(){lit(parts.live,false)}),
    mv(parts.live,p1,p2,.3,"out"),
    mv(parts.live,p2,p3,.3,"in",function(){zones.bin.appendChild(parts.live)}),
    seg(.05,function(){},null,function(){S.platen=null;S.binned.push(c);if(S.binned.length>20)S.binned.shift();S.rejected++;show(parts.live,false);zones.platen.appendChild(parts.live);render()}),
    seg(.55,function(u){parts.pusher.setAttribute("transform",tr(0,-C.PUSH_TRAVEL*(1-ease.io(u)),0))})
  ];
}
var ACT={file:actFile,approve:actApprove,reject:actReject,advance:actAdvance};
var queue=[],cur=null,frame=0,last=0,visible=false,touring=!still.matches,idle=1.4,tourAt=0;
var TOUR=["file","approve","file","reject","approve","file","file","approve","approve","file","reject","approve"];
function start(){
  while(!cur&&queue.length){var name=queue.shift();var segs=ACT[name]();if(segs){cur={segs:segs,i:0,t:0,begun:false}}}
}
function stepSegs(dt){
  var calm=still.matches;
  while(cur){
    var s=cur.segs[cur.i];
    if(!cur.begun){cur.begun=true;if(s.s)s.s()}
    var d=calm?0:s.d;cur.t+=dt;
    if(cur.t>=d||d===0){s.f(1);if(s.e)s.e();dt=cur.t-d;cur.i++;cur.t=0;cur.begun=false;if(cur.i>=cur.segs.length){cur=null;if(!S.platen&&S.pile.length)queue.unshift("advance");start()}if(!calm&&dt<=0)break}
    else{s.f(cur.t/d);break}
  }
}
function tick(now){
  var dt=last?Math.min((now-last)/1000,1/30):1/60;last=now;
  if(S.noteT>0){S.noteT-=dt;if(S.noteT<=0){S.note="";say()}}
  if(!cur){start()}
  if(cur)stepSegs(dt);
  if(!cur&&!queue.length&&touring&&!still.matches){idle-=dt;if(idle<=0){queue.push(TOUR[tourAt++%TOUR.length]);idle=1.1;start()}}
  var busy=cur||queue.length||(touring&&!still.matches)||S.noteT>0;
  frame=visible&&busy?requestAnimationFrame(tick):0;
}
function run(){if(!frame&&visible){last=0;frame=requestAnimationFrame(tick)}}
var quiet=0;
function act(name){touring=false;idle=3.6;clearTimeout(quiet);quiet=setTimeout(function(){touring=!still.matches;idle=0.2;run()},6000);if(queue.length<3)queue.push(name);if(still.matches){start();while(cur)stepSegs(0)}run()}
svg.addEventListener("keydown",function(e){
  var k=e.key.toLowerCase(),name=null;
  if(k==="n"||k==="f")name="file";
  else if(k==="a")name="approve";
  else if(k==="r"||k==="delete"||k==="backspace")name="reject";
  else if((k==="enter"||k===" ")&&e.target.getAttribute&&e.target.getAttribute("data-act"))name=e.target.getAttribute("data-act");
  if(!name)return;e.preventDefault();act(name)});
svg.querySelectorAll(".hp-hit").forEach(function(h){h.addEventListener("click",function(){act(h.getAttribute("data-act"))})});
new IntersectionObserver(function(en){visible=en[en.length-1].isIntersecting;if(visible)run()},{rootMargin:"120px 0px"}).observe(svg);
still.addEventListener&&still.addEventListener("change",function(){touring=!still.matches;run()});
dress(parts.live,S.platen);lit(parts.live,true);place(parts.live,[C.PLATEN_AT[0],C.PLATEN_AT[1],C.MAT_TOP]);show(parts.live,true);
setStamp(0);setPress(stackTop());render();
})();`;
function r1x(v) {
  return Math.round(v * 1e4) / 1e4;
}

const LABEL =
  "A confirmation desk for a family health record. On the left an agent box, fed by three doctors' prescription spikes and a voice recorder, drops proposal cards into an intake tray; each card's tab shows its source, a voice note or a prescription photo. A card moves onto a platen under a hand stamp. Approving stamps it and binds it into a press that holds the record; rejecting pushes it into a bin behind the platen. Nothing reaches the press without the stamp.";

const svg = `<svg xmlns="http://www.w3.org/2000/svg" class="hpf iso-svg" viewBox="${VB.join(" ")}" role="group" tabindex="0" aria-label="${LABEL.replace(/"/g, "&quot;")} Keys: N files a proposal, A approves, R rejects."><style>${CSS.replace(/\n/g, "")}</style>${defs}${body}</svg>`;
const embed = `<style>${FAMILY_CSS}</style>
<div class="hpw fig-fam">
${head("04", "The confirmation desk")}
${svg}
<div class="fig-foot"><p class="fig-read"><span data-readout>pending 3, approved 4, rejected 1</span><br><span data-source>source: Rx photo from doctor 2, crop</span></p><p class="fig-hint">Tap the agent, the stamp or the pusher. Keys N, A, R.</p></div>
</div><script>${LIVE}</script>`;
writeFileSync(join(HERE, "embed.html"), `<!-- Healthpedia, Fig 04. Paste inside <div class="media">. Generated by build.mjs, do not edit by hand. -->\n${embed}\n`);

const page = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Confirmation desk</title>
<script>(function(){var t=new URLSearchParams(location.search).get("theme");document.documentElement.setAttribute("data-theme",t==="dark"?"dark":"light")})()</script>
<style>
:root{--bg:#FAFAF9;--surface:#FAFAF9;--ink:#111111;--muted:#6B6B6B;--rule:#E6E6E3;--cobalt:#1F4E9E;--mono:"JetBrains Mono",ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;--sans:"Instrument Sans","Helvetica Neue",Helvetica,Arial,sans-serif;color-scheme:light}
*{box-sizing:border-box}
body{margin:0;min-height:100vh;background:var(--bg);color:var(--ink);font:15px/1.55 var(--sans);-webkit-font-smoothing:antialiased}
main{width:min(520px,100% - 32px);margin:40px auto 64px}
.media{min-width:0}
p{color:var(--muted);font-size:13.5px;margin:14px 0 0}
</style></head><body><main><div class="media">${embed}</div>
<p>Agents propose, a human approves, every entry carries its source. The agent files cards from voice notes and prescription photos; only a stamped card reaches the bound record.</p></main></body></html>`;
writeFileSync(join(HERE, "figure.html"), page);
console.log("wrote figure.html and embed.html", (embed.length / 1024).toFixed(1) + " KB");
