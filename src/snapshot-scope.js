const fs = require('fs');
const path = require('path');
const { getSnapshotsDir } = require('./snapshot');

function getScopeFile() {
  return path.join(getSnapshotsDir(), '.scopes.json');
}

function loadScopes() {
  const file = getScopeFile();
  if (!fs.existsSync(file)) return {};
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return {};
  }
}

function saveScopes(scopes) {
  const file = getScopeFile();
  fs.writeFileSync(file, JSON.stringify(scopes, null, 2));
}

function setScope(snapshotName, scope) {
  if (!scope || typeof scope !== 'string') throw new Error('Scope must be a non-empty string');
  const scopes = loadScopes();
  scopes[snapshotName] = scope.trim();
  saveScopes(scopes);
}

function getScope(snapshotName) {
  const scopes = loadScopes();
  return scopes[snapshotName] || null;
}

function removeScope(snapshotName) {
  const scopes = loadScopes();
  if (!(snapshotName in scopes)) return false;
  delete scopes[snapshotName];
  saveScopes(scopes);
  return true;
}

function listByScope(scope) {
  const scopes = loadScopes();
  return Object.entries(scopes)
    .filter(([, s]) => s === scope)
    .map(([name]) => name);
}

function getAllScopes() {
  const scopes = loadScopes();
  return [...new Set(Object.values(scopes))].sort();
}

module.exports = {
  getScopeFile,
  loadScopes,
  saveScopes,
  setScope,
  getScope,
  removeScope,
  listByScope,
  getAllScopes,
};
