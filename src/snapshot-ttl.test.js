const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  getTtlFile,
  loadTtls,
  setTtl,
  getTtl,
  removeTtl,
  isExpired,
  getExpiredSnapshots,
  formatTtl,
} = require('./snapshot-ttl');

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-ttl-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('getTtlFile returns path inside dir', () => {
  expect(getTtlFile(tmpDir)).toBe(path.join(tmpDir, 'ttl.json'));
});

test('loadTtls returns empty object when file missing', () => {
  expect(loadTtls(tmpDir)).toEqual({});
});

test('setTtl stores entry with expiresAt', () => {
  const before = Date.now();
  const entry = setTtl('snap1', 3600, tmpDir);
  expect(entry.seconds).toBe(3600);
  expect(entry.expiresAt).toBeGreaterThan(before);
  expect(entry.setAt).toBeGreaterThanOrEqual(before);
});

test('setTtl throws for invalid seconds', () => {
  expect(() => setTtl('snap1', -5, tmpDir)).toThrow('TTL must be a positive number');
  expect(() => setTtl('snap1', 0, tmpDir)).toThrow('TTL must be a positive number');
});

test('getTtl returns null for unknown snapshot', () => {
  expect(getTtl('nope', tmpDir)).toBeNull();
});

test('getTtl returns entry after setTtl', () => {
  setTtl('snap2', 60, tmpDir);
  const entry = getTtl('snap2', tmpDir);
  expect(entry).not.toBeNull();
  expect(entry.seconds).toBe(60);
});

test('removeTtl deletes entry and returns true', () => {
  setTtl('snap3', 120, tmpDir);
  expect(removeTtl('snap3', tmpDir)).toBe(true);
  expect(getTtl('snap3', tmpDir)).toBeNull();
});

test('removeTtl returns false for missing entry', () => {
  expect(removeTtl('ghost', tmpDir)).toBe(false);
});

test('isExpired returns false for future TTL', () => {
  setTtl('snap4', 9999, tmpDir);
  expect(isExpired('snap4', tmpDir)).toBe(false);
});

test('isExpired returns true for past expiresAt', () => {
  const ttls = { snap5: { seconds: 1, expiresAt: Date.now() - 1000, setAt: Date.now() - 2000 } };
  fs.writeFileSync(path.join(tmpDir, 'ttl.json'), JSON.stringify(ttls));
  expect(isExpired('snap5', tmpDir)).toBe(true);
});

test('getExpiredSnapshots returns only expired names', () => {
  setTtl('live', 9999, tmpDir);
  const ttls = JSON.parse(fs.readFileSync(path.join(tmpDir, 'ttl.json'), 'utf8'));
  ttls['dead'] = { seconds: 1, expiresAt: Date.now() - 500, setAt: Date.now() - 1500 };
  fs.writeFileSync(path.join(tmpDir, 'ttl.json'), JSON.stringify(ttls));
  const expired = getExpiredSnapshots(tmpDir);
  expect(expired).toContain('dead');
  expect(expired).not.toContain('live');
});

test('formatTtl shows no TTL message for unknown snapshot', () => {
  expect(formatTtl('x', tmpDir)).toMatch('no TTL set');
});

test('formatTtl shows remaining seconds for active TTL', () => {
  setTtl('snap6', 3600, tmpDir);
  const msg = formatTtl('snap6', tmpDir);
  expect(msg).toMatch('remaining');
  expect(msg).toMatch('3600s TTL');
});
