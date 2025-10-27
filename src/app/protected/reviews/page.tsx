"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import PaginationBar from "@/components/admin/PaginationBar";
import TableShimmer from "@/components/admin/TableShimmer";
import CategoryBadge from "@/components/admin/CategoryBadge";
import StatusBadge from "@/components/admin/StatusBadge";
import toast from "react-hot-toast";

export const dynamic = "force-dynamic";

type Review = {
  id: string;
  rating: number | null;
  comment: string | null;
  category: string | null;
  flagged: boolean | null;
  hidden: boolean | null;
  inserted_at: string | null;
  clubs: { club_name: string | null } | null;
};

const PAGE_SIZE = 25;

function formatDate(ts: string | null) {
  if (!ts) return "—";
  const d = new Date(ts);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function timeAgo(ts: string | null) {
  if (!ts) return "";
  const diff = Date.now() - new Date(ts).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months > 1 ? "s" : ""} ago`;
}

export default function ReviewsPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [reviews, setReviews] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState<"all" | "flagged" | "hidden">("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  async function fetchReviews() {
    setLoading(true);
    try {
      let query = supabase
        .from("reviews")
        .select(
          `
          id,
          rating,
          comment,
          category,
          flagged,
          hidden,
          inserted_at,
          clubs ( club_name )
        `,
          { count: "exact" }
        )
        .range(from, to)
        .order("inserted_at", { ascending: false });

      if (filter === "flagged") query = query.eq("flagged", true);
      if (filter === "hidden") query = query.eq("hidden", true);

      if (search.trim() !== "") {
        query = query.or(
          `comment.ilike.%${search}%,category.ilike.%${search}%,clubs.club_name.ilike.%${search}%`
        );
      }

      const { data, count, error } = await query;
      if (error) throw error;

      const safeData: Review[] = (data || []).map((row: any) => ({
        id: row.id,
        rating: row.rating ?? null,
        comment: row.comment ?? null,
        category: row.category ?? null,
        flagged: row.flagged ?? null,
        hidden: row.hidden ?? null,
        inserted_at: row.inserted_at ?? null,
        clubs: row.clubs
          ? { club_name: row.clubs.club_name ?? null }
          : { club_name: null },
      }));

      setReviews(safeData);
      setTotal(count ?? 0);
    } catch (err) {
      console.error("Error loading reviews:", err);
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, search, page]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const startItem = from + 1;
  const endItem = Math.min(to + 1, total);

  // ---- Moderation Actions ----
  async function toggleHidden(reviewId: string, current: boolean | null) {
    const next = !current;
    try {
      const { error } = await supabase
        .from("reviews")
        .update({ hidden: next })
        .eq("id", reviewId);

      if (error) throw error;

      toast.success(next ? "Review hidden" : "Review made visible", {
        icon: next ? "🙈" : "👁️",
        duration: 2500,
      });

      await fetchReviews();
    } catch (err) {
      console.error("Error toggling hidden:", err);
      toast.error("Failed to update review visibility");
    }
  }

  async function toggleFlagged(reviewId: string, current: boolean | null) {
    const next = !current;
    try {
      const { error } = await supabase
        .from("reviews")
        .update({ flagged: next })
        .eq("id", reviewId);

      if (error) throw error;

      toast.success(next ? "Review flagged" : "Flag removed", {
        icon: next ? "🚩" : "✅",
        duration: 2500,
      });

      await fetchReviews();
    } catch (err) {
      console.error("Error toggling flagged:", err);
      toast.error("Failed to update flag status");
    }
  }

  // ---- Render ----
  return (
    <section className="space-y-6 animate-fadeIn">
      {/* Page header */}
      <header className="animate-slideUpBlur delay-75 flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
            All Reviews
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {total} total reviews • newest first
          </p>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search by club, comment, or category…"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
        />

        {/* Filter segmented buttons */}
        <div className="flex flex-wrap gap-2">
          {(["all", "flagged", "hidden"] as const).map((key) => (
            <button
              key={key}
              onClick={() => {
                setFilter(key);
                setPage(1);
              }}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                filter === key
                  ? "border-blue-500 bg-blue-600 text-white shadow-sm dark:bg-blue-500"
                  : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
              }`}
            >
              {key === "all"
                ? "All"
                : key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
          ))}
        </div>
      </header>

      {/* Main table card */}
      <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
        {/* Top pagination */}
        <PaginationBar
          page={page}
          totalPages={totalPages}
          startItem={startItem}
          endItem={endItem}
          total={total}
          onPageChange={setPage}
        />

        <div
          className={`relative overflow-x-auto transition-all duration-300 ${
            loading ? "opacity-50 blur-[1px]" : "opacity-100"
          }`}
        >
          {loading && <TableShimmer />}

          <table className="min-w-full text-sm text-neutral-800 dark:text-neutral-200">
            <thead className="sticky top-0 bg-neutral-100 text-[11px] uppercase text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400">
              <tr>
                <th className="px-4 py-2 text-left font-medium">Rating</th>
                <th className="px-4 py-2 text-left font-medium">Comment</th>
                <th className="px-4 py-2 text-left font-medium">Club</th>
                <th className="px-4 py-2 text-left font-medium">Category</th>
                <th className="px-4 py-2 text-left font-medium">Status</th>
                <th className="px-4 py-2 text-left font-medium whitespace-nowrap">
                  Created
                </th>
                <th className="px-4 py-2 text-left font-medium whitespace-nowrap">
                  Moderation
                </th>
              </tr>
            </thead>

            <tbody>
              {reviews.map((rev, i) => (
                <tr
                  key={rev.id}
                  className={`border-t border-neutral-200 dark:border-neutral-700 ${
                    i % 2 ? "bg-neutral-50 dark:bg-neutral-800/40" : ""
                  }`}
                >
                  <td className="px-4 py-2 align-top">
                    {rev.rating ?? "-"}
                  </td>
                  <td className="px-4 py-2 max-w-md break-words align-top">
                    {rev.comment || "(no comment)"}
                  </td>
                  <td className="px-4 py-2 align-top text-neutral-700 dark:text-neutral-300">
                    {rev.clubs?.club_name || "—"}
                  </td>
                  <td className="px-4 py-2 align-top">
                    <CategoryBadge category={rev.category} />
                  </td>
                  <td className="px-4 py-2 align-top">
                    <div className="flex flex-col gap-1">
                      <StatusBadge
                        value={!!rev.flagged}
                        trueLabel="Flagged"
                        falseLabel="OK"
                      />
                      <StatusBadge
                        value={!!rev.hidden}
                        trueLabel="Hidden"
                        falseLabel="Visible"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-2 align-top whitespace-nowrap text-neutral-600 dark:text-neutral-400">
                    <div>{formatDate(rev.inserted_at)}</div>
                    <div className="text-[11px] text-neutral-500 dark:text-neutral-500">
                      {timeAgo(rev.inserted_at)}
                    </div>
                  </td>
                  <td className="px-4 py-2 align-top text-[12px] text-neutral-600 dark:text-neutral-300">
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => toggleHidden(rev.id, rev.hidden)}
                        className="w-fit rounded-md border border-neutral-300 bg-white px-2 py-1 text-[12px] font-medium text-neutral-700 hover:border-blue-500 hover:text-blue-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:text-blue-400"
                      >
                        {rev.hidden ? "Unhide" : "Hide"}
                      </button>

                      <button
                        onClick={() => toggleFlagged(rev.id, rev.flagged)}
                        className="w-fit rounded-md border border-neutral-300 bg-white px-2 py-1 text-[12px] font-medium text-neutral-700 hover:border-blue-500 hover:text-blue-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:text-blue-400"
                      >
                        {rev.flagged ? "Unflag" : "Flag"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom pagination */}
        <PaginationBar
          page={page}
          totalPages={totalPages}
          startItem={startItem}
          endItem={endItem}
          total={total}
          onPageChange={setPage}
        />
      </div>
    </section>
  );
}
