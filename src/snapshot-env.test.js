const fs = require('fs');
const os = require('os');
const path = require('path');

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-env-test-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

function getModule() {
  jest.resetModules();
  jest.doMock('./snapshot', () => ({ getSnapshotsDir: () => tmpDir }));
  return require('./snapshot-env');
}

test('loadEnvMap returns empty object when file missing', () => {
  const { loadEnvMap } = getModule();
  expect(loadEnvMap(tmpDir)).toEqual({});
});

test('setEnvMapping and getEnvMapping round-trip', () => {
  const { setEnvMapping, getEnvMapping } = getModule();
  setEnvMapping('snap1', 'production', tmpDir);
  expect(getEnvMapping('snap1', tmpDir)).toBe('production');
});

test('getEnvMapping returns null for unknown snapshot', () => {
  const { getEnvMapping } = getModule();
  expect(getEnvMapping('nope', tmpDir)).toBeNull();
});

test('removeEnvMapping removes existing entry', () => {
  const { setEnvMapping, removeEnvMapping, getEnvMapping } = getModule();
  setEnvMapping('snap2', 'staging', tmpDir);
  const result = removeEnvMapping('snap2', tmpDir);
  expect(result).toBe(true);
  expect(getEnvMapping('snap2', tmpDir)).toBeNull();
});

test('removeEnvMapping returns false for missing entry', () => {
  const { removeEnvMapping } = getModule();
  expect(removeEnvMapping('ghost', tmpDir)).toBe(false);
});

test('listEnvMappings returns all mappings', () => {
  const { setEnvMapping, listEnvMappings } = getModule();
  setEnvMapping('a', 'dev', tmpDir);
  setEnvMapping('b', 'prod', tmpDir);
  const map = listEnvMappings(tmpDir);
  expect(map).toEqual({ a: 'dev', b: 'prod' });
});

test('formatEnvMappings shows message when empty', () => {
  const { formatEnvMappings } = getModule();
  expect(formatEnvMappings({})).toBe('No environment mappings found.');
});

test('formatEnvMappings formats entries correctly', () => {
  const { formatEnvMappings } = getModule();
  const result = formatEnvMappings({ snap1: 'production', snap2: 'staging' });
  expect(result).toContain('snap1 -> production');
  expect(result).toContain('snap2 -> staging');
});
