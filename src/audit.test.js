const fs = require('fs');
const path = require('path');
const os = require('os');
const { loadAuditLog, appendAuditEntry, recordAction, formatAuditLog, clearAuditLog, getAuditLogPath } = require('./audit');

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-audit-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('loadAuditLog returns empty array when no log file exists', () => {
  const entries = loadAuditLog(tmpDir);
  expect(entries).toEqual([]);
});

test('appendAuditEntry writes a JSON line and returns the entry', () => {
  const entry = appendAuditEntry({ action: 'save', snapshotName: 'dev' }, tmpDir);
  expect(entry.action).toBe('save');
  expect(entry.snapshotName).toBe('dev');
  expect(entry.timestamp).toBeDefined();
  const logPath = getAuditLogPath(tmpDir);
  const raw = fs.readFileSync(logPath, 'utf8');
  expect(raw).toContain('save');
});

test('appendAuditEntry timestamp is a valid ISO date string', () => {
  const entry = appendAuditEntry({ action: 'save', snapshotName: 'dev' }, tmpDir);
  const parsed = new Date(entry.timestamp);
  expect(parsed.toString()).not.toBe('Invalid Date');
  expect(entry.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
});

test('loadAuditLog returns all written entries', () => {
  appendAuditEntry({ action: 'save', snapshotName: 'dev' }, tmpDir);
  appendAuditEntry({ action: 'restore', snapshotName: 'prod' }, tmpDir);
  const entries = loadAuditLog(tmpDir);
  expect(entries).toHaveLength(2);
  expect(entries[0].action).toBe('save');
  expect(entries[1].action).toBe('restore');
});

test('recordAction stores action with extra details', () => {
  recordAction('export', 'staging', { format: 'json' }, tmpDir);
  const entries = loadAuditLog(tmpDir);
  expect(entries[0].format).toBe('json');
  expect(entries[0].snapshotName).toBe('staging');
});

test('formatAuditLog returns message when empty', () => {
  expect(formatAuditLog([])).toBe('No audit entries found.');
});

test('formatAuditLog formats entries into readable lines', () => {
  appendAuditEntry({ action: 'delete', snapshotName: 'old' }, tmpDir);
  const entries = loadAuditLog(tmpDir);
  const output = formatAuditLog(entries);
  expect(output).toContain('delete');
  expect(output).toContain('old');
});

test('clearAuditLog empties the log file', () => {
  appendAuditEntry({ action: 'save', snapshotName: 'dev' }, tmpDir);
  clearAuditLog(tmpDir);
  const entries = loadAuditLog(tmpDir);
  expect(entries).toEqual([]);
});
