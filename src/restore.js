const fs = require('fs');
const path = require('path');
const { getSnapshotsDir } = require('./snapshot');

/**
 * Load a snapshot by name and return its env vars as an object
 */
function loadSnapshot(snapshotName) {
  const snapshotsDir = getSnapshotsDir();
  const snapshotPath = path.join(snapshotsDir, `${snapshotName}.json`);

  if (!fs.existsSync(snapshotPath)) {
    throw new Error(`Snapshot "${snapshotName}" not found at ${snapshotPath}`);
  }

  const raw = fs.readFileSync(snapshotPath, 'utf8');

  let snapshot;
  try {
    snapshot = JSON.parse(raw);
  } catch (err) {
    throw new Error(`Snapshot "${snapshotName}" contains invalid JSON: ${err.message}`);
  }

  return snapshot.env || {};
}

/**
 * Format env vars as a .env file string
 */
function formatEnvFile(envVars) {
  return Object.entries(envVars)
    .map(([key, value]) => {
      const escaped = String(value).includes(' ') ? `"${value}"` : value;
      return `${key}=${escaped}`;
    })
    .join('\n') + '\n';
}

/**
 * Write env vars to a target .env file
 */
function restoreToFile(snapshotName, targetPath = '.env', options = {}) {
  const { overwrite = false } = options;

  if (fs.existsSync(targetPath) && !overwrite) {
    throw new Error(
      `File "${targetPath}" already exists. Use --overwrite to replace it.`
    );
  }

  const envVars = loadSnapshot(snapshotName);
  const content = formatEnvFile(envVars);
  fs.writeFileSync(targetPath, content, 'utf8');

  return { targetPath, count: Object.keys(envVars).length };
}

/**
 * Apply env vars directly to process.env
 */
function restoreToProcess(snapshotName) {
  const envVars = loadSnapshot(snapshotName);
  Object.assign(process.env, envVars);
  return { count: Object.keys(envVars).length };
}

module.exports = { loadSnapshot, formatEnvFile, restoreToFile, restoreToProcess };
