const fs = require('fs');
const path = require('path');
const { getSnapshotsDir } = require('./snapshot');

function getMetaFile(snapshotName) {
  return path.join(getSnapshotsDir(), `${snapshotName}.meta.json`);
}

function loadMeta(snapshotName) {
  const metaPath = getMetaFile(snapshotName);
  if (!fs.existsSync(metaPath)) {
    return {};
  }
  try {
    return JSON.parse(fs.readFileSync(metaPath, 'utf8'));
  } catch {
    return {};
  }
}

function saveMeta(snapshotName, meta) {
  const metaPath = getMetaFile(snapshotName);
  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
}

function setMetaField(snapshotName, key, value) {
  const meta = loadMeta(snapshotName);
  meta[key] = value;
  meta.updatedAt = new Date().toISOString();
  saveMeta(snapshotName, meta);
  return meta;
}

function getMetaField(snapshotName, key) {
  const meta = loadMeta(snapshotName);
  return meta[key];
}

function deleteMetaField(snapshotName, key) {
  const meta = loadMeta(snapshotName);
  if (!(key in meta)) {
    return false;
  }
  delete meta[key];
  meta.updatedAt = new Date().toISOString();
  saveMeta(snapshotName, meta);
  return true;
}

function deleteAllMeta(snapshotName) {
  const metaPath = getMetaFile(snapshotName);
  if (fs.existsSync(metaPath)) {
    fs.unlinkSync(metaPath);
    return true;
  }
  return false;
}

function formatMeta(snapshotName, meta) {
  const keys = Object.keys(meta);
  if (keys.length === 0) {
    return `No metadata for snapshot "${snapshotName}".`;
  }
  const lines = [`Metadata for "${snapshotName}":`, ''];
  for (const key of keys) {
    lines.push(`  ${key}: ${meta[key]}`);
  }
  return lines.join('\n');
}

module.exports = {
  getMetaFile,
  loadMeta,
  saveMeta,
  setMetaField,
  getMetaField,
  deleteMetaField,
  deleteAllMeta,
  formatMeta,
};
