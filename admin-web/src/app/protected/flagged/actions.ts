"use server";

import { revalidatePath } from "next/cache";
import { createServerClientInstance } from "@/utils/supabase/server";

/**
 * Marks a flagged report as resolved.
 * Returns { ok: true } on success or { ok: false, error } on failure.
 */
export async function resolveFlaggedReports(reportId: string) {
  try {
    const supabase = await createServerClientInstance();

    const { error } = await supabase
      .from("review_reports")
      .update({ resolved: true })
      .eq("id", reportId);

    if (error) {
      console.error("❌ Error resolving flagged report:", error.message);
      return { ok: false, error: error.message };
    }

    // ✅ Revalidate flagged reports page after action
    revalidatePath("/protected/flagged");
    return { ok: true };
  } catch (err: any) {
    console.error("⚠️ Unexpected error resolving flagged report:", err);
    return { ok: false, error: err.message || "Unknown error" };
  }
}
