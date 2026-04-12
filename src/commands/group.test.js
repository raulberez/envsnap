const fs = require('fs');
const os = require('os');
const path = require('path');
const { Command } = require('commander');
const { registerGroupCommand } = require('./group');
const { addToGroup } = require('../snapshot-group');

let tmpDir;

function makeProgram() {
  const prog = new Command();
  prog.exitOverride();
  registerGroupCommand(prog);
  return prog;
}

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-grpcmd-'));
  jest.spyOn(require('../snapshot'), 'getSnapshotsDir').mockReturnValue(tmpDir);
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
  jest.restoreAllMocks();
});

test('group add prints confirmation', () => {
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  makeProgram().parse(['group', 'add', 'mygroup', 'snap1'], { from: 'user' });
  expect(spy).toHaveBeenCalledWith(expect.stringContaining("Added 'snap1' to group 'mygroup'"));
  spy.mockRestore();
});

test('group list shows no groups message', () => {
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  makeProgram().parse(['group', 'list'], { from: 'user' });
  expect(spy).toHaveBeenCalledWith('No groups defined.');
  spy.mockRestore();
});

test('group show prints members', () => {
  addToGroup('mygroup', 'snap1', tmpDir);
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  makeProgram().parse(['group', 'show', 'mygroup'], { from: 'user' });
  expect(spy).toHaveBeenCalledWith(expect.stringContaining('snap1'));
  spy.mockRestore();
});

test('group show prints not found for missing group', () => {
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  makeProgram().parse(['group', 'show', 'ghost'], { from: 'user' });
  expect(spy).toHaveBeenCalledWith("Group 'ghost' not found.");
  spy.mockRestore();
});

test('group delete prints confirmation', () => {
  addToGroup('mygroup', 'snap1', tmpDir);
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  makeProgram().parse(['group', 'delete', 'mygroup'], { from: 'user' });
  expect(spy).toHaveBeenCalledWith("Deleted group 'mygroup'.");
  spy.mockRestore();
});
