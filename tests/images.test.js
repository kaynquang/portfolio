import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { ventureLogos } from '../js/data.js';
import { attachImageFallbacks } from '../js/images.js';

const root = new URL('../', import.meta.url);
const html = readFileSync(new URL('index.html', root), 'utf8');

test('every photo figure has a visible credit', () => {
  const figures = html.match(/<figure class="photo[^"]*"[^>]*>[\s\S]*?<\/figure>/g) || [];
  assert.ok(figures.length >= 4, `expected photos in the page, got ${figures.length}`);
  for (const f of figures) {
    const cap = f.match(/<figcaption class="credit">([\s\S]*?)<\/figcaption>/);
    assert.ok(cap, 'figcaption.credit present');
    assert.match(cap[1].trim(), /^(Photo|Source):/);
  }
});

test('every local image src exists on disk', () => {
  for (const m of html.matchAll(/<img[^>]+src="(assets\/[^"]+)"/g)) {
    assert.ok(existsSync(new URL(m[1], root)), `missing ${m[1]}`);
  }
});

test('every venue logo has a file or a text fallback', () => {
  for (const [key, l] of Object.entries(ventureLogos)) {
    const hasFile = Boolean(l.file) && existsSync(new URL(l.file, root));
    assert.ok(hasFile || l.fallbackText.length > 0, key);
  }
});

function fakeRoot(imgs) {
  return {
    createElement: (tag) => ({ tag, className: '', textContent: '' }),
    querySelectorAll: () => imgs,
  };
}
function fakeImg({ complete = false, naturalWidth = 1, fallbackText } = {}) {
  const handlers = {};
  return {
    complete, naturalWidth, alt: 'Alt text', dataset: fallbackText ? { fallbackText } : {},
    addEventListener: (ev, cb) => { handlers[ev] = cb; },
    replaceWith(el) { this.replacedWith = el; },
    fire: (ev) => handlers[ev]?.(),
  };
}

test('a failed photo is replaced by a labelled placeholder', () => {
  const img = fakeImg();
  attachImageFallbacks(fakeRoot([img]));
  img.fire('error');
  assert.equal(img.replacedWith.className, 'photo-placeholder');
  assert.equal(img.replacedWith.textContent, 'Alt text');
});

test('a failed logo falls back to its text', () => {
  const img = fakeImg({ fallbackText: 'Springer' });
  attachImageFallbacks(fakeRoot([img]));
  img.fire('error');
  assert.equal(img.replacedWith.textContent, 'Springer');
});

test('an image that already failed before the listener attached is replaced too', () => {
  const img = fakeImg({ complete: true, naturalWidth: 0 });
  attachImageFallbacks(fakeRoot([img]));
  assert.ok(img.replacedWith);
});

test('final review #4: a failed venue logo becomes a text badge, not a photo block', () => {
  const img = { ...fakeImg({ fallbackText: 'Springer' }), classList: { contains: (c) => c === 'pub-logo' } };
  attachImageFallbacks(fakeRoot([img]));
  img.fire('error');
  assert.equal(img.replacedWith.className, 'pub-logo pub-logo--text');
  assert.equal(img.replacedWith.textContent, 'Springer');
});

test('final review #6: photos offer a 700w srcset variant that exists on disk', () => {
  const tags = html.match(/<img[^>]+src="assets\/img\/(?:(?:bong|robog|bki|itgt)-[^"]+|election)\.jpg"[^>]*>/g) || [];
  assert.ok(tags.length >= 8);
  for (const t of tags) {
    const m = t.match(/srcset="([^"]+)"/);
    assert.ok(m, `no srcset: ${t}`);
    assert.match(t, /sizes="/);
    for (const part of m[1].split(',')) {
      const url = part.trim().split(/\s+/)[0];
      assert.ok(existsSync(new URL(url, root)), `missing ${url}`);
    }
  }
});

test('cards use the supplied photos: HIRO team, GUTS thermal figure, IT Got Talent certificate, election event', () => {
  for (const f of ['bki-hiro.jpg', 'bki-guts.png', 'itgt-certificate.jpg', 'election.jpg']) {
    assert.ok(html.includes(`assets/img/${f}`), `index.html should use ${f}`);
  }
});

test('portrait: avatar in the hero and a credited portrait figure in contact', () => {
  assert.match(html, /<img class="avatar" src="assets\/img\/quang\.jpg"[^>]*alt="Nguyen Minh Quang/);
  assert.match(html, /<figure class="photo portrait"[\s\S]*?Photo: Nguyen Minh Quang[\s\S]*?<\/figure>/);
});

test('supplied source images in the project root are not tracked', () => {
  const tracked = execSync('git ls-files', { cwd: root, encoding: 'utf8' }).split('\n');
  assert.ok(!tracked.some((f) => /^image.*\.png$/.test(f)), 'raw image*.png must stay untracked');
});

test('the Springer logo is the knight image file supplied by Quang', () => {
  assert.equal(ventureLogos.springer.file, 'assets/logos/springer.png');
  assert.ok(existsSync(new URL('assets/logos/springer.png', root)));
  assert.ok(existsSync(new URL('assets/logos/ueh.png', root)));
});

test('GUTS figure shows only the leak state', () => {
  const buf = readFileSync(new URL('assets/img/bki-guts.png', root));
  const height = buf.readUInt32BE(20);
  assert.ok(height <= 200, `bki-guts.png should be the leak half only, height ${height}`);
  const card = html.match(/<article class="paper-card"[^>]*>(?:(?!<\/article>)[\s\S])*?GUTS[\s\S]*?<\/article>/)[0];
  const tag = card.match(/<img[^>]+bki-guts\.png[^>]*>/)[0];
  assert.match(tag, /alt="[^"]*leak/i);
  assert.doesNotMatch(tag, /alt="[^"]*normal/i);
  assert.doesNotMatch(card, /normal/i);
});

test('profile icons exist locally', () => {
  for (const n of ['github', 'linkedin', 'orcid']) assert.ok(existsSync(new URL(`assets/logos/${n}.svg`, root)), n);
});
