"use server";

import { createSupabaseServer } from "@/utils/supabase/server";

/**
 * Marks a flagged report as resolved.
 * Returns { ok: true } or { ok: false, error }.
 */
export async function resolveFlaggedReport(id: string) {
  const supabase = createSupabaseServer();

  const { error } = await supabase
    .from("review_reports")
    .update({ resolved: true })
    .eq("id", id);

  if (error) {
    console.error("Failed to resolve report:", error.message);
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
