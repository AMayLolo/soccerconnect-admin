'use client';

import * as React from 'react';
import { createBrowserClient } from '@supabase/ssr';

export function LoginForm() {
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [sent, setSent] = React.useState(false);

  // Browser client (uses NEXT_PUBLIC_ env vars)
  const supabase = React.useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      ),
    []
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${location.origin}/protected` },
      });
      if (error) throw error;
      setSent(true);
    } catch (err: any) {
      setError(err?.message ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <p>
        Check your email for a magic link. After signing in, you’ll land on the
        admin dashboard.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} style={{ marginTop: 12, display: 'grid', gap: 12 }}>
      <label>
        Email
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: '100%', padding: 8 }}
        />
      </label>
      {error ? <p style={{ color: 'crimson' }}>{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        style={{
          padding: '10px 14px',
          background: '#1565C0',
          color: 'white',
          borderRadius: 8,
          border: 0,
        }}
      >
        {loading ? 'Sending…' : 'Send magic link'}
      </button>
    </form>
  );
}
