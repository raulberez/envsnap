const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { getSnapshotsDir } = require('./snapshot');

function getChecksumFile(baseDir) {
  return path.join(baseDir || getSnapshotsDir(), 'checksums.json');
}

function loadChecksums(baseDir) {
  const file = getChecksumFile(baseDir);
  if (!fs.existsSync(file)) return {};
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return {};
  }
}

function saveChecksums(checksums, baseDir) {
  const file = getChecksumFile(baseDir);
  fs.writeFileSync(file, JSON.stringify(checksums, null, 2));
}

function computeChecksum(snapshotName, baseDir) {
  const snapshotPath = path.join(baseDir || getSnapshotsDir(), `${snapshotName}.json`);
  if (!fs.existsSync(snapshotPath)) {
    throw new Error(`Snapshot '${snapshotName}' not found`);
  }
  const content = fs.readFileSync(snapshotPath, 'utf8');
  return crypto.createHash('sha256').update(content).digest('hex');
}

function recordChecksum(snapshotName, baseDir) {
  const checksums = loadChecksums(baseDir);
  checksums[snapshotName] = {
    hash: computeChecksum(snapshotName, baseDir),
    recordedAt: new Date().toISOString(),
  };
  saveChecksums(checksums, baseDir);
  return checksums[snapshotName];
}

function verifyChecksum(snapshotName, baseDir) {
  const checksums = loadChecksums(baseDir);
  const stored = checksums[snapshotName];
  if (!stored) {
    return { verified: false, reason: 'No checksum recorded for this snapshot' };
  }
  const current = computeChecksum(snapshotName, baseDir);
  if (current === stored.hash) {
    return { verified: true, hash: current, recordedAt: stored.recordedAt };
  }
  return { verified: false, reason: 'Checksum mismatch — snapshot may have been tampered with', expected: stored.hash, actual: current };
}

function removeChecksum(snapshotName, baseDir) {
  const checksums = loadChecksums(baseDir);
  if (!checksums[snapshotName]) return false;
  delete checksums[snapshotName];
  saveChecksums(checksums, baseDir);
  return true;
}

function formatChecksumResult(result, snapshotName) {
  if (result.verified) {
    return `✔ ${snapshotName}: checksum verified (${result.hash.slice(0, 12)}…)`;
  }
  return `✘ ${snapshotName}: ${result.reason}`;
}

module.exports = {
  getChecksumFile,
  loadChecksums,
  saveChecksums,
  computeChecksum,
  recordChecksum,
  verifyChecksum,
  removeChecksum,
  formatChecksumResult,
};
