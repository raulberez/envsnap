const fs = require('fs');
const path = require('path');
const { getSnapshotsDir } = require('./snapshot');

function getProfilesFile(snapshotsDir) {
  const dir = snapshotsDir || getSnapshotsDir();
  return path.join(dir, '.profiles.json');
}

function loadProfiles(snapshotsDir) {
  const file = getProfilesFile(snapshotsDir);
  if (!fs.existsSync(file)) return {};
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return {};
  }
}

function saveProfiles(profiles, snapshotsDir) {
  const file = getProfilesFile(snapshotsDir);
  fs.writeFileSync(file, JSON.stringify(profiles, null, 2));
}

function saveProfile(name, snapshotNames, snapshotsDir) {
  if (!name || typeof name !== 'string') throw new Error('Profile name is required');
  if (!Array.isArray(snapshotNames) || snapshotNames.length === 0) {
    throw new Error('At least one snapshot name is required');
  }
  const profiles = loadProfiles(snapshotsDir);
  profiles[name] = { snapshots: snapshotNames, createdAt: new Date().toISOString() };
  saveProfiles(profiles, snapshotsDir);
  return profiles[name];
}

function deleteProfile(name, snapshotsDir) {
  const profiles = loadProfiles(snapshotsDir);
  if (!profiles[name]) throw new Error(`Profile '${name}' not found`);
  delete profiles[name];
  saveProfiles(profiles, snapshotsDir);
}

function getProfile(name, snapshotsDir) {
  const profiles = loadProfiles(snapshotsDir);
  return profiles[name] || null;
}

function formatProfileList(profiles) {
  const entries = Object.entries(profiles);
  if (entries.length === 0) return 'No profiles found.';
  return entries
    .map(([name, data]) => `  ${name} (${data.snapshots.length} snapshot(s)): ${data.snapshots.join(', ')}`)
    .join('\n');
}

module.exports = {
  getProfilesFile,
  loadProfiles,
  saveProfiles,
  saveProfile,
  deleteProfile,
  getProfile,
  formatProfileList,
};
