const fs = require('fs');
const os = require('os');
const path = require('path');
const { Command } = require('commander');

let tmpDir;
beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-histcmd-'));
  jest.resetModules();
  jest.doMock('../snapshot', () => ({ getSnapshotsDir: () => tmpDir }));
});
afterEach(() => fs.rmSync(tmpDir, { recursive: true }));

function makeProgram() {
  const { registerHistoryCommand } = require('./history');
  const program = new Command();
  program.exitOverride();
  registerHistoryCommand(program);
  return program;
}

test('history show prints no history when empty', () => {
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  const program = makeProgram();
  program.parse(['history', 'show', 'mysnap'], { from: 'user' });
  expect(spy).toHaveBeenCalledWith(expect.stringMatching(/No history found/));
  spy.mockRestore();
});

test('history show --json outputs JSON array', () => {
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  const { recordHistoryEntry } = require('../history');
  recordHistoryEntry('mysnap', 'created');
  const program = makeProgram();
  program.parse(['history', 'show', 'mysnap', '--json'], { from: 'user' });
  const output = spy.mock.calls[0][0];
  const parsed = JSON.parse(output);
  expect(Array.isArray(parsed)).toBe(true);
  expect(parsed[0].action).toBe('created');
  spy.mockRestore();
});

test('history clear removes entries', () => {
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  const { recordHistoryEntry, loadHistory } = require('../history');
  recordHistoryEntry('mysnap', 'created');
  const program = makeProgram();
  program.parse(['history', 'clear', 'mysnap'], { from: 'user' });
  expect(loadHistory('mysnap')).toEqual([]);
  expect(spy).toHaveBeenCalledWith(expect.stringMatching(/cleared/));
  spy.mockRestore();
});
