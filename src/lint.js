const fs = require('fs');
const path = require('path');
const { getSnapshotsDir } = require('./snapshot');

const VALID_KEY_REGEX = /^[A-Z_][A-Z0-9_]*$/;
const SUSPICIOUS_PATTERNS = [
  { pattern: /password/i, label: 'password' },
  { pattern: /secret/i, label: 'secret' },
  { pattern: /token/i, label: 'token' },
  { pattern: /api_key/i, label: 'api key' },
  { pattern: /private/i, label: 'private' },
];

function getSnapshotPath(name) {
  return path.join(getSnapshotsDir(), `${name}.json`);
}

function lintSnapshot(name) {
  const filePath = getSnapshotPath(name);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Snapshot "${name}" not found`);
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(raw);
  const warnings = [];
  const errors = [];

  for (const [key, value] of Object.entries(data)) {
    if (!VALID_KEY_REGEX.test(key)) {
      errors.push({ key, message: `Key "${key}" does not follow UPPER_SNAKE_CASE convention` });
    }

    if (value === '' || value === null || value === undefined) {
      warnings.push({ key, message: `Key "${key}" has an empty value` });
    }

    for (const { pattern, label } of SUSPICIOUS_PATTERNS) {
      if (pattern.test(key) && value && value.length > 0) {
        warnings.push({ key, message: `Key "${key}" looks like a ${label} — consider encrypting this snapshot` });
        break;
      }
    }
  }

  return { name, keyCount: Object.keys(data).length, warnings, errors };
}

function formatLintResult(result) {
  const lines = [`Snapshot: ${result.name} (${result.keyCount} keys)`];

  if (result.errors.length === 0 && result.warnings.length === 0) {
    lines.push('  ✔ No issues found');
    return lines.join('\n');
  }

  for (const err of result.errors) {
    lines.push(`  ✖ ERROR: ${err.message}`);
  }

  for (const warn of result.warnings) {
    lines.push(`  ⚠ WARN:  ${warn.message}`);
  }

  return lines.join('\n');
}

module.exports = { lintSnapshot, formatLintResult, getSnapshotPath };
