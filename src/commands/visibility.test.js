const fs = require('fs');
const os = require('os');
const path = require('path');
const { Command } = require('commander');
const { registerVisibilityCommand } = require('./visibility');

let tmpDir;
beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-viscmd-'));
  jest.resetModules();
  jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
});
afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true });
  jest.restoreAllMocks();
});

function makeProgram() {
  const prog = new Command();
  prog.exitOverride();
  registerVisibilityCommand(prog);
  return prog;
}

test('set and get visibility via commands', () => {
  const { setVisibility, getVisibility } = jest.requireActual('../snapshot-visibility');
  const spy = jest.spyOn(require('../snapshot-visibility'), 'setVisibility');
  spy.mockImplementation(() => {});
  const getSpy = jest.spyOn(require('../snapshot-visibility'), 'getVisibility').mockReturnValue('private');
  const log = jest.spyOn(console, 'log').mockImplementation(() => {});

  const prog = makeProgram();
  prog.parse(['node', 'envsnap', 'visibility', 'set', 'mysnap', 'private']);
  expect(spy).toHaveBeenCalledWith('mysnap', 'private');

  prog.parse(['node', 'envsnap', 'visibility', 'get', 'mysnap']);
  expect(log).toHaveBeenCalledWith(expect.stringContaining('private'));

  spy.mockRestore();
  getSpy.mockRestore();
  log.mockRestore();
});

test('set invalid visibility exits with error', () => {
  const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  const prog = makeProgram();
  expect(() =>
    prog.parse(['node', 'envsnap', 'visibility', 'set', 'mysnap', 'secret'])
  ).toThrow('exit');
  expect(errSpy).toHaveBeenCalledWith(expect.stringContaining('Invalid visibility'));
  errSpy.mockRestore();
});

test('list shows formatted output', () => {
  const listSpy = jest.spyOn(require('../snapshot-visibility'), 'loadVisibilities').mockReturnValue({ snap1: 'private' });
  const fmtSpy = jest.spyOn(require('../snapshot-visibility'), 'formatVisibilityList').mockReturnValue('  snap1: private');
  const log = jest.spyOn(console, 'log').mockImplementation(() => {});

  const prog = makeProgram();
  prog.parse(['node', 'envsnap', 'visibility', 'list']);
  expect(log).toHaveBeenCalledWith('  snap1: private');

  listSpy.mockRestore();
  fmtSpy.mockRestore();
  log.mockRestore();
});
