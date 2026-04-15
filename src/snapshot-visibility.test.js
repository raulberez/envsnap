const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  getVisibilityFile,
  loadVisibilities,
  setVisibility,
  getVisibility,
  removeVisibility,
  filterByVisibility,
  formatVisibilityList,
} = require('./snapshot-visibility');

let tmpDir;
beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-vis-'));
});
afterEach(() => fs.rmSync(tmpDir, { recursive: true }));

test('getVisibilityFile returns path inside snapshotsDir', () => {
  expect(getVisibilityFile(tmpDir)).toBe(path.join(tmpDir, 'visibilities.json'));
});

test('loadVisibilities returns empty object when file missing', () => {
  expect(loadVisibilities(tmpDir)).toEqual({});
});

test('setVisibility and getVisibility round-trip', () => {
  setVisibility('snap1', 'private', tmpDir);
  expect(getVisibility('snap1', tmpDir)).toBe('private');

test('getVisibility defaults to public', () => {
  expect(getVisibility('unknown', tmpDir)).toBe('public');
});

test('setVisibility throws on invalid value', () => {
  expect(() => setVisibility('snap1', 'secret', tmpDir)).toThrow('Invalid visibility');
});

test('removeVisibility deletes entry', () => {
  setVisibility('snap1', 'internal', tmpDir);
  removeVisibility('snap1', tmpDir);
  expect(getVisibility('snap1', tmpDir)).toBe('public');
});

test('filterByVisibility returns matching names', () => {
  setVisibility('a', 'private', tmpDir);
  setVisibility('b', 'internal', tmpDir);
  setVisibility('c', 'private', tmpDir);
  const result = filterByVisibility(['a', 'b', 'c', 'd'], 'private', tmpDir);
  expect(result).toEqual(['a', 'c']);
});

test('filterByVisibility includes public defaults', () => {
  const result = filterByVisibility(['x', 'y'], 'public', tmpDir);
  expect(result).toEqual(['x', 'y']);
});

test('formatVisibilityList formats entries', () => {
  setVisibility('snap1', 'private', tmpDir);
  setVisibility('snap2', 'internal', tmpDir);
  const out = formatVisibilityList(loadVisibilities(tmpDir));
  expect(out).toContain('snap1: private');
  expect(out).toContain('snap2: internal');
});

test('formatVisibilityList handles empty', () => {
  expect(formatVisibilityList({})).toBe('No visibility settings found.');
});
