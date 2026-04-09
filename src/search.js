const fs = require('fs');
const path = require('path');
const { getSnapshotsDir } = require('./snapshot');
const { loadTags } = require('./tag');

/**
 * Search snapshots by key name, value pattern, or tag.
 * @param {Object} options
 * @param {string} [options.key] - env var key to search for
 * @param {string} [options.value] - value substring to match
 * @param {string} [options.tag] - tag name to filter by
 * @returns {Array<{name: string, matches: Array<{key: string, value: string}>}>}
 */
function searchSnapshots({ key, value, tag } = {}) {
  const dir = getSnapshotsDir();

  if (!fs.existsSync(dir)) {
    return [];
  }

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  const tags = loadTags();
  const results = [];

  for (const file of files) {
    const name = path.basename(file, '.json');

    if (tag) {
      const snapshotTags = tags[name] || [];
      if (!snapshotTags.includes(tag)) continue;
    }

    let data;
    try {
      const raw = fs.readFileSync(path.join(dir, file), 'utf8');
      data = JSON.parse(raw);
    } catch {
      continue;
    }

    const env = data.env || {};
    const matches = [];

    for (const [k, v] of Object.entries(env)) {
      const keyMatch = key ? k.toLowerCase().includes(key.toLowerCase()) : true;
      const valueMatch = value ? String(v).toLowerCase().includes(value.toLowerCase()) : true;
      if (keyMatch && valueMatch) {
        matches.push({ key: k, value: v });
      }
    }

    if (matches.length > 0) {
      results.push({ name, matches });
    }
  }

  return results;
}

/**
 * Format search results for display.
 * @param {Array} results
 * @returns {string}
 */
function formatSearchResults(results) {
  if (results.length === 0) {
    return 'No matches found.';
  }

  const lines = [];
  for (const { name, matches } of results) {
    lines.push(`Snapshot: ${name}`);
    for (const { key, value } of matches) {
      lines.push(`  ${key}=${value}`);
    }
  }
  return lines.join('\n');
}

module.exports = { searchSnapshots, formatSearchResults };
