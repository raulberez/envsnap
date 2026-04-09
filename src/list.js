const fs = require('fs');
const path = require('path');
const { getSnapshotsDir } = require('./snapshot');

/**
 * Returns an array of snapshot metadata objects sorted by creation time (newest first).
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

module.exports = { listSnapshots, formatList };
