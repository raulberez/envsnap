const { Command } = require('commander');
const fs = require('fs');
const os = require('os');
const path = require('path');

let tmpDir;

function makeProgram() {
  jest.resetModules();
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-lock-cmd-'));
  jest.mock('../snapshot', () => ({ getSnapshotsDir: () => tmpDir }));
  const { registerLockCommand } = require('./lock');
  const program = new Command();
  program.exitOverride();
  registerLockCommand(program);
  return program;
}

afterEach(() => {
  if (tmpDir) fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('lock add sets a lock', () => {
  const program = makeProgram();
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  program.parse(['lock', 'add', 'mysnap', '--reason', 'stable'], { from: 'user' });
  expect(spy).toHaveBeenCalledWith(expect.stringContaining('locked'));
  spy.mockRestore();
});

test('lock remove unlocks a snapshot', () => {
  const program = makeProgram();
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  program.parse(['lock', 'add', 'mysnap'], { from: 'user' });
  program.parse(['lock', 'remove', 'mysnap'], { from: 'user' });
  expect(spy).toHaveBeenCalledWith(expect.stringContaining('unlocked'));
  spy.mockRestore();
});

test('lock list shows locked snapshots', () => {
  const program = makeProgram();
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  program.parse(['lock', 'add', 'snap1'], { from: 'user' });
  program.parse(['lock', 'list'], { from: 'user' });
  expect(spy).toHaveBeenCalledWith(expect.stringContaining('snap1'));
  spy.mockRestore();
});

test('lock status shows not locked for unknown snap', () => {
  const program = makeProgram();
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  program.parse(['lock', 'status', 'unknown'], { from: 'user' });
  expect(spy).toHaveBeenCalledWith(expect.stringContaining('not locked'));
  spy.mockRestore();
});

test('lock remove errors on unlocked snapshot', () => {
  const program = makeProgram();
  const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
  expect(() => program.parse(['lock', 'remove', 'ghost'], { from: 'user' })).toThrow();
  expect(errSpy).toHaveBeenCalled();
  errSpy.mockRestore();
  exitSpy.mockRestore();
});
