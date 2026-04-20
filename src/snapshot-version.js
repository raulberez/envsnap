const fs = require('fs');
const path = require('path');
const { getSnapshotsDir } = require('./snapshot');

function getVersionsFile(snapshotsDir) {
  return path.join(snapshotsDir || getSnapshotsDir(), 'versions.json');
}

function loadVersions(snapshotsDir) {
  const file = getVersionsFile(snapshotsDir);
  if (!fs.existsSync(file)) return {};
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function saveVersions(versions, snapshotsDir) {
  const file = getVersionsFile(snapshotsDir);
  fs.writeFileSync(file, JSON.stringify(versions, null, 2));
}

function bumpVersion(name, snapshotsDir) {
  const versions = loadVersions(snapshotsDir);
  const current = versions[name] || 0;
  versions[name] = current + 1;
  saveVersions(versions, snapshotsDir);
  return versions[name];
}

function getVersion(name, snapshotsDir) {
  const versions = loadVersions(snapshotsDir);
  return versions[name] || null;
}

function resetVersion(name, snapshotsDir) {
  const versions = loadVersions(snapshotsDir);
  delete versions[name];
  saveVersions(versions, snapshotsDir);
}

function listVersioned(snapshotsDir) {
  const versions = loadVersions(snapshotsDir);
  return Object.entries(versions).map(([name, version]) => ({ name, version }));
}

function formatVersionList(entries) {
  if (!entries.length) return 'No versioned snapshots found.';
  return entries.map(({ name, version }) => `  ${name}  v${version}`).join('\n');
}

module.exports = {
  getVersionsFile,
  loadVersions,
  saveVersions,
  bumpVersion,
  getVersion,
  resetVersion,
  listVersioned,
  formatVersionList,
};
