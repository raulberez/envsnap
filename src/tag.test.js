const fs = require('fs');
const os = require('os');
const path = require('path');

jest.mock('./snapshot', () => ({
  getSnapshotsDir: () => tmpDir,
}));

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-tag-'));
  jest.resetModules();
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

function getModule() {
  jest.mock('./snapshot', () => ({ getSnapshotsDir: () => tmpDir }));
  return require('./tag');
}

test('addTag creates a new tag entry', () => {
  const { addTag, listAllTags } = getModule();
  addTag('snap-001', 'production');
  const tags = listAllTags();
  expect(tags['production']).toContain('snap-001');
});

test('addTag does not duplicate entries', () => {
  const { addTag, listAllTags } = getModule();
  addTag('snap-001', 'staging');
  addTag('snap-001', 'staging');
  expect(listAllTags()['staging'].length).toBe(1);
});

test('removeTag removes snapshot from tag', () => {
  const { addTag, removeTag, listAllTags } = getModule();
  addTag('snap-001', 'dev');
  addTag('snap-002', 'dev');
  removeTag('snap-001', 'dev');
  expect(listAllTags()['dev']).not.toContain('snap-001');
  expect(listAllTags()['dev']).toContain('snap-002');
});

test('removeTag deletes tag key when empty', () => {
  const { addTag, removeTag, listAllTags } = getModule();
  addTag('snap-001', 'temp');
  removeTag('snap-001', 'temp');
  expect(listAllTags()['temp']).toBeUndefined();
});

test('getSnapshotsByTag returns correct list', () => {
  const { addTag, getSnapshotsByTag } = getModule();
  addTag('snap-001', 'release');
  addTag('snap-002', 'release');
  expect(getSnapshotsByTag('release')).toEqual(['snap-001', 'snap-002']);
});

test('getTagsForSnapshot returns all tags for a snapshot', () => {
  const { addTag, getTagsForSnapshot } = getModule();
  addTag('snap-001', 'production');
  addTag('snap-001', 'stable');
  const tags = getTagsForSnapshot('snap-001');
  expect(tags).toContain('production');
  expect(tags).toContain('stable');
});

test('returns empty array for unknown tag', () => {
  const { getSnapshotsByTag } = getModule();
  expect(getSnapshotsByTag('nonexistent')).toEqual([]);
});
