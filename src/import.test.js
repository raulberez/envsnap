const fs = require('fs');
const os = require('os');
const path = require('path');
const { importSnapshot, parseEnvFormat, parseJsonFormat, parseShellFormat, detectFormat } = require('./import');

let tmpDir;
beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-import-'));
  process.env.ENVSNAP_DIR = path.join(tmpDir, 'snapshots');
});
afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
  delete process.env.ENVSNAP_DIR;
});

test('parseEnvFormat parses basic key=value lines', () => {
  const result = parseEnvFormat('FOO=bar\nBAZ=qux\n# comment\n\nEMPTY=');
  expect(result).toEqual({ FOO: 'bar', BAZ: 'qux', EMPTY: '' });
});

test('parseEnvFormat strips quotes', () => {
  const result = parseEnvFormat('KEY="hello world"\nOTHER=\'single\'');
  expect(result).toEqual({ KEY: 'hello world', OTHER: 'single' });
});

test('parseJsonFormat parses flat object', () => {
  const result = parseJsonFormat(JSON.stringify({ A: '1', B: 'two' }));
  expect(result).toEqual({ A: '1', B: 'two' });
});

test('parseJsonFormat throws on non-object', () => {
  expect(() => parseJsonFormat('["a","b"]')).toThrow();
});

test('parseShellFormat parses export statements', () => {
  const result = parseShellFormat('export FOO=bar\nexport BAZ="hello"');
  expect(result).toEqual({ FOO: 'bar', BAZ: 'hello' });
});

test('detectFormat returns json for .json extension', () => {
  expect(detectFormat('file.json', '{}')).toBe('json');
});

test('detectFormat returns shell for .sh extension', () => {
  expect(detectFormat('file.sh', 'export X=1')).toBe('shell');
});

test('detectFormat falls back to env', () => {
  expect(detectFormat('file.env', 'FOO=bar')).toBe('env');
});

test('importSnapshot saves snapshot from .env file', () => {
  const envFile = path.join(tmpDir, 'test.env');
  fs.writeFileSync(envFile, 'APP=myapp\nPORT=3000\n');
  const snap = importSnapshot(envFile, 'mysnap');
  expect(snap.vars).toEqual({ APP: 'myapp', PORT: '3000' });
  expect(snap.name).toBe('mysnap');
});

test('importSnapshot throws if snapshot already exists without overwrite', () => {
  const envFile = path.join(tmpDir, 'test.env');
  fs.writeFileSync(envFile, 'X=1');
  importSnapshot(envFile, 'dup');
  expect(() => importSnapshot(envFile, 'dup')).toThrow(/already exists/);
});

test('importSnapshot overwrites when option set', () => {
  const envFile = path.join(tmpDir, 'test.env');
  fs.writeFileSync(envFile, 'X=1');
  importSnapshot(envFile, 'dup');
  fs.writeFileSync(envFile, 'X=2');
  const snap = importSnapshot(envFile, 'dup', { overwrite: true });
  expect(snap.vars.X).toBe('2');
});

test('importSnapshot throws if file not found', () => {
  expect(() => importSnapshot('/no/such/file.env', 'x')).toThrow(/not found/);
});
