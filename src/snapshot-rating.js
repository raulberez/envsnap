const fs = require('fs');
const path = require('path');
const { getSnapshotsDir } = require('./snapshot');

function getRatingsFile(snapshotsDir) {
  return path.join(snapshotsDir || getSnapshotsDir(), 'ratings.json');
}

function loadRatings(snapshotsDir) {
  const file = getRatingsFile(snapshotsDir);
  if (!fs.existsSync(file)) return {};
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return {};
  }
}

function saveRatings(ratings, snapshotsDir) {
  const file = getRatingsFile(snapshotsDir);
  fs.writeFileSync(file, JSON.stringify(ratings, null, 2));
}

function setRating(name, score, snapshotsDir) {
  if (typeof score !== 'number' || score < 1 || score > 5) {
    throw new Error('Rating must be a number between 1 and 5');
  }
  const ratings = loadRatings(snapshotsDir);
  ratings[name] = { score, updatedAt: new Date().toISOString() };
  saveRatings(ratings, snapshotsDir);
  return ratings[name];
}

function getRating(name, snapshotsDir) {
  const ratings = loadRatings(snapshotsDir);
  return ratings[name] || null;
}

function removeRating(name, snapshotsDir) {
  const ratings = loadRatings(snapshotsDir);
  if (!ratings[name]) return false;
  delete ratings[name];
  saveRatings(ratings, snapshotsDir);
  return true;
}

function listRatings(snapshotsDir) {
  return loadRatings(snapshotsDir);
}

function formatRating(name, entry) {
  if (!entry) return `${name}: (no rating)`;
  const stars = '★'.repeat(entry.score) + '☆'.repeat(5 - entry.score);
  return `${name}: ${stars} (${entry.score}/5) — ${entry.updatedAt}`;
}

module.exports = {
  getRatingsFile,
  loadRatings,
  saveRatings,
  setRating,
  getRating,
  removeRating,
  listRatings,
  formatRating,
};
