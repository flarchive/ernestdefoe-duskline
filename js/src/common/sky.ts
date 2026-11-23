/*
 * The sky: which of five scenes to show, and the illustration itself as one
 * inline SVG (no images). Scene boundaries match src/Content/Stamp.php, which
 * picks the first scene before paint.
 */

import { SCENES, type Scene } from './look';

export type { Scene };

export function sceneAt(date: Date = new Date()): Scene {
  const t = date.getHours() + date.getMinutes() / 60;
  if (t < 5 || t >= 20) return 'night';
  if (t < 8) return 'dawn';
  if (t < 16) return 'day';
  return t < 18.5 ? 'golden' : 'sunset';
}

export const isScene = (value: unknown): value is Scene => SCENES.includes(value as Scene);

type Palette = {
  sky: [string, string, string];
  sun: [string, string];
  cx: number;
  cy: number;
  r: number;
  stripe: number;
  far: string;
  mid: string;
  sea: [string, string];
  stars: number;
  win: number;
  winBase: number;
  neon: number;
  refl: number;
  trails: number;
  shim: string;
  deck: string;
  palm: string;
};

const P: Record<Scene, Palette> = {
  dawn: {
    sky: ['#2B2A5C', '#B9658F', '#FFC09A'],
    sun: ['#FFE7B0', '#FF8FA3'],
    cx: 300,
    cy: 206,
    r: 62,
    stripe: 1,
    far: '#7A5E8E',
    mid: '#433865',
    sea: ['#7A5E8E', '#26214B'],
    stars: 0.35,
    win: 0.55,
    winBase: 0.06,
    neon: 0.15,
    refl: 0.7,
    trails: 0.2,
    shim: '#FFC9B0',
    deck: '#2E2648',
    palm: '#1E1836',
  },
  day: {
    sky: ['#2F9BE0', '#7CCBF2', '#D8F1FF'],
    sun: ['#FFFBE0', '#FFE27A'],
    cx: 1000,
    cy: 66,
    r: 42,
    stripe: 0,
    far: '#9CC0DC',
    mid: '#5F82A8',
    sea: ['#3AAED8', '#13628F'],
    stars: 0,
    win: 0.25,
    winBase: 0.18,
    neon: 0,
    refl: 0.25,
    trails: 0,
    shim: '#FFFFFF',
    deck: '#3D5670',
    palm: '#1D4554',
  },
  golden: {
    sky: ['#D9577A', '#FF9A5C', '#FFD681'],
    sun: ['#FFF3B8', '#FF7656'],
    cx: 760,
    cy: 150,
    r: 80,
    stripe: 1,
    far: '#C9708A',
    mid: '#7C3F6B',
    sea: ['#F08A6C', '#5C2B5F'],
    stars: 0,
    win: 0.6,
    winBase: 0.12,
    neon: 0.2,
    refl: 0.85,
    trails: 0.25,
    shim: '#FFE3A0',
    deck: '#4A2148',
    palm: '#3A1637',
  },
  sunset: {
    sky: ['#24113F', '#B43A7A', '#FF874A'],
    sun: ['#FFD86B', '#FF3D7F'],
    cx: 640,
    cy: 206,
    r: 92,
    stripe: 1,
    far: '#6E2C66',
    mid: '#3B1848',
    sea: ['#83306E', '#1C0E31'],
    stars: 0.25,
    win: 0.8,
    winBase: 0.1,
    neon: 0.7,
    refl: 0.9,
    trails: 0.7,
    shim: '#FF9FC0',
    deck: '#26102F',
    palm: '#170A21',
  },
  night: {
    sky: ['#060514', '#170F3A', '#4A1D5E'],
    sun: ['#FBF5FF', '#C9B8FF'],
    cx: 1040,
    cy: 58,
    r: 20,
    stripe: 0,
    far: '#2A1D4F',
    mid: '#130E2C',
    sea: ['#1C1340', '#06041A'],
    stars: 1,
    win: 1,
    winBase: 0.08,
    neon: 1,
    refl: 0.35,
    trails: 1,
    shim: '#8F7BFF',
    deck: '#0C0920',
    palm: '#04030C',
  },
};

const PALM =
  'M-6 0C1-62 9-122 25-180L33-178C19-120 11-60 6 0Z' +
  'M29-178C58-200 98-192 124-154C96-176 64-182 30-172Z' +
  'M29-178C52-170 80-140 88-100C72-134 50-160 27-170Z' +
  'M29-178C6-204-36-204-66-170C-34-190-4-188 27-172Z' +
  'M29-178C8-168-16-138-22-100C-6-134 12-160 30-171Z' +
  'M29-178C34-212 62-232 92-232C66-222 46-204 33-176Z' +
  'M29-178C18-210-6-226-34-224C-10-214 10-198 25-175Z';

