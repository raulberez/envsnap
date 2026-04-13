const fs = require('fs');
const path = require('path');
const { getSnapshotsDir } = require('./snapshot');

function getCategoriesFile() {
  return path.join(getSnapshotsDir(), 'categories.json');
}

function loadCategories() {
  const file = getCategoriesFile();
  if (!fs.existsSync(file)) return {};
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return {};
  }
}

function saveCategories(categories) {
  fs.writeFileSync(getCategoriesFile(), JSON.stringify(categories, null, 2));
}

function setCategory(snapshotName, category) {
  const categories = loadCategories();
  categories[snapshotName] = category;
  saveCategories(categories);
}

function getCategory(snapshotName) {
  const categories = loadCategories();
  return categories[snapshotName] || null;
}

function removeCategory(snapshotName) {
  const categories = loadCategories();
  delete categories[snapshotName];
  saveCategories(categories);
}

function listByCategory(category) {
  const categories = loadCategories();
  return Object.entries(categories)
    .filter(([, cat]) => cat === category)
    .map(([name]) => name);
}

function getAllCategories() {
  const categories = loadCategories();
  return [...new Set(Object.values(categories))].sort();
}

module.exports = {
  getCategoriesFile,
  loadCategories,
  saveCategories,
  setCategory,
  getCategory,
  removeCategory,
  listByCategory,
  getAllCategories,
};
