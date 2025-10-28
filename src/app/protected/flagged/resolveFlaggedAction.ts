"use server";

import { getSupabaseServer } from "@/lib/supabaseServer";
import { revalidatePath } from "next/cache";

/**
 * Marks a flagged report as resolved.
 * Returns { ok: true } on success or { ok: false, error } on failure.
 */
export async function handleResolve(formData: FormData) {
  const supabase = await getSupabaseServer();

  const reportId = formData.get("reportId") as string;
  if (!reportId) {
    return { ok: false, error: "Missing report ID" };
  }

  try {
    const { error } = await supabase
      .from("review_reports")
      .update({ resolved: true })
      .eq("id", reportId);

    if (error) {
      console.error("handleResolve error:", error.message);
      return { ok: false, error: error.message };
    }

    // ✅ Revalidate flagged reports page
    revalidatePath("/protected/flagged");

    return { ok: true };
  } catch (err: any) {
    console.error("Unexpected error in handleResolve:", err);
    return { ok: false, error: err.message || "Unknown error" };
  }
}
