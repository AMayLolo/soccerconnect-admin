"use server";

import { createServerClientInstance } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Marks a flagged report as resolved.
 * Returns { ok: true } on success or { ok: false, error } on failure.
 */
export async function resolveFlaggedReports(reportId: string) {
  const supabase = await createServerClientInstance();

  try {
    const { error } = await supabase
      .from("review_reports")
      .update({ resolved: true })
      .eq("id", reportId);

    if (error) {
      console.error("resolveFlaggedReports error:", error.message);
      return { ok: false, error: error.message };
    }

    // Revalidate flagged page so SSR data is fresh on reload
    revalidatePath("/protected/flagged");

    return { ok: true };
  } catch (err: any) {
    console.error("Unexpected error in resolveFlaggedReports:", err);
    return { ok: false, error: err.message || "Unknown error" };
  }
}
