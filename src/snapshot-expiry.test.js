const fs = require('fs');
const os = require('os');
const path = require('path');

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-expiry-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

function getModule() {
  jest.resetModules();
  jest.doMock('./snapshot', () => ({ getSnapshotsDir: () => tmpDir }));
  return require('./snapshot-expiry');
}

test('loadExpiries returns empty object when no file', () => {
  const { loadExpiries } = getModule();
  expect(loadExpiries(tmpDir)).toEqual({});
});

test('setExpiry and getExpiry round-trip', () => {
  const { setExpiry, getExpiry } = getModule();
  const future = new Date(Date.now() + 86400000).toISOString();
  setExpiry('snap1', future, tmpDir);
  expect(getExpiry('snap1', tmpDir)).toBe(future);
});

test('clearExpiry removes entry', () => {
  const { setExpiry, getExpiry, clearExpiry } = getModule();
  setExpiry('snap2', new Date().toISOString(), tmpDir);
  clearExpiry('snap2', tmpDir);
  expect(getExpiry('snap2', tmpDir)).toBeNull();
});

test('isExpired returns true for past date', () => {
  const { setExpiry, isExpired } = getModule();
  const past = new Date(Date.now() - 1000).toISOString();
  setExpiry('snap3', past, tmpDir);
  expect(isExpired('snap3', tmpDir)).toBe(true);
});

test('isExpired returns false for future date', () => {
  const { setExpiry, isExpired } = getModule();
  const future = new Date(Date.now() + 86400000).toISOString();
  setExpiry('snap4', future, tmpDir);
  expect(isExpired('snap4', tmpDir)).toBe(false);
});

test('isExpired returns false when no expiry set', () => {
  const { isExpired } = getModule();
  expect(isExpired('no-such-snap', tmpDir)).toBe(false);
});

test('listExpired returns only expired entries', () => {
  const { setExpiry, listExpired } = getModule();
  const past = new Date(Date.now() - 1000).toISOString();
  const future = new Date(Date.now() + 86400000).toISOString();
  setExpiry('old', past, tmpDir);
  setExpiry('new', future, tmpDir);
  const expired = listExpired(tmpDir);
  expect(expired).toHaveLength(1);
  expect(expired[0].name).toBe('old');
});

test('formatExpiryList returns message when empty', () => {
  const { formatExpiryList } = getModule();
  expect(formatExpiryList([])).toBe('No expired snapshots.');
});

test('formatExpiryList lists expired entries', () => {
  const { formatExpiryList } = getModule();
  const entries = [{ name: 'snap-x', expiresAt: new Date('-01-01').toISOString() }];
  const result = formatExpiryList(entries);
  expect(result).toContain('snap-x');
  expect(result).toContain('Expired snapshots:');
});
