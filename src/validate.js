const fs = require('fs');
const path = require('path');
const { getSnapshotsDir } = require('./snapshot');

/**
 * Validate that a snapshot file is well-formed JSON with string key/value pairs.
 * Returns { valid: boolean, errors: string[] }
 */
function validateSnapshot(snapshotName) {
  const dir = getSnapshotsDir();
  const filePath = path.join(dir, `${snapshotName}.json`);

  if (!fs.existsSync(filePath)) {
    return { valid: false, errors: [`Snapshot "${snapshotName}" not found`] };
  }

  let data;
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    data = JSON.parse(raw);
  } catch (e) {
    return { valid: false, errors: [`Failed to parse snapshot: ${e.message}`] };
  }

  const errors = [];

  if (typeof data !== 'object' || Array.isArray(data) || data === null) {
    errors.push('Snapshot root must be a JSON object');
    return { valid: false, errors };
  }

  for (const [key, value] of Object.entries(data)) {
    if (typeof key !== 'string' || key.trim() === '') {
      errors.push(`Invalid key: ${JSON.stringify(key)} (must be a non-empty string)`);
    }
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
      errors.push(`Key "${key}" is not a valid environment variable name`);
    }
    if (typeof value !== 'string') {
      errors.push(`Value for key "${key}" must be a string, got ${typeof value}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

function formatValidationResult(snapshotName, result) {
  if (result.valid) {
    return `✔ Snapshot "${snapshotName}" is valid`;
  }
  const lines = [`✘ Snapshot "${snapshotName}" has ${result.errors.length} error(s):`];
  for (const err of result.errors) {
    lines.push(`  - ${err}`);
  }
  return lines.join('\n');
}

module.exports = { validateSnapshot, formatValidationResult };
