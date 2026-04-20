const fs = require('fs');
const os = require('os');
const path = require('path');
const { Command } = require('commander');
const { registerWorkflowCommand } = require('./workflow');
const { setWorkflow, getWorkflow } = require('../snapshot-workflow');

let tmpDir;
beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-wf-cmd-'));
  jest.spyOn(process, 'cwd').mockReturnValue(tmpDir);
});
afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
  jest.restoreAllMocks();
});

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerWorkflowCommand(program);
  return program;
}

test('workflow set prints confirmation', () => {
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.mock('../snapshot-workflow', () => ({
    ...jest.requireActual('../snapshot-workflow'),
  }));
  const program = makeProgram();
  program.parse(['node', 'envsnap', 'workflow', 'set', 'mysnap', 'ci']);
  expect(spy).toHaveBeenCalledWith(expect.stringContaining('ci'));
  spy.mockRestore();
});

test('workflow get prints workflow name', () => {
  const wfMod = require('../snapshot-workflow');
  jest.spyOn(wfMod, 'getWorkflow').mockReturnValue('release');
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  const program = makeProgram();
  program.parse(['node', 'envsnap', 'workflow', 'get', 'mysnap']);
  expect(spy).toHaveBeenCalledWith(expect.stringContaining('release'));
  spy.mockRestore();
  jest.restoreAllMocks();
});

test('workflow get prints message when none assigned', () => {
  const wfMod = require('../snapshot-workflow');
  jest.spyOn(wfMod, 'getWorkflow').mockReturnValue(null);
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  const program = makeProgram();
  program.parse(['node', 'envsnap', 'workflow', 'get', 'mysnap']);
  expect(spy).toHaveBeenCalledWith(expect.stringMatching(/no workflow/i));
  spy.mockRestore();
  jest.restoreAllMocks();
});

test('workflow list prints formatted output', () => {
  const wfMod = require('../snapshot-workflow');
  jest.spyOn(wfMod, 'listByWorkflow').mockReturnValue(['snap1', 'snap2']);
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  const program = makeProgram();
  program.parse(['node', 'envsnap', 'workflow', 'list', 'ci']);
  expect(spy).toHaveBeenCalledWith(expect.stringContaining('snap1'));
  spy.mockRestore();
  jest.restoreAllMocks();
});
