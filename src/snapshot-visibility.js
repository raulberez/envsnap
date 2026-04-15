const fs = require('fs');
const path = require('path');
const { getSnapshotsDir } = require('./snapshot');

const VALID_VISIBILITIES = ['public', 'private', 'internal'];

function getVisibilityFile(snapshotsDir) {
  return path.join(snapshotsDir || getSnapshotsDir(), 'visibilities.json');
}

function loadVisibilities(snapshotsDir) {
  const file = getVisibilityFile(snapshotsDir);
  if (!fs.existsSync(file)) return {};
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return {};
  }
}

function saveVisibilities(visibilities, snapshotsDir) {
  const file = getVisibilityFile(snapshotsDir);
  fs.writeFileSync(file, JSON.stringify(visibilities, null, 2));
}

function setVisibility(name, visibility, snapshotsDir) {
  if (!VALID_VISIBILITIES.includes(visibility)) {
    throw new Error(`Invalid visibility "${visibility}". Must be one of: ${VALID_VISIBILITIES.join(', ')}`);
  }
  const visibilities = loadVisibilities(snapshotsDir);
  visibilities[name] = visibility;
  saveVisibilities(visibilities, snapshotsDir);
  return visibilities[name];
}

function getVisibility(name, snapshotsDir) {
  const visibilities = loadVisibilities(snapshotsDir);
  return visibilities[name] || 'public';
}

function removeVisibility(name, snapshotsDir) {
  const visibilities = loadVisibilities(snapshotsDir);
  delete visibilities[name];
  saveVisibilities(visibilities, snapshotsDir);
}

function filterByVisibility(names, visibility, snapshotsDir) {
  const visibilities = loadVisibilities(snapshotsDir);
  return names.filter(name => (visibilities[name] || 'public') === visibility);
}

function formatVisibilityList(visibilities) {
  const entries = Object.entries(visibilities);
  if (entries.length === 0) return 'No visibility settings found.';
  return entries.map(([name, v]) => `  ${name}: ${v}`).join('\n');
}

module.exports = {
  getVisibilityFile,
  loadVisibilities,
  saveVisibilities,
  setVisibility,
  getVisibility,
  removeVisibility,
  filterByVisibility,
  formatVisibilityList,
  VALID_VISIBILITIES,
};
