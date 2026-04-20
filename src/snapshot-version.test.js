const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  getVersionsFile,
  loadVersions,
  bumpVersion,
  getVersion,
  resetVersion,
  listVersioned,
  formatVersionList,
} = require('./snapshot-version');

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-version-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('getVersionsFile returns path inside dir', () => {
  const f = getVersionsFile(tmpDir);
  expect(f).toBe(path.join(tmpDir, 'versions.json'));
});

test('loadVersions returns empty object when file missing', () => {
  expect(loadVersions(tmpDir)).toEqual({});
});

test('bumpVersion increments from zero', () => {
  const v = bumpVersion('snap1', tmpDir);
  expect(v).toBe(1);
});

test('bumpVersion increments existing version', () => {
  bumpVersion('snap1', tmpDir);
  const v = bumpVersion('snap1', tmpDir);
  expect(v).toBe(2);
});

test('getVersion returns null for unknown snapshot', () => {
  expect(getVersion('nope', tmpDir)).toBeNull();
});

test('getVersion returns current version after bumps', () => {
  bumpVersion('snap2', tmpDir);
  bumpVersion('snap2', tmpDir);
  expect(getVersion('snap2', tmpDir)).toBe(2);
});

test('resetVersion removes entry', () => {
  bumpVersion('snap3', tmpDir);
  resetVersion('snap3', tmpDir);
  expect(getVersion('snap3', tmpDir)).toBeNull();
});

test('listVersioned returns all entries', () => {
  bumpVersion('a', tmpDir);
  bumpVersion('b', tmpDir);
  bumpVersion('b', tmpDir);
  const list = listVersioned(tmpDir);
  expect(list).toEqual(expect.arrayContaining([
    { name: 'a', version: 1 },
    { name: 'b', version: 2 },
  ]));
});

test('formatVersionList shows no-snapshots message', () => {
  expect(formatVersionList([])).toMatch(/No versioned/);
});

test('formatVersionList formats entries', () => {
  const result = formatVersionList([{ name: 'mysnap', version: 3 }]);
  expect(result).toContain('mysnap');
  expect(result).toContain('v3');
});
