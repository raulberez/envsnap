const fs = require('fs');
const path = require('path');
const { getSnapshotsDir } = require('./snapshot');

function getWorkflowFile(dir) {
  return path.join(dir || getSnapshotsDir(), '.workflows.json');
}

function loadWorkflows(dir) {
  const file = getWorkflowFile(dir);
  if (!fs.existsSync(file)) return {};
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return {};
  }
}

function saveWorkflows(workflows, dir) {
  const file = getWorkflowFile(dir);
  fs.writeFileSync(file, JSON.stringify(workflows, null, 2));
}

function setWorkflow(snapshotName, workflow, dir) {
  const workflows = loadWorkflows(dir);
  workflows[snapshotName] = workflow;
  saveWorkflows(workflows, dir);
}

function getWorkflow(snapshotName, dir) {
  const workflows = loadWorkflows(dir);
  return workflows[snapshotName] || null;
}

function removeWorkflow(snapshotName, dir) {
  const workflows = loadWorkflows(dir);
  if (!(snapshotName in workflows)) return false;
  delete workflows[snapshotName];
  saveWorkflows(workflows, dir);
  return true;
}

function listByWorkflow(workflow, dir) {
  const workflows = loadWorkflows(dir);
  return Object.entries(workflows)
    .filter(([, w]) => w === workflow)
    .map(([name]) => name);
}

function formatWorkflowList(entries) {
  if (!entries.length) return 'No snapshots found for this workflow.';
  return entries.map(name => `  - ${name}`).join('\n');
}

module.exports = {
  getWorkflowFile,
  loadWorkflows,
  saveWorkflows,
  setWorkflow,
  getWorkflow,
  removeWorkflow,
  listByWorkflow,
  formatWorkflowList,
};
