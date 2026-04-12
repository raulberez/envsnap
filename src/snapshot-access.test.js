const fs = require('fs');
const path = require('path');
const os = require('os');
const {
  getAccessFile,
  loadAccessLog,
  recordAccess,
  getAccessStats,
  clearAccessStats,
  formatAccessStats,
} = require('./snapshot-access');

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-access-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('getAccessFile returns path inside dir', () => {
  const f = getAccessFile(tmpDir);
  expect(f).toBe(path.join(tmpDir, 'access.json'));
});

test('loadAccessLog returns empty object when file missing', () => {
  expect(loadAccessLog(tmpDir)).toEqual({});
});

test('recordAccess creates entry on first read', () => {
  const entry = recordAccess('mysnap', 'read', tmpDir);
  expect(entry.reads).toBe(1);
  expect(entry.writes).toBe(0);
  expect(entry.lastRead).not.toBeNull();
  expect(entry.lastWrite).toBeNull();
});

test('recordAccess increments writes', () => {
  recordAccess('mysnap', 'write', tmpDir);
  const entry = recordAccess('mysnap', 'write', tmpDir);
  expect(entry.writes).toBe(2);
});

test('recordAccess accumulates reads and writes separately', () => {
  recordAccess('s1', 'read', tmpDir);
  recordAccess('s1', 'read', tmpDir);
  recordAccess('s1', 'write', tmpDir);
  const stats = getAccessStats('s1', tmpDir);
  expect(stats.reads).toBe(2);
  expect(stats.writes).toBe(1);
});

test('getAccessStats returns null for unknown snapshot', () => {
  expect(getAccessStats('nope', tmpDir)).toBeNull();
});

test('clearAccessStats removes entry', () => {
  recordAccess('s2', 'read', tmpDir);
  const removed = clearAccessStats('s2', tmpDir);
  expect(removed).toBe(true);
  expect(getAccessStats('s2', tmpDir)).toBeNull();
});

test('clearAccessStats returns false for missing entry', () => {
  expect(clearAccessStats('ghost', tmpDir)).toBe(false);
});

test('formatAccessStats formats correctly', () => {
  recordAccess('snap', 'read', tmpDir);
  const stats = getAccessStats('snap', tmpDir);
  const out = formatAccessStats('snap', stats);
  expect(out).toMatch('snap');
  expect(out).toMatch('Reads : 1');
  expect(out).toMatch('Writes: 0');
});

test('formatAccessStats handles null stats', () => {
  const out = formatAccessStats('missing', null);
  expect(out).toMatch('No access data');
});
