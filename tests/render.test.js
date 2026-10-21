import { test } from 'node:test';
import assert from 'node:assert/strict';
import { publications, ventureLogos } from '../js/data.js';
import { renderPublication, renderPublications, publicationCountLabel } from '../js/render.js';

const base = {
  id: 'x', title: 'Plain title', venue: 'Some Conf 2026', role: 'co-author',
  status: 'accepted', year: 2026, logos: [],
};

test('renders the title and links the DOI only when one exists', () => {
  const withDoi = renderPublication({ ...base, doi: '10.1145/1' });
  assert.match(withDoi, /Plain title/);
  assert.match(withDoi, /href="https:\/\/doi\.org\/10\.1145\/1"/);
  assert.doesNotMatch(renderPublication(base), /doi\.org/);
});

test('shows the Best Paper badge for the award entry', () => {
  const awarded = publications.find((p) => p.award);
  assert.match(renderPublication(awarded), /Best Paper/);
});

test('escapes HTML in titles', () => {
  const html = renderPublication({ ...base, title: 'A <b> & C' });
  assert.match(html, /A &lt;b&gt; &amp; C/);
  assert.doesNotMatch(html, /<b>/);
});

test('a publication with no logos still renders a card', () => {
  assert.match(renderPublication(base), /<article class="pub paper-card"/);
});

test('renderPublications renders one card per entry', () => {
  const html = renderPublications(publications);
  assert.equal((html.match(/<article class="pub paper-card"/g) || []).length, publications.length);
});

test('count label is computed from the list', () => {
  assert.equal(publicationCountLabel(publications), '7 papers');
  assert.equal(publicationCountLabel([...publications, { ...base, id: 'eighth' }]), '8 papers');
  assert.equal(publicationCountLabel([base]), '1 paper');
});

test('a logo without a file renders as a text badge, not a broken image', () => {
  ventureLogos.fileless = { name: 'Fileless University', file: null, fallbackText: 'Fileless' };
  try {
    const html = renderPublication({ ...base, logos: ['fileless'] });
    assert.match(html, /<span class="pub-logo pub-logo--text">Fileless<\/span>/);
    assert.doesNotMatch(html, /<img/);
  } finally {
    delete ventureLogos.fileless;
  }
});

test('final review #1: a paper without `logos` still renders', () => {
  const { logos, ...noLogos } = base;
  assert.match(renderPublication(noLogos), /<article class="pub paper-card"/);
});

test('final review #1: an unknown logo key renders as a text badge instead of throwing', () => {
  assert.match(renderPublication({ ...base, logos: ['YZU'] }), /pub-logo--text">YZU</);
});

test('final review #1: an unknown role shows the raw text, not "undefined"', () => {
  const html = renderPublication({ ...base, role: 'supervisor' });
  assert.match(html, /supervisor/);
  assert.doesNotMatch(html, /undefined/);
});

test('logo images carry a per-logo class so ACM can be sized separately', () => {
  assert.match(renderPublication({ ...base, logos: ['acm'] }), /class="pub-logo pub-logo--acm"/);
});
