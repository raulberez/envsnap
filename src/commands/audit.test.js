import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { registerAuditCommand } from './audit.js';
import { appendAuditEntry } from '../audit.js';

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerAuditCommand(program);
  return program;
}

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-audit-cmd-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('audit log command', () => {
  it('prints no entries message when log is empty', async () => {
    const program = makeProgram();
    const logs = [];
    const orig = console.log;
    console.log = (...a) => logs.push(a.join(' '));
    await program.parseAsync(['audit', 'log', '-d', tmpDir], { from: 'user' });
    console.log = orig;
    expect(logs.some((l) => l.includes('No audit entries'))).toBe(true);
  });

  it('displays formatted log entries', async () => {
    await appendAuditEntry(tmpDir, { action: 'snapshot', name: 'test', timestamp: new Date().toISOString() });
    const program = makeProgram();
    const logs = [];
    const orig = console.log;
    console.log = (...a) => logs.push(a.join(' '));
    await program.parseAsync(['audit', 'log', '-d', tmpDir], { from: 'user' });
    console.log = orig;
    expect(logs.join('\n')).toMatch(/snapshot/);
  });

  it('outputs json when --json flag is set', async () => {
    await appendAuditEntry(tmpDir, { action: 'restore', name: 'prod', timestamp: new Date().toISOString() });
    const program = makeProgram();
    const logs = [];
    const orig = console.log;
    console.log = (...a) => logs.push(a.join(' '));
    await program.parseAsync(['audit', 'log', '--json', '-d', tmpDir], { from: 'user' });
    console.log = orig;
    const parsed = JSON.parse(logs[0]);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed[0].action).toBe('restore');
  });

  it('clears the audit log', async () => {
    await appendAuditEntry(tmpDir, { action: 'diff', name: 'snap1', timestamp: new Date().toISOString() });
    const program = makeProgram();
    const logs = [];
    const orig = console.log;
    console.log = (...a) => logs.push(a.join(' '));
    await program.parseAsync(['audit', 'clear', '-d', tmpDir], { from: 'user' });
    console.log = orig;
    expect(logs.some((l) => l.includes('cleared'))).toBe(true);
    const logFile = path.join(tmpDir, 'audit.log');
    const content = fs.existsSync(logFile) ? fs.readFileSync(logFile, 'utf8').trim() : '';
    expect(content).toBe('');
  });
});
