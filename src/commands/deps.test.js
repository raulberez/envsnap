const fs = require('fs');
const os = require('os');
const path = require('path');
const { Command } = require('commander');
const { registerDepsCommand } = require('./deps');
const { addDependency } = require('../snapshot-deps');

let tmpDir;

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerDepsCommand(program);
  return program;
}

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-deps-cmd-'));
  jest.spyOn(require('../snapshot-deps'), 'addDependency').mockImplementation(
    (snap, dep) => [dep]
  );
  jest.spyOn(require('../snapshot-deps'), 'removeDependency').mockImplementation(() => []);
  jest.spyOn(require('../snapshot-deps'), 'getDependencies').mockImplementation(() => ['snap-a']);
  jest.spyOn(require('../snapshot-deps'), 'getDependents').mockImplementation(() => ['snap-c']);
  jest.spyOn(require('../snapshot-deps'), 'formatDepsInfo').mockImplementation(
    name => `Snapshot: ${name}\n  Depends on: snap-a\n  Required by: snap-c`
  );
});

afterEach(() => {
  jest.restoreAllMocks();
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('deps add prints confirmation', () => {
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  const program = makeProgram();
  program.parse(['deps', 'add', 'snap-b', 'snap-a'], { from: 'user' });
  expect(spy).toHaveBeenCalledWith(expect.stringContaining('Added'));
  spy.mockRestore();
});

test('deps remove prints confirmation', () => {
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  const program = makeProgram();
  program.parse(['deps', 'remove', 'snap-b', 'snap-a'], { from: 'user' });
  expect(spy).toHaveBeenCalledWith(expect.stringContaining('Removed'));
  spy.mockRestore();
});

test('deps list prints formatted info by default', () => {
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  const program = makeProgram();
  program.parse(['deps', 'list', 'snap-b'], { from: 'user' });
  expect(spy).toHaveBeenCalledWith(expect.stringContaining('Snapshot: snap-b'));
  spy.mockRestore();
});

test('deps list --deps-only prints only dependencies', () => {
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  const program = makeProgram();
  program.parse(['deps', 'list', 'snap-b', '--deps-only'], { from: 'user' });
  expect(spy).toHaveBeenCalledWith('snap-a');
  spy.mockRestore();
});

test('deps list --dependents-only prints only dependents', () => {
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  const program = makeProgram();
  program.parse(['deps', 'list', 'snap-b', '--dependents-only'], { from: 'user' });
  expect(spy).toHaveBeenCalledWith('snap-c');
  spy.mockRestore();
});
