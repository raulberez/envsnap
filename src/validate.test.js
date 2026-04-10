const fs = require('fs');
const path = require('path');
const os = require('os');
const { validateSnapshot, formatValidationResult } = require('./validate');

jest.mock('./snapshot', () => ({
  getSnapshotsDir: () => tmpDir,
}));

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-validate-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

function writeSnap(name, content) {
  fs.writeFileSync(path.join(tmpDir, `${name}.json`), JSON.stringify(content));
}

test('returns valid for a well-formed snapshot', () => {
  writeSnap('good', { API_KEY: 'abc123', NODE_ENV: 'production' });
  const result = validateSnapshot('good');
  expect(result.valid).toBe(true);
  expect(result.errors).toHaveLength(0);
});

test('returns error when snapshot does not exist', () => {
  const result = validateSnapshot('missing');
  expect(result.valid).toBe(false);
  expect(result.errors[0]).toMatch(/not found/);
});

test('returns error for invalid JSON', () => {
  fs.writeFileSync(path.join(tmpDir, 'bad.json'), 'not json {{{');
  const result = validateSnapshot('bad');
  expect(result.valid).toBe(false);
  expect(result.errors[0]).toMatch(/Failed to parse/);
});

test('returns error when root is not an object', () => {
  writeSnap('arr', [1, 2, 3]);
  const result = validateSnapshot('arr');
  expect(result.valid).toBe(false);
  expect(result.errors[0]).toMatch(/root must be a JSON object/);
});

test('returns error for non-string value', () => {
  writeSnap('badval', { PORT: 3000 });
  const result = validateSnapshot('badval');
  expect(result.valid).toBe(false);
  expect(result.errors.some(e => e.includes('PORT'))).toBe(true);
});

test('returns error for invalid env var name', () => {
  writeSnap('badkey', { '123BAD': 'value' });
  const result = validateSnapshot('badkey');
  expect(result.valid).toBe(false);
  expect(result.errors.some(e => e.includes('123BAD'))).toBe(true);
});

test('formatValidationResult shows success message for valid result', () => {
  const out = formatValidationResult('mysnap', { valid: true, errors: [] });
  expect(out).toMatch(/✔/);
  expect(out).toMatch(/mysnap/);
});

test('formatValidationResult lists errors for invalid result', () => {
  const out = formatValidationResult('mysnap', { valid: false, errors: ['bad key', 'bad val'] });
  expect(out).toMatch(/✘/);
  expect(out).toMatch(/bad key/);
  expect(out).toMatch(/bad val/);
});
