import { createServerClientInstance } from "@/utils/supabase/server";
import FlaggedTableClient, { FlaggedReport } from "./FlaggedTableClient";

export const revalidate = 0;

type PageProps = {
  searchParams?: {
    page?: string;
    limit?: string;
  };
};

export default async function FlaggedPage({ searchParams }: PageProps) {
  const supabase = await createServerClientInstance();

  // 🔹 Pagination setup
  const currentPage = Number(searchParams?.page ?? 1);
  const rowsPerPage = Number(searchParams?.limit ?? 10);
  const from = (currentPage - 1) * rowsPerPage;
  const to = from + rowsPerPage - 1;

  // 🔹 Fetch unresolved reports with joined review + club info
  //
  // IMPORTANT:
  // - No "reported_at" (doesn't exist in review_reports)
  // - We use created_at as the timestamp
  // - We follow your actual FKs: review_id -> reviews, and inside that club_id -> clubs
  //
  const { data, error, count } = await supabase
    .from("review_reports")
    .select(
      `
        id,
        reason,
        resolved,
        created_at,
        review_id (
          id,
          comment,
          rating,
          category,
          inserted_at,
          club_id (
            name
          )
        )
      `,
      { count: "exact" }
    )
    .eq("resolved", false)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Error fetching flagged reports:", error.message);
    return (
      <div className="p-6 text-red-600">
        ❌ Failed to load flagged reports: {error.message}
      </div>
    );
  }

  // 🔹 Normalize the shape for the client table
  const normalized: FlaggedReport[] =
    data?.map((row: any) => ({
      id: row.id,
      reason: row.reason ?? "",
      // we don't have reported_at, so expose created_at as the "reported" timestamp
      reported_at: row.created_at ?? "",
      created_at: row.created_at ?? "",
      resolved: !!row.resolved,

      club_name: row.review_id?.club_id?.name ?? "Unknown Club",
      comment: row.review_id?.comment ?? "",
      rating: row.review_id?.rating ?? null,
      category: row.review_id?.category ?? "",
    })) ?? [];

  // 🔹 Inline server action used by <FlaggedTableClient /> to trigger refresh
  async function refreshReports() {
    "use server";
    await supabase.from("review_reports").select("id").limit(1);
  }

  // 🔹 Derived values for header
  const total = count ?? 0;
  const startItem = total === 0 ? 0 : from + 1;
  const endItem = total === 0 ? 0 : Math.min(to + 1, total);

  return (
    <main className="p-6 space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Flagged Reports
            </h1>
            <p className="text-gray-500 text-sm">
              Unresolved reports requiring moderation
            </p>
        </div>

        <div className="text-sm text-gray-500">
          {total === 0 ? (
            <span className="text-gray-400">No unresolved reports 🎉</span>
          ) : (
            <>
              Showing{" "}
              <span className="font-medium text-gray-900">
                {startItem}-{endItem}
              </span>{" "}
              of{" "}
              <span className="font-medium text-gray-900">{total}</span>{" "}
              total
            </>
          )}
        </div>
      </header>

      <FlaggedTableClient
        initialReports={normalized}
        totalCount={total}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        refreshReports={refreshReports}
      />
    </main>
  );
}
