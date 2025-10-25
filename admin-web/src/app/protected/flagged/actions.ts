"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/utils/supabase/server";
import { getCurrentUser } from "@/utils/auth";

export async function resolveFlaggedReport(reportId: string) {
  if (!reportId) {
    return { ok: false, error: "Missing reportId" };
  }

  // auth check
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return { ok: false, error: "Unauthorized" };
  }

  // 👇 IMPORTANT: await the client because createServerClient() is async
  const supabase = await createServerClient();

  const { error } = await supabase
    .from("flagged_reports")
    .update({
      resolved_at: new Date().toISOString(),
    })
    .eq("id", reportId)
    .is("resolved_at", null);

  if (error) {
    console.error("resolveFlaggedReport error:", error);
    return { ok: false, error: "DB update failed" };
  }

  // Revalidate so the list is fresh next navigation
  revalidatePath("/protected/flagged");

  return { ok: true };
}
