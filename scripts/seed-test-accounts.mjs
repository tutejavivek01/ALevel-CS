// Creates two dedicated, synthetic accounts (fake @example.com addresses)
// purely for automated Playwright tests, so the real two accounts'
// passwords (scripts/seed-accounts.mjs) never need to be known outside
// the people using them. Safe to re-run - idempotent, and appends fresh
// generated passwords to .env.local (gitignored) each time.
import { config } from 'dotenv';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const envPath = path.join(import.meta.dirname, '..', '.env.local');
config({ path: envPath, quiet: true });

function generatePassword() {
  return randomBytes(18).toString('base64url');
}

async function upsertAuthUser(admin, email, password) {
  const created = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (!created.error) return created.data.user;

  if (!/already been registered|already exists/i.test(created.error.message)) {
    throw created.error;
  }

  const { data: list, error: listError } = await admin.auth.admin.listUsers();
  if (listError) throw listError;
  const existing = list.users.find((u) => u.email === email);
  if (!existing) throw new Error(`Could not find existing user for ${email}`);

  const { data: updated, error: updateError } =
    await admin.auth.admin.updateUserById(existing.id, { password });
  if (updateError) throw updateError;
  return updated.user;
}

function upsertEnvVar(lines, key, value) {
  const idx = lines.findIndex((l) => l.startsWith(`${key}=`));
  const line = `${key}=${value}`;
  if (idx === -1) lines.push(line);
  else lines[idx] = line;
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anonKey || !serviceRoleKey) {
    throw new Error('Missing Supabase env vars (check .env.local)');
  }

  const admin = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const accounts = [
    { role: 'student', email: 'e2e-student@example.com', envPrefix: 'E2E_STUDENT' },
    { role: 'supporter', email: 'e2e-supporter@example.com', envPrefix: 'E2E_SUPPORTER' },
  ];

  const envLines = existsSync(envPath)
    ? readFileSync(envPath, 'utf8').split('\n').filter(Boolean)
    : [];

  for (const account of accounts) {
    const password = generatePassword();
    const user = await upsertAuthUser(admin, account.email, password);

    const { error: profileError } = await admin.from('profiles').upsert({
      id: user.id,
      role: account.role,
      display_name: `E2E ${account.role}`,
    });
    if (profileError) throw profileError;

    upsertEnvVar(envLines, `${account.envPrefix}_EMAIL`, account.email);
    upsertEnvVar(envLines, `${account.envPrefix}_PASSWORD`, password);
    console.log(`ready: ${account.role} test account (${account.email})`);
  }

  writeFileSync(envPath, envLines.join('\n') + '\n');
  console.log('\nE2E_* credentials written to .env.local.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
