const fs = require('fs');
const path = require('path');
const { getSnapshotsDir } = require('./snapshot');

function getAccessFile(snapshotsDir) {
  return path.join(snapshotsDir || getSnapshotsDir(), 'access.json');
}

function loadAccessLog(snapshotsDir) {
  const file = getAccessFile(snapshotsDir);
  if (!fs.existsSync(file)) return {};
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return {};
  }
}

function saveAccessLog(log, snapshotsDir) {
  const file = getAccessFile(snapshotsDir);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(log, null, 2));
}

function recordAccess(name, action, snapshotsDir) {
  const log = loadAccessLog(snapshotsDir);
  if (!log[name]) {
    log[name] = { reads: 0, writes: 0, lastRead: null, lastWrite: null };
  }
  const now = new Date().toISOString();
  if (action === 'read') {
    log[name].reads += 1;
    log[name].lastRead = now;
  } else if (action === 'write') {
    log[name].writes += 1;
    log[name].lastWrite = now;
  }
  saveAccessLog(log, snapshotsDir);
  return log[name];
}

function getAccessStats(name, snapshotsDir) {
  const log = loadAccessLog(snapshotsDir);
  return log[name] || null;
}

function clearAccessStats(name, snapshotsDir) {
  const log = loadAccessLog(snapshotsDir);
  if (log[name]) {
    delete log[name];
    saveAccessLog(log, snapshotsDir);
    return true;
  }
  return false;
}

function formatAccessStats(name, stats) {
  if (!stats) return `No access data for "${name}"\n`;
  const lines = [
    `Access stats for: ${name}`,
    `  Reads : ${stats.reads}  (last: ${stats.lastRead || 'never'})`,
    `  Writes: ${stats.writes}  (last: ${stats.lastWrite || 'never'})`,
  ];
  return lines.join('\n') + '\n';
}

module.exports = {
  getAccessFile,
  loadAccessLog,
  saveAccessLog,
  recordAccess,
  getAccessStats,
  clearAccessStats,
  formatAccessStats,
};
