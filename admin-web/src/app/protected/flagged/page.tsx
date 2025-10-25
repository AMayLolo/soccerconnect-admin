import { createClient } from "@/utils/supabase/server";
import FlaggedTableClient, { FlaggedReport } from "./FlaggedTableClient";

export const revalidate = 0;

export default async function Page() {
  const supabase = createClient();

  // Fetch both resolved and unresolved reports
  const { data, error } = await supabase
    .from("review_reports")
    .select(`
      id,
      reason,
      resolved,
      created_at,
      reported_at,
      reviews (
        id,
        category,
        inserted_at,
        clubs (
          name
        )
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching flagged reports:", error.message);
    return <div className="p-6 text-red-600">Error loading flagged reports.</div>;
  }

  const normalized: FlaggedReport[] =
    data?.map((r: any) => ({
      id: r.id,
      reason: r.reason,
      reported_at: r.reported_at || r.created_at,
      created_at: r.created_at,
      resolved: r.resolved,
      club_name: r.reviews?.[0]?.clubs?.name ?? "Unknown Club",
    })) ?? [];

  return (
    <div className="p-6">
      <FlaggedTableClient initialReports={normalized} />
    </div>
  );
}
