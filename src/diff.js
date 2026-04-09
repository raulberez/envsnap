const fs = require('fs').promises;
const path = require('path');
const { getSnapshotsDir } = require('./snapshot');

/**
 * Compare two environment snapshots and return the differences
 * @param {Object} snapshot1 - First snapshot object
 * @param {Object} snapshot2 - Second snapshot object
 * @returns {Object} Differences between snapshots
 */
function compareSnapshots(snapshot1, snapshot2) {
  const diff = {
    added: {},
    removed: {},
    modified: {},
    unchanged: {}
  };

  const vars1 = snapshot1.variables || {};
  const vars2 = snapshot2.variables || {};

  const allKeys = new Set([...Object.keys(vars1), ...Object.keys(vars2)]);

  allKeys.forEach(key => {
    if (!(key in vars1) && key in vars2) {
      diff.added[key] = vars2[key];
    } else if (key in vars1 && !(key in vars2)) {
      diff.removed[key] = vars1[key];
    } else if (vars1[key] !== vars2[key]) {
      diff.modified[key] = {
        old: vars1[key],
        new: vars2[key]
      };
    } else {
      diff.unchanged[key] = vars1[key];
    }
  });

  return diff;
}

/**
 * Load and compare two snapshots by name
 * @param {string} name1 - First snapshot name
 * @param {string} name2 - Second snapshot name
 * @returns {Promise<Object>} Diff object
 */
async function diffSnapshots(name1, name2) {
  const snapshotsDir = getSnapshotsDir();
  
  const snapshot1Path = path.join(snapshotsDir, `${name1}.json`);
  const snapshot2Path = path.join(snapshotsDir, `${name2}.json`);

  try {
    const [data1, data2] = await Promise.all([
      fs.readFile(snapshot1Path, 'utf8'),
      fs.readFile(snapshot2Path, 'utf8')
    ]);

    const snapshot1 = JSON.parse(data1);
    const snapshot2 = JSON.parse(data2);

    return {
      name1,
      name2,
      timestamp1: snapshot1.timestamp,
      timestamp2: snapshot2.timestamp,
      diff: compareSnapshots(snapshot1, snapshot2)
    };
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`Snapshot not found: ${error.path}`);
    }
    throw error;
  }
}

/**
 * Format diff output for console display
 * @param {Object} diffResult - Result from diffSnapshots
 * @returns {string} Formatted diff string
 */
function formatDiff(diffResult) {
  const { diff } = diffResult;
  let output = [];

  if (Object.keys(diff.added).length > 0) {
    output.push('\n+ Added:');
    Object.entries(diff.added).forEach(([key, value]) => {
      output.push(`  + ${key}=${value}`);
    });
  }

  if (Object.keys(diff.removed).length > 0) {
    output.push('\n- Removed:');
    Object.entries(diff.removed).forEach(([key, value]) => {
      output.push(`  - ${key}=${value}`);
    });
  }

  if (Object.keys(diff.modified).length > 0) {
    output.push('\n~ Modified:');
    Object.entries(diff.modified).forEach(([key, { old, new: newVal }]) => {
      output.push(`  ~ ${key}`);
      output.push(`    - ${old}`);
      output.push(`    + ${newVal}`);
    });
  }

  return output.join('\n');
}

module.exports = {
  compareSnapshots,
  diffSnapshots,
  formatDiff
};
