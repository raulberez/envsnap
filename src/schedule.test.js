const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  loadSchedule,
  addSchedule,
  removeSchedule,
  getSchedule,
  formatScheduleList,
} = require('./schedule');

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-schedule-'));
  fs.mkdirSync(path.join(tmpDir, '.snapshots'), { recursive: true });
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('loadSchedule returns empty array when no file exists', () => {
  const result = loadSchedule(tmpDir);
  expect(result).toEqual([]);
});

test('addSchedule creates a new schedule entry', () => {
  const entry = addSchedule('mysnap', '0 * * * *', 'Hourly snapshot', tmpDir);
  expect(entry.name).toBe('mysnap');
  expect(entry.cron).toBe('0 * * * *');
  expect(entry.label).toBe('Hourly snapshot');
  expect(entry.createdAt).toBeDefined();
});

test('addSchedule uses name as label when label is omitted', () => {
  const entry = addSchedule('mysnap', '0 0 * * *', null, tmpDir);
  expect(entry.label).toBe('mysnap');
});

test('addSchedule overwrites existing entry with same name', () => {
  addSchedule('mysnap', '0 * * * *', 'Old label', tmpDir);
  addSchedule('mysnap', '0 0 * * *', 'New label', tmpDir);
  const entries = loadSchedule(tmpDir);
  expect(entries.length).toBe(1);
  expect(entries[0].cron).toBe('0 0 * * *');
  expect(entries[0].label).toBe('New label');
});

test('removeSchedule removes an existing entry', () => {
  addSchedule('mysnap', '0 * * * *', 'Test', tmpDir);
  removeSchedule('mysnap', tmpDir);
  expect(loadSchedule(tmpDir)).toEqual([]);
});

test('removeSchedule throws if entry not found', () => {
  expect(() => removeSchedule('ghost', tmpDir)).toThrow('No schedule found for snapshot: ghost');
});

test('getSchedule returns entry by name', () => {
  addSchedule('mysnap', '0 * * * *', 'Test', tmpDir);
  const entry = getSchedule('mysnap', tmpDir);
  expect(entry).not.toBeNull();
  expect(entry.name).toBe('mysnap');
});

test('getSchedule returns null for unknown name', () => {
  expect(getSchedule('nope', tmpDir)).toBeNull();
});

test('formatScheduleList returns message when empty', () => {
  expect(formatScheduleList([])).toBe('No schedules configured.');
});

test('formatScheduleList formats entries', () => {
  const entries = [{ name: 'snap1', cron: '0 * * * *', label: 'Hourly' }];
  const result = formatScheduleList(entries);
  expect(result).toContain('snap1');
  expect(result).toContain('0 * * * *');
  expect(result).toContain('Hourly');
});
