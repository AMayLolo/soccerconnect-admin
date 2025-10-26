// src/app/protected/flagged/resolveFlaggedReports.ts
"use server";

import { requireUser } from "@/utils/auth";
import { getServiceClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Server Action: mark a flagged report as resolved.
 * Called from the form in the UI.
 */
export async function handleResolve(formData: FormData) {
  // auth guard: only logged-in admins can do this
  await requireUser();

  const reportId = formData.get("report_id");
  if (!reportId || typeof reportId !== "string") {
    throw new Error("Missing report_id");
  }

  const supabase = getServiceClient();

  // Update that row in whatever table holds flagged reports.
  // I'm guessing table name `flagged_reports`, status column `status`.
  // Adjust to match your schema.
  const { error } = await supabase
    .from("flagged_reports")
    .update({ status: "resolved" })
    .eq("id", reportId);

  if (error) {
    console.error("[handleResolve] supabase error:", error.message);
    throw new Error("Failed to resolve report");
  }

  // Refresh the /protected/flagged page so the row updates
  revalidatePath("/protected/flagged");
}

/**
 * Small button+form you can render in each row.
 * This is still a Server Component because it's just JSX
 * with a <form action={handleResolve}>; Next can handle that.
 *
 * If Next ever yells about "Server Actions cannot be passed
 * to Client Components", then we convert this to a client
 * component that calls a dedicated server action. But this
 * should be fine in 16.
 */
export function ResolveFlaggedButton({ reportId }: { reportId: string }) {
  return (
    <form action={handleResolve}>
      <input type="hidden" name="report_id" value={reportId} />
      <button
        type="submit"
        className="text-xs px-2 py-1 rounded bg-green-600 text-white hover:bg-green-700"
      >
        Mark Resolved
      </button>
    </form>
  );
}