/** What every layer needs: the palette, a seeded random sequence and unique ids. */
type Ctx = { scene: Scene; s: Palette; rnd: () => number; id: (name: string) => string };

/** Keeps buildings low under a striped sun so it stays in view. */
const nearSun = ({ s }: Ctx, x: number, w: number) => !!s.stripe && x < s.cx + s.r + 6 && x + w > s.cx - s.r - 6;

function defs({ s, id }: Ctx): string {
  const stripes = [10, 24, 37, 49, 60, 71, 82].map((y, i) => `<rect x="-200" y="${y}" width="400" height="${3 + i}" fill="#000"/>`).join('');
  return (
    `<defs><linearGradient id="${id('k')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${s.sky[0]}"/><stop offset=".55" stop-color="${s.sky[1]}"/><stop offset="1" stop-color="${s.sky[2]}"/></linearGradient>` +
    `<linearGradient id="${id('u')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${s.sun[0]}"/><stop offset="1" stop-color="${s.sun[1]}"/></linearGradient>` +
    `<linearGradient id="${id('w')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${s.sea[0]}"/><stop offset="1" stop-color="${s.sea[1]}"/></linearGradient>` +
    `<mask id="${id('m')}" maskUnits="userSpaceOnUse" x="-200" y="-200" width="400" height="400"><rect x="-200" y="-200" width="400" height="400" fill="#fff"/><g opacity="${s.stripe}">${stripes}</g></mask>` +
    `<filter id="${id('g')}" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="3.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>` +
    `<path id="${id('p')}" d="${PALM}"/></defs>`
  );
}

/** Stars always draw from the random sequence, so the buildings stand in the same place in every scene. */
function stars({ s, rnd }: Ctx): string {
  const out: string[] = [];
  for (let i = 0; i < 70; i++) {
    const cx = Math.round(rnd() * 1280);
    const cy = Math.round(rnd() * 150);
    const r = rnd() > 0.85 ? 1.6 : 0.9;
    const o = (0.4 + rnd() * 0.6).toFixed(2);
    if (s.stars) out.push(`<circle cx="${cx}" cy="${cy}" r="${r}" opacity="${o}"/>`);
  }
  return s.stars ? `<g fill="#fff" opacity="${s.stars}">${out.join('')}</g>` : '';
}

/** The stripe mask is drawn around the origin, so the sun moves as a group. */
const sun = ({ s, id }: Ctx) => `<g transform="translate(${s.cx} ${s.cy})"><circle r="${s.r}" fill="url(#${id('u')})" mask="url(#${id('m')})"/></g>`;

function farSkyline(ctx: Ctx): string {
  const out: string[] = [];
  for (let x = 0; x < 1280;) {
    const w = 30 + Math.round(ctx.rnd() * 50);
    let h = 30 + Math.round(ctx.rnd() * 70);
    if (nearSun(ctx, x, w)) h = Math.min(h, 22);
    out.push(`<rect x="${x}" y="${214 - h}" width="${w}" height="${h}"/>`);
    x += w + Math.round(ctx.rnd() * 6);
  }
  return `<g fill="${ctx.s.far}">${out.join('')}</g>`;
}

/** The near towers and their windows, lit at night (a few flicker). */
function city(ctx: Ctx): string {
  const { s, rnd, scene } = ctx;
  const blocks: string[] = [];
  const wins: string[] = [];
  const win = (x: number, y: number) => {
    const lit = rnd() > 0.48;
    const c = rnd() < 0.12 ? '#7FF3E8' : scene === 'day' ? '#DDF2FF' : '#FFD47A';
    const flick = lit && scene === 'night' && rnd() < 0.04 ? ' class="DuskSky-flicker"' : '';
    wins.push(`<rect x="${x}" y="${y}" width="3" height="4" fill="${c}" opacity="${lit ? s.win : s.winBase}"${flick}/>`);
  };
  for (let x = 8; x < 1280;) {
    const bw = 34 + Math.round(rnd() * 44);
    let bh = 44 + Math.round(rnd() * 110);
    if (x > 880 && x < 950) {
      x = 952; // The landmark tower stands here.
      continue;
    }
    if (nearSun(ctx, x, bw)) bh = Math.min(bh, 34);
    blocks.push(`<rect x="${x}" y="${214 - bh}" width="${bw}" height="${bh}"/>`);
    for (let wx = x + 5; wx < x + bw - 5; wx += 8) for (let wy = 214 - bh + 7; wy < 208; wy += 10) win(wx, wy);
    x += bw + 4 + Math.round(rnd() * 14);
  }
  blocks.push(
    '<rect x="902" y="26" width="42" height="188"/><rect x="912" y="12" width="22" height="16"/><rect x="921" y="-10" width="4" height="24"/>'
  );
  for (let ty = 34; ty < 206; ty += 10) for (let tx = 908; tx < 940; tx += 8) win(tx, ty);
  return `<g fill="${s.mid}">${blocks.join('')}</g><g>${wins.join('')}</g>`;
}

