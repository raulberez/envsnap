const fs = require('fs');
const path = require('path');
const { getSnapshotsDir } = require('./snapshot');

function getSnapshotPath(name) {
  return path.join(getSnapshotsDir(), `${name}.json`);
}

function snapshotExists(name) {
  return fs.existsSync(getSnapshotPath(name));
}

function copySnapshot(sourceName, destName) {
  if (!sourceName || typeof sourceName !== 'string') {
    throw new Error('Source snapshot name is required');
  }
  if (!destName || typeof destName !== 'string') {
    throw new Error('Destination snapshot name is required');
  }
  if (sourceName === destName) {
    throw new Error('Source and destination names must be different');
  }

  const sourcePath = getSnapshotPath(sourceName);
  if (!snapshotExists(sourceName)) {
    throw new Error(`Snapshot "${sourceName}" does not exist`);
  }

  const destPath = getSnapshotPath(destName);
  if (snapshotExists(destName)) {
    throw new Error(`Snapshot "${destName}" already exists`);
  }

  const data = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
  const copied = {
    ...data,
    name: destName,
    copiedFrom: sourceName,
    createdAt: new Date().toISOString(),
  };

  fs.writeFileSync(destPath, JSON.stringify(copied, null, 2));
  return copied;
}

module.exports = { getSnapshotPath, snapshotExists, copySnapshot };
