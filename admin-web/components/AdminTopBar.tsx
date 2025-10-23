'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export default function AdminTopBar() {
  const [email, setEmail] = useState<string | null>(null);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setEmail(user?.email ?? null);
    })();
  }, []);

  const onSignOut = async () => {
    // Call our server route so cookies are cleared on the server side too
    await fetch('/auth/signout', { method: 'POST' });
    // As a fallback also sign out on the client (no-op if already cleared)
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: '#0b5bd3',
        color: 'white',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 1px 3px rgba(0,0,0,.15)',
      }}
    >
      <strong>SoccerConnect • Admin</strong>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <span style={{ opacity: 0.9 }}>
          {email ? `Signed in as ${email}` : 'Not signed in'}
        </span>
        <button
          onClick={onSignOut}
          style={{
            background: 'white',
            color: '#0b5bd3',
            border: 0,
            borderRadius: 6,
            padding: '6px 10px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
