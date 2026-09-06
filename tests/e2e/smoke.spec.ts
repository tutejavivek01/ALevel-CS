import { test, expect } from '@playwright/test';

// The home page now requires auth (proxy.ts, task 4) - an unauthenticated
// visit redirects to /login, which is what this app actually boots to for
// a signed-out visitor. See tests/e2e/auth.spec.ts for the full auth
// flow (login, redirect, session persistence) and role-specific views.
test('app boots and an unauthenticated visit reaches the login page', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Sign in'
  );
});
