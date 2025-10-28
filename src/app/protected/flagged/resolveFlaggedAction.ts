"use server";

import { createServerAdminClientInstance } from "@/utils/supabase/serverAdmin";
import { revalidatePath } from "next/cache";

/**
 * Marks a flagged review report as resolved.
 */
export async function resolveFlaggedAction(reportId: string) {
  const supabase = await createServerAdminClientInstance();

  try {
    const { error } = await supabase
      .from("review_reports")
      .update({ resolved: true })
      .eq("id", reportId);

    if (error) {
      console.error("resolveFlaggedAction error:", error.message);
      return { ok: false, error: error.message };
    }

    // Refresh the flagged reports page
    revalidatePath("/protected/flagged");

    return { ok: true };
  } catch (err: any) {
    console.error("Unexpected error in resolveFlaggedAction:", err);
    return { ok: false, error: err.message || "Unknown error" };
  }
}
