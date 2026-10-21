import { test } from 'node:test';
import assert from 'node:assert/strict';
import { publications, ventureLogos, bongStats } from '../js/data.js';

test('has the 7 publications from the CV', () => {
  assert.equal(publications.length, 7);
});

test('publication ids are unique', () => {
  const ids = publications.map((p) => p.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('exactly one Best Paper award, on the ATAC 2026 paper', () => {
  const awarded = publications.filter((p) => p.award && p.award.includes('Best Paper'));
  assert.equal(awarded.length, 1);
  assert.match(awarded[0].venue, /ATAC 2026/);
});

test('one first-author and one corresponding-author paper', () => {
  assert.equal(publications.filter((p) => p.role === 'first').length, 1);
  assert.equal(publications.filter((p) => p.role === 'corresponding').length, 1);
});

test('the two ACM MLCI papers carry their DOIs', () => {
  const dois = publications.filter((p) => p.doi).map((p) => p.doi).sort();
  assert.deepEqual(dois, ['10.1145/3815970.3815972', '10.1145/3815970.3815978']);
});

test('every logo key used by a publication is defined', () => {
  for (const p of publications) {
    for (const key of p.logos) {
      assert.ok(ventureLogos[key], `${p.id} uses unknown logo ${key}`);
    }
  }
});

test('Bông stats match the CV figures and are labelled team figures', () => {
  assert.equal(bongStats.languages, 20);
  assert.equal(bongStats.visitors, '15,000+');
  assert.equal(bongStats.note, 'team figures');
});

test('no venue line mentions "presented" or a certificate of achievement', () => {
  for (const p of publications) assert.doesNotMatch(p.venue, /presented|certificate/i, p.id);
});

test('the ICBS 2026 paper shows the UEH organiser logo', () => {
  const icbs = publications.find((p) => p.venue.startsWith('ICBS 2026'));
  assert.ok(icbs.logos.includes('ueh'));
  assert.match(ventureLogos.ueh.name, /UEH/);
  assert.equal(ventureLogos.ueh.file, 'assets/logos/ueh.png');
});

test('venue logos follow the conference hosts', () => {
  const logos = (id) => publications.find((p) => p.id === id).logos;
  for (const id of ['ic-peak-shifts', 'vital']) {
    assert.deepEqual(logos(id), ['springer', 'ctu', 'yzu'], `${id}: ISDS 2026 is run by CTU and hosted at YZU`);
  }
  assert.deepEqual(logos('onnx-backdoor'), ['springer', 'bk'], 'CSoNet 2026 is hosted at HCMUT');
  assert.deepEqual(logos('traffic-sign-nms-free'), ['eiu'], 'ATAC 2026 is organised by EIU');
  assert.deepEqual(logos('legal-edge-retrieval'), ['ueh']);
  for (const id of ['hydrogen-thermal', 'footwear-android']) {
    assert.deepEqual(logos(id), ['acm', 'iuh'], `${id}: MLCI 2026 is sponsored by IUH`);
  }
  for (const k of ['ctu', 'yzu', 'bk', 'eiu', 'iuh']) {
    assert.match(ventureLogos[k].file, new RegExp(`^assets/logos/${k}\\.(png|jpg|svg)$`), k);
  }
});
