const fs = require('fs');
const path = require('path');
const { getSnapshotsDir } = require('./snapshot');

function getSnapshotPath(name) {
  return path.join(getSnapshotsDir(), `${name}.json`);
}

function loadSnapshot(name) {
  const filePath = getSnapshotPath(name);
  if (!fs.existsSync(filePath)) throw new Error(`Snapshot '${name}' not found`);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function computeStats(snapshot) {
  const vars = snapshot.vars || {};
  const keys = Object.keys(vars);
  const values = Object.values(vars);

  const totalKeys = keys.length;
  const emptyValues = values.filter(v => v === '' || v == null).length;
  const uniqueValues = new Set(values).size;
  const avgValueLength = totalKeys === 0 ? 0 :
    Math.round(values.reduce((sum, v) => sum + String(v).length, 0) / totalKeys);

  const longestKey = keys.reduce((a, b) => a.length >= b.length ? a : b, '');
  const shortestKey = keys.reduce((a, b) => a.length <= b.length ? a : b, keys[0] || '');

  return {
    totalKeys,
    emptyValues,
    nonEmptyValues: totalKeys - emptyValues,
    uniqueValues,
    avgValueLength,
    longestKey,
    shortestKey,
    createdAt: snapshot.createdAt || null,
    tags: (snapshot.tags || []).length,
  };
}

function formatStats(name, stats) {
  const lines = [
    `Stats for snapshot: ${name}`,
    `  Total keys       : ${stats.totalKeys}`,
    `  Non-empty values : ${stats.nonEmptyValues}`,
    `  Empty values     : ${stats.emptyValues}`,
    `  Unique values    : ${stats.uniqueValues}`,
    `  Avg value length : ${stats.avgValueLength}`,
    `  Longest key      : ${stats.longestKey || '(none)'}`,
    `  Shortest key     : ${stats.shortestKey || '(none)'}`,
    `  Tags             : ${stats.tags}`,
  ];
  if (stats.createdAt) lines.push(`  Created at       : ${stats.createdAt}`);
  return lines.join('\n');
}

module.exports = { computeStats, formatStats, loadSnapshot };
