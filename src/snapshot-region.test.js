const fs = require('fs');
const os = require('os');
const path = require('path');

let tmpDir;
let mod;

function getModule() {
  jest.resetModules();
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-region-'));
  jest.mock('./snapshot', () => ({ getSnapshotsDir: () => tmpDir }));
  return require('./snapshot-region');
}

beforeEach(() => {
  mod = getModule();
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('loadRegions returns empty object when no file', () => {
  expect(mod.loadRegions()).toEqual({});
});

test('setRegion and getRegion round-trip', () => {
  mod.setRegion('snap1', 'us-east-1');
  expect(mod.getRegion('snap1')).toBe('us-east-1');
});

test('setRegion trims whitespace', () => {
  mod.setRegion('snap2', '  eu-west-1  ');
  expect(mod.getRegion('snap2')).toBe('eu-west-1');
});

test('setRegion throws on empty region', () => {
  expect(() => mod.setRegion('snap1', '')).toThrow('Region must be a non-empty string');
});

test('getRegion returns null when not set', () => {
  expect(mod.getRegion('unknown')).toBeNull();
});

test('removeRegion removes existing entry', () => {
  mod.setRegion('snap1', 'ap-southeast-1');
  const result = mod.removeRegion('snap1');
  expect(result).toBe(true);
  expect(mod.getRegion('snap1')).toBeNull();
});

test('removeRegion returns false for missing entry', () => {
  expect(mod.removeRegion('nope')).toBe(false);
});

test('listByRegion returns matching snapshots', () => {
  mod.setRegion('snap1', 'us-west-2');
  mod.setRegion('snap2', 'us-west-2');
  mod.setRegion('snap3', 'eu-central-1');
  expect(mod.listByRegion('us-west-2').sort()).toEqual(['snap1', 'snap2']);
});

test('getAllRegions returns sorted unique regions', () => {
  mod.setRegion('snap1', 'us-east-1');
  mod.setRegion('snap2', 'eu-west-1');
  mod.setRegion('snap3', 'us-east-1');
  expect(mod.getAllRegions()).toEqual(['eu-west-1', 'us-east-1']);
});
