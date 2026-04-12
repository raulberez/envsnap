const fs = require('fs');
const path = require('path');
const { getSnapshotsDir } = require('./snapshot');

/**
 * Returns an array of snapshot metadata objects sorted by creation time (newest first).
 * @param {string} projectName - The project name used to locate the snapshots directory.
 * @returns {Array<{name: string, file: string, createdAt: string, varCount: number, tags: string[]}>}
 */
function listSnapshots(projectName) {
  const dir = getSnapshotsDir(projectName);

  if (!fs.existsSync(dir)) {
    return [];
  }

  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));

  const snapshots = files.map((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    let data = {};

    try {
      data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch {
      // skip malformed files
    }

    return {
      name: file.replace('.json', ''),
      file: filePath,
      createdAt: data.createdAt || stat.birthtime.toISOString(),
      varCount: data.env ? Object.keys(data.env).length : 0,
      tags: data.tags || [],
    };
  });

  return snapshots.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
}

/**
 * Formats the snapshot list as a human-readable string.
 * @param {Array} snapshots - Array of snapshot metadata objects.
 * @returns {string}
 */
function formatList(snapshots) {
  if (snapshots.length === 0) {
    return 'No snapshots found.';
  }

  const lines = snapshots.map((s, i) => {
    const tags = s.tags.length ? ` [${s.tags.join(', ')}]` : '';
    const date = new Date(s.createdAt).toLocaleString();
    return `${i + 1}. ${s.name}${tags}\n   Created: ${date} | Vars: ${s.varCount}`;
  });

  return lines.join('\n');
}

/**
 * Filters snapshots by one or more tags. Returns only snapshots that contain
 * every tag in the provided list (AND logic).
 * @param {Array} snapshots - Array of snapshot metadata objects.
 * @param {string[]} tags - Tags that each returned snapshot must include.
 * @returns {Array}
 */
function filterByTags(snapshots, tags) {
  if (!tags || tags.length === 0) {
    return snapshots;
  }
  return snapshots.filter((s) => tags.every((tag) => s.tags.includes(tag)));
}

module.exports = { listSnapshots, formatList, filterByTags };
