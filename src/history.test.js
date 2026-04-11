const fs = require('fs');
const os = require('os');
const path = require('path');

let tmpDir;
beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-history-'));
  jest.resetModules();
  jest.doMock('./snapshot', () => ({ getSnapshotsDir: () => tmpDir }));
});
afterEach(() => fs.rmSync(tmpDir, { recursive: true }));

function getModule() {
  return require('./history');
}

test('loadHistory returns empty array when no file', () => {
  const { loadHistory } = getModule();
  expect(loadHistory('mysnap')).toEqual([]);
});

test('recordHistoryEntry creates and appends entries', () => {
  const { recordHistoryEntry, loadHistory } = getModule();
  recordHistoryEntry('mysnap', 'created');
  recordHistoryEntry('mysnap', 'renamed', { from: 'oldname' });
  const entries = loadHistory('mysnap');
  expect(entries).toHaveLength(2);
  expect(entries[0].action).toBe('created');
  expect(entries[1].action).toBe('renamed');
  expect(entries[1].from).toBe('oldname');
  expect(entries[0].timestamp).toBeTruthy();
});

test('clearHistory removes the history file', () => {
  const { recordHistoryEntry, clearHistory, loadHistory } = getModule();
  recordHistoryEntry('mysnap', 'created');
  clearHistory('mysnap');
  expect(loadHistory('mysnap')).toEqual([]);
});

test('formatHistory shows no history message when empty', () => {
  const { formatHistory } = getModule();
  const out = formatHistory('mysnap', []);
  expect(out).toMatch(/No history found/);
});

test('formatHistory renders entries', () => {
  const { recordHistoryEntry, loadHistory, formatHistory } = getModule();
  recordHistoryEntry('mysnap', 'exported', { format: 'json' });
  const entries = loadHistory('mysnap');
  const out = formatHistory('mysnap', entries);
  expect(out).toMatch(/exported/);
  expect(out).toMatch(/format=json/);
  expect(out).toMatch(/mysnap/);
});
