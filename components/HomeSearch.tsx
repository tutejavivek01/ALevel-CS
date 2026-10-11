'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { SearchResult } from '@/lib/search/search-index';

// Dashboard search: type a keyword, get matching spec areas and reading
// chapters, each linking straight to where it can be read.
export function HomeSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [searchedFor, setSearchedFor] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) {
      setResults(null);
      return;
    }
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error(String(res.status));
      const data: { results: SearchResult[] } = await res.json();
      setResults(data.results);
      setSearchedFor(q);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="home-search">
      <form onSubmit={handleSubmit} role="search" className="home-search-form">
        <input
          type="search"
          className="home-search-input"
          placeholder="Search any topic to read, e.g. recursion, logic gates…"
          aria-label="Search topics"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Searching…' : 'Search'}
        </button>
      </form>

      {error && (
        <p className="ex-feedback no">Couldn&apos;t search — try again.</p>
      )}

      {results && !error && (
        <div className="home-search-results" aria-live="polite">
          <div className="home-search-count">
            {results.length === 0
              ? `No topics found for “${searchedFor}”.`
              : `${results.length} result${results.length === 1 ? '' : 's'} for “${searchedFor}”`}
          </div>
          {results.map((result) => (
            <Link
              key={result.href}
              href={result.href}
              className="home-search-result"
            >
              <div className="home-search-title">{result.title}</div>
              <div className="home-search-context">
                {result.kind === 'area' ? 'Spec area' : 'Reading'} ·{' '}
                {result.context}
              </div>
              {result.summary && (
                <p className="home-search-summary">{result.summary}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
