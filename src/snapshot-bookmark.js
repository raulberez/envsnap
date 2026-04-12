const fs = require('fs');
const path = require('path');
const { getSnapshotsDir } = require('./snapshot');

function getBookmarksFile() {
  return path.join(getSnapshotsDir(), 'bookmarks.json');
}

function loadBookmarks() {
  const file = getBookmarksFile();
  if (!fs.existsSync(file)) return {};
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return {};
  }
}

function saveBookmarks(bookmarks) {
  const file = getBookmarksFile();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(bookmarks, null, 2));
}

function addBookmark(snapshotName, label) {
  const bookmarks = loadBookmarks();
  if (!bookmarks[snapshotName]) bookmarks[snapshotName] = [];
  if (!bookmarks[snapshotName].includes(label)) {
    bookmarks[snapshotName].push(label);
  }
  saveBookmarks(bookmarks);
  return bookmarks[snapshotName];
}

function removeBookmark(snapshotName, label) {
  const bookmarks = loadBookmarks();
  if (!bookmarks[snapshotName]) return [];
  bookmarks[snapshotName] = bookmarks[snapshotName].filter(l => l !== label);
  if (bookmarks[snapshotName].length === 0) delete bookmarks[snapshotName];
  saveBookmarks(bookmarks);
  return bookmarks[snapshotName] || [];
}

function getBookmarks(snapshotName) {
  const bookmarks = loadBookmarks();
  return bookmarks[snapshotName] || [];
}

function findByBookmark(label) {
  const bookmarks = loadBookmarks();
  return Object.entries(bookmarks)
    .filter(([, labels]) => labels.includes(label))
    .map(([name]) => name);
}

function formatBookmarks(bookmarks) {
  const entries = Object.entries(bookmarks);
  if (entries.length === 0) return 'No bookmarks found.';
  return entries
    .map(([name, labels]) => `  ${name}: ${labels.join(', ')}`)
    .join('\n');
}

module.exports = {
  getBookmarksFile,
  loadBookmarks,
  saveBookmarks,
  addBookmark,
  removeBookmark,
  getBookmarks,
  findByBookmark,
  formatBookmarks,
};
