const fs = require('fs');
const path = require('path');
const { getSnapshotsDir } = require('./snapshot');

function getGroupsFile(snapshotsDir) {
  const dir = snapshotsDir || getSnapshotsDir();
  return path.join(dir, '.groups.json');
}

function loadGroups(snapshotsDir) {
  const file = getGroupsFile(snapshotsDir);
  if (!fs.existsSync(file)) return {};
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return {};
  }
}

function saveGroups(groups, snapshotsDir) {
  const file = getGroupsFile(snapshotsDir);
  fs.writeFileSync(file, JSON.stringify(groups, null, 2));
}

function addToGroup(groupName, snapshotName, snapshotsDir) {
  const groups = loadGroups(snapshotsDir);
  if (!groups[groupName]) groups[groupName] = [];
  if (!groups[groupName].includes(snapshotName)) {
    groups[groupName].push(snapshotName);
  }
  saveGroups(groups, snapshotsDir);
  return groups[groupName];
}

function removeFromGroup(groupName, snapshotName, snapshotsDir) {
  const groups = loadGroups(snapshotsDir);
  if (!groups[groupName]) return [];
  groups[groupName] = groups[groupName].filter(s => s !== snapshotName);
  if (groups[groupName].length === 0) delete groups[groupName];
  saveGroups(groups, snapshotsDir);
  return groups[groupName] || [];
}

function deleteGroup(groupName, snapshotsDir) {
  const groups = loadGroups(snapshotsDir);
  if (!groups[groupName]) throw new Error(`Group '${groupName}' not found`);
  delete groups[groupName];
  saveGroups(groups, snapshotsDir);
}

function getGroup(groupName, snapshotsDir) {
  const groups = loadGroups(snapshotsDir);
  return groups[groupName] || null;
}

function formatGroupList(groups) {
  const names = Object.keys(groups);
  if (names.length === 0) return 'No groups defined.';
  return names.map(name => {
    const members = groups[name].join(', ') || '(empty)';
    return `  ${name}: ${members}`;
  }).join('\n');
}

module.exports = {
  getGroupsFile,
  loadGroups,
  saveGroups,
  addToGroup,
  removeFromGroup,
  deleteGroup,
  getGroup,
  formatGroupList
};
