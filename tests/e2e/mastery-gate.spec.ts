import { config } from 'dotenv';
import path from 'node:path';
import { Client } from 'pg';
import { test, expect } from '@playwright/test';
import { MASTERY_QUIZZES } from '../../lib/exercises/mastery-quiz';
import { MASTERY_CHALLENGES } from '../../lib/exercises/mastery-challenges';

config({ path: path.join(process.cwd(), '.env.local'), quiet: true });

// design.md §6.13, requirements.md §12 - these tables have no
// student/supporter delete policy, so a prior run's attempts would
// otherwise persist and break repeatability, same reasoning as
// ocr-challenge-execution.spec.ts's resetOcrChallengeState.
async function resetMasteryState(topicId: string) {
  const client = new Client({
    connectionString: process.env.SUPABASE_DB_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    await client.query(
      'delete from mastery_attempt_items where attempt_id in (select id from mastery_attempts where topic_id = $1)',
      [topicId]
    );
    await client.query('delete from mastery_attempts where topic_id = $1', [
      topicId,
    ]);
    await client.query('delete from topic_completion where topic_id = $1', [
      topicId,
    ]);
    await client.query(
      'delete from subtopic_status where subtopic_id like $1',
      [`${topicId}__%`]
    );
    await client.query(
      'delete from subtopic_status_history where subtopic_id like $1',
      [`${topicId}__%`]
    );
  } finally {
    await client.end();
  }
}

// Tests share the `consequences` topic's attempt/completion rows, so run
// them one at a time.
test.describe.configure({ mode: 'serial' });

test.beforeEach(async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.E2E_STUDENT_EMAIL!);
  await page.getByLabel('Password').fill(process.env.E2E_STUDENT_PASSWORD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('/');
});

test('Confident is free; only Mark Complete asks the questionnaire', async ({
  page,
}) => {
  const topicId = 'consequences'; // 4.8 - a quiz-route topic, few items
  await resetMasteryState(topicId);

  await page.goto(`/topic/${topicId}`);
  const row = page.locator('.check-row').first();
  await row.getByRole('button', { name: 'Confident' }).click();

  // No gate: status is set immediately and no test opens.
  await expect(row.getByRole('button', { name: 'Confident' })).toHaveClass(
    /on/
  );
  await expect(
    page.getByRole('heading', { name: 'Mark Complete — test your knowledge' })
  ).not.toBeVisible();

  await page.getByRole('button', { name: 'Mark Complete' }).click();
  await expect(
    page.getByRole('heading', { name: 'Mark Complete — test your knowledge' })
  ).toBeVisible();
});

