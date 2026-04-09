const fs = require('fs');
const path = require('path');
const { getSnapshotsDir } = require('./snapshot');

/**
 * Load and parse a snapshot file into a key/value map
 */
function loadSnapshotMap(snapshotName) {
  const snapshotsDir = getSnapshotsDir();
  const filePath = path.join(snapshotsDir, `${snapshotName}.json`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Snapshot not found: ${snapshotName}`);
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(raw);
  return data.env || {};
}

/**
 * Compare multiple snapshots and return a matrix of differences
 */
function compareMultiple(snapshotNames) {
  if (snapshotNames.length < 2) {
    throw new Error('At least two snapshots are required for comparison');
  }

  const maps = snapshotNames.map(name => ({
    name,
    env: loadSnapshotMap(name),
  }));

  const allKeys = new Set();
  maps.forEach(({ env }) => Object.keys(env).forEach(k => allKeys.add(k)));

  const rows = [];
  for (const key of [...allKeys].sort()) {
    const values = maps.map(({ env }) => env[key] !== undefined ? env[key] : null);
    const unique = new Set(values.filter(v => v !== null));
    const hasConflict = unique.size > 1;
    const missingIn = maps
      .filter(({ env }) => env[key] === undefined)
      .map(({ name }) => name);

    rows.push({ key, values, hasConflict, missingIn });
  }

  return { snapshots: snapshotNames, rows };
}

/**
 * Format comparison matrix as a readable table string
 */
function formatComparisonTable(result) {
  const { snapshots, rows } = result;
  const colWidth = 20;
  const keyWidth = 30;

  const pad = (str, len) => String(str ?? '(missing)').slice(0, len).padEnd(len);

  const header = pad('KEY', keyWidth) + snapshots.map(s => pad(s, colWidth)).join(' | ');
  const divider = '-'.repeat(header.length);

  const lines = [header, divider];

  for (const { key, values, hasConflict } of rows) {
    const marker = hasConflict ? '* ' : '  ';
    const line = marker + pad(key, keyWidth - 2) + values.map(v => pad(v, colWidth)).join(' | ');
    lines.push(line);
  }

  lines.push('');
  lines.push(`* = conflicting values across snapshots`);

  return lines.join('\n');
}

module.exports = { loadSnapshotMap, compareMultiple, formatComparisonTable };
