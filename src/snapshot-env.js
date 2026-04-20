const fs = require('fs');
const path = require('path');
const { getSnapshotsDir } = require('./snapshot');

function getEnvMapFile(dir) {
  return path.join(dir || getSnapshotsDir(), 'env-map.json');
}

function loadEnvMap(dir) {
  const file = getEnvMapFile(dir);
  if (!fs.existsSync(file)) return {};
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return {};
  }
}

function saveEnvMap(map, dir) {
  const file = getEnvMapFile(dir);
  fs.writeFileSync(file, JSON.stringify(map, null, 2));
}

function setEnvMapping(snapshotName, envName, dir) {
  const map = loadEnvMap(dir);
  map[snapshotName] = envName;
  saveEnvMap(map, dir);
}

function getEnvMapping(snapshotName, dir) {
  const map = loadEnvMap(dir);
  return map[snapshotName] || null;
}

function removeEnvMapping(snapshotName, dir) {
  const map = loadEnvMap(dir);
  if (!(snapshotName in map)) return false;
  delete map[snapshotName];
  saveEnvMap(map, dir);
  return true;
}

function listEnvMappings(dir) {
  return loadEnvMap(dir);
}

function formatEnvMappings(map) {
  const entries = Object.entries(map);
  if (entries.length === 0) return 'No environment mappings found.';
  const lines = entries.map(([snap, env]) => `  ${snap} -> ${env}`);
  return `Environment Mappings:\n${lines.join('\n')}`;
}

module.exports = {
  getEnvMapFile,
  loadEnvMap,
  saveEnvMap,
  setEnvMapping,
  getEnvMapping,
  removeEnvMapping,
  listEnvMappings,
  formatEnvMappings,
};
