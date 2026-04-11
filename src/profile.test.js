const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  getProfilesFile,
  loadProfiles,
  saveProfile,
  deleteProfile,
  getProfile,
  formatProfileList,
} = require('./profile');

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-profile-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('getProfilesFile returns path inside snapshotsDir', () => {
  const file = getProfilesFile(tmpDir);
  expect(file).toBe(path.join(tmpDir, '.profiles.json'));
});

test('loadProfiles returns empty object when file missing', () => {
  expect(loadProfiles(tmpDir)).toEqual({});
});

test('saveProfile creates a profile entry', () => {
  const result = saveProfile('dev', ['snap1', 'snap2'], tmpDir);
  expect(result.snapshots).toEqual(['snap1', 'snap2']);
  expect(result.createdAt).toBeDefined();
  const profiles = loadProfiles(tmpDir);
  expect(profiles['dev']).toBeDefined();
});

test('saveProfile throws if name is missing', () => {
  expect(() => saveProfile('', ['snap1'], tmpDir)).toThrow('Profile name is required');
});

test('saveProfile throws if snapshots array is empty', () => {
  expect(() => saveProfile('dev', [], tmpDir)).toThrow('At least one snapshot name is required');
});

test('deleteProfile removes an existing profile', () => {
  saveProfile('staging', ['snap3'], tmpDir);
  deleteProfile('staging', tmpDir);
  expect(loadProfiles(tmpDir)['staging']).toBeUndefined();
});

test('deleteProfile throws if profile not found', () => {
  expect(() => deleteProfile('ghost', tmpDir)).toThrow("Profile 'ghost' not found");
});

test('getProfile returns null for missing profile', () => {
  expect(getProfile('nope', tmpDir)).toBeNull();
});

test('formatProfileList returns message when empty', () => {
  expect(formatProfileList({})).toBe('No profiles found.');
});

test('formatProfileList formats profiles correctly', () => {
  const profiles = {
    dev: { snapshots: ['a', 'b'], createdAt: '2024-01-01' },
  };
  const output = formatProfileList(profiles);
  expect(output).toContain('dev');
  expect(output).toContain('2 snapshot(s)');
  expect(output).toContain('a, b');
});
