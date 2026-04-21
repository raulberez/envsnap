const fs = require('fs');
const os = require('os');
const path = require('path');

let tmpDir;
let mod;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-retention-'));
  jest.resetModules();
  jest.doMock('./snapshot', () => ({ getSnapshotsDir: () => tmpDir }));
  mod = require('./snapshot-retention');
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('loadRetentions returns empty object when no file', () => {
  expect(mod.loadRetentions(tmpDir)).toEqual({});
});

test('setRetention stores policy and returns entry', () => {
  const entry = mod.setRetention('snap1', 7, tmpDir);
  expect(entry.days).toBe(7);
  expect(entry.expiresAt).toBeDefined();
  expect(entry.setAt).toBeDefined();
});

test('getRetention retrieves stored policy', () => {
  mod.setRetention('snap1', 30, tmpDir);
  const entry = mod.getRetention('snap1', tmpDir);
  expect(entry.days).toBe(30);
});

test('getRetention returns null for unknown snapshot', () => {
  expect(mod.getRetention('nope', tmpDir)).toBeNull();
});

test('removeRetention deletes policy', () => {
  mod.setRetention('snap1', 5, tmpDir);
  const result = mod.removeRetention('snap1', tmpDir);
  expect(result).toBe(true);
  expect(mod.getRetention('snap1', tmpDir)).toBeNull();
});

test('removeRetention returns false for missing snapshot', () => {
  expect(mod.removeRetention('ghost', tmpDir)).toBe(false);
});

test('isExpired returns false for future expiry', () => {
  mod.setRetention('snap1', 10, tmpDir);
  expect(mod.isExpired('snap1', tmpDir)).toBe(false);
});

test('isExpired returns true for past expiry', () => {
  const retentions = { snap1: { days: 1, expiresAt: new Date(Date.now() - 1000).toISOString(), setAt: new Date().toISOString() } };
  fs.writeFileSync(mod.getRetentionFile(tmpDir), JSON.stringify(retentions));
  expect(mod.isExpired('snap1', tmpDir)).toBe(true);
});

test('listExpired returns only expired entries', () => {
  mod.setRetention('active', 10, tmpDir);
  const retentions = mod.loadRetentions(tmpDir);
  retentions['old'] = { days: 1, expiresAt: new Date(Date.now() - 5000).toISOString(), setAt: new Date().toISOString() };
  mod.saveRetentions(retentions, tmpDir);
  const expired = mod.listExpired(tmpDir);
  expect(expired).toHaveLength(1);
  expect(expired[0].name).toBe('old');
});

test('formatRetentionList shows message when empty', () => {
  expect(mod.formatRetentionList({})).toBe('No retention policies set.');
});

test('setRetention throws for invalid days', () => {
  expect(() => mod.setRetention('snap1', -1, tmpDir)).toThrow();
  expect(() => mod.setRetention('snap1', 0, tmpDir)).toThrow();
});
