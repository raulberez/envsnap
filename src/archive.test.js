const fs = require('fs');
const path = require('path');
const os = require('os');
const { archiveSnapshot, unarchiveSnapshot, listArchived, getArchiveDir } = require('./archive');

function writeSnap(dir, name, data) {
  fs.writeFileSync(path.join(dir, `${name}.json`), JSON.stringify(data));
}

let tmpDir;
beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-archive-'));
});
afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('archiveSnapshot moves snapshot to archive dir', () => {
  writeSnap(tmpDir, 'mysnap', { FOO: 'bar' });
  const dest = archiveSnapshot('mysnap', tmpDir);
  expect(fs.existsSync(dest)).toBe(true);
  expect(fs.existsSync(path.join(tmpDir, 'mysnap.json'))).toBe(false);
});

test('archiveSnapshot throws if snapshot not found', () => {
  expect(() => archiveSnapshot('nope', tmpDir)).toThrow('not found');
});

test('unarchiveSnapshot restores latest archived snapshot', () => {
  writeSnap(tmpDir, 'snap1', { A: '1' });
  archiveSnapshot('snap1', tmpDir);
  const dest = unarchiveSnapshot('snap1', tmpDir);
  expect(fs.existsSync(dest)).toBe(true);
  expect(fs.existsSync(path.join(tmpDir, 'snap1.json'))).toBe(true);
});

test('unarchiveSnapshot throws if nothing archived', () => {
  expect(() => unarchiveSnapshot('ghost', tmpDir)).toThrow('No archived snapshot');
});

test('unarchiveSnapshot throws if active snapshot already exists', () => {
  writeSnap(tmpDir, 'dup', { X: '1' });
  archiveSnapshot('dup', tmpDir);
  writeSnap(tmpDir, 'dup', { X: '2' });
  expect(() => unarchiveSnapshot('dup', tmpDir)).toThrow('already exists');
});

test('listArchived returns archived entries sorted newest first', () => {
  writeSnap(tmpDir, 'a', { K: 'v' });
  archiveSnapshot('a', tmpDir);
  writeSnap(tmpDir, 'b', { K: 'v2' });
  archiveSnapshot('b', tmpDir);
  const list = listArchived(tmpDir);
  expect(list.length).toBe(2);
  expect(list[0]).toHaveProperty('name');
  expect(list[0]).toHaveProperty('archivedAt');
});

test('listArchived returns empty array when no archive dir', () => {
  expect(listArchived(tmpDir)).toEqual([]);
});
