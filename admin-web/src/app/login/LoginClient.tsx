'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function LoginClient() {
  const supabase = createClientComponentClient();
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/protected` },
    });
    setLoading(false);
    setMsg(error ? error.message : 'Check your email for a sign-in link.');
  }

  return (
    <form onSubmit={sendMagicLink}>
      <label htmlFor="email">Email</label>
      <input
        id="email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ display: 'block', margin: '8px 0 12px', width: 320, padding: 8 }}
      />
      <button disabled={loading} type="submit">
        {loading ? 'Sending…' : 'Send magic link'}
      </button>
      {msg && <p style={{ marginTop: 12 }}>{msg}</p>}
    </form>
  );
}

