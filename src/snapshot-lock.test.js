const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  getLockFile,
  lockSnapshot,
  unlockSnapshot,
  isLocked,
  getLockInfo,
  listLocked,
  formatLockList,
} = require('./snapshot-lock');

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-lock-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('lockSnapshot creates a lock entry', () => {
  lockSnapshot('mysnap', 'production env', tmpDir);
  expect(isLocked('mysnap', tmpDir)).toBe(true);
});

test('isLocked returns false when not locked', () => {
  expect(isLocked('nosnap', tmpDir)).toBe(false);
});

test('getLockInfo returns reason and lockedAt', () => {
  lockSnapshot('mysnap', 'do not delete', tmpDir);
  const info = getLockInfo('mysnap', tmpDir);
  expect(info.reason).toBe('do not delete');
  expect(info.lockedAt).toBeDefined();
});

test('unlockSnapshot removes the lock', () => {
  lockSnapshot('mysnap', '', tmpDir);
  unlockSnapshot('mysnap', tmpDir);
  expect(isLocked('mysnap', tmpDir)).toBe(false);
});

test('unlockSnapshot throws if not locked', () => {
  expect(() => unlockSnapshot('ghost', tmpDir)).toThrow("Snapshot 'ghost' is not locked");
});

test('listLocked returns all locked entries', () => {
  lockSnapshot('a', 'reason a', tmpDir);
  lockSnapshot('b', '', tmpDir);
  const locks = listLocked(tmpDir);
  expect(Object.keys(locks)).toEqual(expect.arrayContaining(['a', 'b']));
});

test('formatLockList handles empty locks', () => {
  expect(formatLockList({})).toBe('No locked snapshots.');
});

test('formatLockList formats entries', () => {
  lockSnapshot('prod', 'stable', tmpDir);
  const locks = listLocked(tmpDir);
  const output = formatLockList(locks);
  expect(output).toContain('prod');
  expect(output).toContain('stable');
});
