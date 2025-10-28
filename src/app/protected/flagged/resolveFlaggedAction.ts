"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Marks a flagged report as resolved in Supabase.
 */
export async function resolveFlaggedAction(reportId: string) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => Array.from(cookieStore.getAll()),
        setAll: () => {},
      },
    }
  );

  try {
    const { error } = await supabase
      .from("reports") // ✅ matches your Supabase table
      .update({ resolved: true })
      .eq("id", reportId);

    if (error) {
      console.error("[resolveFlaggedAction] Supabase error:", error.message);
      return { ok: false, error: error.message };
    }

    console.log(`[resolveFlaggedAction] Report ${reportId} marked as resolved.`);
    return { ok: true };
  } catch (err: any) {
    console.error("[resolveFlaggedAction] Unexpected error:", err);
    return { ok: false, error: err.message || "Unknown error" };
  }
}
