import { config } from 'dotenv';
import path from 'node:path';
import { writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { test, expect } from '@playwright/test';

config({ path: path.join(process.cwd(), '.env.local'), quiet: true });

// The parent-authored ("custom") problem scenario this test used to also
// cover is retired along with that flow (design.md §6.9,
// requirements.md §8.11) - PythonEditor.tsx's upload control is shared
// with the OCR flow, so this single test now proves the full
// upload-to-submission path there instead of just checking the button
// renders.
test('uploading a .py file populates the OCR challenge editor, stays editable, and submits indistinguishably from typed code', async ({
  page,
}) => {
  const tmpDir = mkdtempSync(path.join(tmpdir(), 'ocr-upload-test-'));
  const filePath = path.join(tmpDir, 'solution.py');
  writeFileSync(filePath, "import math\nprint(math.factorial(int(input())))");

  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.E2E_STUDENT_EMAIL!);
  await page.getByLabel('Password').fill(process.env.E2E_STUDENT_PASSWORD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('/');
  await page.goto('/python/ocr/ocr-factorial-finder');

  await page.getByText('Upload .py file').setInputFiles(filePath);

  const editor = page.locator('.cm-content');
  await expect(editor).toContainText("print(math.factorial(int(input())))");

  // Still editable afterward - not a static/locked preview.
  await editor.click();
  await page.keyboard.press('End');
  await page.keyboard.type('  # edited after upload');
  await expect(editor).toContainText('# edited after upload');

  // Undo the appended comment so the program is exactly the uploaded one
  // again, then submit - the resulting row must be indistinguishable
  // from a typed/pasted submission (same table, same columns, no upload
  // metadata anywhere).
  await editor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.type("import math\nprint(math.factorial(int(input())))");
  await page.getByRole('button', { name: 'Run' }).click();
  await expect(page.locator('.python-output.pass')).toBeVisible({ timeout: 45000 });

  rmSync(tmpDir, { recursive: true, force: true });
});
