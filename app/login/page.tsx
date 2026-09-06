'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/db/supabase-browser';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setPending(false);
      return;
    }

    router.push('/');
    router.refresh();
  }

  return (
    <main style={{ maxWidth: 360, margin: '80px auto', padding: '0 24px' }}>
      <div className="card">
        <h1>Sign in</h1>
        <form onSubmit={handleSubmit} style={{ marginTop: 18 }}>
          <div style={{ marginBottom: 14 }}>
            <label htmlFor="email">Email</label>
            <br />
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                marginTop: 6,
                padding: '8px 10px',
                borderRadius: 7,
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                color: 'var(--ink)',
              }}
            />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label htmlFor="password">Password</label>
            <br />
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                marginTop: 6,
                padding: '8px 10px',
                borderRadius: 7,
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                color: 'var(--ink)',
              }}
            />
          </div>
          {error && (
            <p role="alert" style={{ color: 'var(--warn)', fontSize: 13 }}>
              {error}
            </p>
          )}
          <button type="submit" disabled={pending} className="btn2">
            {pending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </main>
  );
}
