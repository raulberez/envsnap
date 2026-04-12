const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  getDepsFile,
  loadDeps,
  addDependency,
  removeDependency,
  getDependencies,
  getDependents,
  formatDepsInfo
} = require('./snapshot-deps');

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-deps-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('getDepsFile returns path inside baseDir', () => {
  expect(getDepsFile(tmpDir)).toBe(path.join(tmpDir, '.deps.json'));
});

test('loadDeps returns empty object when file missing', () => {
  expect(loadDeps(tmpDir)).toEqual({});
});

test('addDependency creates and persists dependency', () => {
  addDependency('snap-b', 'snap-a', tmpDir);
  expect(getDependencies('snap-b', tmpDir)).toEqual(['snap-a']);
});

test('addDependency does not duplicate entries', () => {
  addDependency('snap-b', 'snap-a', tmpDir);
  addDependency('snap-b', 'snap-a', tmpDir);
  expect(getDependencies('snap-b', tmpDir)).toHaveLength(1);
});

test('removeDependency removes an entry', () => {
  addDependency('snap-b', 'snap-a', tmpDir);
  addDependency('snap-b', 'snap-c', tmpDir);
  removeDependency('snap-b', 'snap-a', tmpDir);
  expect(getDependencies('snap-b', tmpDir)).toEqual(['snap-c']);
});

test('removeDependency cleans up empty arrays', () => {
  addDependency('snap-b', 'snap-a', tmpDir);
  removeDependency('snap-b', 'snap-a', tmpDir);
  const deps = loadDeps(tmpDir);
  expect(deps['snap-b']).toBeUndefined();
});

test('getDependents returns snapshots that depend on given name', () => {
  addDependency('snap-b', 'snap-a', tmpDir);
  addDependency('snap-c', 'snap-a', tmpDir);
  expect(getDependents('snap-a', tmpDir)).toEqual(expect.arrayContaining(['snap-b', 'snap-c']));
});

test('formatDepsInfo includes dependency and dependent info', () => {
  addDependency('snap-b', 'snap-a', tmpDir);
  const result = formatDepsInfo('snap-b', tmpDir);
  expect(result).toContain('snap-a');
  expect(result).toContain('Depends on');
});

test('formatDepsInfo shows none when no relationships', () => {
  const result = formatDepsInfo('snap-x', tmpDir);
  expect(result).toContain('(none)');
});
