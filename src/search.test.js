const fs = require('fs');
const path = require('path');
const os = require('os');
const { searchSnapshots, formatSearchResults } = require('./search');

jest.mock('./snapshot');
jest.mock('./tag');

const { getSnapshotsDir } = require('./snapshot');
const { loadTags } = require('./tag');

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-search-'));
  getSnapshotsDir.mockReturnValue(tmpDir);
  loadTags.mockReturnValue({});
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

function writeSnap(name, env) {
  fs.writeFileSync(
    path.join(tmpDir, `${name}.json`),
    JSON.stringify({ env, createdAt: new Date().toISOString() })
  );
}

test('returns empty array when no snapshots dir', () => {
  getSnapshotsDir.mockReturnValue('/nonexistent/path');
  expect(searchSnapshots({ key: 'PORT' })).toEqual([]);
});

test('finds snapshot by key name', () => {
  writeSnap('dev', { PORT: '3000', HOST: 'localhost' });
  const results = searchSnapshots({ key: 'PORT' });
  expect(results).toHaveLength(1);
  expect(results[0].name).toBe('dev');
  expect(results[0].matches).toEqual([{ key: 'PORT', value: '3000' }]);
});

test('finds snapshot by value substring', () => {
  writeSnap('dev', { DB_URL: 'postgres://localhost/mydb', API: 'http://api.dev' });
  const results = searchSnapshots({ value: 'localhost' });
  expect(results[0].matches.map(m => m.key)).toContain('DB_URL');
});

test('filters by tag', () => {
  writeSnap('dev', { PORT: '3000' });
  writeSnap('prod', { PORT: '8080' });
  loadTags.mockReturnValue({ dev: ['frontend'], prod: ['backend'] });
  const results = searchSnapshots({ key: 'PORT', tag: 'frontend' });
  expect(results).toHaveLength(1);
  expect(results[0].name).toBe('dev');
});

test('returns no matches when key not found', () => {
  writeSnap('dev', { HOST: 'localhost' });
  const results = searchSnapshots({ key: 'MISSING_KEY' });
  expect(results).toEqual([]);
});

test('formatSearchResults with results', () => {
  const results = [{ name: 'dev', matches: [{ key: 'PORT', value: '3000' }] }];
  const output = formatSearchResults(results);
  expect(output).toContain('Snapshot: dev');
  expect(output).toContain('PORT=3000');
});

test('formatSearchResults with no results', () => {
  expect(formatSearchResults([])).toBe('No matches found.');
});
