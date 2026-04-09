const fs = require('fs');
const path = require('path');
const { getSnapshotsDir } = require('./snapshot');

/**
 * List all snapshots with their metadata (name, mtime, size)
 * @param {string} project
 * @returns {Array<{name: string, file: string, mtime: Date, size: number}>}
 */
function getSnapshotMeta(project) {
  const dir = getSnapshotsDir(project);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => {
      const file = path.join(dir, f);
      const stat = fs.statSync(file);
      return {
        name: f.replace(/\.json$/, ''),
        file,
        mtime: stat.mtime,
        size: stat.size,
      };
    })
    .sort((a, b) => a.mtime - b.mtime);
}

/**
 * Delete snapshots older than `days` days for a given project.
 * @param {string} project
 * @param {number} days
 * @returns {string[]} names of deleted snapshots
 */
function pruneByAge(project, days) {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const snapshots = getSnapshotMeta(project);
  const deleted = [];

  for (const snap of snapshots) {
    if (snap.mtime < cutoff) {
      fs.unlinkSync(snap.file);
      deleted.push(snap.name);
    }
  }

  return deleted;
}

/**
 * Keep only the `keep` most recent snapshots, deleting the rest.
 * @param {string} project
 * @param {number} keep
 * @returns {string[]} names of deleted snapshots
 */
function pruneByCount(project, keep) {
  const snapshots = getSnapshotMeta(project);
  if (snapshots.length <= keep) return [];

  const toDelete = snapshots.slice(0, snapshots.length - keep);
  const deleted = [];

  for (const snap of toDelete) {
    fs.unlinkSync(snap.file);
    deleted.push(snap.name);
  }

  return deleted;
}

module.exports = { getSnapshotMeta, pruneByAge, pruneByCount };
