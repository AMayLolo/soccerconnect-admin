"use server";

import { createSupabaseServer } from "@/lib/supabaseServer";
import { revalidatePath } from "next/cache";

export async function handleResolve(formData: FormData) {
  const reportId = formData.get("report_id");
  if (typeof reportId !== "string") {
    console.error("[handleResolve] missing report_id in formData");
    return;
  }

  const supabase = await createSupabaseServer();

  const { error } = await supabase
    .from("reports")
    .update({ status: "resolved" })
    .eq("id", reportId);

  if (error) {
    console.error("[handleResolve] supabase error:", error.message);
  } else {
    console.log(`[handleResolve] report ${reportId} marked resolved`);
  }

  // refresh the list + detail UI on next request
  revalidatePath("/protected/flagged");
  revalidatePath(`/protected/reports/${reportId}`);
}
