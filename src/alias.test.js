const fs = require('fs');
const os = require('os');
const path = require('path');

let tmpDir;
let mod;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-alias-'));
  jest.resetModules();
  jest.doMock('./snapshot', () => ({ getSnapshotsDir: () => tmpDir }));
  mod = require('./alias');
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
  jest.resetModules();
});

test('loadAliases returns empty object when no file', () => {
  expect(mod.loadAliases()).toEqual({});
});

test('addAlias stores alias and resolves it', () => {
  mod.addAlias('prod', 'snapshot-2024-01-01');
  expect(mod.resolveAlias('prod')).toBe('snapshot-2024-01-01');
});

test('resolveAlias returns original name when no alias match', () => {
  expect(mod.resolveAlias('no-such-alias')).toBe('no-such-alias');
});

test('addAlias throws when alias or name missing', () => {
  expect(() => mod.addAlias('', 'snap')).toThrow('required');
  expect(() => mod.addAlias('a', '')).toThrow('required');
});

test('removeAlias removes existing alias', () => {
  mod.addAlias('staging', 'snap-staging');
  mod.removeAlias('staging');
  expect(mod.resolveAlias('staging')).toBe('staging');
});

test('removeAlias throws when alias not found', () => {
  expect(() => mod.removeAlias('ghost')).toThrow('not found');
});

test('listAliases returns all aliases', () => {
  mod.addAlias('dev', 'snap-dev');
  mod.addAlias('prod', 'snap-prod');
  const list = mod.listAliases();
  expect(list).toEqual({ dev: 'snap-dev', prod: 'snap-prod' });
});

test('formatAliasList shows message when empty', () => {
  expect(mod.formatAliasList({})).toBe('No aliases defined.');
});

test('formatAliasList formats entries', () => {
  const result = mod.formatAliasList({ dev: 'snap-dev', prod: 'snap-prod' });
  expect(result).toContain('dev -> snap-dev');
  expect(result).toContain('prod -> snap-prod');
});
