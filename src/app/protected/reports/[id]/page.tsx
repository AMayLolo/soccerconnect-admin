// src/app/protected/reports/[id]/page.tsx
import { notFound } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { ResolveFlaggedButton } from "../../flagged/ResolveFlaggedButton";

export const dynamic = "force-dynamic";

export default async function ReportDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await getSupabaseServer();
  const { data: report, error } = await supabase
    .from("review_reports")
    .select("*, reviews(*, clubs(*))")
    .eq("id", params.id)
    .single();

  if (error || !report) {
    console.error("Error loading report:", error?.message);
    notFound();
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">
        Flagged Report Details
      </h1>

      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <p>
          <strong>Review ID:</strong> {report.review_id}
        </p>
        <p>
          <strong>Reason:</strong> {report.reason}
        </p>
        <p>
          <strong>Resolved:</strong>{" "}
          {report.resolved ? "✅ Yes" : "❌ No"}
        </p>
      </div>

      <ResolveFlaggedButton reportId={report.id} resolved={report.resolved} />
    </div>
  );
}
