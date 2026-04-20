const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  getWorkflowFile,
  loadWorkflows,
  setWorkflow,
  getWorkflow,
  removeWorkflow,
  listByWorkflow,
  formatWorkflowList,
} = require('./snapshot-workflow');

let tmpDir;
beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-workflow-'));
});
afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('loadWorkflows returns empty object when file missing', () => {
  expect(loadWorkflows(tmpDir)).toEqual({});
});

test('setWorkflow and getWorkflow round-trip', () => {
  setWorkflow('snap1', 'ci', tmpDir);
  expect(getWorkflow('snap1', tmpDir)).toBe('ci');
});

test('getWorkflow returns null for unknown snapshot', () => {
  expect(getWorkflow('nope', tmpDir)).toBeNull();
});

test('removeWorkflow removes existing entry', () => {
  setWorkflow('snap1', 'release', tmpDir);
  const result = removeWorkflow('snap1', tmpDir);
  expect(result).toBe(true);
  expect(getWorkflow('snap1', tmpDir)).toBeNull();
});

test('removeWorkflow returns false for missing entry', () => {
  expect(removeWorkflow('ghost', tmpDir)).toBe(false);
});

test('listByWorkflow returns matching snapshots', () => {
  setWorkflow('snap1', 'ci', tmpDir);
  setWorkflow('snap2', 'ci', tmpDir);
  setWorkflow('snap3', 'release', tmpDir);
  const results = listByWorkflow('ci', tmpDir);
  expect(results).toContain('snap1');
  expect(results).toContain('snap2');
  expect(results).not.toContain('snap3');
});

test('formatWorkflowList formats entries', () => {
  const out = formatWorkflowList(['snap1', 'snap2']);
  expect(out).toContain('snap1');
  expect(out).toContain('snap2');
});

test('formatWorkflowList handles empty list', () => {
  expect(formatWorkflowList([])).toMatch(/no snapshots/i);
});

test('getWorkflowFile returns path inside dir', () => {
  const file = getWorkflowFile(tmpDir);
  expect(file).toContain(tmpDir);
  expect(file).toContain('.workflows.json');
});
