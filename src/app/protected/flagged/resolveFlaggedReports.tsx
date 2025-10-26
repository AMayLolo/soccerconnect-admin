// src/app/protected/flagged/resolveFlaggedReports.tsx

// This file defines:
// 1. a server action (`handleResolve`) that marks a report resolved in Supabase
// 2. a small client component <ResolveFlaggedButton /> that renders the form
//
// This pattern (server action + client wrapper) is compatible with Next.js 16.

import { revalidatePath } from "next/cache";
import { createSupabaseServer } from "@/lib/supabaseServer";

// --- 1. SERVER ACTION -------------------------------------------------
export async function handleResolve(formData: FormData) {
  "use server";

  const reportId = formData.get("report_id");
  if (typeof reportId !== "string") {
    console.error("[handleResolve] missing report_id in formData");
    return;
  }

  const supabase = await createSupabaseServer();

  // update report to resolved
  const { error } = await supabase
    .from("reports")
    .update({ status: "resolved" })
    .eq("id", reportId);

  if (error) {
    console.error("[handleResolve] supabase error:", error.message);
  } else {
    console.log(`[handleResolve] report ${reportId} marked resolved`);
  }

  // Revalidate flagged list page + this report page (so UI updates in prod)
  revalidatePath("/protected/flagged");
  revalidatePath(`/protected/reports/${reportId}`);
}

// --- 2. CLIENT COMPONENT BUTTON ---------------------------------------
"use client";

export function ResolveFlaggedButton({ reportId }: { reportId: string }) {
  return (
    <form action={handleResolve}>
      <input type="hidden" name="report_id" value={reportId} />
      <button
        type="submit"
        className="px-3 py-2 rounded bg-green-600 text-white text-sm font-medium hover:bg-green-700"
      >
        Mark Resolved
      </button>
    </form>
  );
}
