const fs = require('fs');
const os = require('os');
const path = require('path');

let tmpDir;

function getModule() {
  jest.resetModules();
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-scope-'));
  jest.mock('./snapshot', () => ({ getSnapshotsDir: () => tmpDir }));
  return require('./snapshot-scope');
}

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('getScope returns null when no scopes file exists', () => {
  const { getScope } = getModule();
  expect(getScope('snap1')).toBeNull();
});

test('setScope and getScope round-trip', () => {
  const { setScope, getScope } = getModule();
  setScope('snap1', 'production');
  expect(getScope('snap1')).toBe('production');
});

test('setScope trims whitespace', () => {
  const { setScope, getScope } = getModule();
  setScope('snap1', '  staging  ');
  expect(getScope('snap1')).toBe('staging');
});

test('setScope throws on empty scope', () => {
  const { setScope } = getModule();
  expect(() => setScope('snap1', '')).toThrow('Scope must be a non-empty string');
});

test('removeScope deletes entry and returns true', () => {
  const { setScope, removeScope, getScope } = getModule();
  setScope('snap1', 'dev');
  expect(removeScope('snap1')).toBe(true);
  expect(getScope('snap1')).toBeNull();
});

test('removeScope returns false when snapshot not scoped', () => {
  const { removeScope } = getModule();
  expect(removeScope('nonexistent')).toBe(false);
});

test('listByScope returns only matching snapshots', () => {
  const { setScope, listByScope } = getModule();
  setScope('snap1', 'production');
  setScope('snap2', 'staging');
  setScope('snap3', 'production');
  const result = listByScope('production');
  expect(result.sort()).toEqual(['snap1', 'snap3']);
});

test('getAllScopes returns unique sorted scope values', () => {
  const { setScope, getAllScopes } = getModule();
  setScope('snap1', 'production');
  setScope('snap2', 'staging');
  setScope('snap3', 'production');
  expect(getAllScopes()).toEqual(['production', 'staging']);
});
