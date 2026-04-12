const fs = require('fs');
const path = require('path');
const { getSnapshotsDir } = require('./snapshot');

function getSnapshotPath(name) {
  return path.join(getSnapshotsDir(), `${name}.json`);
}

function loadSnapshot(name) {
  const filePath = getSnapshotPath(name);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Snapshot "${name}" not found`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function computeSize(snapshot) {
  const vars = snapshot.vars || {};
  const keyCount = Object.keys(vars).length;
  const totalBytes = Object.entries(vars).reduce((sum, [k, v]) => {
    return sum + Buffer.byteLength(k, 'utf8') + Buffer.byteLength(String(v), 'utf8');
  }, 0);
  const avgValueLength = keyCount === 0 ? 0 :
    Object.values(vars).reduce((sum, v) => sum + String(v).length, 0) / keyCount;

  return {
    keyCount,
    totalBytes,
    avgValueLength: Math.round(avgValueLength * 100) / 100,
    rawJson: Buffer.byteLength(JSON.stringify(snapshot), 'utf8'),
  };
}

function formatSize(name, sizeInfo) {
  const lines = [
    `Snapshot: ${name}`,
    `  Variables : ${sizeInfo.keyCount}`,
    `  Total key+value bytes : ${sizeInfo.totalBytes} B`,
    `  Avg value length      : ${sizeInfo.avgValueLength} chars`,
    `  Raw JSON size         : ${sizeInfo.rawJson} B`,
  ];
  return lines.join('\n');
}

module.exports = { getSnapshotPath, loadSnapshot, computeSize, formatSize };
