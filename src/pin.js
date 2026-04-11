const fs = require('fs');
const path = require('path');
const { getSnapshotsDir } = require('./snapshot');

function getPinsFile(baseDir) {
  return path.join(baseDir || getSnapshotsDir(), '.pins.json');
}

function loadPins(baseDir) {
  const pinsFile = getPinsFile(baseDir);
  if (!fs.existsSync(pinsFile)) return {};
  try {
    return JSON.parse(fs.readFileSync(pinsFile, 'utf8'));
  } catch {
    return {};
  }
}

function savePins(pins, baseDir) {
  const pinsFile = getPinsFile(baseDir);
  fs.writeFileSync(pinsFile, JSON.stringify(pins, null, 2));
}

function pinSnapshot(name, note, baseDir) {
  const snapshotPath = path.join(baseDir || getSnapshotsDir(), `${name}.json`);
  if (!fs.existsSync(snapshotPath)) {
    throw new Error(`Snapshot "${name}" does not exist`);
  }
  const pins = loadPins(baseDir);
  pins[name] = { note: note || '', pinnedAt: new Date().toISOString() };
  savePins(pins, baseDir);
  return pins[name];
}

function unpinSnapshot(name, baseDir) {
  const pins = loadPins(baseDir);
  if (!pins[name]) {
    throw new Error(`Snapshot "${name}" is not pinned`);
  }
  delete pins[name];
  savePins(pins, baseDir);
}

function isPinned(name, baseDir) {
  const pins = loadPins(baseDir);
  return !!pins[name];
}

function listPinned(baseDir) {
  return loadPins(baseDir);
}

function formatPinList(pins) {
  const entries = Object.entries(pins);
  if (entries.length === 0) return 'No pinned snapshots.';
  return entries
    .map(([name, meta]) => {
      const note = meta.note ? ` — ${meta.note}` : '';
      return `  📌 ${name}${note}  (pinned ${meta.pinnedAt})`;
    })
    .join('\n');
}

module.exports = { getPinsFile, loadPins, savePins, pinSnapshot, unpinSnapshot, isPinned, listPinned, formatPinList };
