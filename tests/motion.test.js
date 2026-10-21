import { test } from 'node:test';
import assert from 'node:assert/strict';
import { initMotion } from '../js/motion.js';

function fakeDoc({ reduced }) {
  const classes = new Set();
  const observed = [];
  globalThis.window = { matchMedia: () => ({ matches: reduced }), addEventListener() {}, innerHeight: 800 };
  globalThis.IntersectionObserver = class {
    constructor(cb) { this.cb = cb; }
    observe(el) { observed.push(el); }
    unobserve() {}
  };
  return {
    classes, observed,
    doc: {
      documentElement: { classList: { add: (c) => classes.add(c) } },
      querySelectorAll: (sel) => (sel === '[data-reveal]' ? [{ classList: { add() {} } }] : []),
    },
  };
}

test('reduced motion: does nothing and never hides content', () => {
  const { doc, classes, observed } = fakeDoc({ reduced: true });
  initMotion(doc);
  assert.equal(classes.has('js-reveal'), false);
  assert.equal(observed.length, 0);
});

test('normal motion: enables reveal and observes [data-reveal] elements', () => {
  const { doc, classes, observed } = fakeDoc({ reduced: false });
  initMotion(doc);
  assert.equal(classes.has('js-reveal'), true);
  assert.equal(observed.length, 1);
});
