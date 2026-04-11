const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  saveTemplate,
  deleteTemplate,
  applyTemplate,
  listTemplates,
  formatTemplateList,
  getTemplatesFile,
} = require('./template');

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envsnap-template-'));
  fs.mkdirSync(path.join(tmpDir, '.envsnap'), { recursive: true });
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('saveTemplate stores vars and createdAt', () => {
  const result = saveTemplate('base', { NODE_ENV: 'production' }, tmpDir);
  expect(result.vars).toEqual({ NODE_ENV: 'production' });
  expect(result.createdAt).toBeDefined();
});

test('saveTemplate throws if name missing', () => {
  expect(() => saveTemplate('', {}, tmpDir)).toThrow('Template name is required');
});

test('saveTemplate throws if vars not object', () => {
  expect(() => saveTemplate('x', null, tmpDir)).toThrow('Template vars must be an object');
});

test('listTemplates returns saved templates', () => {
  saveTemplate('alpha', { A: '1' }, tmpDir);
  saveTemplate('beta', { B: '2' }, tmpDir);
  const list = listTemplates(tmpDir);
  expect(Object.keys(list)).toContain('alpha');
  expect(Object.keys(list)).toContain('beta');
});

test('deleteTemplate removes a template', () => {
  saveTemplate('temp', { X: 'y' }, tmpDir);
  deleteTemplate('temp', tmpDir);
  const list = listTemplates(tmpDir);
  expect(list['temp']).toBeUndefined();
});

test('deleteTemplate throws if not found', () => {
  expect(() => deleteTemplate('ghost', tmpDir)).toThrow('Template "ghost" not found');
});

test('applyTemplate merges vars with overrides', () => {
  saveTemplate('defaults', { PORT: '3000', HOST: 'localhost' }, tmpDir);
  const result = applyTemplate('defaults', { PORT: '8080' }, tmpDir);
  expect(result).toEqual({ PORT: '8080', HOST: 'localhost' });
});

test('applyTemplate throws if template missing', () => {
  expect(() => applyTemplate('nope', {}, tmpDir)).toThrow('Template "nope" not found');
});

test('formatTemplateList returns message when empty', () => {
  expect(formatTemplateList({})).toBe('No templates saved.');
});

test('formatTemplateList shows name and var count', () => {
  saveTemplate('mytemplate', { A: '1', B: '2' }, tmpDir);
  const list = listTemplates(tmpDir);
  const output = formatTemplateList(list);
  expect(output).toContain('mytemplate');
  expect(output).toContain('2 vars');
});
