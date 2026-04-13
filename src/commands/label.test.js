const { Command } = require('commander');

let labelMod;
let mockSet, mockGet, mockRemove, mockList, mockFind;

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  require('./label').registerLabelCommand(program);
  return program;
}

beforeEach(() => {
  jest.resetModules();
  mockSet = jest.fn();
  mockGet = jest.fn();
  mockRemove = jest.fn();
  mockList = jest.fn();
  mockFind = jest.fn();
  jest.doMock('../snapshot-label', () => ({
    setLabel: mockSet,
    getLabel: mockGet,
    removeLabel: mockRemove,
    listLabels: mockList,
    findByLabel: mockFind,
  }));
  labelMod = require('./label');
});

test('label set calls setLabel and logs output', () => {
  const program = new Command();
  program.exitOverride();
  labelMod.registerLabelCommand(program);
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  program.parse(['node', 'cli', 'label', 'set', 'snap1', 'my label']);
  expect(mockSet).toHaveBeenCalledWith('snap1', 'my label');
  spy.mockRestore();
});

test('label get prints label when found', () => {
  mockGet.mockReturnValue('staging');
  const program = new Command();
  program.exitOverride();
  labelMod.registerLabelCommand(program);
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  program.parse(['node', 'cli', 'label', 'get', 'snap1']);
  expect(spy).toHaveBeenCalledWith('staging');
  spy.mockRestore();
});

test('label get prints not found message', () => {
  mockGet.mockReturnValue(null);
  const program = new Command();
  program.exitOverride();
  labelMod.registerLabelCommand(program);
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  program.parse(['node', 'cli', 'label', 'get', 'snap1']);
  expect(spy.mock.calls[0][0]).toMatch(/No label found/);
  spy.mockRestore();
});

test('label list prints all labels', () => {
  mockList.mockReturnValue({ snap1: 'alpha', snap2: 'beta' });
  const program = new Command();
  program.exitOverride();
  labelMod.registerLabelCommand(program);
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  program.parse(['node', 'cli', 'label', 'list']);
  expect(spy).toHaveBeenCalledTimes(2);
  spy.mockRestore();
});

test('label find prints matching snapshots', () => {
  mockFind.mockReturnValue(['snap1', 'snap3']);
  const program = new Command();
  program.exitOverride();
  labelMod.registerLabelCommand(program);
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  program.parse(['node', 'cli', 'label', 'find', 'prod']);
  expect(spy).toHaveBeenCalledTimes(2);
  spy.mockRestore();
});
