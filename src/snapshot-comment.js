const fs = require('fs');
const path = require('path');
const { getSnapshotsDir } = require('./snapshot');

function getCommentsFile(snapshotsDir) {
  return path.join(snapshotsDir || getSnapshotsDir(), 'comments.json');
}

function loadComments(snapshotsDir) {
  const file = getCommentsFile(snapshotsDir);
  if (!fs.existsSync(file)) return {};
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return {};
  }
}

function saveComments(comments, snapshotsDir) {
  const file = getCommentsFile(snapshotsDir);
  fs.writeFileSync(file, JSON.stringify(comments, null, 2));
}

function setComment(name, comment, snapshotsDir) {
  const comments = loadComments(snapshotsDir);
  comments[name] = { text: comment, updatedAt: new Date().toISOString() };
  saveComments(comments, snapshotsDir);
  return comments[name];
}

function getComment(name, snapshotsDir) {
  const comments = loadComments(snapshotsDir);
  return comments[name] || null;
}

function deleteComment(name, snapshotsDir) {
  const comments = loadComments(snapshotsDir);
  if (!comments[name]) return false;
  delete comments[name];
  saveComments(comments, snapshotsDir);
  return true;
}

function listComments(snapshotsDir) {
  return loadComments(snapshotsDir);
}

function formatComment(name, entry) {
  if (!entry) return `No comment for "${name}".`;
  return `${name}: ${entry.text}  (updated ${entry.updatedAt})`;
}

module.exports = {
  getCommentsFile,
  loadComments,
  saveComments,
  setComment,
  getComment,
  deleteComment,
  listComments,
  formatComment,
};
