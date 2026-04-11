const fs = require('fs');
const path = require('path');
const os = require('os');
const { pinSnapshot, unpinSnapshot, isPinned, listPinned, formatPinList } = require('./pin');

function writeSnap(dir, name, data) {
  fs.writeFileSync(path.join(dir, `${name}.json`), JSON.stringify(data));
}

let tmpDir;
beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-pin-'));
});
afterEach(() => fs.rmSync(tmpDir, { recursive: true }));

test('pinSnapshot adds entry to pins file', () => {
  writeSnap(tmpDir, 'mysnap', { FOO: 'bar' });
  const result = pinSnapshot('mysnap', 'keep this one', tmpDir);
  expect(result.note).toBe('keep this one');
  expect(result.pinnedAt).toBeDefined();
  expect(isPinned('mysnap', tmpDir)).toBe(true);
});

test('pinSnapshot throws if snapshot does not exist', () => {
  expect(() => pinSnapshot('ghost', '', tmpDir)).toThrow('does not exist');
});

test('unpinSnapshot removes entry', () => {
  writeSnap(tmpDir, 'mysnap', { FOO: 'bar' });
  pinSnapshot('mysnap', '', tmpDir);
  unpinSnapshot('mysnap', tmpDir);
  expect(isPinned('mysnap', tmpDir)).toBe(false);
});

test('unpinSnapshot throws if not pinned', () => {
  expect(() => unpinSnapshot('nope', tmpDir)).toThrow('is not pinned');
});

test('listPinned returns all pinned entries', () => {
  writeSnap(tmpDir, 'a', {});
  writeSnap(tmpDir, 'b', {});
  pinSnapshot('a', 'note a', tmpDir);
  pinSnapshot('b', '', tmpDir);
  const pins = listPinned(tmpDir);
  expect(Object.keys(pins)).toEqual(expect.arrayContaining(['a', 'b']));
});

test('formatPinList returns message when empty', () => {
  expect(formatPinList({})).toBe('No pinned snapshots.');
});

test('formatPinList formats entries with notes', () => {
  const pins = { prod: { note: 'production', pinnedAt: '2024-01-01T00:00:00.000Z' } };
  const output = formatPinList(pins);
  expect(output).toContain('prod');
  expect(output).toContain('production');
  expect(output).toContain('📌');
});
