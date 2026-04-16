const fs = require('fs');
const path = require('path');
const os = require('os');
const { Command } = require('commander');

let tmpDir;
beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-owner-cmd-'));
  jest.resetModules();
  jest.mock('../snapshot', () => ({ getSnapshotsDir: () => tmpDir }));
});
afterEach(() => fs.rmSync(tmpDir, { recursive: true }));

function makeProgram() {
  const { registerOwnerCommand } = require('./owner');
  const program = new Command();
  program.exitOverride();
  registerOwnerCommand(program);
  return program;
}

test('set and get owner', () => {
  const program = makeProgram();
  const logs = [];
  jest.spyOn(console, 'log').mockImplementation(m => logs.push(m));
  program.parse(['node', 'test', 'owner', 'set', 'snap1', 'alice']);
  expect(logs[0]).toContain('alice');
  logs.length = 0;
  program.parse(['node', 'test', 'owner', 'get', 'snap1']);
  expect(logs[0]).toContain('alice');
  console.log.mockRestore();
});

test('get unknown snapshot shows no owner', () => {
  const program = makeProgram();
  const logs = [];
  jest.spyOn(console, 'log').mockImplementation(m => logs.push(m));
  program.parse(['node', 'test', 'owner', 'get', 'ghost']);
  expect(logs[0]).toContain('no owner');
  console.log.mockRestore();
});

test('remove owner', () => {
  const program = makeProgram();
  const logs = [];
  jest.spyOn(console, 'log').mockImplementation(m => logs.push(m));
  program.parse(['node', 'test', 'owner', 'set', 'snap2', 'bob']);
  logs.length = 0;
  program.parse(['node', 'test', 'owner', 'remove', 'snap2']);
  expect(logs[0]).toContain('removed');
  console.log.mockRestore();
});

test('list owned snapshots', () => {
  const program = makeProgram();
  const logs = [];
  jest.spyOn(console, 'log').mockImplementation(m => logs.push(m));
  program.parse(['node', 'test', 'owner', 'set', 'snap3', 'carol']);
  program.parse(['node', 'test', 'owner', 'set', 'snap4', 'carol']);
  logs.length = 0;
  program.parse(['node', 'test', 'owner', 'list', 'carol']);
  expect(logs.length).toBe(2);
  console.log.mockRestore();
});
