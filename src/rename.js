const fs = require('fs');
const path = require('path');
const { getSnapshotsDir } = require('./snapshot');

function getSnapshotPath(name) {
  return path.join(getSnapshotsDir(), `${name}.json`);
}

function snapshotExists(name) {
  return fs.existsSync(getSnapshotPath(name));
}

function renameSnapshot(oldName, newName) {
  if (!oldName || typeof oldName !== 'string') {
    throw new Error('Old snapshot name is required');
  }
  if (!newName || typeof newName !== 'string') {
    throw new Error('New snapshot name is required');
  }

  const oldPath = getSnapshotPath(oldName);
  const newPath = getSnapshotPath(newName);

  if (!snapshotExists(oldName)) {
    throw new Error(`Snapshot "${oldName}" does not exist`);
  }

  if (snapshotExists(newName)) {
    throw new Error(`Snapshot "${newName}" already exists`);
  }

  const data = JSON.parse(fs.readFileSync(oldPath, 'utf8'));
  data.name = newName;
  data.renamedAt = new Date().toISOString();
  data.renamedFrom = oldName;

  fs.writeFileSync(newPath, JSON.stringify(data, null, 2));
  fs.unlinkSync(oldPath);

  return { oldName, newName, path: newPath };
}

module.exports = { getSnapshotPath, snapshotExists, renameSnapshot };
