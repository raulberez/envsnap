const fs = require('fs');
const path = require('path');
const { parseEnvFile } = require('./snapshot');

describe('parseEnvFile', () => {
  it('parses simple key=value pairs', () => {
    const content = 'FOO=bar\nBAZ=qux';
    expect(parseEnvFile(content)).toEqual({ FOO: 'bar', BAZ: 'qux' });
  });

  it('ignores comment lines', () => {
    const content = '# this is a comment\nFOO=bar';
    expect(parseEnvFile(content)).toEqual({ FOO: 'bar' });
  });

  it('ignores empty lines', () => {
    const content = '\nFOO=bar\n\nBAZ=qux\n';
    expect(parseEnvFile(content)).toEqual({ FOO: 'bar', BAZ: 'qux' });
  });

  it('strips double quotes from values', () => {
    const content = 'FOO="hello world"';
    expect(parseEnvFile(content)).toEqual({ FOO: 'hello world' });
  });

  it('strips single quotes from values', () => {
    const content = "FOO='hello world'";
    expect(parseEnvFile(content)).toEqual({ FOO: 'hello world' });
  });

  it('handles values with equals signs', () => {
    const content = 'FOO=bar=baz';
    expect(parseEnvFile(content)).toEqual({ FOO: 'bar=baz' });
  });

  it('handles empty values', () => {
    const content = 'FOO=';
    expect(parseEnvFile(content)).toEqual({ FOO: '' });
  });

  it('skips lines without an equals sign', () => {
    const content = 'INVALID_LINE\nFOO=bar';
    expect(parseEnvFile(content)).toEqual({ FOO: 'bar' });
  });

  it('returns empty object for empty content', () => {
    expect(parseEnvFile('')).toEqual({});
  });

  it('trims whitespace around keys', () => {
    const content = '  FOO  =bar';
    expect(parseEnvFile(content)).toEqual({ FOO: 'bar' });
  });
});
