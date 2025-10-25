import { createServerClient } from "@/utils/supabase/server";
import FlaggedTableClient, { FlaggedReport } from "./FlaggedTableClient";

export const revalidate = 0;

type PageProps = {
  searchParams?: {
    page?: string;
    limit?: string;
  };
};

export default async function FlaggedPage({ searchParams }: PageProps) {
  const supabase = await createServerClient();

  // 🔹 Pagination setup
  const currentPage = Number(searchParams?.page ?? 1);
  const rowsPerPage = Number(searchParams?.limit ?? 10);
  const from = (currentPage - 1) * rowsPerPage;
  const to = from + rowsPerPage - 1;

  // 🔹 Fetch unresolved reports with joined review + club info
  const { data, error, count } = await supabase
    .from("review_reports")
    .select(
      `
        id,
        reason,
        resolved,
        created_at,
        reported_at,
        reviews (
          id,
          comment,
          rating,
          category,
          inserted_at,
          clubs (
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

  // 🔹 Normalize the shape for the table
  const normalized: FlaggedReport[] =
    data?.map((r: any) => ({
      id: r.id,
      reason: r.reason,
      reported_at: r.reported_at || r.created_at,
      created_at: r.created_at,
      resolved: r.resolved,
      club_name: r.reviews?.clubs?.name ?? "Unknown Club",
      comment: r.reviews?.comment ?? "",
      rating: r.reviews?.rating ?? null,
      category: r.reviews?.category ?? "",
    })) ?? [];

  // 🔹 Inline server action for triggering a refresh
  async function refreshReports() {
    "use server";
    await supabase
      .from("review_reports")
      .select("id")
      .limit(1);
  }

  // 🔹 Derived values for header
  const total = count ?? 0;
  const startItem = from + 1;
  const endItem = Math.min(to + 1, total);

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
          Showing{" "}
          <span className="font-medium text-gray-900">
            {startItem}-{endItem}
          </span>{" "}
          of{" "}
          <span className="font-medium text-gray-900">{total}</span> total
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
