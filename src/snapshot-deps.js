const fs = require('fs');
const path = require('path');
const { getSnapshotsDir } = require('./snapshot');

function getDepsFile(baseDir) {
  return path.join(baseDir || getSnapshotsDir(), '.deps.json');
}

function loadDeps(baseDir) {
  const file = getDepsFile(baseDir);
  if (!fs.existsSync(file)) return {};
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return {};
  }
}

function saveDeps(deps, baseDir) {
  const file = getDepsFile(baseDir);
  fs.writeFileSync(file, JSON.stringify(deps, null, 2));
}

function addDependency(snapshotName, dependsOn, baseDir) {
  const deps = loadDeps(baseDir);
  if (!deps[snapshotName]) deps[snapshotName] = [];
  if (!deps[snapshotName].includes(dependsOn)) {
    deps[snapshotName].push(dependsOn);
  }
  saveDeps(deps, baseDir);
  return deps[snapshotName];
}

function removeDependency(snapshotName, dependsOn, baseDir) {
  const deps = loadDeps(baseDir);
  if (!deps[snapshotName]) return [];
  deps[snapshotName] = deps[snapshotName].filter(d => d !== dependsOn);
  if (deps[snapshotName].length === 0) delete deps[snapshotName];
  saveDeps(deps, baseDir);
  return deps[snapshotName] || [];
}

function getDependencies(snapshotName, baseDir) {
  const deps = loadDeps(baseDir);
  return deps[snapshotName] || [];
}

function getDependents(snapshotName, baseDir) {
  const deps = loadDeps(baseDir);
  return Object.entries(deps)
    .filter(([, list]) => list.includes(snapshotName))
    .map(([name]) => name);
}

function formatDepsInfo(snapshotName, baseDir) {
  const dependencies = getDependencies(snapshotName, baseDir);
  const dependents = getDependents(snapshotName, baseDir);
  const lines = [`Snapshot: ${snapshotName}`];
  if (dependencies.length) {
    lines.push(`  Depends on: ${dependencies.join(', ')}`);
  } else {
    lines.push('  Depends on: (none)');
  }
  if (dependents.length) {
    lines.push(`  Required by: ${dependents.join(', ')}`);
  } else {
    lines.push('  Required by: (none)');
  }
  return lines.join('\n');
}

module.exports = {
  getDepsFile,
  loadDeps,
  saveDeps,
  addDependency,
  removeDependency,
  getDependencies,
  getDependents,
  formatDepsInfo
};
