import { describe, it, expect } from 'vitest';
import { outputsMatch } from '@/lib/exercises/python-output';

describe('outputsMatch', () => {
  it('matches identical output', () => {
    expect(outputsMatch('hello\n', 'hello\n')).toBe(true);
  });

  it('ignores a trailing newline difference', () => {
    expect(outputsMatch('5\n', '5')).toBe(true);
    expect(outputsMatch('5', '5\n')).toBe(true);
  });

  it('ignores trailing whitespace generally, not just newlines', () => {
    expect(outputsMatch('5\n\n  ', '5')).toBe(true);
  });

  it('does not ignore leading whitespace', () => {
    expect(outputsMatch('  5\n', '5\n')).toBe(false);
  });

  it('does not ignore internal whitespace/formatting differences', () => {
    expect(outputsMatch('1 2 3\n', '1  2  3\n')).toBe(false);
  });

  it('fails on mismatched content', () => {
    expect(outputsMatch('4\n', '5\n')).toBe(false);
  });

  it('compares multi-line output line by line correctly', () => {
    expect(outputsMatch('a\nb\nc\n', 'a\nb\nc')).toBe(true);
    expect(outputsMatch('a\nb\nc\n', 'a\nb\nd')).toBe(false);
  });

  it('matches two empty outputs', () => {
    expect(outputsMatch('', '')).toBe(true);
    expect(outputsMatch('\n', '')).toBe(true);
  });
});
