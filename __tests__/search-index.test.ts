import { describe, expect, test } from 'vitest';
import {
  extractSummary,
  parseQuery,
  searchContent,
} from '../lib/search/search-index';

describe('parseQuery', () => {
  test('lower-cases, splits on whitespace and drops 1-char terms', () => {
    expect(parseQuery('  Logic  A gates ')).toEqual(['logic', 'gates']);
  });

  test('strips common suffixes only when a sensible stem remains', () => {
    expect(parseQuery('recursion sorting')).toEqual(['recurs', 'sort']);
  });
});

describe('extractSummary', () => {
  test('skips headings and list items, returns the first prose paragraph', () => {
    const html =
      '<h1>Chapter 1</h1><h2>Objectives</h2><ul><li><p>Learn a thing that is quite long indeed, longer than sixty characters in total.</p></li></ul>' +
      '<p>Short.</p><p>An algorithm is a set of rules or a sequence of steps specifying how to solve a problem.</p>';
    expect(extractSummary(html)).toBe(
      'An algorithm is a set of rules or a sequence of steps specifying how to solve a problem.'
    );
  });

  test('clamps long paragraphs to a short summary', () => {
    const html = `<p>${'Word and more words here. '.repeat(40)}</p>`;
    expect(extractSummary(html).length).toBeLessThanOrEqual(201);
  });
});

describe('searchContent', () => {
  test('empty or too-short queries return nothing', () => {
    expect(searchContent('')).toEqual([]);
    expect(searchContent('a')).toEqual([]);
  });

  test('a keyword finds readable chapters linking to the reading page', () => {
    const results = searchContent('recursion');
    expect(results.length).toBeGreaterThan(0);
    const chapter = results.find((r) => r.kind === 'chapter');
    expect(chapter?.href).toMatch(/^\/topic\/[a-z-]+\/reading#ch/);
  });

  test('recursion ranks the Recursive algorithms chapter first', () => {
    expect(searchContent('recursion')[0].title).toBe('Recursive algorithms');
  });

  test('a spec-area keyword returns the topic page link', () => {
    const results = searchContent('big data');
    expect(results.some((r) => r.href === '/topic/big-data')).toBe(true);
  });

  test('every term must match (AND)', () => {
    expect(searchContent('recursion zzzqqqxxx')).toEqual([]);
  });

  test('results are capped and every result has a summary', () => {
    const results = searchContent('data');
    expect(results.length).toBeLessThanOrEqual(12);
    for (const r of results) expect(r.summary.length).toBeGreaterThan(0);
  });
});
