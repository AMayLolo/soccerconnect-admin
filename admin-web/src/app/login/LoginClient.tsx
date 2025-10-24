'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function LoginClient() {
  const router = useRouter();
  const search = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const initialMsg =
    search.get('e') === 'not_admin' ? 'Your account is not an admin.' : null;
  const [msg, setMsg] = useState<string | null>(initialMsg);

  // Public env vars are safe to read in the browser
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMsg(error.message);
      return;
    }
    router.replace('/protected');
  };

  return (
    <form onSubmit={onSubmit} className="p-6 max-w-sm mx-auto space-y-3">
      <h1 className="text-2xl font-semibold">Admin sign in</h1>
      {msg && <p className="text-red-600">{msg}</p>}
      <input
        type="email"
        placeholder="Email"
        className="border rounded px-3 py-2 w-full"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        className="border rounded px-3 py-2 w-full"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit" className="rounded px-4 py-2 border">
        Sign in
      </button>
    </form>
  );
}

