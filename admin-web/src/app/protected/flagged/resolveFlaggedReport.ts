'use server';

import { createSupabaseServer } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';

export async function resolveFlaggedReport(reportId: string) {
  try {
    // ✅ cookies() is now async — await it
    const cookieStore = await cookies();

    const supabase = await createSupabaseServer({
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
    });

    const { error } = await supabase
      .from('review_reports')
      .update({ resolved: true })
      .eq('id', reportId);

    if (error) {
      console.error('resolveFlaggedReport error:', error.message);
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (err: any) {
    console.error('resolveFlaggedReport exception:', err);
    return { ok: false, error: err?.message ?? 'Unknown error' };
  }
}
