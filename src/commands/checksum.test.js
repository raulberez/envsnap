const fs = require('fs');
const path = require('path');
const os = require('os');
const { Command } = require('commander');
const { registerChecksumCommand } = require('./checksum');

let tmpDir;
beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-cmd-checksum-'));
  jest.resetModules();
});
afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
  jest.restoreAllMocks();
});

function writeSnap(name, data) {
  fs.writeFileSync(path.join(tmpDir, `${name}.json`), JSON.stringify(data));
}

function makeProgram() {
  const prog = new Command();
  prog.exitOverride();
  registerChecksumCommand(prog);
  return prog;
}

test('record prints checksum confirmation', () => {
  jest.mock('../snapshot-checksum', () => ({
    recordChecksum: jest.fn(() => ({ hash: 'abc123def456789012345678', recordedAt: '2024-01-01' })),
    verifyChecksum: jest.fn(),
    removeChecksum: jest.fn(),
    loadChecksums: jest.fn(() => ({})),
    formatChecksumResult: jest.fn(() => '✔ mysnap: ok'),
  }));
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  const prog = makeProgram();
  prog.parse(['node', 'envsnap', 'checksum', 'record', 'mysnap']);
  expect(spy).toHaveBeenCalledWith(expect.stringContaining('abc123def456'));
});

test('verify prints pass result', () => {
  jest.mock('../snapshot-checksum', () => ({
    recordChecksum: jest.fn(),
    verifyChecksum: jest.fn(() => ({ verified: true, hash: 'aabbcc112233445566778899' })),
    removeChecksum: jest.fn(),
    loadChecksums: jest.fn(() => ({})),
    formatChecksumResult: jest.fn((r, n) => `✔ ${n}: checksum verified`),
  }));
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  const prog = makeProgram();
  prog.parse(['node', 'envsnap', 'checksum', 'verify', 'mysnap']);
  expect(spy).toHaveBeenCalledWith(expect.stringContaining('✔'));
});

test('list shows no checksums message when empty', () => {
  jest.mock('../snapshot-checksum', () => ({
    recordChecksum: jest.fn(),
    verifyChecksum: jest.fn(),
    removeChecksum: jest.fn(),
    loadChecksums: jest.fn(() => ({})),
    formatChecksumResult: jest.fn(),
  }));
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  const prog = makeProgram();
  prog.parse(['node', 'envsnap', 'checksum', 'list']);
  expect(spy).toHaveBeenCalledWith('No checksums recorded.');
});

test('remove confirms deletion', () => {
  jest.mock('../snapshot-checksum', () => ({
    recordChecksum: jest.fn(),
    verifyChecksum: jest.fn(),
    removeChecksum: jest.fn(() => true),
    loadChecksums: jest.fn(() => ({})),
    formatChecksumResult: jest.fn(),
  }));
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  const prog = makeProgram();
  prog.parse(['node', 'envsnap', 'checksum', 'remove', 'mysnap']);
  expect(spy).toHaveBeenCalledWith(expect.stringContaining("removed for 'mysnap'"));
});
