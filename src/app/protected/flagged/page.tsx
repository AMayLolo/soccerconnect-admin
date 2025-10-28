import { createServerClientInstance } from "@/utils/supabase/server";
import { FlaggedTableClient } from "./FlaggedTableClient";

export const metadata = {
  title: "Flagged Reports | SoccerConnect Admin",
  description: "Moderate reported reviews and mark them resolved.",
};

export default async function FlaggedPage() {
  const supabase = await createServerClientInstance();

  const { data: reports, error } = await supabase
    .from("review_reports")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching flagged reports:", error.message);
  }

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Flagged Reports</h1>
      <FlaggedTableClient reports={reports || []} />
    </div>
  );
}
