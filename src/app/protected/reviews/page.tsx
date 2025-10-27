// src/app/protected/reviews/page.tsx
import { createServerClientInstance } from "@/utils/supabase/server";
import { requireCurrentUser } from "@/utils/auth";

export const dynamic = "force-dynamic";

type ReviewRow = {
  id: string;
  club_id: string | null;
  user_id: string | null;
  rating: number | null;
  comment: string | null;
  inserted_at: string | null;
  category: string | null;
  flagged: boolean | null;
  hidden: boolean | null;
};

type ClubRow = {
  id: string;
  name: string | null;
};

function formatTimestamp(ts: string | null) {
  if (!ts) return "—";
  const d = new Date(ts);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function ReviewsPage() {
  // ✅ protect route (redirects to /login if not logged in)
  await requireCurrentUser();

  const supabase = await createServerClientInstance();

  // 1. Pull all reviews from newest to oldest, using real columns only
  const {
    data: reviews,
    error: reviewsError,
  } = await supabase
    .from("reviews")
    .select(
      `
        id,
        club_id,
        user_id,
        rating,
        comment,
        inserted_at,
        category,
        flagged,
        hidden
      `
    )
    .order("inserted_at", { ascending: false });

  const reviewList: ReviewRow[] = Array.isArray(reviews)
    ? (reviews as ReviewRow[])
    : [];

  // 2. Collect unique club_ids so we can map club_id -> club name
  const uniqueClubIds = Array.from(
    new Set(
      reviewList
        .map((r) => r.club_id)
        .filter((cid): cid is string => Boolean(cid))
    )
  );

  // 3. Fetch those clubs in one query
  let clubMap: Record<string, string> = {};
  if (uniqueClubIds.length > 0) {
    const {
      data: clubs,
      error: clubsError,
    } = await supabase
      .from("clubs")
      .select("id, name")
      .in("id", uniqueClubIds);

    if (clubsError) {
      console.error("Error loading clubs:", clubsError.message);
    }

    if (Array.isArray(clubs)) {
      clubMap = (clubs as ClubRow[]).reduce((acc, club) => {
        acc[club.id] = club.name || "(Unnamed Club)";
        return acc;
      }, {} as Record<string, string>);
    }
  }

  return (
    <section className="space-y-4">
      <header className="flex items-baseline justify-between">
        <div>
          <h1 className="text-lg font-semibold text-neutral-900">
            All Reviews
          </h1>
          <p className="text-sm text-neutral-500">
            Full review feed (newest first)
          </p>
        </div>
      </header>

      {/* Error block */}
      {reviewsError && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          Error loading reviews: {reviewsError.message}
        </div>
      )}

      {/* Empty state */}
      {!reviewsError && reviewList.length === 0 && (
        <div className="rounded-xl border border-neutral-200 bg-white p-6 text-center text-sm text-neutral-500 shadow-sm">
          No reviews yet.
        </div>
      )}

      {/* Table */}
      {!reviewsError && reviewList.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm text-neutral-800">
            <thead className="bg-neutral-50 text-xs uppercase text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-medium">Rating</th>
                <th className="px-4 py-3 font-medium">Comment</th>
                <th className="px-4 py-3 font-medium">Club</th>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Flags</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 bg-white">
              {reviewList.map((rev) => {
                const clubName = rev.club_id
                  ? clubMap[rev.club_id] || rev.club_id
                  : "—";

                return (
                  <tr key={rev.id} className="align-top">
                    {/* Rating */}
                    <td className="px-4 py-3 text-sm font-semibold text-neutral-900">
                      {rev.rating ?? "-"}
                    </td>

                    {/* Comment/body */}
                    <td className="px-4 py-3 text-sm text-neutral-700 max-w-[320px] break-words leading-relaxed">
                      {rev.comment || "(no comment)"}
                    </td>

                    {/* Club info */}
                    <td className="px-4 py-3 text-xs text-neutral-600 leading-relaxed max-w-[200px] break-words">
                      <div className="font-medium text-neutral-800">
                        {clubName}
                      </div>
                      <div className="text-[11px] text-neutral-500">
                        {rev.club_id ?? "—"}
                      </div>
                    </td>

                    {/* User info (right now we just show user_id) */}
                    <td className="px-4 py-3 text-xs text-neutral-600 leading-relaxed break-all max-w-[160px]">
                      <div className="font-medium text-neutral-800">
                        {rev.user_id || "—"}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3 text-xs text-neutral-600 leading-relaxed">
                      <span className="inline-flex items-center rounded-md border border-neutral-300 bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-700">
                        {rev.category || "—"}
                      </span>
                    </td>

                    {/* Flags (flagged / hidden) */}
                    <td className="px-4 py-3 text-xs text-neutral-600 leading-relaxed">
                      <div className="flex flex-col gap-1">
                        <span
                          className={
                            "inline-flex w-fit rounded-md px-2 py-0.5 text-[11px] font-medium border " +
                            (rev.flagged
                              ? "bg-red-50 text-red-700 border-red-300"
                              : "bg-neutral-100 text-neutral-600 border-neutral-300")
                          }
                        >
                          {rev.flagged ? "Flagged" : "OK"}
                        </span>

                        <span
                          className={
                            "inline-flex w-fit rounded-md px-2 py-0.5 text-[11px] font-medium border " +
                            (rev.hidden
                              ? "bg-yellow-50 text-yellow-700 border-yellow-300"
                              : "bg-neutral-100 text-neutral-600 border-neutral-300")
                          }
                        >
                          {rev.hidden ? "Hidden" : "Visible"}
                        </span>
                      </div>
                    </td>

                    {/* Timestamp */}
                    <td className="px-4 py-3 text-xs text-neutral-500 whitespace-nowrap">
                      {formatTimestamp(rev.inserted_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
