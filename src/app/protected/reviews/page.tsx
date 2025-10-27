// src/app/protected/reviews/page.tsx
import { requireCurrentUser } from "@/utils/auth";
import { createServerClientInstance } from "@/utils/supabase/server";

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
  club_name: string | null;
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

function FlagBadge({ flagged }: { flagged: boolean | null }) {
  const active = !!flagged;
  return (
    <span
      className={
        "inline-flex w-fit items-center rounded-full border px-2 py-[2px] text-[11px] font-medium " +
        (active
          ? "border-red-300 bg-red-50 text-red-700"
          : "border-neutral-300 bg-neutral-100 text-neutral-600")
      }
    >
      {active ? "Flagged" : "OK"}
    </span>
  );
}

function HiddenBadge({ hidden }: { hidden: boolean | null }) {
  const active = !!hidden;
  return (
    <span
      className={
        "inline-flex w-fit items-center rounded-full border px-2 py-[2px] text-[11px] font-medium " +
        (active
          ? "border-yellow-300 bg-yellow-50 text-yellow-700"
          : "border-neutral-300 bg-neutral-100 text-neutral-600")
      }
    >
      {active ? "Hidden" : "Visible"}
    </span>
  );
}

function CategoryBadge({ category }: { category: string | null }) {
  if (!category) {
    return (
      <span className="inline-flex w-fit items-center rounded-full border border-neutral-300 bg-neutral-100 px-2 py-[2px] text-[11px] font-medium text-neutral-600">
        —
      </span>
    );
  }

  return (
    <span className="inline-flex w-fit items-center rounded-full border border-blue-300 bg-blue-50 px-2 py-[2px] text-[11px] font-medium text-blue-700">
      {category}
    </span>
  );
}

export default async function ReviewsPage() {
  // Protect route
  await requireCurrentUser();

  const supabase = await createServerClientInstance();

  // 1. Fetch reviews (newest first)
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

  // 2. Build list of unique club_ids from reviews
  const uniqueClubIds = Array.from(
    new Set(
      reviewList
        .map((r) => r.club_id)
        .filter((cid): cid is string => Boolean(cid))
    )
  );

  // 3. Fetch clubs -> map of { club_id: club_name }
  let clubMap: Record<string, string> = {};

if (uniqueClubIds.length > 0) {
  const clubsResult = await supabase
    .from("clubs")
    .select("id, club_name")
    .in("id", uniqueClubIds);

  if (clubsResult.error) {
    console.error("Error loading clubs:", clubsResult.error);
  } else if (Array.isArray(clubsResult.data)) {
    clubMap = (clubsResult.data as ClubRow[]).reduce((acc, club) => {
      acc[club.id] = (club as any).club_name || "(Unnamed Club)";
      return acc;
    }, {} as Record<string, string>);
  }
}



  return (
    <section className="space-y-8">
      {/* Page header */}
      <header className="flex flex-col gap-2 md:flex-row md:items-baseline md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">
            All Reviews
          </h1>

          <p className="text-sm text-neutral-600">
            {reviewList.length === 1
              ? "1 total review"
              : `${reviewList.length} total reviews`}{" "}
            • newest first
          </p>
        </div>

        {/* Filter chips (static for now) */}
        <div className="flex flex-wrap gap-2 text-[12px]">
          <span className="rounded-lg border border-neutral-300 bg-white px-2 py-1 text-neutral-700 shadow-sm">
            Show: All
          </span>
          <span className="rounded-lg border border-neutral-300 bg-white px-2 py-1 text-neutral-700 shadow-sm">
            Flagged
          </span>
          <span className="rounded-lg border border-neutral-300 bg-white px-2 py-1 text-neutral-700 shadow-sm">
            Hidden
          </span>
        </div>
      </header>

      {/* Card wrapper around table */}
      <div className="rounded-2xl border border-neutral-300 bg-white shadow-sm">
        {/* Card header */}
        <div className="flex items-center justify-between border-b border-neutral-300 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold text-neutral-900">
              Reviews
            </div>
            <span className="rounded-full border border-neutral-300 bg-neutral-100 px-2 py-[2px] text-[11px] font-medium text-neutral-700">
              Live feed
            </span>
          </div>

          <div className="text-[11px] text-neutral-500">
            Most recent at top
          </div>
        </div>

        {/* Card body */}
        <div className="p-4">
          {reviewsError ? (
            <div className="rounded-lg border border-red-400 bg-red-50 px-3 py-2 text-sm text-red-700">
              Error loading reviews: {reviewsError.message}
            </div>
          ) : reviewList.length === 0 ? (
            <div className="rounded-xl border border-neutral-300 bg-white p-6 text-center text-sm text-neutral-500 shadow-sm">
              No reviews yet.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-neutral-300">
              <table className="min-w-full text-left text-sm text-neutral-800">
                <thead className="bg-neutral-100 text-[11px] uppercase text-neutral-700">
                  <tr className="text-left">
                    <th className="px-4 py-2 font-medium">Rating</th>
                    <th className="px-4 py-2 font-medium w-[320px]">
                      Comment
                    </th>
                    <th className="px-4 py-2 font-medium w-[180px]">Club</th>
                    <th className="px-4 py-2 font-medium w-[160px]">User</th>
                    <th className="px-4 py-2 font-medium">Category</th>
                    <th className="px-4 py-2 font-medium">Status</th>
                    <th className="px-4 py-2 font-medium whitespace-nowrap">
                      Created
                    </th>
                  </tr>
                </thead>

                <tbody className="text-[13px]">
                  {reviewList.map((rev, idx) => {
                    const clubName = rev.club_id
                      ? clubMap[rev.club_id] || rev.club_id
                      : "—";

                    return (
                      <tr
                        key={rev.id}
                        className={
                          "align-top border-t border-neutral-300 " +
                          (idx % 2 === 1
                            ? "bg-neutral-50 hover:bg-neutral-100"
                            : "bg-white hover:bg-neutral-100")
                        }
                      >
                        {/* Rating */}
                        <td className="px-4 py-2.5 text-sm font-semibold text-neutral-900">
                          {rev.rating ?? "-"}
                        </td>

                        {/* Comment */}
                        <td className="px-4 py-2.5 text-neutral-700 leading-relaxed break-words">
                          {rev.comment || "(no comment)"}
                        </td>

                        {/* Club */}
                        <td className="px-4 py-2.5 text-neutral-700 leading-relaxed break-words">
                          <div className="text-sm font-medium text-neutral-900">
                            {clubName}
                          </div>
                          <div className="text-[11px] text-neutral-500 break-all">
                            {rev.club_id ?? "—"}
                          </div>
                        </td>

                        {/* User */}
                        <td className="px-4 py-2.5 text-neutral-700 leading-relaxed break-words">
                          <div className="text-sm font-medium text-neutral-900 break-all">
                            {rev.user_id || "—"}
                          </div>
                          <div className="text-[11px] text-neutral-500">
                            User ID
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-4 py-2.5 align-top text-neutral-700 leading-relaxed">
                          <CategoryBadge category={rev.category} />
                        </td>

                        {/* Status */}
                        <td className="px-4 py-2.5 align-top text-neutral-700 leading-relaxed">
                          <div className="flex flex-col gap-1">
                            <FlagBadge flagged={rev.flagged} />
                            <HiddenBadge hidden={rev.hidden} />
                          </div>
                        </td>

                        {/* Created */}
                        <td className="px-4 py-2.5 text-neutral-500 whitespace-nowrap align-top">
                          {formatTimestamp(rev.inserted_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
