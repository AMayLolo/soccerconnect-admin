// src/app/protected/flagged/page.tsx
import { requireUser } from "@/utils/auth";
import { createServerClientInstance } from "@/utils/supabase/server";
import { ResolveFlaggedButton } from "./ResolveFlaggedButton";

export const dynamic = "force-dynamic";

export default async function FlaggedPage() {
  // Enforce auth on the server. If not logged in, this will redirect to /login.
  const user = await requireUser();

  // Get a Supabase server client bound to cookies
  const supabase = await createServerClientInstance();

  // Load unresolved reports
  const { data: flaggedReports, error } = await supabase
    .from("review_reports")
    .select("*")
    .eq("resolved", false)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(
      "[FlaggedPage] Error loading flagged reports:",
      error.message
    );
  }

  return (
    <main className="space-y-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Flagged Reports
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Reports submitted by users that still need review.
        </p>
      </header>

      <section className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        {!flaggedReports || flaggedReports.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No unresolved reports. 🎉
          </p>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {flaggedReports.map((report: any) => (
              <li
                key={report.id}
                className="py-4 flex flex-col md:flex-row md:items-start md:justify-between gap-3"
              >
                <div className="text-sm text-gray-900 dark:text-gray-100">
                  <div className="font-medium">
                    {report.club_name || "Unknown club"}
                  </div>

                  <div className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                    {report.reason || "No reason provided"}
                  </div>

                  {report.comment && (
                    <div className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                      "{report.comment}"
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <ResolveFlaggedButton reportId={report.id} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
