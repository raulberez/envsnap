const fs = require('fs');
const os = require('os');
const path = require('path');

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-priority-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

function getModule() {
  jest.resetModules();
  jest.doMock('./snapshot', () => ({ getSnapshotsDir: () => tmpDir }));
  return require('./snapshot-priority');
}

test('returns null for unknown snapshot', () => {
  const { getPriority } = getModule();
  expect(getPriority('missing', tmpDir)).toBeNull();
});

test('sets and gets a priority', () => {
  const { setPriority, getPriority } = getModule();
  setPriority('snap1', 'high', tmpDir);
  expect(getPriority('snap1', tmpDir)).toBe('high');
});

test('throws on invalid priority', () => {
  const { setPriority } = getModule();
  expect(() => setPriority('snap1', 'urgent', tmpDir)).toThrow('Invalid priority');
});

test('removes a priority', () => {
  const { setPriority, removePriority, getPriority } = getModule();
  setPriority('snap1', 'low', tmpDir);
  const removed = removePriority('snap1', tmpDir);
  expect(removed).toBe(true);
  expect(getPriority('snap1', tmpDir)).toBeNull();
});

test('removePriority returns false if not set', () => {
  const { removePriority } = getModule();
  expect(removePriority('nope', tmpDir)).toBe(false);
});

test('filterByPriority returns matching names', () => {
  const { setPriority, filterByPriority } = getModule();
  setPriority('a', 'high', tmpDir);
  setPriority('b', 'low', tmpDir);
  setPriority('c', 'high', tmpDir);
  const result = filterByPriority(['a', 'b', 'c'], 'high', tmpDir);
  expect(result).toEqual(['a', 'c']);
});

test('formatPriorityList shows no priorities message', () => {
  const { formatPriorityList } = getModule();
  expect(formatPriorityList({})).toBe('No priorities set.');
});

test('formatPriorityList sorts by priority level', () => {
  const { formatPriorityList } = getModule();
  const output = formatPriorityList({ a: 'low', b: 'critical', c: 'medium' });
  const lines = output.split('\n');
  expect(lines[0]).toContain('b: critical');
  expect(lines[lines.length - 1]).toContain('a: low');
});
