import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const root = new URL('../', import.meta.url);
const read = (p) => readFileSync(new URL(p, root), 'utf8');

test('final review #2: Jekyll config keeps docs, tests and dev files off the live site', () => {
  const cfg = read('_config.yml');
  for (const item of ['docs', 'tests', 'package.json', 'README.md', 'CV_Nguyen_Minh_Quang.pdf']) {
    assert.ok(cfg.includes(item), `_config.yml should exclude ${item}`);
  }
});

test('final review #3: the root CV duplicate is not tracked (only assets/cv/ is published)', () => {
  const tracked = execSync('git ls-files', { cwd: root, encoding: 'utf8' }).split('\n');
  assert.ok(!tracked.includes('CV_Nguyen_Minh_Quang.pdf'));
  assert.ok(tracked.includes('assets/cv/CV_Nguyen_Minh_Quang.pdf'));
});

test('public repo: docs/ and notes are not tracked', () => {
  const tracked = execSync('git ls-files', { cwd: root, encoding: 'utf8' }).split('\n').filter(Boolean);
  assert.deepEqual(tracked.filter((f) => f.startsWith('docs/')), []);
});

test('public repo: the published CV is the new one and the old phone number is nowhere', () => {
  const tracked = execSync('git ls-files', { cwd: root, encoding: 'utf8' }).split('\n').filter(Boolean);
  const cv = readFileSync(new URL('assets/cv/CV_Nguyen_Minh_Quang.pdf', root));
  const same = readFileSync(new URL('CV_Quang_Nguyen.pdf', root));
  assert.ok(cv.equals(same), 'assets/cv should hold CV_Quang_Nguyen.pdf');
  assert.ok(!tracked.includes('CV_Quang_Nguyen.pdf'), 'root CV copy stays untracked');
  const everAdded = execSync('git log HEAD --name-only --format=', { cwd: root, encoding: 'utf8' }).split('\n').filter(Boolean);
  assert.deepEqual(everAdded.filter((f) => f.startsWith('docs/') || f === 'CV_Nguyen_Minh_Quang.pdf' || f === 'CV_Quang_Nguyen.pdf'), [], 'no commit in history touched docs/ or a root CV');
});
