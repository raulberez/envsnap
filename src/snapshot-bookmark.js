const fs = require('fs');
const path = require('path');
const { getSnapshotsDir } = require('./snapshot');

function getBookmarksFile(dir) {
  return path.join(dir || getSnapshotsDir(), '.bookmarks.json');
}

function loadBookmarks(dir) {
  const file = getBookmarksFile(dir);
  if (!fs.existsSync(file)) return {};
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return {};
  }
}

function saveBookmarks(bookmarks, dir) {
  const file = getBookmarksFile(dir);
  fs.writeFileSync(file, JSON.stringify(bookmarks, null, 2));
}

function addBookmark(name, label, dir) {
  const bookmarks = loadBookmarks(dir);
  bookmarks[name] = { label: label || name, createdAt: new Date().toISOString() };
  saveBookmarks(bookmarks, dir);
  return bookmarks[name];
}

function removeBookmark(name, dir) {
  const bookmarks = loadBookmarks(dir);
  if (!bookmarks[name]) return false;
  delete bookmarks[name];
  saveBookmarks(bookmarks, dir);
  return true;
}

function getBookmark(name, dir) {
  const bookmarks = loadBookmarks(dir);
  return bookmarks[name] || null;
}

function listBookmarks(dir) {
  return loadBookmarks(dir);
}

function formatBookmarks(bookmarks) {
  const entries = Object.entries(bookmarks);
  if (entries.length === 0) return 'No bookmarks found.';
  return entries
    .map(([name, info]) => `  ${name} — "${info.label}" (${info.createdAt})`)
    .join('\n');
}

module.exports = {
  getBookmarksFile,
  loadBookmarks,
  saveBookmarks,
  addBookmark,
  removeBookmark,
  getBookmark,
  listBookmarks,
  formatBookmarks,
};
