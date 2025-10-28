import { getSupabaseServer } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

interface Club {
  name: string | null;
}

interface Review {
  title: string | null;
  clubs: Club[] | null;
}

interface Report {
  id: string;
  reason: string | null;
  resolved: boolean;
  created_at: string;
  reviews: Review[] | null;
}

export default async function ProtectedDashboard() {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from("review_reports")
    .select("id, reason, resolved, created_at, reviews(title, clubs(name))")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    console.error("Error loading reports:", error.message);
  }

  const reports = (data ?? []) as Report[];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <table className="min-w-full border-collapse border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2 text-left">Review Title</th>
            <th className="border p-2 text-left">Club</th>
            <th className="border p-2 text-left">Reason</th>
            <th className="border p-2 text-left">Resolved</th>
            <th className="border p-2 text-left">Created</th>
          </tr>
        </thead>
        <tbody>
          {reports.length ? (
            reports.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-2">{r.reviews?.[0]?.title ?? "—"}</td>
                <td className="p-2">{r.reviews?.[0]?.clubs?.[0]?.name ?? "—"}</td>
                <td className="p-2">{r.reason ?? "—"}</td>
                <td className="p-2 text-center">
                  {r.resolved ? "✅" : "❌"}
                </td>
                <td className="p-2">
                  {r.created_at
                    ? new Date(r.created_at).toLocaleDateString()
                    : "—"}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="p-4 text-center text-gray-500">
                No flagged reports found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
