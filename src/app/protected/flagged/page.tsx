// src/app/protected/flagged/page.tsx

import { requireUser } from "@/utils/auth";
import { getServiceClient } from "@/utils/supabase/server";
import { ResolveFlaggedButton } from "./resolveFlaggedReports";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function FlaggedPage() {
  // make sure only logged-in admins can view
  await requireUser();

  const supabase = getServiceClient();

  // pull flagged reports
  // Adjust table/columns to match your DB schema
  const { data: reports, error } = await supabase
    .from("flagged_reports")
    .select("*")
    .eq("status", "flagged")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[FlaggedPage] error loading flagged reports:", error.message);
  }

  return (
    <main className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Flagged Reports
          </h1>
          <p className="text-sm text-gray-600">
            Admin moderation queue. Mark items resolved as you review them.
          </p>
        </div>
      </header>

      <section className="bg-white shadow border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full text-sm text-gray-800">
          <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Club / User</th>
              <th className="px-4 py-3">Reason</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {(reports ?? []).length === 0 ? (
              <tr>
                <td
                  className="px-4 py-4 text-center text-gray-500"
                  colSpan={5}
                >
                  Nothing is flagged right now 🎉
                </td>
              </tr>
            ) : (
              reports!.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-4 font-mono text-xs text-gray-700">
                    {r.id}
                  </td>

                  <td className="px-4 py-4">
                    {/* tweak this for whatever columns you have */}
                    <div className="text-gray-900 font-medium">
                      {r.club_name || r.club_id || "—"}
                    </div>
                    <div className="text-gray-500 text-xs">
                      {r.user_email || r.user_id || ""}
                    </div>
                  </td>

                  <td className="px-4 py-4 text-gray-800">
                    {r.reason || r.comment || "(no details)"}
                  </td>

                  <td className="px-4 py-4">
                    <span className="inline-block rounded bg-yellow-100 text-yellow-800 text-[10px] font-semibold px-2 py-1 uppercase tracking-wide">
                      {r.status}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <ResolveFlaggedButton reportId={r.id} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}
