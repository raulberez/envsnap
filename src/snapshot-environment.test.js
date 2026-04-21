const fs = require('fs');
const path = require('path');
const os = require('os');

let tmpDir;
let mod;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-env-test-'));
  jest.resetModules();
  jest.doMock('./snapshot', () => ({ getSnapshotsDir: () => tmpDir }));
  mod = require('./snapshot-environment');
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('returns null for unknown snapshot', () => {
  expect(mod.getEnvironment('no-such-snap')).toBeNull();
});

test('sets and gets environment', () => {
  mod.setEnvironment('snap1', 'production');
  expect(mod.getEnvironment('snap1')).toBe('production');
});

test('normalizes environment to lowercase', () => {
  mod.setEnvironment('snap2', 'Staging');
  expect(mod.getEnvironment('snap2')).toBe('staging');
});

test('throws on empty environment string', () => {
  expect(() => mod.setEnvironment('snap3', '')).toThrow();
});

test('removes environment', () => {
  mod.setEnvironment('snap4', 'development');
  const removed = mod.removeEnvironment('snap4');
  expect(removed).toBe(true);
  expect(mod.getEnvironment('snap4')).toBeNull();
});

test('removeEnvironment returns false if not set', () => {
  expect(mod.removeEnvironment('ghost')).toBe(false);
});

test('listByEnvironment returns matching snapshots', () => {
  mod.setEnvironment('a', 'production');
  mod.setEnvironment('b', 'staging');
  mod.setEnvironment('c', 'production');
  const prod = mod.listByEnvironment('production');
  expect(prod).toContain('a');
  expect(prod).toContain('c');
  expect(prod).not.toContain('b');
});

test('getAllEnvironments returns unique sorted list', () => {
  mod.setEnvironment('x', 'production');
  mod.setEnvironment('y', 'staging');
  mod.setEnvironment('z', 'production');
  const all = mod.getAllEnvironments();
  expect(all).toEqual(['production', 'staging']);
});

test('persists across reloads', () => {
  mod.setEnvironment('persist-snap', 'qa');
  jest.resetModules();
  jest.doMock('./snapshot', () => ({ getSnapshotsDir: () => tmpDir }));
  const mod2 = require('./snapshot-environment');
  expect(mod2.getEnvironment('persist-snap')).toBe('qa');
});
