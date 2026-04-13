const { Command } = require('commander');
const fs = require('fs');
const os = require('os');
const path = require('path');

let tmpDir;
let makeProgram;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-cat-cmd-'));
  jest.resetModules();
  jest.doMock('../snapshot', () => ({ getSnapshotsDir: () => tmpDir }));
  const { registerCategoryCommand } = require('./category');
  makeProgram = () => {
    const p = new Command();
    p.exitOverride();
    registerCategoryCommand(p);
    return p;
  };
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('set and get category', () => {
  const p = makeProgram();
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  p.parse(['node', 'test', 'category', 'set', 'mysnap', 'production']);
  p.parse(['node', 'test', 'category', 'get', 'mysnap']);
  expect(spy).toHaveBeenCalledWith('mysnap: production');
  spy.mockRestore();
});

test('get unknown snapshot prints message', () => {
  const p = makeProgram();
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  p.parse(['node', 'test', 'category', 'get', 'ghost']);
  expect(spy).toHaveBeenCalledWith('No category set for "ghost".');
  spy.mockRestore();
});

test('remove category', () => {
  const p = makeProgram();
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  p.parse(['node', 'test', 'category', 'set', 'mysnap', 'staging']);
  p.parse(['node', 'test', 'category', 'remove', 'mysnap']);
  p.parse(['node', 'test', 'category', 'get', 'mysnap']);
  expect(spy).toHaveBeenCalledWith('No category set for "mysnap".');
  spy.mockRestore();
});

test('list all categories', () => {
  const p = makeProgram();
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  p.parse(['node', 'test', 'category', 'set', 'snap1', 'production']);
  p.parse(['node', 'test', 'category', 'list']);
  expect(spy).toHaveBeenCalledWith('  production');
  spy.mockRestore();
});

test('list snapshots by category', () => {
  const p = makeProgram();
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  p.parse(['node', 'test', 'category', 'set', 'snap1', 'production']);
  p.parse(['node', 'test', 'category', 'list', 'production']);
  expect(spy).toHaveBeenCalledWith('  snap1');
  spy.mockRestore();
});
