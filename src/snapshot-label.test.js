const fs = require('fs');
const os = require('os');
const path = require('path');

let tmpDir;
let mod;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-label-'));
  jest.resetModules();
  jest.doMock('./snapshot', () => ({ getSnapshotsDir: () => tmpDir }));
  mod = require('./snapshot-label');
});

afterEach(() => fs.rmSync(tmpDir, { recursive: true, force: true }));

test('loadLabels returns empty object when no file', () => {
  expect(mod.loadLabels()).toEqual({});
});

test('setLabel stores a label', () => {
  mod.setLabel('snap1', 'production baseline');
  expect(mod.getLabel('snap1')).toBe('production baseline');
});

test('setLabel trims whitespace', () => {
  mod.setLabel('snap1', '  staging  ');
  expect(mod.getLabel('snap1')).toBe('staging');
});

test('getLabel returns null for unknown snapshot', () => {
  expect(mod.getLabel('nope')).toBeNull();
});

test('removeLabel deletes a label and returns true', () => {
  mod.setLabel('snap1', 'test');
  expect(mod.removeLabel('snap1')).toBe(true);
  expect(mod.getLabel('snap1')).toBeNull();
});

test('removeLabel returns false when label does not exist', () => {
  expect(mod.removeLabel('ghost')).toBe(false);
});

test('listLabels returns all labels', () => {
  mod.setLabel('a', 'alpha');
  mod.setLabel('b', 'beta');
  expect(mod.listLabels()).toEqual({ a: 'alpha', b: 'beta' });
});

test('findByLabel does case-insensitive partial match', () => {
  mod.setLabel('snap1', 'Production Baseline');
  mod.setLabel('snap2', 'dev snapshot');
  expect(mod.findByLabel('prod')).toEqual(['snap1']);
  expect(mod.findByLabel('snap')).toEqual(['snap2']);
});

test('setLabel throws when name is missing', () => {
  expect(() => mod.setLabel('', 'label')).toThrow();
});
