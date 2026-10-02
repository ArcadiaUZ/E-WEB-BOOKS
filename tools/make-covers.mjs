/**
 * Procedural cover generator.
 * Reads the catalog (assets/js/data/catalog.js) and renders one restrained,
 * dark, typographic SVG cover per book into assets/covers/.
 *
 *   node tools/make-covers.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CATALOG } from '../assets/js/data/catalog.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = resolve(root, 'assets/covers');
mkdirSync(out, { recursive: true });

const W = 600;
const H = 900;

const mulberry = (seed) => {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const hash = (str) => {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

/** h,s,l (%) → #rrggbb (chiqarish uchun hex, renderer'lar hsl ni to'g'ri qabul qilmasligi mumkin) */
const hex = (h, s, l) => {
  s /= 100;
  l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const v = l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return Math.round(255 * v)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

const escapeXml = (s) =>
  String(s).replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c]);

/** Greedy word wrap for the title block. */
function wrap(text, max) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > max && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function cover(book, index) {
  const rand = mulberry(hash(book.id));
  const hue = Math.floor(rand() * 360);
  const hue2 = (hue + 20 + Math.floor(rand() * 60)) % 360;
  const base = hex(hue, 26, 12);
  const deep = hex(hue, 30, 5);
  const accent = hex(hue2, 52, 74);
  const accentSoft = hex(hue2, 40, 52);

  const [main, ...rest] = book.title.split(':');
  const sub = rest.join(': ').trim();

  const maxChars = (px) => Math.max(6, Math.floor((W - 128) / (px * 0.62)));
  const titleSize = main.length > 22 ? 54 : main.length > 14 ? 66 : 78;
  const lineH = titleSize * 1.06;
  const subSize = 27;
  const lines = wrap(main.toUpperCase(), maxChars(titleSize)).slice(0, 3);
  const subLines = sub ? wrap(sub, maxChars(subSize)).slice(0, 2) : [];

  // shelf / architecture motif
  const shelves = [];
  const count = 6 + Math.floor(rand() * 5);
  for (let i = 0; i < count; i++) {
    const y = 70 + i * (38 + rand() * 42);
    const w = 80 + rand() * 360;
    const x = rand() * (W - w - 40) + 20;
    const h = 7 + rand() * 24;
    shelves.push(
      `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="1.5" fill="${
        i % 5 === 0 ? accent : '#ffffff'
      }" opacity="${(0.06 + rand() * 0.14).toFixed(3)}"/>`,
    );
  }

  // one large geometric glyph
  const glyph = (() => {
    const cx = 120 + rand() * 360;
    const cy = 150 + rand() * 180;
    const r = 60 + rand() * 90;
    const common = `fill="none" stroke="${accent}" stroke-width="1.6" opacity="0.5"`;
    const kind = Math.floor(rand() * 3);
    if (kind === 0) return `<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${r.toFixed(0)}" ${common}/>`;
    if (kind === 1)
      return `<rect x="${(cx - r).toFixed(0)}" y="${(cy - r).toFixed(0)}" width="${(r * 2).toFixed(0)}" height="${(r * 2).toFixed(0)}" transform="rotate(45 ${cx.toFixed(0)} ${cy.toFixed(0)})" ${common}/>`;
    return `<path d="M${(cx - r).toFixed(0)} ${cy.toFixed(0)} L${cx.toFixed(0)} ${(cy - r).toFixed(0)} L${(
      cx + r
    ).toFixed(0)} ${cy.toFixed(0)} L${cx.toFixed(0)} ${(cy + r).toFixed(0)} Z" ${common}/>`;
  })();

  const authorY = 806;
  const blockBottom = authorY - 62;
  const blockH =
    lines.length * lineH + (subLines.length ? subLines.length * subSize * 1.4 + 34 : 0);
  const titleStartY = blockBottom - blockH + titleSize * 0.8;

  const titleBlock = [
    ...lines.map(
      (l, i) =>
        `<text x="58" y="${(titleStartY + i * lineH).toFixed(1)}" font-family="Georgia,'Times New Roman',serif" font-size="${titleSize}" letter-spacing="-1.4" fill="#f6f3ec">${escapeXml(l)}</text>`,
    ),
    ...subLines.map(
      (l, i) =>
        `<text x="60" y="${(titleStartY + lines.length * lineH + 14 + i * subSize * 1.4).toFixed(
          1,
        )}" font-family="Georgia,serif" font-size="${subSize}" fill="${accent}" opacity="0.92">${escapeXml(l)}</text>`,
    ),
  ].join('');

  const author = `<text x="58" y="${authorY}" font-family="Helvetica,Arial,sans-serif" font-size="20" letter-spacing="4" fill="#ffffff" opacity="0.6">${escapeXml(
    book.author.toUpperCase().slice(0, 34),
  )}</text>`;

  const num = `<text x="${W - 48}" y="${authorY}" text-anchor="end" font-family="Helvetica,Arial,sans-serif" font-size="18" letter-spacing="3" fill="${accent}" opacity="0.55">${String(
    index + 1,
  ).padStart(2, '0')}</text>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${escapeXml(
    book.title,
  )} — ${escapeXml(book.author)}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.7" y2="1">
      <stop offset="0" stop-color="${base}"/>
      <stop offset="1" stop-color="${deep}"/>
    </linearGradient>
    <radialGradient id="spot" cx="0.5" cy="0.24" r="0.6">
      <stop offset="0" stop-color="${accent}" stop-opacity="0.24"/>
      <stop offset="0.55" stop-color="${accentSoft}" stop-opacity="0.08"/>
      <stop offset="1" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="veil" x1="0" y1="0.34" x2="0" y2="0.5">
      <stop offset="0" stop-color="${deep}" stop-opacity="0"/>
      <stop offset="0.5" stop-color="${deep}" stop-opacity="0.8"/>
      <stop offset="1" stop-color="${deep}" stop-opacity="0.97"/>
    </linearGradient>
    <linearGradient id="edge" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.1"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  ${shelves.join('')}
  <rect width="${W}" height="${H}" fill="url(#spot)"/>
  ${glyph}
  <rect width="${W}" height="${H}" fill="url(#edge)"/>
  <rect y="300" width="${W}" height="${H - 300}" fill="url(#veil)"/>
  <rect x="28" y="28" width="${W - 56}" height="${H - 56}" fill="none" stroke="${accent}" stroke-opacity="0.16"/>
  <rect x="0" y="0" width="12" height="${H}" fill="${accent}" opacity="0.22"/>
  <rect x="58" y="${authorY - 30}" width="64" height="1.5" fill="${accent}" opacity="0.85"/>
  ${titleBlock}
  ${author}
  ${num}
</svg>`;
}

CATALOG.forEach((book, i) => {
  const file = resolve(out, `${book.id}.svg`);
  writeFileSync(file, cover(book, i));
  console.log('wrote', file);
});
