const fs = require('fs');
const path = require('path');
const { getSnapshotsDir } = require('./snapshot');

function getHistoryFile(snapshotName) {
  return path.join(getSnapshotsDir(), `${snapshotName}.history.json`);
}

function loadHistory(snapshotName) {
  const file = getHistoryFile(snapshotName);
  if (!fs.existsSync(file)) return [];
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return [];
  }
}

function saveHistory(snapshotName, entries) {
  const file = getHistoryFile(snapshotName);
  fs.writeFileSync(file, JSON.stringify(entries, null, 2));
}

function recordHistoryEntry(snapshotName, action, metadata = {}) {
  const entries = loadHistory(snapshotName);
  entries.push({
    action,
    timestamp: new Date().toISOString(),
    ...metadata,
  });
  saveHistory(snapshotName, entries);
}

function clearHistory(snapshotName) {
  const file = getHistoryFile(snapshotName);
  if (fs.existsSync(file)) fs.unlinkSync(file);
}

function formatHistory(snapshotName, entries) {
  if (entries.length === 0) return `No history found for "${snapshotName}".`;
  const lines = [`History for "${snapshotName}":`, ''];
  entries.forEach((e, i) => {
    const meta = Object.entries(e)
      .filter(([k]) => k !== 'action' && k !== 'timestamp')
      .map(([k, v]) => `${k}=${v}`)
      .join(', ');
    lines.push(`  ${i + 1}. [${e.timestamp}] ${e.action}${meta ? '  ('+meta+')' : ''}`);
  });
  return lines.join('\n');
}

module.exports = {
  getHistoryFile,
  loadHistory,
  saveHistory,
  recordHistoryEntry,
  clearHistory,
  formatHistory,
};
