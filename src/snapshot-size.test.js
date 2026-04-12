const fs = require('fs');
const path = require('path');
const os = require('os');
const { computeSize, formatSize, loadSnapshot } = require('./snapshot-size');

jest.mock('./snapshot', () => ({
  getSnapshotsDir: () => tmpDir,
}));

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-size-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

function writeSnap(name, data) {
  fs.writeFileSync(path.join(tmpDir, `${name}.json`), JSON.stringify(data));
}

test('computeSize returns correct keyCount', () => {
  const snap = { vars: { FOO: 'bar', BAZ: 'qux' } };
  const result = computeSize(snap);
  expect(result.keyCount).toBe(2);
});

test('computeSize totalBytes counts key and value bytes', () => {
  const snap = { vars: { A: '123' } };
  const result = computeSize(snap);
  expect(result.totalBytes).toBe(Buffer.byteLength('A') + Buffer.byteLength('123'));
});

test('computeSize handles empty vars', () => {
  const snap = { vars: {} };
  const result = computeSize(snap);
  expect(result.keyCount).toBe(0);
  expect(result.totalBytes).toBe(0);
  expect(result.avgValueLength).toBe(0);
});

test('computeSize avgValueLength is correct', () => {
  const snap = { vars: { A: 'ab', B: 'abcd' } };
  const result = computeSize(snap);
  expect(result.avgValueLength).toBe(3);
});

test('formatSize returns a string with snapshot name', () => {
  const info = { keyCount: 3, totalBytes: 50, avgValueLength: 4.5, rawJson: 120 };
  const out = formatSize('mysnap', info);
  expect(out).toContain('mysnap');
  expect(out).toContain('3');
  expect(out).toContain('50 B');
});

test('loadSnapshot throws if snapshot missing', () => {
  expect(() => loadSnapshot('nonexistent')).toThrow('not found');
});

test('loadSnapshot returns parsed snapshot', () => {
  writeSnap('proj', { vars: { X: '1' } });
  const snap = loadSnapshot('proj');
  expect(snap.vars.X).toBe('1');
});
