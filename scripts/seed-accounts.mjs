// One-time setup (design.md §3.1, tasks.md task 3): creates the two real
// accounts and their profiles rows with an explicit role. Not part of the
// app's runtime code - run by hand, once, against the real project:
//
//   node scripts/seed-accounts.mjs --supporter-email=you@example.com --student-email=her@example.com
//
// Generated passwords are written to .seed-credentials.local.txt
// (gitignored) and never printed to stdout - only PASS/FAIL verification
// results are. Open that file, save/share the passwords, then delete it.
import { config } from 'dotenv';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

config({ path: path.join(import.meta.dirname, '..', '.env.local'), quiet: true });

function parseArgs() {
  const args = Object.fromEntries(
    process.argv.slice(2).map((a) => {
      const [k, ...rest] = a.replace(/^--/, '').split('=');
      return [k, rest.join('=')];
    })
  );
  if (!args['supporter-email'] || !args['student-email']) {
    throw new Error(
      'Usage: node scripts/seed-accounts.mjs --supporter-email=... --student-email=...'
    );
  }
  return args;
}

function generatePassword() {
  return randomBytes(18).toString('base64url'); // 24 chars, URL-safe
}

async function upsertAuthUser(admin, email, password) {
  const created = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (!created.error) {
    return created.data.user;
  }

  // Re-running the script (e.g. after a mistake) should still work: reset
  // the existing user's password rather than failing.
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

async function verifyLogin(url, anonKey, email, password, expectedRole) {
  const client = createClient(url, anonKey);
  const { data: signIn, error: signInError } =
    await client.auth.signInWithPassword({ email, password });
  if (signInError) return `FAIL (sign-in: ${signInError.message})`;

  const { data: profile, error: profileError } = await client
    .from('profiles')
    .select('role')
    .eq('id', signIn.user.id)
    .single();
  if (profileError) return `FAIL (profile read: ${profileError.message})`;

  return profile.role === expectedRole
    ? 'PASS'
    : `FAIL (expected role "${expectedRole}", got "${profile.role}")`;
}

async function main() {
  const args = parseArgs();
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
    {
      role: 'supporter',
      displayName: 'Dad',
      email: args['supporter-email'],
      password: generatePassword(),
    },
    {
      role: 'student',
      displayName: 'Student',
      email: args['student-email'],
      password: generatePassword(),
    },
  ];

  const credentialLines = [];
  for (const account of accounts) {
    const user = await upsertAuthUser(admin, account.email, account.password);

    const { error: profileError } = await admin.from('profiles').upsert({
      id: user.id,
      role: account.role,
      display_name: account.displayName,
    });
    if (profileError) throw profileError;

    console.log(`created/updated ${account.role} account (${account.email})`);
    credentialLines.push(`${account.role}: ${account.email} / ${account.password}`);
  }

  const credentialsPath = path.join(
    import.meta.dirname,
    '..',
    '.seed-credentials.local.txt'
  );
  writeFileSync(credentialsPath, credentialLines.join('\n') + '\n');
  console.log(
    `\nPasswords written to ${credentialsPath} - open it, save/share them, then delete the file.\n`
  );

  console.log('Verifying each account can sign in and sees the correct role...');
  for (const account of accounts) {
    const result = await verifyLogin(
      url,
      anonKey,
      account.email,
      account.password,
      account.role
    );
    console.log(`  ${account.role} (${account.email}): ${result}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
