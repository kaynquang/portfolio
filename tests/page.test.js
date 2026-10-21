import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('page is English', () => {
  assert.match(html, /<html lang="en">/);
});

test('chapters appear in order: street, lab, future, contact', () => {
  const idx = ['street', 'lab', 'future', 'contact'].map((id) => html.indexOf(`id="${id}"`));
  assert.ok(idx.every((i) => i >= 0), 'all section ids present');
  assert.deepEqual([...idx].sort((a, b) => a - b), idx);
  for (const id of ['hero', 'publications', 'pub-count']) {
    assert.ok(html.includes(`id="${id}"`), `missing #${id}`);
  }
});

test('Bông figures are worded as team figures', () => {
  assert.match(html, /20 languages/);
  assert.match(html, /15,000\+ visitors/);
  assert.match(html, /team figures/);
});

test('Lab is written as a research narrative, without detailed result figures', () => {
  const lab = html.match(/id="lab"[\s\S]*?<\/section>/)[0];
  for (const n of ['31.36', '2.99', '7.45', '0.9994', 'R²']) assert.ok(!lab.includes(n), `should not include ${n}`);
  assert.doesNotMatch(lab, /<ul class="figures">/);
  for (const phrase of ['STM32F746', 'one shared', 'continual', 'measured']) {
    assert.ok(lab.toLowerCase().includes(phrase.toLowerCase()), `Lab should mention "${phrase}"`);
  }
});

test('contact email is present', () => {
  assert.ok(html.includes('nmq.brian@gmail.com'));
});

test('chapter 3 is at most 4 sentences', () => {
  const section = html.match(/id="future"[\s\S]*?<\/section>/)[0];
  const text = [...section.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)].map((m) => m[1].replace(/<[^>]+>/g, '')).join(' ');
  const sentences = text.split(/[.!?](?:\s|$)/).filter((s) => s.trim());
  assert.ok(sentences.length >= 1 && sentences.length <= 4, `got ${sentences.length}`);
});

test('works without JS: noscript links to the CV PDF', () => {
  assert.match(html, /<noscript>[\s\S]*assets\/cv\/CV_Nguyen_Minh_Quang\.pdf[\s\S]*<\/noscript>/);
});

test('no hotlinked images', () => {
  assert.doesNotMatch(html, /<img[^>]+src="https?:/);
});

test('final review #1: #publications ships a static fallback link to the CV', () => {
  const block = html.match(/id="publications"[^>]*>([\s\S]*?)<\/div>/)[1];
  assert.match(block, /CV_Nguyen_Minh_Quang\.pdf/);
});

test('contact links to GitHub', () => {
  const contact = html.match(/id="contact"[\s\S]*?<\/footer>/)[0];
  assert.match(contact, /href="https:\/\/github\.com\/kaynquang"/);
});

test('local URLs are document-relative, so the page also works when opened from disk', () => {
  assert.doesNotMatch(html, /\s(?:src|href)="\/(?!\/)/, 'index.html has a root-relative src/href');
  const data = readFileSync(new URL('../js/data.js', import.meta.url), 'utf8');
  assert.doesNotMatch(data, /file:\s*'\//, 'data.js has a root-relative logo path');
});

test('Bach Khoa Innovation is split into one card per team', () => {
  const cards = html.match(/<article class="paper-card"[\s\S]*?<\/article>/g);
  const guts = cards.filter((c) => c.includes('GUTS'));
  const hiro = cards.filter((c) => c.includes('HIRO'));
  assert.equal(guts.length, 1);
  assert.equal(hiro.length, 1);
  assert.notEqual(guts[0], hiro[0], 'GUTS and HIRO must not share a card');
  assert.match(guts[0], /Top 9/);
  assert.match(guts[0], /bki-guts\.png/);
  assert.doesNotMatch(guts[0], /bki-hiro/);
  assert.match(hiro[0], /Top 20/);
  assert.match(hiro[0], /bki-hiro\.jpg/);
  assert.doesNotMatch(hiro[0], /bki-guts/);
});

test('chapters 1 and 2 are two-column: text beside photos / lab cards', () => {
  for (const id of ['street', 'lab']) {
    const sec = html.match(new RegExp(`id="${id}"[\\s\\S]*?<\\/section>`))[0];
    assert.match(sec, /class="chapter-grid"/, `${id} grid`);
    assert.match(sec, /<aside class="chapter-aside[ "]/, `${id} aside`);
  }
});

test('Lab lists both labs with university logos; only CCIS has a link', () => {
  const lab = html.match(/id="lab"[\s\S]*?<\/section>/)[0];
  const cards = lab.match(/<article class="lab-card[ "][\s\S]*?<\/article>/g);
  assert.equal(cards.length, 2);
  const [ccis, tinhvi] = cards;
  assert.match(ccis, /CCIS Laboratory/);
  assert.match(ccis, /National Formosa University/);
  assert.match(ccis, /assets\/logos\/nfu\.png/);
  assert.match(ccis, /href="https:\/\/sites\.google\.com\/view\/ccislab"/);
  assert.match(tinhvi, /TINH VI Lab/);
  assert.match(tinhvi, /HUFLIT/);
  assert.match(tinhvi, /assets\/logos\/huflit\.png/);
  assert.doesNotMatch(tinhvi, /<a /, 'no public TINH VI page yet');
});
