import { config } from 'dotenv';
import path from 'node:path';
import { test, expect } from '@playwright/test';

config({ path: path.join(process.cwd(), '.env.local'), quiet: true });

test.beforeEach(async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.E2E_STUDENT_EMAIL!);
  await page.getByLabel('Password').fill(process.env.E2E_STUDENT_PASSWORD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('/');
});

test('the reading page is marked noindex (requirements.md §5)', async ({
  page,
}) => {
  await page.goto('/topic/programming/reading');
  const robots = await page
    .locator('meta[name="robots"]')
    .getAttribute('content');
  expect(robots).toContain('noindex');
  expect(robots).toContain('nofollow');
});

test('the page footer carries the real book citation (requirements.md §5)', async ({
  page,
}) => {
  await page.goto('/topic/programming/reading');
  await expect(
    page.getByText(
      'AQA AS and A Level Computer Science (P.M. & R.S.U. Heathcote), PG Online, ISBN 978-1-910523-07-0'
    )
  ).toBeVisible();
});

test('the "Read more" link on the topic page opens the reading page', async ({
  page,
}) => {
  await page.goto('/topic/programming');
  await page.getByRole('link', { name: 'Read more →' }).click();
  await page.waitForURL('/topic/programming/reading');
  await expect(
    page.getByRole('heading', { name: 'Fundamentals of programming' })
  ).toBeVisible();
});

test('chapters render in year-then-number order, with a Year 13 divider, and a jump-menu link opens the target chapter', async ({
  page,
}) => {
  await page.goto('/topic/programming/reading');

  // 4.1 spans chapters 1-6, 8 (Year 12) then 67-68 (Year 13) - hidden
  // until the Year 13 checkbox is ticked.
  await expect(
    page.locator('#ch67-basic-concepts-of-object-oriented-programming')
  ).toHaveCount(0);
  await page.getByLabel('Include A Level (Year 13) chapters').check();
  await expect(
    page.locator('#ch67-basic-concepts-of-object-oriented-programming')
  ).toHaveCount(1);
  await expect(page.getByText('A Level (Year 13)').first()).toBeVisible();

  const chapterIds = await page
    .locator('.reading-chapter')
    .evaluateAll((els) => els.map((el) => el.id));
  expect(chapterIds).toEqual([
    'ch01-programming-basics',
    'ch02-selection',
    'ch03-iteration',
    'ch04-arrays',
    'ch05-subroutines',
    'ch06-files-and-exception-handling',
    'ch08-structured-programming',
    'ch67-basic-concepts-of-object-oriented-programming',
    'ch68-object-oriented-design-principles',
  ]);

  // Chapters start collapsed.
  const firstChapter = page.locator('#ch01-programming-basics');
  await expect(firstChapter).not.toHaveAttribute('open', '');

  // Clicking a jump-menu link navigates to (and, per the native <details>
  // fragment-targeting behaviour, opens) that chapter.
  await page.locator('.reading-toc a', { hasText: 'Chapter 1' }).click();
  await expect(firstChapter).toHaveAttribute('open', '');
});

test('a figure enlarges on click, and the Exercises section links to the exam question bank', async ({
  page,
}) => {
  await page.goto('/topic/programming/reading');
  const firstChapter = page.locator('#ch01-programming-basics');
  await firstChapter.locator('> summary').click();
  await expect(firstChapter).toHaveAttribute('open', '');

  const figureImg = firstChapter.locator('.reading-figure-frame img').first();
  await figureImg.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.locator('.reading-figure-enlarged')).toBeVisible();
  await page.getByRole('button', { name: 'Close dialog' }).click();

  await firstChapter
    .locator('.reading-exercises summary', { hasText: 'Exercises' })
    .click();
  const examLink = firstChapter.getByRole('link', {
    name: 'Practice these as marked exam questions →',
  });
  await expect(examLink).toBeVisible();
  await examLink.click();
  await page.waitForURL('/topic/programming#exam-questions');
  await expect(
    page.getByRole('heading', { name: 'Exam questions' })
  ).toBeVisible();
});

test('an appendix is ordered last and labelled as extension material, not just implied by its name', async ({
  page,
}) => {
  // data-representation (4.5) ends in Appendix A - Year 13 content, so
  // needs the level filter checked to be visible at all.
  await page.goto('/topic/data-representation/reading');
  await page.getByLabel('Include A Level (Year 13) chapters').check();

  const chapterIds = await page
    .locator('.reading-chapter')
    .evaluateAll((els) => els.map((el) => el.id));
  expect(chapterIds[chapterIds.length - 1]).toBe(
    'appendix-a-floating-point-form'
  );

  const appendix = page.locator('#appendix-a-floating-point-form');
  await expect(appendix.getByText('Extension', { exact: true })).toBeVisible();
  await expect(page.getByText('Extension material').first()).toBeVisible();
});
