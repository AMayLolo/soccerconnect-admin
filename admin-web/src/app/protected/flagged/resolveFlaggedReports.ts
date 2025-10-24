'use server';

import { getSupabaseServerAdmin } from '@/lib/supabaseServerAdmin';

/**
 * Mark a single report as resolved=true.
 * Returns { ok: true } or { ok: false, error: string }
 */
export async function resolveFlaggedReport(reportId: string) {
  try {
    const supabase = await getSupabaseServerAdmin();

    const { error } = await supabase
      .from('review_reports')
      .update({ resolved: true })
      .eq('id', reportId);

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message ?? 'Unknown error' };
  }
}
