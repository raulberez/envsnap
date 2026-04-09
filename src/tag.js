const fs = require('fs');
const path = require('path');
const { getSnapshotsDir } = require('./snapshot');

function getTagsFile() {
  return path.join(getSnapshotsDir(), 'tags.json');
}

function loadTags() {
  const tagsFile = getTagsFile();
  if (!fs.existsSync(tagsFile)) return {};
  try {
    return JSON.parse(fs.readFileSync(tagsFile, 'utf8'));
  } catch {
    return {};
  }
}

function saveTags(tags) {
  const tagsFile = getTagsFile();
  fs.writeFileSync(tagsFile, JSON.stringify(tags, null, 2));
}

function addTag(snapshotName, tag) {
  const tags = loadTags();
  if (!tags[tag]) tags[tag] = [];
  if (!tags[tag].includes(snapshotName)) {
    tags[tag].push(snapshotName);
  }
  saveTags(tags);
  return tags;
}

function removeTag(snapshotName, tag) {
  const tags = loadTags();
  if (!tags[tag]) return tags;
  tags[tag] = tags[tag].filter(n => n !== snapshotName);
  if (tags[tag].length === 0) delete tags[tag];
  saveTags(tags);
  return tags;
}

function getSnapshotsByTag(tag) {
  const tags = loadTags();
  return tags[tag] || [];
}

function getTagsForSnapshot(snapshotName) {
  const tags = loadTags();
  return Object.entries(tags)
    .filter(([, names]) => names.includes(snapshotName))
    .map(([tag]) => tag);
}

function listAllTags() {
  return loadTags();
}

module.exports = {
  addTag,
  removeTag,
  getSnapshotsByTag,
  getTagsForSnapshot,
  listAllTags,
  getTagsFile,
};
