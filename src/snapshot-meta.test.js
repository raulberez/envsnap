const fs = require('fs');
const os = require('os');
const path = require('path');

let tmpDir;

function getModule() {
  jest.resetModules();
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-meta-'));
  jest.mock('./snapshot', () => ({ getSnapshotsDir: () => tmpDir }));
  return require('./snapshot-meta');
}

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('loadMeta returns empty object when no meta file', () => {
  const { loadMeta } = getModule();
  expect(loadMeta('mysnap')).toEqual({});
});

test('setMetaField creates and updates meta', () => {
  const { setMetaField, loadMeta } = getModule();
  setMetaField('mysnap', 'author', 'alice');
  const meta = loadMeta('mysnap');
  expect(meta.author).toBe('alice');
  expect(meta.updatedAt).toBeDefined();
});

test('getMetaField retrieves a specific field', () => {
  const { setMetaField, getMetaField } = getModule();
  setMetaField('mysnap', 'env', 'production');
  expect(getMetaField('mysnap', 'env')).toBe('production');
  expect(getMetaField('mysnap', 'missing')).toBeUndefined();
});

test('deleteMetaField removes a field and returns true', () => {
  const { setMetaField, deleteMetaField, loadMeta } = getModule();
  setMetaField('mysnap', 'author', 'bob');
  const result = deleteMetaField('mysnap', 'author');
  expect(result).toBe(true);
  expect(loadMeta('mysnap').author).toBeUndefined();
});

test('deleteMetaField returns false for missing key', () => {
  const { deleteMetaField } = getModule();
  expect(deleteMetaField('mysnap', 'nope')).toBe(false);
});

test('deleteAllMeta removes meta file', () => {
  const { setMetaField, deleteAllMeta, getMetaFile } = getModule();
  setMetaField('mysnap', 'x', '1');
  expect(fs.existsSync(getMetaFile('mysnap'))).toBe(true);
  expect(deleteAllMeta('mysnap')).toBe(true);
  expect(fs.existsSync(getMetaFile('mysnap'))).toBe(false);
});

test('formatMeta returns readable output', () => {
  const { setMetaField, loadMeta, formatMeta } = getModule();
  setMetaField('mysnap', 'author', 'carol');
  const meta = loadMeta('mysnap');
  const output = formatMeta('mysnap', meta);
  expect(output).toContain('mysnap');
  expect(output).toContain('author: carol');
});

test('formatMeta handles empty meta', () => {
  const { formatMeta } = getModule();
  const output = formatMeta('mysnap', {});
  expect(output).toContain('No metadata');
});
