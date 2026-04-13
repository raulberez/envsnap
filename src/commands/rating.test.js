const fs = require('fs');
const os = require('os');
const path = require('path');
const { Command } = require('commander');

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-rating-cmd-'));
  jest.resetModules();
  jest.doMock('../snapshot', () => ({ getSnapshotsDir: () => tmpDir }));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
  jest.restoreAllMocks();
});

function makeProgram() {
  const { registerRatingCommand } = require('./rating');
  const program = new Command();
  program.exitOverride();
  registerRatingCommand(program);
  return program;
}

test('rating set stores and prints score', () => {
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  makeProgram().parse(['node', 'cli', 'rating', 'set', 'mysnap', '4']);
  expect(spy).toHaveBeenCalledWith(expect.stringContaining('4/5'));
});

test('rating set rejects invalid score', () => {
  const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
  const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
  expect(() =>
    makeProgram().parse(['node', 'cli', 'rating', 'set', 'mysnap', '9'])
  ).toThrow();
  expect(spy).toHaveBeenCalled();
  mockExit.mockRestore();
});

test('rating get shows no rating for unknown snapshot', () => {
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  makeProgram().parse(['node', 'cli', 'rating', 'get', 'unknown']);
  expect(spy).toHaveBeenCalledWith(expect.stringContaining('no rating'));
});

test('rating remove prints removed message', () => {
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  const { setRating } = require('../snapshot-rating');
  setRating('mysnap', 3, tmpDir);
  makeProgram().parse(['node', 'cli', 'rating', 'remove', 'mysnap']);
  expect(spy).toHaveBeenCalledWith(expect.stringContaining('removed'));
});

test('rating list shows all entries sorted by score', () => {
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  const { setRating } = require('../snapshot-rating');
  setRating('a', 2, tmpDir);
  setRating('b', 5, tmpDir);
  makeProgram().parse(['node', 'cli', 'rating', 'list']);
  const calls = spy.mock.calls.map(c => c[0]);
  expect(calls[0]).toContain('b');
});

test('rating list shows message when empty', () => {
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  makeProgram().parse(['node', 'cli', 'rating', 'list']);
  expect(spy).toHaveBeenCalledWith(expect.stringContaining('No ratings'));
});
