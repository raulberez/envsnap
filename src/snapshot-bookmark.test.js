const fs = require('fs');
const path = require('path');
const os = require('os');
const {
  getBookmarksFile,
  addBookmark,
  removeBookmark,
  getBookmark,
  listBookmarks,
  formatBookmarks,
} = require('./snapshot-bookmark');

function getModule(dir) {
  return {
    getBookmarksFile: () => getBookmarksFile(dir),
    addBookmark: (name, label) => addBookmark(name, label, dir),
    removeBookmark: (name) => removeBookmark(name, dir),
    getBookmark: (name) => getBookmark(name, dir),
    listBookmarks: () => listBookmarks(dir),
  };
}

let tmpDir;
beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-bm-'));
});
afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('addBookmark stores a bookmark', () => {
  const m = getModule(tmpDir);
  const bm = m.addBookmark('snap1', 'My Snap');
  expect(bm.label).toBe('My Snap');
  expect(bm.createdAt).toBeDefined();
});

test('addBookmark uses name as label if none given', () => {
  const m = getModule(tmpDir);
  const bm = m.addBookmark('snap2');
  expect(bm.label).toBe('snap2');
});

test('getBookmark retrieves existing bookmark', () => {
  const m = getModule(tmpDir);
  m.addBookmark('snap3', 'Test');
  const bm = m.getBookmark('snap3');
  expect(bm).not.toBeNull();
  expect(bm.label).toBe('Test');
});

test('getBookmark returns null for missing bookmark', () => {
  const m = getModule(tmpDir);
  expect(m.getBookmark('nope')).toBeNull();
});

test('removeBookmark deletes a bookmark', () => {
  const m = getModule(tmpDir);
  m.addBookmark('snap4', 'Del');
  expect(m.removeBookmark('snap4')).toBe(true);
  expect(m.getBookmark('snap4')).toBeNull();
});

test('removeBookmark returns false for missing', () => {
  const m = getModule(tmpDir);
  expect(m.removeBookmark('ghost')).toBe(false);
});

test('listBookmarks returns all bookmarks', () => {
  const m = getModule(tmpDir);
  m.addBookmark('a', 'A');
  m.addBookmark('b', 'B');
  const all = m.listBookmarks();
  expect(Object.keys(all)).toHaveLength(2);
});

test('formatBookmarks returns message when empty', () => {
  expect(formatBookmarks({})).toBe('No bookmarks found.');
});

test('formatBookmarks lists bookmarks', () => {
  const bms = { snap1: { label: 'Hello', createdAt: '2024-01-01T00:00:00.000Z' } };
  const out = formatBookmarks(bms);
  expect(out).toContain('snap1');
  expect(out).toContain('Hello');
});
