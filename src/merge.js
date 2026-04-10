const fs = require('fs');
const path = require('path');
const { getSnapshotsDir } = require('./snapshot');

function getSnapshotPath(name) {
  return path.join(getSnapshotsDir(), `${name}.json`);
}

function snapshotExists(name) {
  return fs.existsSync(getSnapshotPath(name));
}

function loadSnapshot(name) {
  const filePath = getSnapshotPath(name);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Snapshot "${name}" not found`);
  }
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

function mergeSnapshots(names, strategy = 'last-wins') {
  if (!names || names.length < 2) {
    throw new Error('At least two snapshot names are required to merge');
  }

  const snapshots = names.map((name) => ({
    name,
    data: loadSnapshot(name),
  }));

  let merged = {};
  const conflicts = {};

  for (const { name, data } of snapshots) {
    const vars = data.vars || data;
    for (const [key, value] of Object.entries(vars)) {
      if (merged[key] !== undefined && merged[key] !== value) {
        if (!conflicts[key]) {
          conflicts[key] = [{ source: names[0], value: merged[key] }];
        }
        conflicts[key].push({ source: name, value });
      }
      if (strategy === 'last-wins' || merged[key] === undefined) {
        merged[key] = value;
      }
    }
  }

  return { merged, conflicts };
}

function saveMergedSnapshot(name, vars) {
  const dir = getSnapshotsDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const filePath = getSnapshotPath(name);
  const payload = { vars, createdAt: new Date().toISOString(), mergedSnapshot: true };
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2));
  return filePath;
}

module.exports = { getSnapshotPath, snapshotExists, loadSnapshot, mergeSnapshots, saveMergedSnapshot };
