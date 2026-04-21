const fs = require('fs');
const os = require('os');
const path = require('path');

let tmpDir;
let mod;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-project-'));
  jest.resetModules();
  jest.doMock('./snapshot', () => ({ getSnapshotsDir: () => tmpDir }));
  mod = require('./snapshot-project');
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('loadProjects returns empty object when no file', () => {
  expect(mod.loadProjects()).toEqual({});
});

test('setProject and getProject roundtrip', () => {
  mod.setProject('snap1', 'my-app');
  expect(mod.getProject('snap1')).toBe('my-app');
});

test('getProject returns null for unknown snapshot', () => {
  expect(mod.getProject('nonexistent')).toBeNull();
});

test('removeProject deletes entry', () => {
  mod.setProject('snap1', 'my-app');
  mod.removeProject('snap1');
  expect(mod.getProject('snap1')).toBeNull();
});

test('listByProject returns matching snapshots', () => {
  mod.setProject('snap1', 'my-app');
  mod.setProject('snap2', 'other-app');
  mod.setProject('snap3', 'my-app');
  const result = mod.listByProject('my-app');
  expect(result).toHaveLength(2);
  expect(result).toContain('snap1');
  expect(result).toContain('snap3');
});

test('listByProject returns empty array for unknown project', () => {
  expect(mod.listByProject('ghost')).toEqual([]);
});

test('getAllProjects returns sorted unique project names', () => {
  mod.setProject('snap1', 'zebra');
  mod.setProject('snap2', 'alpha');
  mod.setProject('snap3', 'zebra');
  expect(mod.getAllProjects()).toEqual(['alpha', 'zebra']);
});
