// admin-web/app/protected/layout.tsx
import React from 'react';
import { redirect } from 'next/navigation';
import { createSupabaseServer } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Server Action to sign out
async function signOutAction() {
  'use server';
  const supabase = await createSupabaseServer();
  await supabase.auth.signOut();
  redirect('/login');
}

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Optional: check admin role
  const { data: adminRow } = await supabase
    .from('admin_users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();
  if (!adminRow) redirect('/login?e=not_admin');

  return (
    <div>
      {/* simple header so you can verify it’s the protected shell */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        background: '#0B63CE',
        color: 'white',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <strong>Soccer Connect • Admin</strong>
        <form action={signOutAction}>
          <button type="submit" style={{ background: 'white', color: '#0B63CE', borderRadius: 6, padding: '6px 10px' }}>
            Sign out
          </button>
        </form>
      </div>

      <div style={{ padding: 16 }}>{children}</div>
    </div>
  );
}
