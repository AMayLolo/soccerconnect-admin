import FlaggedTableClient, {
    FlaggedReport,
} from "./FlaggedTableClient";

import { getCurrentUser } from "@/utils/auth";
import { createServerClient } from "@/utils/supabase/server";

export default async function FlaggedPage() {
  // auth
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return (
      <main className="p-6">
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 p-4 text-sm">
          Unauthorized
        </div>
      </main>
    );
  }

  // 👇 IMPORTANT: await here too
  const supabase = await createServerClient();

  // OPTION A: if you actually have a clubs table with relationship
  const { data, error } = await supabase
    .from("flagged_reports")
    .select(
      `
        id,
        reason,
        created_at,
        clubs (
          name
        )
      `
    )
    .is("resolved_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("fetch flagged_reports error:", error);
    return (
      <main className="p-6">
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 p-4 text-sm">
          Failed to load flagged reports.
        </div>
      </main>
    );
  }

  // Normalize for the client component
  const rows: FlaggedReport[] = (data ?? []).map((row: any) => ({
    id: row.id,
    reason: row.reason,
    created_at: row.created_at,
    club_name: row.clubs?.name ?? "Unknown club",
  }));

  return (
    <main className="p-6 space-y-6">
      <section>
        <h1 className="text-xl font-semibold text-zinc-100 flex items-center gap-2">
          Flagged Content
          <span className="text-xs font-normal text-zinc-500">
            ({rows.length} open)
          </span>
        </h1>

        <p className="text-sm text-zinc-500">
          These are reports submitted by parents. When you’ve handled it,
          resolve the item to hide it from this queue.
        </p>
      </section>

      <FlaggedTableClient initialReports={rows} />
    </main>
  );
}
