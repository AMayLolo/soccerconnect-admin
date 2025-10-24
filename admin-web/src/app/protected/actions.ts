'use server';

import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

// Helper to get a server-side Supabase client
async function getServerSb() {
  const cookieStore = await cookies(); // ✅ await required in Next.js 15+

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set() {
          // no-op for server actions
        },
        remove() {
          // no-op for server actions
        },
      },
    }
  );

  return supabase;
}

// Mark a single review_reports row as resolved
export async function resolveReport(reportId: string) {
  const supabase = await getServerSb(); // ✅ must await

  // Confirm user is logged in
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) {
    return { ok: false, error: 'not_authenticated' };
  }

  // Confirm user is admin
  const { data: adminRow } = await supabase
    .from('admin_users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (!adminRow) {
    return { ok: false, error: 'not_admin' };
  }

  // Update report as resolved
  const { error: updateErr } = await supabase
    .from('review_reports')
    .update({ resolved: true })
    .eq('id', reportId);

  if (updateErr) {
    return { ok: false, error: updateErr.message };
  }

  return { ok: true };
}
