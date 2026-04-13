const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  getRatingsFile,
  setRating,
  getRating,
  removeRating,
  listRatings,
  formatRating,
} = require('./snapshot-rating');

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-rating-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('getRatingsFile returns path inside snapshotsDir', () => {
  const file = getRatingsFile(tmpDir);
  expect(file).toBe(path.join(tmpDir, 'ratings.json'));
});

test('setRating stores a rating entry', () => {
  const entry = setRating('mysnap', 4, tmpDir);
  expect(entry.score).toBe(4);
  expect(entry.updatedAt).toBeDefined();
});

test('getRating returns stored rating', () => {
  setRating('mysnap', 3, tmpDir);
  const entry = getRating('mysnap', tmpDir);
  expect(entry.score).toBe(3);
});

test('getRating returns null for unknown snapshot', () => {
  expect(getRating('nope', tmpDir)).toBeNull();
});

test('setRating throws on invalid score', () => {
  expect(() => setRating('mysnap', 6, tmpDir)).toThrow();
  expect(() => setRating('mysnap', 0, tmpDir)).toThrow();
  expect(() => setRating('mysnap', 'high', tmpDir)).toThrow();
});

test('removeRating deletes an entry and returns true', () => {
  setRating('mysnap', 5, tmpDir);
  const result = removeRating('mysnap', tmpDir);
  expect(result).toBe(true);
  expect(getRating('mysnap', tmpDir)).toBeNull();
});

test('removeRating returns false if entry does not exist', () => {
  expect(removeRating('ghost', tmpDir)).toBe(false);
});

test('listRatings returns all entries', () => {
  setRating('a', 2, tmpDir);
  setRating('b', 5, tmpDir);
  const all = listRatings(tmpDir);
  expect(Object.keys(all)).toHaveLength(2);
});

test('formatRating shows stars', () => {
  const entry = { score: 3, updatedAt: '2024-01-01T00:00:00.000Z' };
  const out = formatRating('mysnap', entry);
  expect(out).toContain('★★★☆☆');
  expect(out).toContain('mysnap');
});

test('formatRating handles no rating', () => {
  const out = formatRating('mysnap', null);
  expect(out).toContain('no rating');
});
