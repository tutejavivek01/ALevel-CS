import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  // The full suite hits a single local dev server + one shared Supabase
  // project (not a per-test sandbox), and several tests share fixed rows
  // (the two seeded accounts' subtopic/NEA state). High worker counts
  // caused real contention - auth flows timing out and cross-test data
  // races - that isolated test files never showed. A local retry also
  // absorbs the rare genuine race between two tests that legitimately
  // touch the same row.
  workers: 2,
  retries: process.env.CI ? 2 : 1,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
