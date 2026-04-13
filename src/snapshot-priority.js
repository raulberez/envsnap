const fs = require('fs');
const path = require('path');
const { getSnapshotsDir } = require('./snapshot');

const VALID_PRIORITIES = ['low', 'medium', 'high', 'critical'];

function getPriorityFile(snapshotsDir) {
  const dir = snapshotsDir || getSnapshotsDir();
  return path.join(dir, '.priorities.json');
}

function loadPriorities(snapshotsDir) {
  const file = getPriorityFile(snapshotsDir);
  if (!fs.existsSync(file)) return {};
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return {};
  }
}

function savePriorities(priorities, snapshotsDir) {
  const file = getPriorityFile(snapshotsDir);
  fs.writeFileSync(file, JSON.stringify(priorities, null, 2));
}

function setPriority(name, priority, snapshotsDir) {
  if (!VALID_PRIORITIES.includes(priority)) {
    throw new Error(`Invalid priority "${priority}". Must be one of: ${VALID_PRIORITIES.join(', ')}`);
  }
  const priorities = loadPriorities(snapshotsDir);
  priorities[name] = priority;
  savePriorities(priorities, snapshotsDir);
  return priorities[name];
}

function getPriority(name, snapshotsDir) {
  const priorities = loadPriorities(snapshotsDir);
  return priorities[name] || null;
}

function removePriority(name, snapshotsDir) {
  const priorities = loadPriorities(snapshotsDir);
  if (!priorities[name]) return false;
  delete priorities[name];
  savePriorities(priorities, snapshotsDir);
  return true;
}

function filterByPriority(names, priority, snapshotsDir) {
  const priorities = loadPriorities(snapshotsDir);
  return names.filter(n => priorities[n] === priority);
}

function formatPriorityList(priorities) {
  const entries = Object.entries(priorities);
  if (entries.length === 0) return 'No priorities set.';
  const sorted = entries.sort((a, b) =>
    VALID_PRIORITIES.indexOf(b[1]) - VALID_PRIORITIES.indexOf(a[1])
  );
  return sorted.map(([name, p]) => `  ${name}: ${p}`).join('\n');
}

module.exports = {
  getPriorityFile,
  loadPriorities,
  savePriorities,
  setPriority,
  getPriority,
  removePriority,
  filterByPriority,
  formatPriorityList,
  VALID_PRIORITIES,
};