const neon = ({ s, id }: Ctx) =>
  s.neon
    ? `<g class="DuskSky-neon" opacity="${s.neon}" filter="url(#${id('g')})" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">` +
      '<path d="M906 60h34M906 100h34" stroke="#3FF0E0"/><circle cx="923" cy="20" r="3" fill="#FF3B6B" stroke="none"/>' +
      '<path d="M214 150l10-10 10 10 10-10 10 10 10-10 10 10" stroke="#FF4F8B"/>' +
      '<rect x="1196" y="150" width="46" height="18" rx="9" stroke="#FFC24B"/><path d="M1110 168v-26m-8 8l8-8 8 8" stroke="#9D7BFF"/></g>'
    : '';

/** The bay: the sun's reflection and a shimmer. */
function water({ s, rnd, id }: Ctx): string {
  const refl: string[] = [];
  for (let k = 0; k < 9; k++) {
    const rw = Math.max(14, s.r * 1.6 - k * 14);
    refl.push(`<rect x="${(s.cx - rw / 2 + (rnd() - 0.5) * 10).toFixed(1)}" y="${220 + k * 9}" width="${rw}" height="2.5" rx="1.25"/>`);
  }
  const shim: string[] = [];
  for (let j = 0; j < 26; j++) {
    const lx = Math.round(rnd() * 1260);
    const y = 262 + Math.round(rnd() * 34);
    shim.push(`<line x1="${lx}" y1="${y}" x2="${lx + 10 + Math.round(rnd() * 40)}" y2="${y}"/>`);
  }
  return (
    `<rect y="214" width="1280" height="106" fill="url(#${id('w')})"/>` +
    `<g fill="${s.sun[1]}" opacity="${s.refl}">${refl.join('')}</g>` +
    `<g stroke="${s.shim}" stroke-width="1.5" opacity=".35">${shim.join('')}</g>`
  );
}

/** The causeway across the bay, with traffic after dark. */
const causeway = ({ s, id }: Ctx) =>
  `<path d="M0 252C320 244 640 240 1280 236V242C640 246 320 250 0 258Z" fill="${s.deck}"/>` +
  `<g fill="${s.deck}">${[120, 400, 680, 960, 1220].map((x, i) => `<rect x="${x}" y="${[252, 246, 242, 239, 237][i]}" width="5" height="22"/>`).join('')}</g>` +
  (s.trails
    ? `<g class="DuskSky-trails" opacity="${s.trails}" filter="url(#${id('g')})" fill="none" stroke-width="1.6">` +
      '<path d="M0 251C320 243 640 239 1280 235" stroke="#FF3B5C" stroke-dasharray="26 12"/>' +
      '<path d="M0 255C320 247 640 243 1280 239" stroke="#FFF1C4" stroke-dasharray="14 18"/></g>'
    : '');

const PALMS = [
  'translate(70 312) scale(1.05)',
  'translate(140 316) scale(.8) rotate(6)',
  'translate(430 314) scale(.55) rotate(-4)',
  'translate(1150 312) scale(-1 1)',
  'translate(1235 318) scale(-.78 .78)',
];

const shore = ({ s, id }: Ctx) =>
  `<path d="M0 300C200 288 360 296 520 304C760 316 1040 290 1280 296V320H0Z" fill="${s.palm}"/>` +
  `<g fill="${s.palm}">${PALMS.map((tr) => `<use href="#${id('p')}" transform="${tr}"/>`).join('')}</g>`;

/** The illustration for one scene. Deterministic (seeded), so it never jumps between redraws. */
export function skySvg(scene: Scene, uid: string): string {
  let seed = 7;
  const ctx: Ctx = {
    scene,
    s: P[scene],
    rnd: () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646,
    id: (name) => `${name}-${uid}`,
  };

  // Layer order is paint order, and the random sequence follows it.
  return (
    '<svg class="DuskSky-art" viewBox="0 0 1280 320" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">' +
    defs(ctx) +
    `<rect width="1280" height="214" fill="url(#${ctx.id('k')})"/>` +
    stars(ctx) +
    sun(ctx) +
    farSkyline(ctx) +
    city(ctx) +
    neon(ctx) +
    water(ctx) +
    causeway(ctx) +
    shore(ctx) +
    '</svg>'
  );
}
