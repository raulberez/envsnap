const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { getSnapshotsDir } = require('./snapshot');

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

function deriveKey(passphrase) {
  return crypto.scryptSync(passphrase, 'envsnap-salt', KEY_LENGTH);
}

function encryptSnapshot(name, passphrase) {
  const dir = getSnapshotsDir();
  const srcPath = path.join(dir, `${name}.json`);

  if (!fs.existsSync(srcPath)) {
    throw new Error(`Snapshot "${name}" not found.`);
  }

  const plaintext = fs.readFileSync(srcPath);
  const key = deriveKey(passphrase);
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();

  const outPath = path.join(dir, `${name}.enc`);
  const payload = Buffer.concat([iv, tag, encrypted]);
  fs.writeFileSync(outPath, payload);

  return outPath;
}

function decryptSnapshot(name, passphrase) {
  const dir = getSnapshotsDir();
  const encPath = path.join(dir, `${name}.enc`);

  if (!fs.existsSync(encPath)) {
    throw new Error(`Encrypted snapshot "${name}" not found.`);
  }

  const payload = fs.readFileSync(encPath);
  const iv = payload.subarray(0, IV_LENGTH);
  const tag = payload.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const encrypted = payload.subarray(IV_LENGTH + TAG_LENGTH);

  const key = deriveKey(passphrase);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return JSON.parse(decrypted.toString('utf8'));
}

function isEncrypted(name) {
  const dir = getSnapshotsDir();
  return fs.existsSync(path.join(dir, `${name}.enc`));
}

module.exports = { encryptSnapshot, decryptSnapshot, isEncrypted };
