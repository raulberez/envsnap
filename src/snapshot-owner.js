const fs = require('fs');
const path = require('path');
const { getSnapshotsDir } = require('./snapshot');

function getOwnerFile() {
  return path.join(getSnapshotsDir(), 'owners.json');
}

function loadOwners() {
  const file = getOwnerFile();
  if (!fs.existsSync(file)) return {};
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function saveOwners(owners) {
  fs.writeFileSync(getOwnerFile(), JSON.stringify(owners, null, 2));
}

function setOwner(name, owner) {
  const owners = loadOwners();
  owners[name] = { owner, setAt: new Date().toISOString() };
  saveOwners(owners);
  return owners[name];
}

function getOwner(name) {
  const owners = loadOwners();
  return owners[name] || null;
}

function removeOwner(name) {
  const owners = loadOwners();
  if (!owners[name]) return false;
  delete owners[name];
  saveOwners(owners);
  return true;
}

function listOwned(owner) {
  const owners = loadOwners();
  return Object.entries(owners)
    .filter(([, v]) => v.owner === owner)
    .map(([name, v]) => ({ name, ...v }));
}

function formatOwnerInfo(name, info) {
  if (!info) return `${name}: (no owner set)`;
  return `${name}: owned by ${info.owner} (set ${info.setAt})`;
}

module.exports = { getOwnerFile, loadOwners, saveOwners, setOwner, getOwner, removeOwner, listOwned, formatOwnerInfo };
