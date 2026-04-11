const path = require('path');
const fs = require('fs');
const os = require('os');
const { Command } = require('commander');
const { registerLintCommand } = require('./lint');

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerLintCommand(program);
  return program;
}

function writeSnap(dir, name, data) {
  fs.writeFileSync(path.join(dir, `${name}.json`), JSON.stringify(data));
}

describe('registerLintCommand', () => {
  let tmpDir;
  let originalEnv;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-lint-cmd-'));
    originalEnv = process.env.ENVSNAP_DIR;
    process.env.ENVSNAP_DIR = tmpDir;
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    if (originalEnv === undefined) {
      delete process.env.ENVSNAP_DIR;
    } else {
      process.env.ENVSNAP_DIR = originalEnv;
    }
    jest.restoreAllMocks();
  });

  test('exits 0 for a clean snapshot', async () => {
    writeSnap(tmpDir, 'clean', { NODE_ENV: 'production', PORT: '3000' });
    const program = makeProgram();
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    await program.parseAsync(['node', 'envsnap', 'lint', 'clean']);

    expect(exitSpy).toHaveBeenCalledWith(0);
  });

  test('exits 1 when snapshot not found', async () => {
    const program = makeProgram();
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await program.parseAsync(['node', 'envsnap', 'lint', 'nonexistent']);

    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(errSpy).toHaveBeenCalledWith(expect.stringContaining('not found'));
  });

  test('outputs JSON when --json flag is set', async () => {
    writeSnap(tmpDir, 'myjson', { API_KEY: 'abc123' });
    const program = makeProgram();
    jest.spyOn(process, 'exit').mockImplementation(() => {});
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    await program.parseAsync(['node', 'envsnap', 'lint', 'myjson', '--json']);

    const output = logSpy.mock.calls[0][0];
    const parsed = JSON.parse(output);
    expect(parsed).toHaveProperty('errors');
    expect(parsed).toHaveProperty('warnings');
  });
});
