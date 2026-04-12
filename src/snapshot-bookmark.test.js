const fs = require('fs');
const os = require('os');
const path = require('path');

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-bookmark-'));
  jest.resetModules();
  jest.doMock('./snapshot', () => ({ getSnapshotsDir: () => tmpDir }));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
  jest.resetModules();
});

function getModule() {
  return require('./snapshot-bookmark');
}

test('loadBookmarks returns empty object when no file', () => {
  const { loadBookmarks } = getModule();
  expect(loadBookmarks()).toEqual({});
});

test('addBookmark creates and stores a label', () => {
  const { addBookmark, getBookmarks } = getModule();
  addBookmark('snap1', 'important');
  expect(getBookmarks('snap1')).toEqual(['important']);
});

test('addBookmark does not duplicate labels', () => {
  const { addBookmark, getBookmarks } = getModule();
  addBookmark('snap1', 'important');
  addBookmark('snap1', 'important');
  expect(getBookmarks('snap1')).toEqual(['important']);
});

test('addBookmark supports multiple labels per snapshot', () => {
  const { addBookmark, getBookmarks } = getModule();
  addBookmark('snap1', 'alpha');
  addBookmark('snap1', 'beta');
  expect(getBookmarks('snap1')).toEqual(['alpha', 'beta']);
});

test('removeBookmark removes a label', () => {
  const { addBookmark, removeBookmark, getBookmarks } = getModule();
  addBookmark('snap1', 'alpha');
  addBookmark('snap1', 'beta');
  removeBookmark('snap1', 'alpha');
  expect(getBookmarks('snap1')).toEqual(['beta']);
});

test('removeBookmark cleans up empty entries', () => {
  const { addBookmark, removeBookmark, loadBookmarks } = getModule();
  addBookmark('snap1', 'only');
  removeBookmark('snap1', 'only');
  expect(loadBookmarks()).toEqual({});
});

test('findByBookmark returns snapshots with given label', () => {
  const { addBookmark, findByBookmark } = getModule();
  addBookmark('snap1', 'prod');
  addBookmark('snap2', 'prod');
  addBookmark('snap3', 'dev');
  expect(findByBookmark('prod').sort()).toEqual(['snap1', 'snap2']);
});

test('formatBookmarks returns message when empty', () => {
  const { formatBookmarks } = getModule();
  expect(formatBookmarks({})).toBe('No bookmarks found.');
});

test('formatBookmarks lists all entries', () => {
  const { formatBookmarks } = getModule();
  const result = formatBookmarks({ snap1: ['prod', 'stable'], snap2: ['dev'] });
  expect(result).toContain('snap1: prod, stable');
  expect(result).toContain('snap2: dev');
});
