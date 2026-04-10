const fs = require('fs');
const path = require('path');
const os = require('os');
const { encryptSnapshot, decryptSnapshot, isEncrypted } = require('./encrypt');

jest.mock('./snapshot', () => ({
  getSnapshotsDir: () => tmpDir,
}));

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-enc-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

function writeSnap(name, data) {
  fs.writeFileSync(path.join(tmpDir, `${name}.json`), JSON.stringify(data));
}

test('encryptSnapshot creates .enc file', () => {
  writeSnap('prod', { DB_URL: 'postgres://localhost/db', SECRET: 'abc123' });
  const outPath = encryptSnapshot('prod', 'mypassword');
  expect(fs.existsSync(outPath)).toBe(true);
  expect(outPath).toMatch(/prod\.enc$/);
});

test('decryptSnapshot returns original data', () => {
  const original = { DB_URL: 'postgres://localhost/db', SECRET: 'abc123' };
  writeSnap('prod', original);
  encryptSnapshot('prod', 'mypassword');
  const result = decryptSnapshot('prod', 'mypassword');
  expect(result).toEqual(original);
});

test('decryptSnapshot throws on wrong passphrase', () => {
  writeSnap('prod', { KEY: 'value' });
  encryptSnapshot('prod', 'correctpass');
  expect(() => decryptSnapshot('prod', 'wrongpass')).toThrow();
});

test('encryptSnapshot throws if snapshot does not exist', () => {
  expect(() => encryptSnapshot('ghost', 'pass')).toThrow('Snapshot "ghost" not found.');
});

test('decryptSnapshot throws if .enc file does not exist', () => {
  expect(() => decryptSnapshot('missing', 'pass')).toThrow('Encrypted snapshot "missing" not found.');
});

test('isEncrypted returns true when .enc file exists', () => {
  writeSnap('staging', { FOO: 'bar' });
  expect(isEncrypted('staging')).toBe(false);
  encryptSnapshot('staging', 'pass');
  expect(isEncrypted('staging')).toBe(true);
});
