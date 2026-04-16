const fs = require('fs');
const path = require('path');
const os = require('os');

let tmpDir;
beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-owner-'));
  jest.resetModules();
  jest.mock('./snapshot', () => ({ getSnapshotsDir: () => tmpDir }));
});
afterEach(() => fs.rmSync(tmpDir, { recursive: true }));

function getModule() {
  return require('./snapshot-owner');
}

test('loadOwners returns empty object when no file', () => {
  const { loadOwners } = getModule();
  expect(loadOwners()).toEqual({});
});

test('setOwner and getOwner roundtrip', () => {
  const { setOwner, getOwner } = getModule();
  setOwner('snap1', 'alice');
  const info = getOwner('snap1');
  expect(info.owner).toBe('alice');
  expect(info.setAt).toBeDefined();
});

test('getOwner returns null for unknown snapshot', () => {
  const { getOwner } = getModule();
  expect(getOwner('nope')).toBeNull();
});

test('removeOwner removes entry', () => {
  const { setOwner, removeOwner, getOwner } = getModule();
  setOwner('snap1', 'bob');
  expect(removeOwner('snap1')).toBe(true);
  expect(getOwner('snap1')).toBeNull();
});

test('removeOwner returns false for unknown', () => {
  const { removeOwner } = getModule();
  expect(removeOwner('ghost')).toBe(false);
});

test('listOwned filters by owner', () => {
  const { setOwner, listOwned } = getModule();
  setOwner('snap1', 'alice');
  setOwner('snap2', 'bob');
  setOwner('snap3', 'alice');
  const owned = listOwned('alice');
  expect(owned.map(o => o.name).sort()).toEqual(['snap1', 'snap3']);
});

test('formatOwnerInfo formats correctly', () => {
  const { setOwner, getOwner, formatOwnerInfo } = getModule();
  setOwner('snap1', 'carol');
  const info = getOwner('snap1');
  const result = formatOwnerInfo('snap1', info);
  expect(result).toContain('carol');
  expect(result).toContain('snap1');
});

test('formatOwnerInfo handles no owner', () => {
  const { formatOwnerInfo } = getModule();
  expect(formatOwnerInfo('snap1', null)).toContain('no owner');
});
