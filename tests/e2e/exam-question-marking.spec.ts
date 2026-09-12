import { config } from 'dotenv';
import path from 'node:path';
import { Client } from 'pg';
import { test, expect } from '@playwright/test';

config({ path: path.join(process.cwd(), '.env.local'), quiet: true });

// specs/exam-question-bank/requirements.md §4 / design.md §3 - exercises
// the real submit -> persist -> mark -> respond route. Runs against the
// EXAM_MARKING_STUB=true deterministic marker configured in .env.local
// for this suite (no live Anthropic call, no cost); a live-API smoke test
// against a real key is a separate manual check, not part of CI.
async function resetExamAttempts(questionId: string) {
  const client = new Client({
    connectionString: process.env.SUPABASE_DB_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    await client.query(
      'delete from exam_question_attempts where question_id = $1',
      [questionId]
    );
  } finally {
    await client.end();
  }
}

test.beforeEach(async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.E2E_STUDENT_EMAIL!);
  await page.getByLabel('Password').fill(process.env.E2E_STUDENT_PASSWORD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('/');
});

test('an unauthenticated request to the marking route is rejected', async ({
  browser,
}) => {
  // A fresh, never-logged-in context - the shared `request`/`page`
  // fixtures would otherwise inherit this file's beforeEach login.
  // proxy.ts's middleware (design.md §5's "enforce it at the boundary")
  // redirects an unauthenticated request to /login before it ever
  // reaches the route handler - the same behaviour data-export.spec.ts
  // asserts for /export, and the reason the route's own 401 check
  // (app/api/exam-questions/mark/route.ts) is a defence-in-depth
  // backstop rather than something this test can observe directly.
  const context = await browser.newContext();
  const response = await context.request.post('/api/exam-questions/mark', {
    data: { questionId: 'ch1-q1', part: '', answer: 'A relevant answer here.' },
  });
  expect(response.url()).toContain('/login');
  await context.close();
});

test('a real submission is persisted and marked (stub), and an answer too short to mark is declined', async ({
  page,
}) => {
  await resetExamAttempts('ch1-q1');

  const tooShort = await page.request.post('/api/exam-questions/mark', {
    data: { questionId: 'ch1-q1', part: '', answer: 'hi' },
  });
  expect(tooShort.status()).toBe(400);

  const response = await page.request.post('/api/exam-questions/mark', {
    data: {
      questionId: 'ch1-q1',
      part: '',
      answer: 'String, character, real/float, integer, Boolean.',
    },
  });
  expect(response.status()).toBe(200);
  const attempt = await response.json();
  expect(attempt.marking_status).toBe('marked');
  expect(attempt.awarded).toBeGreaterThan(0);
  expect(attempt.question_id).toBe('ch1-q1');
  expect(attempt.topic_id).toBe('4.1');
});

test('an identical resubmitted answer is a new attempt row reusing the prior marking result', async ({
  page,
}) => {
  await resetExamAttempts('ch1-q1');
  const answer = 'String, character, real/float, integer, Boolean.';

  const first = await page.request.post('/api/exam-questions/mark', {
    data: { questionId: 'ch1-q1', part: '', answer },
  });
  const firstAttempt = await first.json();

  const second = await page.request.post('/api/exam-questions/mark', {
    data: { questionId: 'ch1-q1', part: '', answer },
  });
  const secondAttempt = await second.json();

  // Two distinct, permanently-retained attempt rows (requirements.md
  // §3.4) - not the same row updated in place.
  expect(secondAttempt.id).not.toBe(firstAttempt.id);
  // Same marking result, reused from the dedup match rather than
  // re-derived (requirements.md §4.6) - the route's own dedup branch
  // copies these fields across rather than calling the marker again.
  expect(secondAttempt.awarded).toBe(firstAttempt.awarded);
  expect(secondAttempt.max).toBe(firstAttempt.max);
  expect(secondAttempt.marking_status).toBe('marked');
});

test('an unknown question id 404s', async ({ page }) => {
  const response = await page.request.post('/api/exam-questions/mark', {
    data: {
      questionId: 'not-a-real-id',
      part: '',
      answer: 'A relevant answer here.',
    },
  });
  expect(response.status()).toBe(404);
});
