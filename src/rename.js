const fs = require('fs');
const path = require('path');
const { getSnapshotsDir } = require('./snapshot');
const { loadTags, saveTags } = require('./tag');

function getSnapshotPath(name) {
  return path.join(getSnapshotsDir(), `${name}.json`);
}

function snapshotExists(name) {
  return fs.existsSync(getSnapshotPath(name));
}

function renameSnapshot(oldName, newName) {
  if (!oldName || !newName) {
    throw new Error('Both old and new names are required');
  }

  if (oldName === newName) {
    throw new Error('Old and new names must be different');
  }

  if (!snapshotExists(oldName)) {
    throw new Error(`Snapshot "${oldName}" does not exist`);
  }

  if (snapshotExists(newName)) {
    throw new Error(`Snapshot "${newName}" already exists`);
  }

  const oldPath = getSnapshotPath(oldName);
  const newPath = getSnapshotPath(newName);

  const data = JSON.parse(fs.readFileSync(oldPath, 'utf8'));
  data.name = newName;
  fs.writeFileSync(newPath, JSON.stringify(data, null, 2));
  fs.unlinkSync(oldPath);

  // update tags references
  const tags = loadTags();
  let tagsChanged = false;
  for (const [tag, snapshots] of Object.entries(tags)) {
    const idx = snapshots.indexOf(oldName);
    if (idx !== -1) {
      snapshots[idx] = newName;
      tagsChanged = true;
    }
  }
  if (tagsChanged) {
    saveTags(tags);
  }

  return { oldName, newName };
}

module.exports = { renameSnapshot, snapshotExists };
