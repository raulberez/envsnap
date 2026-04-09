const fs = require('fs');
const path = require('path');
const os = require('os');
const { loadSnapshot, formatEnvFile, restoreToFile, restoreToProcess } = require('./restore');
const { getSnapshotsDir } = require('./snapshot');

jest.mock('./snapshot');
jest.mock('fs');

describe('formatEnvFile', () => {
  it('formats key=value pairs', () => {
    const result = formatEnvFile({ NODE_ENV: 'production', PORT: '3000' });
    expect(result).toContain('NODE_ENV=production');
    expect(result).toContain('PORT=3000');
  });

  it('wraps values with spaces in quotes', () => {
    const result = formatEnvFile({ APP_NAME: 'my app' });
    expect(result).toContain('APP_NAME="my app"');
  });

  it('ends with a newline', () => {
    const result = formatEnvFile({ FOO: 'bar' });
    expect(result.endsWith('\n')).toBe(true);
  });
});

describe('loadSnapshot', () => {
  beforeEach(() => {
    getSnapshotsDir.mockReturnValue('/fake/snapshots');
  });

  it('throws if snapshot file does not exist', () => {
    fs.existsSync.mockReturnValue(false);
    expect(() => loadSnapshot('missing')).toThrow('Snapshot "missing" not found');
  });

  it('returns env vars from snapshot file', () => {
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue(
      JSON.stringify({ name: 'mysnap', env: { FOO: 'bar', BAZ: '123' } })
    );
    const result = loadSnapshot('mysnap');
    expect(result).toEqual({ FOO: 'bar', BAZ: '123' });
  });

  it('returns empty object if snapshot has no env key', () => {
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue(JSON.stringify({ name: 'empty' }));
    const result = loadSnapshot('empty');
    expect(result).toEqual({});
  });
});

describe('restoreToFile', () => {
  beforeEach(() => {
    getSnapshotsDir.mockReturnValue('/fake/snapshots');
    fs.existsSync.mockImplementation((p) => p.endsWith('.json'));
    fs.readFileSync.mockReturnValue(
      JSON.stringify({ env: { KEY: 'val' } })
    );
    fs.writeFileSync.mockImplementation(() => {});
  });

  it('throws if target file exists and overwrite is false', () => {
    fs.existsSync.mockReturnValue(true);
    expect(() => restoreToFile('snap', '.env')).toThrow('already exists');
  });

  it('writes env file when overwrite is true', () => {
    fs.existsSync.mockImplementation((p) => p.endsWith('.json'));
    const result = restoreToFile('snap', '.env', { overwrite: true });
    expect(fs.writeFileSync).toHaveBeenCalled();
    expect(result.count).toBe(1);
  });
});
