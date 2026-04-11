const fs = require('fs');
const path = require('path');
const { getSnapshotsDir } = require('./snapshot');

const TEMPLATES_FILE = 'templates.json';

function getTemplatesFile(baseDir) {
  return path.join(getSnapshotsDir(baseDir), TEMPLATES_FILE);
}

function loadTemplates(baseDir) {
  const file = getTemplatesFile(baseDir);
  if (!fs.existsSync(file)) return {};
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return {};
  }
}

function saveTemplates(baseDir, templates) {
  const file = getTemplatesFile(baseDir);
  fs.writeFileSync(file, JSON.stringify(templates, null, 2));
}

function saveTemplate(name, vars, baseDir) {
  if (!name || typeof name !== 'string') throw new Error('Template name is required');
  if (!vars || typeof vars !== 'object') throw new Error('Template vars must be an object');
  const templates = loadTemplates(baseDir);
  templates[name] = { vars, createdAt: new Date().toISOString() };
  saveTemplates(baseDir, templates);
  return templates[name];
}

function deleteTemplate(name, baseDir) {
  const templates = loadTemplates(baseDir);
  if (!templates[name]) throw new Error(`Template "${name}" not found`);
  delete templates[name];
  saveTemplates(baseDir, templates);
}

function applyTemplate(name, overrides = {}, baseDir) {
  const templates = loadTemplates(baseDir);
  if (!templates[name]) throw new Error(`Template "${name}" not found`);
  return { ...templates[name].vars, ...overrides };
}

function listTemplates(baseDir) {
  return loadTemplates(baseDir);
}

function formatTemplateList(templates) {
  const names = Object.keys(templates);
  if (names.length === 0) return 'No templates saved.';
  return names
    .map(n => {
      const count = Object.keys(templates[n].vars).length;
      return `  ${n} (${count} var${count !== 1 ? 's' : ''}) — created ${templates[n].createdAt}`;
    })
    .join('\n');
}

module.exports = {
  getTemplatesFile,
  loadTemplates,
  saveTemplate,
  deleteTemplate,
  applyTemplate,
  listTemplates,
  formatTemplateList,
};
