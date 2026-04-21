const fs = require('fs');
const path = require('path');
const { getSnapshotsDir } = require('./snapshot');

function getNamespaceFile(snapshotsDir) {
  const dir = snapshotsDir || getSnapshotsDir();
  return path.join(dir, '.namespaces.json');
}

function loadNamespaces(snapshotsDir) {
  const file = getNamespaceFile(snapshotsDir);
  if (!fs.existsSync(file)) return {};
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return {};
  }
}

function saveNamespaces(namespaces, snapshotsDir) {
  const file = getNamespaceFile(snapshotsDir);
  fs.writeFileSync(file, JSON.stringify(namespaces, null, 2));
}

function setNamespace(snapshotName, namespace, snapshotsDir) {
  if (!namespace || typeof namespace !== 'string') {
    throw new Error('Namespace must be a non-empty string');
  }
  const namespaces = loadNamespaces(snapshotsDir);
  namespaces[snapshotName] = namespace.trim();
  saveNamespaces(namespaces, snapshotsDir);
}

function getNamespace(snapshotName, snapshotsDir) {
  const namespaces = loadNamespaces(snapshotsDir);
  return namespaces[snapshotName] || null;
}

function removeNamespace(snapshotName, snapshotsDir) {
  const namespaces = loadNamespaces(snapshotsDir);
  delete namespaces[snapshotName];
  saveNamespaces(namespaces, snapshotsDir);
}

function listByNamespace(namespace, snapshotsDir) {
  const namespaces = loadNamespaces(snapshotsDir);
  return Object.entries(namespaces)
    .filter(([, ns]) => ns === namespace)
    .map(([name]) => name);
}

function getAllNamespaces(snapshotsDir) {
  const namespaces = loadNamespaces(snapshotsDir);
  const unique = [...new Set(Object.values(namespaces))];
  return unique.sort();
}

module.exports = {
  getNamespaceFile,
  loadNamespaces,
  saveNamespaces,
  setNamespace,
  getNamespace,
  removeNamespace,
  listByNamespace,
  getAllNamespaces,
};
