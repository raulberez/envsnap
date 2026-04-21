const fs = require('fs');
const path = require('path');
const os = require('os');
const {
  computeChecksum,
  recordChecksum,
  verifyChecksum,
  removeChecksum,
  loadChecksums,
  formatChecksumResult,
} = require('./snapshot-checksum');

function writeSnap(dir, name, data) {
  fs.writeFileSync(path.join(dir, `${name}.json`), JSON.stringify(data));
}

let tmpDir;
beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-checksum-'));
});
afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('computeChecksum returns sha256 hex string', () => {
  writeSnap(tmpDir, 'snap1', { FOO: 'bar' });
  const hash = computeChecksum('snap1', tmpDir);
  expect(hash).toMatch(/^[a-f0-9]{64}$/);
});

test('computeChecksum throws if snapshot missing', () => {
  expect(() => computeChecksum('ghost', tmpDir)).toThrow("Snapshot 'ghost' not found");
});

test('recordChecksum stores hash and recordedAt', () => {
  writeSnap(tmpDir, 'snap1', { FOO: 'bar' });
  const entry = recordChecksum('snap1', tmpDir);
  expect(entry).toHaveProperty('hash');
  expect(entry).toHaveProperty('recordedAt');
  const loaded = loadChecksums(tmpDir);
  expect(loaded['snap1'].hash).toBe(entry.hash);
});

test('verifyChecksum returns verified true when unchanged', () => {
  writeSnap(tmpDir, 'snap1', { FOO: 'bar' });
  recordChecksum('snap1', tmpDir);
  const result = verifyChecksum('snap1', tmpDir);
  expect(result.verified).toBe(true);
});

test('verifyChecksum returns verified false when snapshot changes', () => {
  writeSnap(tmpDir, 'snap1', { FOO: 'bar' });
  recordChecksum('snap1', tmpDir);
  writeSnap(tmpDir, 'snap1', { FOO: 'tampered' });
  const result = verifyChecksum('snap1', tmpDir);
  expect(result.verified).toBe(false);
  expect(result.reason).toMatch(/mismatch/);
});

test('verifyChecksum returns no-record message if not recorded', () => {
  writeSnap(tmpDir, 'snap1', { FOO: 'bar' });
  const result = verifyChecksum('snap1', tmpDir);
  expect(result.verified).toBe(false);
  expect(result.reason).toMatch(/No checksum/);
});

test('removeChecksum deletes entry', () => {
  writeSnap(tmpDir, 'snap1', { FOO: 'bar' });
  recordChecksum('snap1', tmpDir);
  const removed = removeChecksum('snap1', tmpDir);
  expect(removed).toBe(true);
  expect(loadChecksums(tmpDir)['snap1']).toBeUndefined();
});

test('formatChecksumResult formats pass and fail', () => {
  expect(formatChecksumResult({ verified: true, hash: 'abc123def456' }, 'mysnap')).toMatch(/✔/);
  expect(formatChecksumResult({ verified: false, reason: 'mismatch' }, 'mysnap')).toMatch(/✘/);
});
