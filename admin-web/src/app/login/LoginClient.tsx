// admin-web/src/app/login/LoginClient.tsx
'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'; // already in your repo

export default function LoginClient() {
  const search = useSearchParams();
  const supabase = useMemo(() => createSupabaseBrowser(), []);
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // show any error/success passed back on redirect
  const urlError = search.get('error');
  const urlOk = search.get('ok');

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setSending(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo:
            typeof window !== 'undefined'
              ? `${window.location.origin}/protected`
              : undefined,
        },
      });
      if (error) throw error;
      setMsg('Check your email for the sign-in link.');
    } catch (e: any) {
      setErr(e?.message ?? 'Failed to send link.');
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={sendMagicLink}>
      {urlOk && <p style={{ color: 'green' }}>{urlOk}</p>}
      {urlError && <p style={{ color: 'crimson' }}>{urlError}</p>}
      {msg && <p style={{ color: 'green' }}>{msg}</p>}
      {err && <p style={{ color: 'crimson' }}>{err}</p>}

      <label htmlFor="email" style={{ display: 'block', marginBottom: 6 }}>
        Admin email
      </label>
      <input
        id="email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@company.com"
        style={{
          width: '100%',
          padding: 12,
          borderRadius: 8,
          border: '1px solid #e5e7eb',
          marginBottom: 12,
        }}
      />

      <button
        type="submit"
        disabled={sending}
        style={{
          width: '100%',
          padding: 12,
          borderRadius: 8,
          background: '#1565C0',
          color: 'white',
          fontWeight: 700,
          opacity: sending ? 0.7 : 1,
        }}
      >
        {sending ? 'Sending…' : 'Send Magic Link'}
      </button>
    </form>
  );
}
