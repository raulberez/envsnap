const fs = require('fs');
const path = require('path');
const os = require('os');

let tmpDir;

jest.mock('./snapshot', () => ({ getSnapshotsDir: () => tmpDir }));
jest.mock('./tag', () => {
  let tags = {};
  return {
    loadTags: () => tags,
    saveTags: (t) => { tags = t; },
    _setTags: (t) => { tags = t; },
  };
});

const { renameSnapshot, snapshotExists } = require('./rename');
const tagModule = require('./tag');

function writeSnap(name, vars = {}) {
  const data = { name, timestamp: Date.now(), vars };
  fs.writeFileSync(path.join(tmpDir, `${name}.json`), JSON.stringify(data));
}

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-rename-'));
  tagModule._setTags({});
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('renames a snapshot file and updates name field', () => {
  writeSnap('old-snap', { FOO: 'bar' });
  renameSnapshot('old-snap', 'new-snap');
  expect(snapshotExists('new-snap')).toBe(true);
  expect(snapshotExists('old-snap')).toBe(false);
  const data = JSON.parse(fs.readFileSync(path.join(tmpDir, 'new-snap.json'), 'utf8'));
  expect(data.name).toBe('new-snap');
  expect(data.vars.FOO).toBe('bar');
});

test('throws if old snapshot does not exist', () => {
  expect(() => renameSnapshot('ghost', 'new-snap')).toThrow('does not exist');
});

test('throws if new snapshot name already exists', () => {
  writeSnap('snap-a');
  writeSnap('snap-b');
  expect(() => renameSnapshot('snap-a', 'snap-b')).toThrow('already exists');
});

test('throws if old and new names are the same', () => {
  writeSnap('snap-a');
  expect(() => renameSnapshot('snap-a', 'snap-a')).toThrow('must be different');
});

test('updates tag references when renaming', () => {
  writeSnap('snap-old');
  tagModule._setTags({ production: ['snap-old', 'other-snap'] });
  renameSnapshot('snap-old', 'snap-new');
  const tags = tagModule.loadTags();
  expect(tags.production).toContain('snap-new');
  expect(tags.production).not.toContain('snap-old');
});

test('returns old and new names on success', () => {
  writeSnap('alpha');
  const result = renameSnapshot('alpha', 'beta');
  expect(result).toEqual({ oldName: 'alpha', newName: 'beta' });
});
