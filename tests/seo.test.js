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
  assert.equal(data.name, 'Nguyen Minh Quang');
  assert.equal(data.url, 'https://minhquang.dev');
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

test('sitemap lists the home page; robots.txt references the sitemap', () => {
  assert.match(read('sitemap.xml'), /<loc>https:\/\/minhquang\.dev\/<\/loc>/);
  assert.match(read('robots.txt'), /Sitemap:\s*https:\/\/minhquang\.dev\/sitemap\.xml/);
});

test('llms.txt exists and points to the CV', () => {
  assert.match(read('llms.txt'), /CV_Nguyen_Minh_Quang\.pdf/);
});

test('the page contains no hard-coded paper count', () => {
  assert.doesNotMatch(html, /\b(seven|7|eight|8)\s+(conference\s+)?papers\b/i);
});
