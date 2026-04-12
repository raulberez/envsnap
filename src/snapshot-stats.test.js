const { computeStats, formatStats } = require('./snapshot-stats');

const makeSnap = (vars, extra = {}) => ({ vars, tags: [], createdAt: '2024-01-01T00:00:00Z', ...extra });

describe('computeStats', () => {
  test('counts total keys', () => {
    const snap = makeSnap({ A: '1', B: '2', C: '3' });
    expect(computeStats(snap).totalKeys).toBe(3);
  });

  test('counts empty values', () => {
    const snap = makeSnap({ A: '', B: 'hello', C: null });
    expect(computeStats(snap).emptyValues).toBe(2);
    expect(computeStats(snap).nonEmptyValues).toBe(1);
  });

  test('counts unique values', () => {
    const snap = makeSnap({ A: 'x', B: 'x', C: 'y' });
    expect(computeStats(snap).uniqueValues).toBe(2);
  });

  test('calculates average value length', () => {
    const snap = makeSnap({ A: 'ab', B: 'abcd' });
    expect(computeStats(snap).avgValueLength).toBe(3);
  });

  test('identifies longest and shortest keys', () => {
    const snap = makeSnap({ AB: '1', ABCDEF: '2', A: '3' });
    const stats = computeStats(snap);
    expect(stats.longestKey).toBe('ABCDEF');
    expect(stats.shortestKey).toBe('A');
  });

  test('handles empty snapshot', () => {
    const snap = makeSnap({});
    const stats = computeStats(snap);
    expect(stats.totalKeys).toBe(0);
    expect(stats.avgValueLength).toBe(0);
    expect(stats.longestKey).toBe('');
  });

  test('counts tags', () => {
    const snap = makeSnap({ A: '1' }, { tags: ['prod', 'v2'] });
    expect(computeStats(snap).tags).toBe(2);
  });
});

describe('formatStats', () => {
  test('includes snapshot name in output', () => {
    const snap = makeSnap({ FOO: 'bar' });
    const result = formatStats('mysnap', computeStats(snap));
    expect(result).toContain('mysnap');
  });

  test('includes all stat fields', () => {
    const snap = makeSnap({ FOO: 'bar', BAZ: '' });
    const result = formatStats('test', computeStats(snap));
    expect(result).toContain('Total keys');
    expect(result).toContain('Empty values');
    expect(result).toContain('Unique values');
    expect(result).toContain('Avg value length');
  });
});
