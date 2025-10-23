'use client';

import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password: pwd });
    setLoading(false);
    if (error) {
      setErr(error.message);
      return;
    }
    router.replace('/protected');
  };

  return (
    <div style={{ maxWidth: 420, margin: '16vh auto', padding: 24, border: '1px solid #e5e7eb', borderRadius: 12 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>Admin sign in</h1>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
        <input
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
          type="email"
          required
          style={{ padding: 10, borderRadius: 8, border: '1px solid #d1d5db' }}
        />
        <input
          value={pwd}
          onChange={e => setPwd(e.target.value)}
          placeholder="Password"
          type="password"
          required
          style={{ padding: 10, borderRadius: 8, border: '1px solid #d1d5db' }}
        />
        <button
          disabled={loading}
          style={{
            padding: '10px 12px',
            borderRadius: 8,
            background: '#0b5bd3',
            color: 'white',
            fontWeight: 700,
            border: 0,
            cursor: 'pointer',
          }}
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
        {err && <p style={{ color: 'crimson' }}>{err}</p>}
      </form>
    </div>
  );
}
