import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
