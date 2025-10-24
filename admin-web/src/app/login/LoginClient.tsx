'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export default function LoginClient() {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pw,
    });

    setLoading(false);

    if (error) {
      setErr(error.message);
      return;
    }

    // got a session, go to /protected
    if (data.session) {
      window.location.href = '/protected';
    } else {
      setErr('No session returned.');
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-sm mx-auto mt-24 border border-gray-200 rounded-lg p-6 shadow-sm"
    >
      <h1 className="text-xl font-semibold text-gray-900 mb-4">
        Admin login
      </h1>

      <label className="block text-sm font-medium text-gray-700 mb-1">
        Email
      </label>
      <input
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />

      <label className="block text-sm font-medium text-gray-700 mb-1">
        Password
      </label>
      <input
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        type="password"
        value={pw}
        onChange={e => setPw(e.target.value)}
        required
      />

      {err && (
        <p className="text-sm text-red-600 mb-3">{err}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-blue-600 text-white text-sm font-medium py-2 hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
