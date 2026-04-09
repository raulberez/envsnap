jest.mock('../tag');

const { addTag, removeTag, getSnapshotsByTag, getTagsForSnapshot, listAllTags } = require('../tag');
const { Command } = require('commander');
const { registerTagCommand } = require('./tag');

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerTagCommand(program);
  return program;
}

beforeEach(() => jest.clearAllMocks());

test('tag add calls addTag and logs message', () => {
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  makeProgram().parse(['tag', 'add', 'snap-001', 'production'], { from: 'user' });
  expect(addTag).toHaveBeenCalledWith('snap-001', 'production');
  expect(spy).toHaveBeenCalledWith(expect.stringContaining('Tagged'));
  spy.mockRestore();
});

test('tag remove calls removeTag and logs message', () => {
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  makeProgram().parse(['tag', 'remove', 'snap-001', 'production'], { from: 'user' });
  expect(removeTag).toHaveBeenCalledWith('snap-001', 'production');
  expect(spy).toHaveBeenCalledWith(expect.stringContaining('Removed'));
  spy.mockRestore();
});

test('tag list with tag name shows snapshots', () => {
  getSnapshotsByTag.mockReturnValue(['snap-001', 'snap-002']);
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  makeProgram().parse(['tag', 'list', 'staging'], { from: 'user' });
  expect(getSnapshotsByTag).toHaveBeenCalledWith('staging');
  expect(spy).toHaveBeenCalledWith(expect.stringContaining('snap-001'));
  spy.mockRestore();
});

test('tag list with no tag shows all tags', () => {
  listAllTags.mockReturnValue({ prod: ['snap-001'], dev: ['snap-002'] });
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  makeProgram().parse(['tag', 'list'], { from: 'user' });
  expect(listAllTags).toHaveBeenCalled();
  expect(spy).toHaveBeenCalledWith(expect.stringContaining('prod'));
  spy.mockRestore();
});

test('tag show displays tags for snapshot', () => {
  getTagsForSnapshot.mockReturnValue(['production', 'stable']);
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  makeProgram().parse(['tag', 'show', 'snap-001'], { from: 'user' });
  expect(getTagsForSnapshot).toHaveBeenCalledWith('snap-001');
  expect(spy).toHaveBeenCalledWith(expect.stringContaining('production'));
  spy.mockRestore();
});
