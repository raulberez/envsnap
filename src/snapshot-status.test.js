const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  getStatusFile,
  loadStatuses,
  setStatus,
  getStatus,
  clearStatus,
  filterByStatus,
  formatStatusList,
} = require('./snapshot-status');

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-status-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('getStatusFile returns path inside dir', () => {
  expect(getStatusFile(tmpDir)).toBe(path.join(tmpDir, '.status.json'));
});

test('loadStatuses returns empty object when no file', () => {
  expect(loadStatuses(tmpDir)).toEqual({});
});

test('setStatus saves and getStatus retrieves', () => {
  setStatus('snap1', 'active', tmpDir);
  const result = getStatus('snap1', tmpDir);
  expect(result.status).toBe('active');
  expect(result.updatedAt).toBeTruthy();
});

test('setStatus throws on invalid status', () => {
  expect(() => setStatus('snap1', 'unknown', tmpDir)).toThrow('Invalid status');
});

test('clearStatus removes entry and returns true', () => {
  setStatus('snap1', 'draft', tmpDir);
  expect(clearStatus('snap1', tmpDir)).toBe(true);
  expect(getStatus('snap1', tmpDir)).toBeNull();
});

test('clearStatus returns false if not set', () => {
  expect(clearStatus('nope', tmpDir)).toBe(false);
});

test('filterByStatus returns matching names', () => {
  setStatus('a', 'active', tmpDir);
  setStatus('b', 'draft', tmpDir);
  setStatus('c', 'active', tmpDir);
  const result = filterByStatus(['a', 'b', 'c'], 'active', tmpDir);
  expect(result).toEqual(['a', 'c']);
});

test('formatStatusList returns readable string', () => {
  setStatus('mysnap', 'deprecated', tmpDir);
  const statuses = loadStatuses(tmpDir);
  const out = formatStatusList(statuses);
  expect(out).toContain('mysnap');
  expect(out).toContain('deprecated');
});

test('formatStatusList handles empty', () => {
  expect(formatStatusList({})).toBe('No statuses set.');
});
