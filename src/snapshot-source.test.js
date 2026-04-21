const fs = require('fs');
const os = require('os');
const path = require('path');

let tmpDir;

function getModule() {
  jest.resetModules();
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-source-'));
  jest.mock('./snapshot', () => ({ getSnapshotsDir: () => tmpDir }));
  return require('./snapshot-source');
}

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('loadSources returns empty object when file missing', () => {
  const { loadSources } = getModule();
  expect(loadSources()).toEqual({});
});

test('setSource and getSource round-trip', () => {
  const { setSource, getSource } = getModule();
  setSource('my-snap', '.env.production');
  const result = getSource('my-snap');
  expect(result).not.toBeNull();
  expect(result.source).toBe('.env.production');
  expect(result.recordedAt).toBeDefined();
});

test('getSource returns null for unknown snapshot', () => {
  const { getSource } = getModule();
  expect(getSource('nonexistent')).toBeNull();
});

test('removeSource deletes entry', () => {
  const { setSource, removeSource, getSource } = getModule();
  setSource('snap-a', '.env');
  removeSource('snap-a');
  expect(getSource('snap-a')).toBeNull();
});

test('listSources returns all entries', () => {
  const { setSource, listSources } = getModule();
  setSource('snap-x', '.env.local');
  setSource('snap-y', '.env.test');
  const all = listSources();
  expect(Object.keys(all)).toHaveLength(2);
  expect(all['snap-x'].source).toBe('.env.local');
});

test('formatSourceList returns message when empty', () => {
  const { formatSourceList } = getModule();
  expect(formatSourceList({})).toBe('No source records found.');
});

test('formatSourceList formats entries correctly', () => {
  const { setSource, listSources, formatSourceList } = getModule();
  setSource('snap-z', '.env.staging');
  const output = formatSourceList(listSources());
  expect(output).toContain('snap-z');
  expect(output).toContain('.env.staging');
});
