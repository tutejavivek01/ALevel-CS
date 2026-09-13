import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // The figures route reads reference/book_md/figures/ from disk at
  // request time (specs/reading-material/design.md §2/§7) - without
  // this, Next's production file tracing wouldn't know those 422 PNGs
  // are needed by this route and could leave them out of the deployed
  // server bundle, even though they're committed to the repo.
  outputFileTracingIncludes: {
    '/api/reading-material/figures/[filename]': [
      './reference/book_md/figures/**/*',
    ],
  },
  // Needed for Pyodide's interrupt-buffer timeout mechanism (task 24,
  // design.md §6.7): SharedArrayBuffer is unavailable in a browser tab
  // that isn't cross-origin isolated. Added now, alongside the basic
  // worker (task 23), since it's easy to miss later and the interrupt
  // buffer silently can't work without it.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
        ],
      },
    ];
  },
};

export default nextConfig;
