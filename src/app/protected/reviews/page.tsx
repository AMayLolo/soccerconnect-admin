// src/app/protected/reviews/page.tsx
import { createServerClientInstance } from "@/utils/supabase/server";
import { requireCurrentUser } from "@/utils/auth";

export const dynamic = "force-dynamic";

type ReviewRow = {
  id: string;
  inserted_at: string | null;
  rating: number | null;
  title: string | null;
  headline: string | null;
  body: string | null;
  comment: string | null;
  text: string | null;
  club_id: string | null;
  author_name: string | null;
  author_role: string | null;
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
  // protect the page
  await requireCurrentUser();

  const supabase = await createServerClientInstance();

  // 1. Get ALL reviews, ordered newest first by inserted_at
  const {
    data: reviews,
    error: reviewsError,
  } = await supabase
    .from("reviews")
    .select(
      `
        id,
        inserted_at,
        rating,
        title,
        headline,
        body,
        comment,
        text,
        club_id,
        author_name,
        author_role
      `
    )
    .order("inserted_at", { ascending: false });

  const reviewList: ReviewRow[] = Array.isArray(reviews)
    ? (reviews as ReviewRow[])
    : [];

  // 2. Build list of unique club_ids
  const uniqueClubIds = Array.from(
    new Set(
      reviewList
        .map((r) => r.club_id)
        .filter((cid): cid is string => Boolean(cid))
    )
  );

  // 3. Fetch those clubs and build a lookup map: club_id -> club_name
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

      {/* Error loading */}
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
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Body</th>
                <th className="px-4 py-3 font-medium">Club</th>
                <th className="px-4 py-3 font-medium">Author</th>
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

                const displayTitle =
                  rev.title ||
                  rev.headline ||
                  "(no title)";

                const displayBody =
                  rev.body ||
                  rev.comment ||
                  rev.text ||
                  "(no body)";

                return (
                  <tr key={rev.id} className="align-top">
                    {/* Rating */}
                    <td className="px-4 py-3 text-sm font-semibold text-neutral-900">
                      {rev.rating ?? "-"}
                    </td>

                    {/* Title */}
                    <td className="px-4 py-3 text-sm text-neutral-900 max-w-[200px] break-words">
                      {displayTitle}
                    </td>

                    {/* Body */}
                    <td className="px-4 py-3 text-sm text-neutral-700 max-w-[320px] break-words leading-relaxed">
                      {displayBody}
                    </td>

                    {/* Club */}
                    <td className="px-4 py-3 text-xs text-neutral-600 leading-relaxed max-w-[160px] break-words">
                      <div className="font-medium text-neutral-800">
                        {clubName}
                      </div>
                      <div className="text-[11px] text-neutral-500">
                        {rev.club_id ?? "—"}
                      </div>
                    </td>

                    {/* Author */}
                    <td className="px-4 py-3 text-xs text-neutral-600 leading-relaxed">
                      <div className="font-medium text-neutral-800">
                        {rev.author_name || "Anonymous"}
                      </div>
                      <div className="text-[11px] text-neutral-500">
                        {rev.author_role || ""}
                      </div>
                    </td>

                    {/* Created */}
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
