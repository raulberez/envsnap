const fs = require('fs');
const path = require('path');
const { getSnapshotsDir } = require('./snapshot');

function getSourceFile() {
  return path.join(getSnapshotsDir(), '.sources.json');
}

function loadSources() {
  const file = getSourceFile();
  if (!fs.existsSync(file)) return {};
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return {};
  }
}

function saveSources(sources) {
  const file = getSourceFile();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(sources, null, 2));
}

function setSource(snapshotName, source) {
  const sources = loadSources();
  sources[snapshotName] = { source, recordedAt: new Date().toISOString() };
  saveSources(sources);
}

function getSource(snapshotName) {
  const sources = loadSources();
  return sources[snapshotName] || null;
}

function removeSource(snapshotName) {
  const sources = loadSources();
  delete sources[snapshotName];
  saveSources(sources);
}

function listSources() {
  return loadSources();
}

function formatSourceList(sources) {
  const entries = Object.entries(sources);
  if (entries.length === 0) return 'No source records found.';
  return entries
    .map(([name, info]) => `  ${name}: ${info.source} (recorded ${info.recordedAt})`)
    .join('\n');
}

module.exports = {
  getSourceFile,
  loadSources,
  saveSources,
  setSource,
  getSource,
  removeSource,
  listSources,
  formatSourceList,
};
