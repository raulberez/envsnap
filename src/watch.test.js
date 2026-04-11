const fs = require('fs');
const path = require('path');
const os = require('os');
const { watchEnvFile, readEnvFile, snapshotChanged, saveAutoSnapshot, getEnvFilePath } = require('./watch');

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-watch-'));
  jest.spyOn(require('./snapshot'), 'getSnapshotsDir').mockReturnValue(path.join(tmpDir, 'snapshots'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
  jest.restoreAllMocks();
});

function writeEnv(dir, content) {
  const p = path.join(dir, '.env');
  fs.writeFileSync(p, content);
  return p;
}

test('readEnvFile parses key=value pairs', () => {
  const p = writeEnv(tmpDir, 'FOO=bar\nBAZ=qux\n');
  const vars = readEnvFile(p);
  expect(vars).toEqual({ FOO: 'bar', BAZ: 'qux' });
});

test('readEnvFile ignores comments and blank lines', () => {
  const p = writeEnv(tmpDir, '# comment\nFOO=bar\n\nBAR=baz\n');
  expect(readEnvFile(p)).toEqual({ FOO: 'bar', BAR: 'baz' });
});

test('readEnvFile returns null for missing file', () => {
  expect(readEnvFile(path.join(tmpDir, 'nonexistent.env'))).toBeNull();
});

test('snapshotChanged detects added key', () => {
  expect(snapshotChanged({ A: '1' }, { A: '1', B: '2' })).toBe(true);
});

test('snapshotChanged detects changed value', () => {
  expect(snapshotChanged({ A: '1' }, { A: '2' })).toBe(true);
});

test('snapshotChanged returns false for identical objects', () => {
  expect(snapshotChanged({ A: '1', B: '2' }, { A: '1', B: '2' })).toBe(false);
});

test('snapshotChanged returns true when prev is null', () => {
  expect(snapshotChanged(null, { A: '1' })).toBe(true);
});

test('saveAutoSnapshot writes a snapshot file', () => {
  const name = saveAutoSnapshot({ FOO: 'bar' }, 'test');
  const snapsDir = path.join(tmpDir, 'snapshots');
  const files = fs.readdirSync(snapsDir);
  expect(files.length).toBe(1);
  const snap = JSON.parse(fs.readFileSync(path.join(snapsDir, files[0]), 'utf8'));
  expect(snap.vars).toEqual({ FOO: 'bar' });
  expect(snap.name).toBe(name);
});

test('watchEnvFile triggers onSnapshot when file changes', done => {
  const envPath = writeEnv(tmpDir, 'X=1\n');
  jest.spyOn(require('./watch'), 'getEnvFilePath').mockReturnValue(envPath);

  const watcher = watchEnvFile({
    envFile: envPath,
    label: 'ci',
    interval: 50,
    onSnapshot: (name, vars) => {
      watcher.stop();
      expect(vars).toEqual({ X: '2' });
      done();
    },
  });

  setTimeout(() => fs.writeFileSync(envPath, 'X=2\n'), 80);
});
