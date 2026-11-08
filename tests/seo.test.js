import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const read = (p) => readFileSync(new URL(p, root), 'utf8');
const html = read('index.html');

test('canonical URL points at the custom domain', () => {
  assert.match(html, /<link rel="canonical" href="https:\/\/minhquang\.dev\/">/);
});

test('Open Graph and Twitter tags are present with an absolute image URL', () => {
  for (const p of ['og:title', 'og:description', 'og:type']) assert.ok(html.includes(`property="${p}"`), p);
  assert.match(html, /property="og:image" content="https:\/\/minhquang\.dev\/assets\/img\/og\.png"/);
  assert.match(html, /name="twitter:card" content="summary_large_image"/);
  assert.ok(existsSync(new URL('assets/img/og.png', root)));
});

test('JSON-LD Person parses and names the owner', () => {
  const m = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert.ok(m, 'JSON-LD block present');
  const data = JSON.parse(m[1]);
  assert.equal(data['@type'], 'Person');
  assert.equal(data.name, 'Nguyễn Minh Quang');
  assert.ok(data.alternateName.includes('Nguyen Minh Quang'), 'unaccented spelling is an alternateName');
  assert.equal(data['@id'], 'https://minhquang.dev/#person');
  assert.equal(data.url, 'https://minhquang.dev/');
  for (const k of ['affiliation', 'alumniOf', 'knowsAbout']) assert.ok(data[k], `Person has ${k}`);
  assert.ok(data.sameAs.includes('https://github.com/kaynquang'), 'sameAs lists GitHub');
  if (data.sameAs) for (const u of data.sameAs) assert.match(u, /^https:\/\//);
});

test('favicon is linked and exists', () => {
  assert.match(html, /<link rel="icon" [^>]*href="favicon\.png"/);
  assert.ok(existsSync(new URL('favicon.png', root)));
});

test('CNAME is exactly the custom domain', () => {
  assert.equal(read('CNAME').trim(), 'minhquang.dev');
});

test('sitemap lists both language versions; robots.txt references the sitemap', () => {
  assert.match(read('sitemap.xml'), /<loc>https:\/\/minhquang\.dev\/<\/loc>/);
  assert.match(read('sitemap.xml'), /<loc>https:\/\/minhquang\.dev\/vi\/<\/loc>/);
  assert.match(read('robots.txt'), /Sitemap:\s*https:\/\/minhquang\.dev\/sitemap\.xml/);
});

test('llms.txt exists and points to the CV', () => {
  assert.match(read('llms.txt'), /CV_Nguyen_Minh_Quang\.pdf/);
});

test('the page contains no hard-coded paper count', () => {
  assert.doesNotMatch(html, /\b(seven|7|eight|8)\s+(conference\s+)?papers\b/i);
});

test('the accented name is in the title and visible in the hero', () => {
  assert.match(html, /<title>Nguyễn Minh Quang[^<]*<\/title>/);
  const hero = html.match(/<header id="hero">[\s\S]*?<\/header>/)[0];
  assert.ok(hero.includes('Nguyễn Minh Quang'));
});

test('English and Vietnamese pages point at each other with hreflang', () => {
  const vi = read('vi/index.html');
  for (const page of [html, vi]) {
    assert.match(page, /<link rel="alternate" hreflang="en" href="https:\/\/minhquang\.dev\/">/);
    assert.match(page, /<link rel="alternate" hreflang="vi" href="https:\/\/minhquang\.dev\/vi\/">/);
    assert.match(page, /<link rel="alternate" hreflang="x-default" href="https:\/\/minhquang\.dev\/">/);
  }
});

test('Vietnamese page answers "Nguyễn Minh Quang là ai" and reuses the same Person', () => {
  const vi = read('vi/index.html');
  assert.match(vi, /<html lang="vi">/);
  assert.match(vi, /<link rel="canonical" href="https:\/\/minhquang\.dev\/vi\/">/);
  assert.match(vi, /<h1>Nguyễn Minh Quang là ai\?<\/h1>/);
  const data = JSON.parse(vi.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  assert.equal(data['@type'], 'ProfilePage');
  assert.equal(data.mainEntity['@id'], 'https://minhquang.dev/#person');
  assert.doesNotMatch(vi, /\s(?:src|href)="\/(?!\/)/, 'vi/index.html has a root-relative src/href');
});

test('Vietnamese page carries the same evidence links as the English page', async () => {
  const vi = read('vi/index.html');
  const { publications } = await import(new URL('js/data.js', root));
  for (const p of publications) {
    assert.ok(vi.includes(p.title), `vi lists "${p.title}"`);
    if (p.doi) assert.ok(vi.includes(`https://doi.org/${p.doi}`), `vi links DOI ${p.doi}`);
  }
  for (const url of [
    'https://www.scimagojr.com/journalsearch.php?q=25674&amp;tip=sid',
    'https://www.scopus.com/sourceid/17700155007',
    'https://kiemtruong.vn/',
    'https://huflit.edu.vn/vi/tin-tuc/',
    'https://sites.google.com/view/ccislab',
  ]) assert.ok(vi.includes(url), `vi links ${url}`);
});

test('HUFLIT student ID is shown on both pages and in the JSON-LD', () => {
  const vi = read('vi/index.html');
  for (const page of [html, vi]) assert.ok(page.includes('23DH114792'));
  const data = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  assert.ok(data.identifier.some((i) => i.value === '23DH114792'));
});
