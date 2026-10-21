import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const paper = read('css/paper.css');
const base = read('css/base.css');
const html = read('index.html');

test('reduced motion: content stays visible and static', () => {
  const block = paper.match(/@media \(prefers-reduced-motion: reduce\)\s*\{([\s\S]*?)\n\}/);
  assert.ok(block, 'has a prefers-reduced-motion: reduce block');
  assert.match(block[1], /\.js-reveal \[data-reveal\]/);
  assert.match(block[1], /opacity:\s*1/);
  assert.match(block[1], /transform:\s*none/);
});

test('hidden reveal state only applies when JS is running (.js-reveal)', () => {
  const hiddenRules = [...paper.matchAll(/([^{}]+)\{[^{}]*opacity:\s*0\s*(?:;|\})[^{}]*\}?/g)].map((m) => m[1]);
  assert.ok(hiddenRules.length > 0);
  for (const sel of hiddenRules) assert.match(sel, /\.js-reveal/);
});

test('at most three non-generic font families', () => {
  const generic = new Set(['serif', 'sans-serif', 'monospace', 'system-ui', 'inherit']);
  const families = new Set();
  for (const m of (base + paper).matchAll(/font-family:\s*([^;}]+)/g)) {
    for (const f of m[1].split(',')) {
      const name = f.trim().replace(/['"]/g, '');
      if (name && !generic.has(name) && !name.startsWith('var(')) families.add(name);
    }
  }
  assert.ok(families.size <= 3, [...families].join(', '));
});

test('page links both stylesheets and loads fonts without blocking render', () => {
  assert.match(html, /href="css\/base\.css"/);
  assert.match(html, /href="css\/paper\.css"/);
  assert.match(html, /rel="preconnect" href="https:\/\/fonts\.googleapis\.com"/);
  assert.match(html, /media="print" onload="this\.media='all'"/);
});

test('every <img> has alt text', () => {
  for (const tag of html.match(/<img\b[^>]*>/g) || []) assert.match(tag, /\balt="/);
});

test('mobile: no fixed widths that force horizontal scroll', () => {
  assert.match(base, /overflow-x:\s*hidden|max-width:\s*100%/);
});

function lum(hex) {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const token = (name) => base.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`))?.[1];

test('final review #7: award badge text meets 4.5:1', () => {
  assert.match(paper, /\.badge--award\s*\{[^}]*background:\s*var\(--terracotta-deep\)/);
  assert.ok(ratio(token('terracotta-deep'), token('white')) >= 4.5);
});

test('final review #7: focus ring meets 3:1 on the page background', () => {
  assert.match(base, /a:focus-visible\s*\{[^}]*outline:\s*3px solid var\(--focus\)/);
  assert.ok(ratio(token('focus'), token('paper')) >= 3);
});

test('final review #5: on phones the empty terracotta sheet is hidden', () => {
  const mobile = paper.match(/@media \(max-width: 640px\)\s*\{([\s\S]*?)\n\}/)[1];
  assert.match(mobile, /\.sheet--terracotta\s*\{[^}]*display:\s*none/);
});

test('square venue logos (Springer knight, ACM diamond) are shown at least 34px tall', () => {
  const h = (sel) => Number(paper.match(new RegExp(`\\${sel}\\s*\\{[^}]*height:\\s*(\\d+)px`))?.[1]);
  assert.ok(h('.pub-logo--acm') >= 34, 'acm height');
  assert.ok(h('.pub-logo--springer') >= 34, 'springer height');
});

test('UEH banner logo is wide enough to read', () => {
  const h = Number(paper.match(/\.pub-logo--ueh\s*\{[^}]*height:\s*(\d+)px/)?.[1]);
  assert.ok(h >= 34, `ueh height ${h}`);
});

test('every venue logo class has an explicit height', () => {
  for (const k of ['springer', 'acm', 'ueh', 'bk', 'yzu', 'ctu', 'eiu', 'iuh']) {
    assert.match(paper, new RegExp(`\\.pub-logo--${k}\\s*\\{[^}]*height:\\s*\\d+px`), k);
  }
});

test('chapter grid uses the full container on wide screens', () => {
  assert.match(paper, /\.chapter-grid\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s+minmax\(280px,\s*\d+px\)/);
  assert.match(paper, /@media \(max-width: 899px\)\s*\{[^}]*\.chapter-grid\s*\{[^}]*grid-template-columns:\s*1fr/);
});

test('NFU wordmark is white, so it sits on a dark chip', () => {
  assert.match(paper, /\.lab-logo--dark\s*\{[^}]*background:\s*var\(--navy\)/);
});
