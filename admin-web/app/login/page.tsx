// admin-web/app/login/page.tsx
'use client';

import { createClient } from '@supabase/supabase-js';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const next = params.get('next') || '/';

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setMsg(error.message);
      return;
    }
    router.replace(next);
  };

  return (
    <main style={{ padding: 24, maxWidth: 420, margin: '40px auto' }}>
      <h1 style={{ fontWeight: 800, fontSize: 22, marginBottom: 16 }}>Admin Login</h1>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
        <label>
          <div>Email</div>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd' }}
          />
        </label>
        <label>
          <div>Password</div>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd' }}
          />
        </label>
        <button
          disabled={loading}
          type="submit"
          style={{
            marginTop: 8,
            padding: '12px 16px',
            borderRadius: 10,
            background: '#1565C0',
            color: '#fff',
            fontWeight: 700,
          }}
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
        {msg && <p style={{ color: 'crimson' }}>{msg}</p>}
      </form>
    </main>
  );
}
// touch
