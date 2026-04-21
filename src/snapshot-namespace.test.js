const fs = require('fs');
const os = require('os');
const path = require('path');

function getModule(tmpDir) {
  jest.resetModules();
  jest.doMock('./snapshot', () => ({ getSnapshotsDir: () => tmpDir }));
  return require('./snapshot-namespace');
}

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-ns-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('returns null for unknown snapshot', () => {
  const { getNamespace } = getModule(tmpDir);
  expect(getNamespace('snap1', tmpDir)).toBeNull();
});

test('sets and gets a namespace', () => {
  const { setNamespace, getNamespace } = getModule(tmpDir);
  setNamespace('snap1', 'production', tmpDir);
  expect(getNamespace('snap1', tmpDir)).toBe('production');
});

test('overwrites existing namespace', () => {
  const { setNamespace, getNamespace } = getModule(tmpDir);
  setNamespace('snap1', 'staging', tmpDir);
  setNamespace('snap1', 'production', tmpDir);
  expect(getNamespace('snap1', tmpDir)).toBe('production');
});

test('removes a namespace', () => {
  const { setNamespace, getNamespace, removeNamespace } = getModule(tmpDir);
  setNamespace('snap1', 'dev', tmpDir);
  removeNamespace('snap1', tmpDir);
  expect(getNamespace('snap1', tmpDir)).toBeNull();
});

test('lists snapshots by namespace', () => {
  const { setNamespace, listByNamespace } = getModule(tmpDir);
  setNamespace('snap1', 'production', tmpDir);
  setNamespace('snap2', 'staging', tmpDir);
  setNamespace('snap3', 'production', tmpDir);
  const result = listByNamespace('production', tmpDir);
  expect(result).toContain('snap1');
  expect(result).toContain('snap3');
  expect(result).not.toContain('snap2');
});

test('getAllNamespaces returns sorted unique list', () => {
  const { setNamespace, getAllNamespaces } = getModule(tmpDir);
  setNamespace('snap1', 'production', tmpDir);
  setNamespace('snap2', 'staging', tmpDir);
  setNamespace('snap3', 'production', tmpDir);
  const all = getAllNamespaces(tmpDir);
  expect(all).toEqual(['production', 'staging']);
});

test('throws on empty namespace string', () => {
  const { setNamespace } = getModule(tmpDir);
  expect(() => setNamespace('snap1', '', tmpDir)).toThrow();
});

test('handles missing namespace file gracefully', () => {
  const { loadNamespaces } = getModule(tmpDir);
  expect(loadNamespaces(tmpDir)).toEqual({});
});