test('a sub-80% quiz attempt shows attempted-not-passed; an 80%+ attempt completes the chapter', async ({
  page,
}) => {
  const topicId = 'consequences';
  const questions = MASTERY_QUIZZES[topicId];
  await resetMasteryState(topicId);

  await page.goto(`/topic/${topicId}`);
  await page.getByRole('button', { name: 'Mark Complete' }).click();
  await expect(
    page.getByRole('heading', { name: 'Mark Complete — test your knowledge' })
  ).toBeVisible();

  // Answer every MC question with a deliberately wrong option, and every
  // short-answer question with garbage text - 0/10 correct.
  for (const question of questions) {
    if (!question.options) continue;
    const wrongOption = question.options.find(
      (o) => !question.accept.includes(o)
    )!;
    await page.getByRole('radio', { name: wrongOption, exact: true }).check();
  }
  const shortAnswerInputs = page.locator('.mastery-short-answer');
  const count = await shortAnswerInputs.count();
  for (let i = 0; i < count; i++) {
    await shortAnswerInputs.nth(i).fill('zzz-definitely-wrong-zzz');
  }

  await page.getByRole('button', { name: 'Submit quiz' }).click();
  await expect(page.getByText(/0\/10 correct/)).toBeVisible();
  await page
    .locator('.mastery-result')
    .getByRole('button', { name: 'Close', exact: true })
    .click();

  // Not complete - the header shows the attempt status and offers a retake.
  await expect(
    page.getByText('Test attempted — not passed (0/10)')
  ).toBeVisible();
  await expect(page.getByText(/Completed/)).toHaveCount(0);
  await page.getByRole('button', { name: 'Mark Complete' }).click();
  await expect(
    page.getByRole('heading', { name: 'Mark Complete — test your knowledge' })
  ).toBeVisible();

  // Now answer everything correctly (10/10).
  for (const question of questions) {
    if (question.options) {
      await page
        .getByRole('radio', { name: question.accept[0], exact: true })
        .check();
    }
  }
  const shortAnswerInputsPass = page.locator('.mastery-short-answer');
  const questionsWithoutOptions = questions.filter((q) => !q.options);
  for (let i = 0; i < questionsWithoutOptions.length; i++) {
    await shortAnswerInputsPass
      .nth(i)
      .fill(questionsWithoutOptions[i].accept[0]);
  }
  await page.getByRole('button', { name: 'Submit quiz' }).click();
  await expect(page.getByText(/10\/10 correct/)).toBeVisible();
  await page
    .locator('.mastery-result')
    .getByRole('button', { name: 'Close', exact: true })
    .click();

  // Chapter is now complete and survives a reload.
  await expect(page.locator('.chapter-complete')).toBeVisible();
  await page.reload();
  await expect(page.locator('.chapter-complete')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Mark Complete' })).toHaveCount(
    0
  );

  // Both attempts appear in History.
  await page.getByRole('button', { name: 'History' }).click();
  await expect(page.getByRole('heading', { name: 'History' })).toBeVisible();
  await expect(page.getByText('Passed', { exact: true })).toBeVisible();
  await expect(page.getByText('Not passed')).toBeVisible();
});

test('a completed chapter stays completed and no longer offers Mark Complete', async ({
  page,
}) => {
  const topicId = 'consequences';
  await resetMasteryState(topicId);

  const { createClient } = await import('@supabase/supabase-js');
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
  const studentClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  await studentClient.auth.signInWithPassword({
    email: process.env.E2E_STUDENT_EMAIL!,
    password: process.env.E2E_STUDENT_PASSWORD!,
  });
  const {
    data: { user },
  } = await studentClient.auth.getUser();

  // Seed a passing attempt, a later failing attempt, and completion:
  // completion is sticky and not revoked by the later failure.
  await studentClient.from('mastery_attempts').insert([
    {
      topic_id: topicId,
      route: 'quiz',
      score: 8,
      max_score: 10,
      passed: true,
      attempted_by: user!.id,
    },
    {
      topic_id: topicId,
      route: 'quiz',
      score: 2,
      max_score: 10,
      passed: false,
      attempted_by: user!.id,
    },
  ]);
  await studentClient
    .from('topic_completion')
    .insert({ topic_id: topicId, completed_by: user!.id });

  await page.goto(`/topic/${topicId}`);
  await expect(page.locator('.chapter-complete')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Mark Complete' })).toHaveCount(
    0
  );

  await admin.from('mastery_attempts').delete().eq('topic_id', topicId);
  await admin.from('topic_completion').delete().eq('topic_id', topicId);
});

test('a programming-challenge attempt needs both challenges passing', async ({
  page,
}) => {
  const topicId = 'functional'; // 4.12 - challenge route, 2 small challenges
  await resetMasteryState(topicId);

  await page.goto(`/topic/${topicId}`);
  await page.getByRole('button', { name: 'Mark Complete' }).click();
  await expect(
    page.getByRole('heading', { name: 'Mark Complete — test your knowledge' })
  ).toBeVisible();

  const challenges = MASTERY_CHALLENGES[topicId];
  expect(challenges).toHaveLength(2);

  // Leave both editors empty (wrong output) - 0/2 passing.
  await page.getByRole('button', { name: 'Submit attempt' }).click();
  await expect(page.getByText(/0\/2 passed/)).toBeVisible({ timeout: 45000 });
  await page
    .locator('.mastery-result')
    .getByRole('button', { name: 'Close', exact: true })
    .click();

  await expect(
    page.getByText('Test attempted — not passed (0/2)')
  ).toBeVisible();
  await expect(page.locator('.chapter-complete')).toHaveCount(0);
});
