import { config } from 'dotenv';
import path from 'node:path';
import { Client } from 'pg';
import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

config({ path: path.join(process.cwd(), '.env.local'), quiet: true });

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

test('a question is answered end-to-end: draft, submit, and a marked result', async ({
  page,
}) => {
  await resetExamAttempts('ch1-q1');

  await page.goto('/topic/programming');
  await expect(
    page.getByRole('heading', { name: 'Exam questions' })
  ).toBeVisible();

  const questionCard = page
    .locator('.exam-question-card', { hasText: 'Q1' })
    .first();
  const textarea = questionCard.locator('.exam-answer-textarea');
  await textarea.fill('String, character, real/float, integer, Boolean.');

  // Draft autosaves without submitting (requirements.md §3.2) - reload
  // and confirm it's still there before actually submitting.
  await page.reload();
  const reloadedCard = page
    .locator('.exam-question-card', { hasText: 'Q1' })
    .first();
  await expect(reloadedCard.locator('.exam-answer-textarea')).toHaveValue(
    'String, character, real/float, integer, Boolean.'
  );

  await reloadedCard.getByRole('button', { name: 'Submit answer' }).click();
  await expect(reloadedCard.getByText(/\d+\/\d+ marks/)).toBeVisible();
});

test('a needs_review question is attemptable and shows its notice; Year 13 is hidden by default', async ({
  page,
}) => {
  await resetExamAttempts('ch72-q4');

  await page.goto('/topic/big-data');
  // 4.11's whole chapter is "A Level (Year 13)" - hidden until toggled.
  await expect(
    page.getByText('No exam questions for this topic yet.')
  ).toBeVisible();

  await page.getByLabel('Include A Level (Year 13) questions').check();
  await expect(
    page.getByText('No exam questions for this topic yet.')
  ).toHaveCount(0);

  const questionCard = page
    .locator('.exam-question-card', { hasText: 'Q4' })
    .first();
  await expect(
    questionCard.getByText(/diagram, table, or figure/)
  ).toBeVisible();
  await expect(questionCard.getByText('page 388')).toBeVisible();

  // Still attemptable, per-part.
  const firstPartAnswer = questionCard.locator('.exam-answer-textarea').first();
  await firstPartAnswer.fill('Bob has a father edge to Mark and Emma.');
  await questionCard
    .getByRole('button', { name: 'Submit answer' })
    .first()
    .click();
  await expect(
    questionCard.getByText(/\d+\/\d+ marks|Unmarkable/)
  ).toBeVisible();
});

test('reaching the exam-question threshold unlocks Confident, via the same gate as the quiz/challenge routes', async ({
  page,
}) => {
  // 4.11 Big Data: 4 questions, 23 marks total (ch72-q1..3, no parts;
  // ch72-q4 has parts, left untouched here). Seeding q1-q3 fully correct
  // covers 16/23 = ~70% of marks at 100% quality - comfortably over the
  // >=50% coverage / >=70% quality bar (requirements.md §5.2) without
  // going through the real marking route.
  for (const id of ['ch72-q1', 'ch72-q2', 'ch72-q3']) {
    await resetExamAttempts(id);
  }
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
  const studentAuth = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  await studentAuth.auth.signInWithPassword({
    email: process.env.E2E_STUDENT_EMAIL!,
    password: process.env.E2E_STUDENT_PASSWORD!,
  });
  const {
    data: { user: studentUser },
  } = await studentAuth.auth.getUser();

  for (const [id, marks] of [
    ['ch72-q1', 4],
    ['ch72-q2', 6],
    ['ch72-q3', 6],
  ] as const) {
    await admin.from('exam_question_attempts').insert({
      question_id: id,
      part: '',
      topic_id: '4.11',
      student_id: studentUser!.id,
      answer: 'a full-marks answer',
      marking_status: 'marked',
      awarded: marks,
      max: marks,
      credited: ['everything'],
      missed: [],
      model_answer: '',
      misconceptions: [],
      confidence: 1,
    });
  }

  await page.goto('/topic/big-data');
  const row = page.locator('.check-row').first();
  await row.getByRole('button', { name: 'Confident' }).click();
  // No mastery_attempts row exists for this topic at all - the exam-
  // question threshold alone must be what unlocks it.
  await expect(row.getByRole('button', { name: 'Confident' })).toHaveClass(
    /on/
  );

  await admin.from('exam_question_attempts').delete().eq('topic_id', '4.11');
});
