const fs = require('fs');
const os = require('os');
const path = require('path');

let tmpDir;

jest.mock('./snapshot', () => ({ getSnapshotsDir: () => tmpDir }));

const { lintSnapshot, formatLintResult } = require('./lint');

function writeSnap(name, data) {
  fs.writeFileSync(path.join(tmpDir, `${name}.json`), JSON.stringify(data));
}

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-lint-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('returns no issues for a clean snapshot', () => {
  writeSnap('clean', { NODE_ENV: 'production', PORT: '3000' });
  const result = lintSnapshot('clean');
  expect(result.errors).toHaveLength(0);
  expect(result.warnings).toHaveLength(0);
  expect(result.keyCount).toBe(2);
});

test('reports error for non-UPPER_SNAKE_CASE key', () => {
  writeSnap('bad-keys', { myVar: 'hello', GOOD_KEY: 'ok' });
  const result = lintSnapshot('bad-keys');
  expect(result.errors).toHaveLength(1);
  expect(result.errors[0].key).toBe('myVar');
});

test('reports warning for empty value', () => {
  writeSnap('empty-val', { API_URL: '' });
  const result = lintSnapshot('empty-val');
  expect(result.warnings.some(w => w.key === 'API_URL')).toBe(true);
});

test('reports warning for suspicious key names', () => {
  writeSnap('secrets', { DB_PASSWORD: 'hunter2', API_TOKEN: 'abc123' });
  const result = lintSnapshot('secrets');
  const warnKeys = result.warnings.map(w => w.key);
  expect(warnKeys).toContain('DB_PASSWORD');
  expect(warnKeys).toContain('API_TOKEN');
});

test('throws if snapshot does not exist', () => {
  expect(() => lintSnapshot('ghost')).toThrow('not found');
});

test('formatLintResult shows checkmark clean', () => {
  writeSnap('ok', { PORT: '8080' });
  const result = lintSnapshot('ok');
  const output = formatLintResult(result);
  expect(output).toContain('✔');
});

test('formatLintResult shows errors and warnings', () => {
  writeSnap('messy', { badKey: '', DB_SECRET: 'pass' });
  const result = lintSnapshot('messy');
  const output = formatLintResult(result);
  expect(output).toContain('✖ ERROR');
  expect(output).toContain('⚠ WARN');
});
