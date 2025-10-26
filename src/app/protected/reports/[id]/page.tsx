// src/app/protected/reports/[id]/page.tsx

import Link from "next/link";
import { notFound } from "next/navigation";

import { createSupabaseServer } from "@/lib/supabaseServer";
import { ResolveFlaggedButton } from "../../flagged/resolveFlaggedReports";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type ReportRow = {
  id: string;
  club_id: string | null;
  club_name: string | null;
  reason: string | null;
  details: string | null;
  status: string | null;
  created_at: string | null;
};

async function getReportById(id: string) {
  const supabase = await createSupabaseServer();

  const { data, error } = await supabase
    .from("reports")
    .select(
      `
        id,
        club_id,
        club_name,
        reason,
        details,
        status,
        created_at
      `
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[reports/[id]] error fetching report:", error.message);
    return null;
  }

  return data as ReportRow | null;
}

export default async function ReportDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  const report = await getReportById(id);

  if (!report) {
    notFound();
  }

  const { club_id, club_name, reason, details, status, created_at } = report;

  return (
    <main className="p-6 space-y-6 max-w-2xl">
      <Link
        href="/protected/flagged"
        className="text-sm text-blue-600 hover:underline"
      >
        ← Back to Flagged Reports
      </Link>

      <header className="space-y-1">
        <h1 className="text-xl font-semibold text-gray-900">
          Report #{id.slice(0, 8)}
        </h1>
        <div className="text-sm text-gray-500">
          Status:{" "}
          <span
            className={
              status === "resolved"
                ? "text-green-600 font-medium"
                : "text-red-600 font-medium"
            }
          >
            {status ?? "unknown"}
          </span>
        </div>
        <div className="text-xs text-gray-400">
          Created: {created_at ? new Date(created_at).toLocaleString() : "—"}
        </div>
      </header>

      <section className="rounded border border-gray-200 bg-white p-4 space-y-3">
        <div>
          <div className="text-xs font-medium text-gray-500 uppercase">
            Club
          </div>
          <div className="text-base text-gray-900">
            {club_name || "—"}{" "}
            {club_id ? (
              <span className="text-xs text-gray-500 ml-1">
                (ID: {club_id})
              </span>
            ) : null}
          </div>
        </div>

        <div>
          <div className="text-xs font-medium text-gray-500 uppercase">
            Reason
          </div>
          <div className="text-base text-gray-900 whitespace-pre-wrap">
            {reason || "—"}
          </div>
        </div>

        <div>
          <div className="text-xs font-medium text-gray-500 uppercase">
            Details
          </div>
          <div className="text-base text-gray-900 whitespace-pre-wrap">
            {details || "—"}
          </div>
        </div>
      </section>

      <section className="flex items-center gap-3">
        <ResolveFlaggedButton reportId={id} />
      </section>
    </main>
  );
}
