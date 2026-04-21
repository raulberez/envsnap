const fs = require('fs');
const path = require('path');
const { getSnapshotsDir } = require('./snapshot');

function getRegionFile() {
  return path.join(getSnapshotsDir(), '.regions.json');
}

function loadRegions() {
  const file = getRegionFile();
  if (!fs.existsSync(file)) return {};
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return {};
  }
}

function saveRegions(regions) {
  const file = getRegionFile();
  fs.writeFileSync(file, JSON.stringify(regions, null, 2));
}

function setRegion(snapshotName, region) {
  if (!region || typeof region !== 'string') throw new Error('Region must be a non-empty string');
  const regions = loadRegions();
  regions[snapshotName] = region.trim();
  saveRegions(regions);
  return regions[snapshotName];
}

function getRegion(snapshotName) {
  const regions = loadRegions();
  return regions[snapshotName] || null;
}

function removeRegion(snapshotName) {
  const regions = loadRegions();
  if (!regions[snapshotName]) return false;
  delete regions[snapshotName];
  saveRegions(regions);
  return true;
}

function listByRegion(targetRegion) {
  const regions = loadRegions();
  return Object.entries(regions)
    .filter(([, r]) => r === targetRegion)
    .map(([name]) => name);
}

function getAllRegions() {
  const regions = loadRegions();
  const unique = [...new Set(Object.values(regions))];
  return unique.sort();
}

module.exports = {
  getRegionFile,
  loadRegions,
  saveRegions,
  setRegion,
  getRegion,
  removeRegion,
  listByRegion,
  getAllRegions,
};
