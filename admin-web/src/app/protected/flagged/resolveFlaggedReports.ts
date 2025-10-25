// admin-web/src/app/protected/flagged/resolveFlaggedReports.ts
'use server';

import { cookies } from 'next/headers';
import { createSupabaseServer } from '@/lib/supabaseServer';

// helper for createSupabaseServer to read auth cookies in Next 16
async function getCookieValue(name: string): Promise<string | undefined> {
  const jar = await cookies();
  return jar.get(name)?.value;
}

// Mark a single review_reports row as resolved
export async function resolveFlaggedReport(reportId: string): Promise<boolean> {
  if (!reportId) return false;

  const supabase = await createSupabaseServer({
    get: getCookieValue,
  });

  const { error } = await supabase
    .from('review_reports')
    .update({ resolved: true })
    .eq('id', reportId);

  if (error) {
    console.error('resolveFlaggedReport error:', error);
    return false;
  }

  return true;
}
