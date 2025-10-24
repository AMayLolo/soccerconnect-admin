'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

// browser-side supabase client
function getBrowserClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export default function LoginClient() {
  const router = useRouter();
  const params = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // surface ?error=... from redirect flow or login failure
  const urlError = params.get('error');
  const [errorMsg, setErrorMsg] = useState<string | null>(urlError);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    const supabase = getBrowserClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message || 'Sign-in failed');
      return;
    }

    // got a session? send them to dashboard
    if (data.session) {
      router.push('/protected');
      // optional: force refresh so server layout sees the new session
      router.refresh();
    } else {
      setErrorMsg('No active session returned.');
    }
  }

  return (
    <div className="w-full max-w-sm bg-white rounded-lg shadow p-6 border border-gray-200">
      <h1 className="text-xl font-semibold text-gray-900 mb-1">
        SoccerConnect Admin
      </h1>
      <p className="text-sm text-gray-600 mb-4">
        Sign in with your admin credentials.
      </p>

      {errorMsg && (
        <div className="mb-4 rounded bg-red-50 text-red-700 text-sm p-2 border border-red-200">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 transition"
        >
          Sign in
        </button>
      </form>
    </div>
  );
}
