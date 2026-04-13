const fs = require('fs');
const os = require('os');
const path = require('path');

let tmpDir;
let mod;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-cat-'));
  jest.resetModules();
  jest.doMock('./snapshot', () => ({ getSnapshotsDir: () => tmpDir }));
  mod = require('./snapshot-category');
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('loadCategories returns empty object when no file', () => {
  expect(mod.loadCategories()).toEqual({});
});

test('setCategory and getCategory roundtrip', () => {
  mod.setCategory('snap1', 'production');
  expect(mod.getCategory('snap1')).toBe('production');
});

test('getCategory returns null for unknown snapshot', () => {
  expect(mod.getCategory('nope')).toBeNull();
});

test('removeCategory deletes entry', () => {
  mod.setCategory('snap1', 'staging');
  mod.removeCategory('snap1');
  expect(mod.getCategory('snap1')).toBeNull();
});

test('listByCategory returns matching snapshots', () => {
  mod.setCategory('snap1', 'production');
  mod.setCategory('snap2', 'staging');
  mod.setCategory('snap3', 'production');
  expect(mod.listByCategory('production').sort()).toEqual(['snap1', 'snap3']);
});

test('getAllCategories returns unique sorted list', () => {
  mod.setCategory('snap1', 'production');
  mod.setCategory('snap2', 'staging');
  mod.setCategory('snap3', 'production');
  expect(mod.getAllCategories()).toEqual(['production', 'staging']);
});

test('getAllCategories returns empty array when none set', () => {
  expect(mod.getAllCategories()).toEqual([]);
});
