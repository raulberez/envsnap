const { Command } = require('commander');
const fs = require('fs');
const os = require('os');
const path = require('path');

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  return program;
}

function writeSnap(dir, name, data) {
  fs.writeFileSync(path.join(dir, `${name}.json`), JSON.stringify(data));
}

describe('stats command', () => {
  let tmpDir, origEnv;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-stats-'));
    origEnv = process.env.ENVSNAP_DIR;
    process.env.ENVSNAP_DIR = tmpDir;
    jest.resetModules();
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    if (origEnv === undefined) delete process.env.ENVSNAP_DIR;
    else process.env.ENVSNAP_DIR = origEnv;
  });

  test('prints stats for a valid snapshot', async () => {
    writeSnap(tmpDir, 'mysnap', { vars: { FOO: 'bar', BAZ: '' }, tags: [], createdAt: '2024-01-01' });
    const { registerStatsCommand } = require('./stats');
    const program = makeProgram();
    registerStatsCommand(program);
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await program.parseAsync(['node', 'test', 'stats', 'mysnap']);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('mysnap'));
    spy.mockRestore();
  });

  test('outputs JSON when --json flag is set', async () => {
    writeSnap(tmpDir, 'snap2', { vars: { X: '1' }, tags: ['t1'], createdAt: '2024-02-01' });
    const { registerStatsCommand } = require('./stats');
    const program = makeProgram();
    registerStatsCommand(program);
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await program.parseAsync(['node', 'test', 'stats', 'snap2', '--json']);
    const output = spy.mock.calls[0][0];
    const parsed = JSON.parse(output);
    expect(parsed.name).toBe('snap2');
    expect(parsed.totalKeys).toBe(1);
    spy.mockRestore();
  });

  test('exits with error for missing snapshot', async () => {
    const { registerStatsCommand } = require('./stats');
    const program = makeProgram();
    registerStatsCommand(program);
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    await expect(program.parseAsync(['node', 'test', 'stats', 'nope'])).rejects.toThrow();
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('nope'));
    spy.mockRestore();
    exitSpy.mockRestore();
  });
});
