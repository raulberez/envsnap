const fs = require('fs');
const path = require('path');
const { getSnapshotsDir } = require('./snapshot');

const VALID_STATUSES = ['draft', 'active', 'deprecated', 'archived'];

function getStatusFile(baseDir) {
  return path.join(baseDir || getSnapshotsDir(), '.status.json');
}

function loadStatuses(baseDir) {
  const file = getStatusFile(baseDir);
  if (!fs.existsSync(file)) return {};
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return {};
  }
}

function saveStatuses(statuses, baseDir) {
  const file = getStatusFile(baseDir);
  fs.writeFileSync(file, JSON.stringify(statuses, null, 2));
}

function setStatus(name, status, baseDir) {
  if (!VALID_STATUSES.includes(status)) {
    throw new Error(`Invalid status "${status}". Valid: ${VALID_STATUSES.join(', ')}`);
  }
  const statuses = loadStatuses(baseDir);
  statuses[name] = { status, updatedAt: new Date().toISOString() };
  saveStatuses(statuses, baseDir);
  return statuses[name];
}

function getStatus(name, baseDir) {
  const statuses = loadStatuses(baseDir);
  return statuses[name] || null;
}

function clearStatus(name, baseDir) {
  const statuses = loadStatuses(baseDir);
  if (!statuses[name]) return false;
  delete statuses[name];
  saveStatuses(statuses, baseDir);
  return true;
}

function filterByStatus(names, status, baseDir) {
  const statuses = loadStatuses(baseDir);
  return names.filter(n => statuses[n] && statuses[n].status === status);
}

function formatStatusList(statuses) {
  const entries = Object.entries(statuses);
  if (entries.length === 0) return 'No statuses set.';
  return entries
    .map(([name, meta]) => `  ${name}: ${meta.status} (updated ${meta.updatedAt})`)
    .join('\n');
}

module.exports = {
  getStatusFile,
  loadStatuses,
  saveStatuses,
  setStatus,
  getStatus,
  clearStatus,
  filterByStatus,
  formatStatusList,
  VALID_STATUSES,
};
