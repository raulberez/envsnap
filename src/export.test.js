const { exportSnapshot, formatAsEnv, formatAsJson, formatAsShell } = require('./export');
const { loadSnapshot } = require('./restore');

jest.mock('./restore');

const mockSnapshot = {
  name: 'test-snap',
  createdAt: '2024-01-01T00:00:00.000Z',
  vars: {
    NODE_ENV: 'production',
    API_KEY: 'abc123',
    DB_URL: 'postgres://localhost/db',
  },
};

beforeEach(() => {
  loadSnapshot.mockReturnValue(mockSnapshot);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('exportSnapshot', () => {
  test('defaults to env format', () => {
    const result = exportSnapshot('test-snap');
    expect(result).toContain('NODE_ENV=production');
    expect(result).toContain('API_KEY=abc123');
  });

  test('exports as json format', () => {
    const result = exportSnapshot('test-snap', 'json');
    const parsed = JSON.parse(result);
    expect(parsed.NODE_ENV).toBe('production');
    expect(parsed.API_KEY).toBe('abc123');
  });

  test('exports as shell format', () => {
    const result = exportSnapshot('test-snap', 'shell');
    expect(result).toContain('export NODE_ENV="production"');
    expect(result).toContain('export API_KEY="abc123"');
  });
});

describe('formatAsEnv', () => {
  test('formats vars as KEY=VALUE pairs', () => {
    const result = formatAsEnv(mockSnapshot);
    const lines = result.split('\n');
    expect(lines).toContain('NODE_ENV=production');
    expect(lines).toContain('DB_URL=postgres://localhost/db');
  });
});

describe('formatAsJson', () => {
  test('returns pretty-printed json', () => {
    const result = formatAsJson(mockSnapshot);
    expect(result).toMatch(/^{/);
    const parsed = JSON.parse(result);
    expect(Object.keys(parsed)).toHaveLength(3);
  });
});

describe('formatAsShell', () => {
  test('escapes double quotes in values', () => {
    const snap = { vars: { MSG: 'say "hello"' } };
    const result = formatAsShell(snap);
    expect(result).toContain('export MSG="say \\"hello\\""');
  });
});
