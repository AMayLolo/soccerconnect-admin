'use server';

import { getSupabaseServerAdmin } from '@/lib/supabaseServerAdmin';

export async function resolveFlaggedReport(reportId: string) {
  const supabase = await getSupabaseServerAdmin();

  // mark report as resolved
  const { error } = await supabase
    .from('review_reports')
    .update({ resolved: true })
    .eq('id', reportId);

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
