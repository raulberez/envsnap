const fs = require('fs');
const os = require('os');
const path = require('path');
const { Command } = require('commander');
const { registerProfileCommand } = require('./profile');
const { saveProfile, loadProfiles } = require('../profile');

let tmpDir;

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerProfileCommand(program);
  return program;
}

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-cmd-profile-'));
  jest.spyOn(require('../profile'), 'loadProfiles').mockImplementation(() => ({}));
  jest.spyOn(require('../profile'), 'saveProfile').mockImplementation(() => ({ snapshots: ['s1'], createdAt: '2024-01-01' }));
  jest.spyOn(require('../profile'), 'deleteProfile').mockImplementation(() => {});
  jest.spyOn(require('../profile'), 'getProfile').mockImplementation((name) =>
    name === 'dev' ? { snapshots: ['s1', 's2'], createdAt: '2024-01-01' } : null
  );
  jest.spyOn(require('../profile'), 'formatProfileList').mockReturnValue('No profiles found.');
});

afterEach(() => {
  jest.restoreAllMocks();
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('profile save calls saveProfile and logs success', () => {
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  const program = makeProgram();
  program.parse(['node', 'envsnap', 'profile', 'save', 'dev', 's1', 's2']);
  expect(require('../profile').saveProfile).toHaveBeenCalledWith('dev', ['s1', 's2']);
  expect(spy).toHaveBeenCalledWith(expect.stringContaining("Profile 'dev' saved"));
  spy.mockRestore();
});

test('profile delete calls deleteProfile and logs success', () => {
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  const program = makeProgram();
  program.parse(['node', 'envsnap', 'profile', 'delete', 'dev']);
  expect(require('../profile').deleteProfile).toHaveBeenCalledWith('dev');
  expect(spy).toHaveBeenCalledWith(expect.stringContaining("Profile 'dev' deleted"));
  spy.mockRestore();
});

test('profile show prints profile details', () => {
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  const program = makeProgram();
  program.parse(['node', 'envsnap', 'profile', 'show', 'dev']);
  expect(spy).toHaveBeenCalledWith(expect.stringContaining('dev'));
  spy.mockRestore();
});

test('profile list prints formatted list', () => {
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  const program = makeProgram();
  program.parse(['node', 'envsnap', 'profile', 'list']);
  expect(spy).toHaveBeenCalledWith('No profiles found.');
  spy.mockRestore();
});
