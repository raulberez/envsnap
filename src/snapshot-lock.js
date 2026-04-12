const fs = require('fs');
const path = require('path');
const { getSnapshotsDir } = require('./snapshot');

function getLockFile(snapshotsDir) {
  return path.join(snapshotsDir || getSnapshotsDir(), '.locks.json');
}

function loadLocks(snapshotsDir) {
  const lockFile = getLockFile(snapshotsDir);
  if (!fs.existsSync(lockFile)) return {};
  try {
    return JSON.parse(fs.readFileSync(lockFile, 'utf8'));
  } catch {
    return {};
  }
}

function saveLocks(locks, snapshotsDir) {
  const lockFile = getLockFile(snapshotsDir);
  fs.writeFileSync(lockFile, JSON.stringify(locks, null, 2));
}

function lockSnapshot(name, reason, snapshotsDir) {
  const locks = loadLocks(snapshotsDir);
  locks[name] = { reason: reason || '', lockedAt: new Date().toISOString() };
  saveLocks(locks, snapshotsDir);
}

function unlockSnapshot(name, snapshotsDir) {
  const locks = loadLocks(snapshotsDir);
  if (!locks[name]) throw new Error(`Snapshot '${name}' is not locked`);
  delete locks[name];
  saveLocks(locks, snapshotsDir);
}

function isLocked(name, snapshotsDir) {
  const locks = loadLocks(snapshotsDir);
  return !!locks[name];
}

function getLockInfo(name, snapshotsDir) {
  const locks = loadLocks(snapshotsDir);
  return locks[name] || null;
}

function listLocked(snapshotsDir) {
  return loadLocks(snapshotsDir);
}

function formatLockList(locks) {
  const entries = Object.entries(locks);
  if (entries.length === 0) return 'No locked snapshots.';
  return entries
    .map(([name, info]) => {
      const reason = info.reason ? ` — ${info.reason}` : '';
      return `  🔒 ${name}${reason} (locked at ${info.lockedAt})`;
    })
    .join('\n');
}

module.exports = {
  getLockFile,
  loadLocks,
  saveLocks,
  lockSnapshot,
  unlockSnapshot,
  isLocked,
  getLockInfo,
  listLocked,
  formatLockList,
};
