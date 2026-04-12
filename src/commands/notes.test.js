const { Command } = require('commander');
const fs = require('fs');
const os = require('os');
const path = require('path');

let tmpDir;
let registerNotesCommand;

function makeProgram() {
  const prog = new Command();
  prog.exitOverride();
  registerNotesCommand(prog);
  return prog;
}

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-notes-cmd-'));
  jest.resetModules();
  jest.mock('../snapshot', () => ({ getSnapshotsDir: () => tmpDir }));
  ({ registerNotesCommand } = require('./notes'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('notes set prints confirmation', () => {
  const prog = makeProgram();
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  prog.parse(['node', 'envsnap', 'notes', 'set', 'mysnap', 'hello world']);
  expect(spy).toHaveBeenCalledWith(expect.stringContaining('hello world'));
  spy.mockRestore();
});

test('notes get shows note', () => {
  const prog = makeProgram();
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  prog.parse(['node', 'envsnap', 'notes', 'set', 'snap1', 'test note']);
  prog.parse(['node', 'envsnap', 'notes', 'get', 'snap1']);
  expect(spy).toHaveBeenCalledWith(expect.stringContaining('test note'));
  spy.mockRestore();
});

test('notes get missing shows fallback', () => {
  const prog = makeProgram();
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  prog.parse(['node', 'envsnap', 'notes', 'get', 'ghost']);
  expect(spy).toHaveBeenCalledWith(expect.stringContaining('No note found'));
  spy.mockRestore();
});

test('notes delete removes note', () => {
  const prog = makeProgram();
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  prog.parse(['node', 'envsnap', 'notes', 'set', 'snap2', 'bye']);
  prog.parse(['node', 'envsnap', 'notes', 'delete', 'snap2']);
  expect(spy).toHaveBeenCalledWith(expect.stringContaining('Note deleted'));
  spy.mockRestore();
});

test('notes list shows all', () => {
  const prog = makeProgram();
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  prog.parse(['node', 'envsnap', 'notes', 'set', 'a', 'first']);
  prog.parse(['node', 'envsnap', 'notes', 'list']);
  expect(spy).toHaveBeenCalledWith(expect.stringContaining('first'));
  spy.mockRestore();
});
