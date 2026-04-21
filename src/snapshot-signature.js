/**
 * snapshot-signature.js
 * Sign snapshots with a simple HMAC so you can verify they haven't been
 * tampered with since they were created.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { getSnapshotsDir } = require('./snapshot');

const SIGNATURES_FILE = 'signatures.json';

/** Path to the signatures store */
function getSignaturesFile(baseDir) {
  return path.join(baseDir || getSnapshotsDir(), SIGNATURES_FILE);
}

/** Load all stored signatures */
function loadSignatures(baseDir) {
  const file = getSignaturesFile(baseDir);
  if (!fs.existsSync(file)) return {};
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return {};
  }
}

/** Persist signatures to disk */
function saveSignatures(signatures, baseDir) {
  const file = getSignaturesFile(baseDir);
  fs.writeFileSync(file, JSON.stringify(signatures, null, 2));
}

/**
 * Compute an HMAC-SHA256 signature for a snapshot file.
 * @param {string} snapshotPath - Absolute path to the .json snapshot file
 * @param {string} secret - Shared secret / passphrase
 * @returns {string} hex-encoded HMAC digest
 */
function computeSignature(snapshotPath, secret) {
  if (!fs.existsSync(snapshotPath)) {
    throw new Error(`Snapshot file not found: ${snapshotPath}`);
  }
  const content = fs.readFileSync(snapshotPath);
  return crypto.createHmac('sha256', secret).update(content).digest('hex');
}

/**
 * Sign a snapshot and store the signature.
 * @param {string} name - Snapshot name
 * @param {string} secret - Secret used to sign
 * @param {string} [baseDir]
 * @returns {{ name: string, signature: string, signedAt: string }}
 */
function signSnapshot(name, secret, baseDir) {
  const dir = baseDir || getSnapshotsDir();
  const snapshotPath = path.join(dir, `${name}.json`);
  const signature = computeSignature(snapshotPath, secret);
  const signedAt = new Date().toISOString();

  const signatures = loadSignatures(dir);
  signatures[name] = { signature, signedAt };
  saveSignatures(signatures, dir);

  return { name, signature, signedAt };
}

/**
 * Verify a snapshot against its stored signature.
 * @param {string} name - Snapshot name
 * @param {string} secret - Secret used when signing
 * @param {string} [baseDir]
 * @returns {{ valid: boolean, reason?: string, signedAt?: string }}
 */
function verifySnapshot(name, secret, baseDir) {
  const dir = baseDir || getSnapshotsDir();
  const snapshotPath = path.join(dir, `${name}.json`);

  const signatures = loadSignatures(dir);
  const record = signatures[name];

  if (!record) {
    return { valid: false, reason: 'No signature found for this snapshot' };
  }

  let current;
  try {
    current = computeSignature(snapshotPath, secret);
  } catch (err) {
    return { valid: false, reason: err.message };
  }

  const valid = crypto.timingSafeEqual(
    Buffer.from(current, 'hex'),
    Buffer.from(record.signature, 'hex')
  );

  return valid
    ? { valid: true, signedAt: record.signedAt }
    : { valid: false, reason: 'Signature mismatch — snapshot may have been modified' };
}

/**
 * Remove the stored signature for a snapshot.
 * @param {string} name
 * @param {string} [baseDir]
 */
function removeSignature(name, baseDir) {
  const dir = baseDir || getSnapshotsDir();
  const signatures = loadSignatures(dir);
  delete signatures[name];
  saveSignatures(signatures, dir);
}

/**
 * Return a human-readable summary of a verification result.
 * @param {string} name
 * @param {{ valid: boolean, reason?: string, signedAt?: string }} result
 * @returns {string}
 */
function formatVerificationResult(name, result) {
  if (result.valid) {
    return `✔  ${name} — signature valid (signed ${result.signedAt})`;
  }
  return `✘  ${name} — ${result.reason}`;
}

module.exports = {
  getSignaturesFile,
  loadSignatures,
  saveSignatures,
  computeSignature,
  signSnapshot,
  verifySnapshot,
  removeSignature,
  formatVerificationResult,
};
