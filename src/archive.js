const fs = require('fs');
const path = require('path');
const { getSnapshotsDir } = require('./snapshot');

function getArchiveDir(baseDir) {
  return path.join(baseDir || getSnapshotsDir(), '.archive');
}

function ensureArchiveDir(archiveDir) {
  if (!fs.existsSync(archiveDir)) {
    fs.mkdirSync(archiveDir, { recursive: true });
  }
}

function archiveSnapshot(name, baseDir) {
  const snapshotsDir = baseDir || getSnapshotsDir();
  const archiveDir = getArchiveDir(snapshotsDir);
  const src = path.join(snapshotsDir, `${name}.json`);

  if (!fs.existsSync(src)) {
    throw new Error(`Snapshot "${name}" not found`);
  }

  ensureArchiveDir(archiveDir);

  const timestamp = Date.now();
  const dest = path.join(archiveDir, `${name}.${timestamp}.json`);
  fs.copyFileSync(src, dest);
  fs.unlinkSync(src);

  return dest;
}

function unarchiveSnapshot(name, baseDir) {
  const snapshotsDir = baseDir || getSnapshotsDir();
  const archiveDir = getArchiveDir(snapshotsDir);

  const entries = fs.existsSync(archiveDir) ? fs.readdirSync(archiveDir) : [];
  const matches = entries
    .filter(f => f.startsWith(`${name}.`) && f.endsWith('.json'))
    .sort();

  if (matches.length === 0) {
    throw new Error(`No archived snapshot found for "${name}"`);
  }

  const latest = matches[matches.length - 1];
  const src = path.join(archiveDir, latest);
  const dest = path.join(snapshotsDir, `${name}.json`);

  if (fs.existsSync(dest)) {
    throw new Error(`Snapshot "${name}" already exists in active snapshots`);
  }

  fs.copyFileSync(src, dest);
  fs.unlinkSync(src);

  return dest;
}

function listArchived(baseDir) {
  const snapshotsDir = baseDir || getSnapshotsDir();
  const archiveDir = getArchiveDir(snapshotsDir);

  if (!fs.existsSync(archiveDir)) return [];

  return fs.readdirSync(archiveDir)
    .filter(f => f.endsWith('.json'))
    .map(f => {
      const parts = f.replace('.json', '').split('.');
      const timestamp = parseInt(parts[parts.length - 1], 10);
      const name = parts.slice(0, -1).join('.');
      return { name, timestamp, archivedAt: new Date(timestamp).toISOString(), file: f };
    })
    .sort((a, b) => b.timestamp - a.timestamp);
}

module.exports = { getArchiveDir, archiveSnapshot, unarchiveSnapshot, listArchived };
