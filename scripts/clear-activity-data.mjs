// Wipes the "activity" data that accumulates from automated Playwright
// runs (and any manual poking): every attempt/submission, saved code
// version, review/comment, status-history row, supporter flag, NEA note,
// and activity-feed event. Current subtopic statuses (subtopic_status),
// NEA section state (nea_state), personal resource links, glossary
// progress, the authored python_problems/python_test_cases content, and
// all auth accounts/profiles are deliberately kept.
//
// Runs directly against the database via SUPABASE_DB_URL (the same
// pooler connection scripts/migrate.mjs uses), so it bypasses RLS and
// clears rows regardless of which account created them.
//
// Usage:
//   node scripts/clear-activity-data.mjs          # dry run - only prints current row counts
//   node scripts/clear-activity-data.mjs --yes    # actually delete
import { config } from 'dotenv';
import path from 'node:path';
import { Client } from 'pg';

config({ path: path.join(import.meta.dirname, '..', '.env.local'), quiet: true });

// Order matters: child tables (FK references) before their parents, so
// the counts are accurate and the TRUNCATE list is self-consistent even
// though every FK here is already ON DELETE CASCADE.
const TABLES = [
  'ocr_challenge_submission_results',
  'ocr_challenge_submissions',
  'ocr_challenge_version_comments',
  'ocr_challenge_code_versions',
  'ocr_challenge_reviews',
  'ocr_challenge_review_state',
  'python_submission_results',
  'python_submissions',
  'python_problem_reviews',
  'subtopic_status_history',
  'subtopic_flags',
  'nea_notes',
  'activity_events',
];

async function main() {
  const dbUrl = process.env.SUPABASE_DB_URL;
  if (!dbUrl) {
    throw new Error('SUPABASE_DB_URL is not set (check .env.local)');
  }

  const apply = process.argv.includes('--yes');

  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  try {
    console.log('Current row counts:');
    let total = 0;
    for (const table of TABLES) {
      const { rows } = await client.query(`select count(*)::int as n from ${table}`);
      const n = rows[0].n;
      total += n;
      console.log(`  ${table.padEnd(34)} ${n}`);
    }
    console.log(`  ${''.padEnd(34)} ${'-'.repeat(6)}`);
    console.log(`  ${'total'.padEnd(34)} ${total}`);

    if (!apply) {
      console.log('\nDry run - nothing deleted. Re-run with --yes to delete the rows above.');
      return;
    }

    if (total === 0) {
      console.log('\nNothing to delete.');
      return;
    }

    console.log('\nDeleting...');
    await client.query('begin');
    try {
      // One statement, one transaction: RESTART IDENTITY resets the
      // bigserial sequences so fresh rows start from 1 again.
      await client.query(`truncate table ${TABLES.join(', ')} restart identity`);
      await client.query('commit');
    } catch (err) {
      await client.query('rollback');
      throw err;
    }

    console.log('Done. New row counts:');
    for (const table of TABLES) {
      const { rows } = await client.query(`select count(*)::int as n from ${table}`);
      console.log(`  ${table.padEnd(34)} ${rows[0].n}`);
    }
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
