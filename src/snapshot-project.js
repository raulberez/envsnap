const fs = require('fs');
const path = require('path');
const { getSnapshotsDir } = require('./snapshot');

function getProjectFile() {
  return path.join(getSnapshotsDir(), 'projects.json');
}

function loadProjects() {
  const file = getProjectFile();
  if (!fs.existsSync(file)) return {};
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return {};
  }
}

function saveProjects(projects) {
  const file = getProjectFile();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(projects, null, 2));
}

function setProject(snapshotName, projectName) {
  const projects = loadProjects();
  projects[snapshotName] = projectName;
  saveProjects(projects);
}

function getProject(snapshotName) {
  const projects = loadProjects();
  return projects[snapshotName] || null;
}

function removeProject(snapshotName) {
  const projects = loadProjects();
  delete projects[snapshotName];
  saveProjects(projects);
}

function listByProject(projectName) {
  const projects = loadProjects();
  return Object.entries(projects)
    .filter(([, p]) => p === projectName)
    .map(([snap]) => snap);
}

function getAllProjects() {
  const projects = loadProjects();
  const unique = [...new Set(Object.values(projects))];
  return unique.sort();
}

module.exports = {
  getProjectFile,
  loadProjects,
  saveProjects,
  setProject,
  getProject,
  removeProject,
  listByProject,
  getAllProjects,
};
