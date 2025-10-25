// admin-web/src/app/protected/data.ts
'use server'

import { getSupabaseServerAdmin } from '@/lib/supabaseServerAdmin'

/**
 * Marks a flagged report as resolved.
 * Uses the admin Supabase client (service role capable).
 * Called via server action from the Flagged Reports table.
 */
export async function resolveFlaggedReport(reportId: string) {
  if (!reportId) throw new Error('Missing report ID')

  const supabase = await getSupabaseServerAdmin()

  const { error } = await supabase
    .from('review_reports')
    .update({ resolved: true })
    .eq('id', reportId)

  if (error) {
    console.error('❌ Failed to resolve flagged report:', error)
    throw new Error('Unable to resolve report')
  }

  console.log(`✅ Report ${reportId} marked as resolved`)
  return { success: true }
}
