const fs = require('fs');
const path = require('path');
const { loadSnapshot } = require('./restore');

/**
 * Export a snapshot to various formats
 * @param {string} snapshotName - name of the snapshot to export
 * @param {string} format - output format: 'env', 'json', 'shell'
 * @returns {string} formatted output string
 */
function exportSnapshot(snapshotName, format = 'env') {
  const snapshot = loadSnapshot(snapshotName);

  switch (format) {
    case 'json':
      return formatAsJson(snapshot);
    case 'shell':
      return formatAsShell(snapshot);
    case 'env':
    default:
      return formatAsEnv(snapshot);
  }
}

/**
 * Format snapshot as .env file content
 */
function formatAsEnv(snapshot) {
  return Object.entries(snapshot.vars)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
}

/**
 * Format snapshot as JSON
 */
function formatAsJson(snapshot) {
  return JSON.stringify(snapshot.vars, null, 2);
}

/**
 * Format snapshot as shell export statements
 */
function formatAsShell(snapshot) {
  return Object.entries(snapshot.vars)
    .map(([key, value]) => `export ${key}="${value.replace(/"/g, '\\"')}"`)
    .join('\n');
}

/**
 * Write exported snapshot to a file
 */
function exportToFile(snapshotName, outputPath, format = 'env') {
  const content = exportSnapshot(snapshotName, format);
  fs.writeFileSync(outputPath, content, 'utf8');
  return outputPath;
}

module.exports = { exportSnapshot, exportToFile, formatAsEnv, formatAsJson, formatAsShell };
