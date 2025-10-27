// src/app/protected/reviews/page.tsx
"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

// Types
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
  club_name?: string | null;
};

// Utility formatters
function formatTimestamp(ts: string | null) {
  if (!ts) return "—";
  const d = new Date(ts);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function FlagBadge({ flagged }: { flagged: boolean | null }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-[2px] text-[11px] font-medium ${
        flagged
          ? "border-red-300 bg-red-50 text-red-700"
          : "border-neutral-300 bg-neutral-100 text-neutral-600"
      }`}
    >
      {flagged ? "Flagged" : "OK"}
    </span>
  );
}

function HiddenBadge({ hidden }: { hidden: boolean | null }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-[2px] text-[11px] font-medium ${
        hidden
          ? "border-yellow-300 bg-yellow-50 text-yellow-700"
          : "border-neutral-300 bg-neutral-100 text-neutral-600"
      }`}
    >
      {hidden ? "Hidden" : "Visible"}
    </span>
  );
}

function CategoryBadge({ category }: { category: string | null }) {
  if (!category)
    return (
      <span className="inline-flex items-center rounded-full border border-neutral-300 bg-neutral-100 px-2 py-[2px] text-[11px] font-medium text-neutral-600">
        —
      </span>
    );

  return (
    <span className="inline-flex items-center rounded-full border border-blue-300 bg-blue-50 px-2 py-[2px] text-[11px] font-medium text-blue-700">
      {category}
    </span>
  );
}

export default function ReviewsPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    loadReviews();
  }, []);

  async function loadReviews() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("reviews")
        .select("*, clubs!inner(club_name)")
        .order("inserted_at", { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const filtered = reviews.filter((r) => {
    const matchesSearch =
      r.comment?.toLowerCase().includes(search.toLowerCase()) ||
      r.club_name?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "all"
        ? true
        : filter === "flagged"
        ? r.flagged
        : filter === "hidden"
        ? r.hidden
        : true;
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <section className="space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-2 md:flex-row md:items-baseline md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">
            All Reviews
          </h1>
          <p className="text-sm text-neutral-600">
            {reviews.length} total reviews • newest first
          </p>
        </div>
      </header>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-neutral-200 bg-white p-3 shadow-sm">
        <input
          type="text"
          placeholder="Search by club or comment..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full md:w-[300px] rounded-lg border border-neutral-300 px-3 py-1.5 text-sm outline-none focus:border-blue-400"
        />
        <div className="flex gap-2">
          {["all", "flagged", "hidden"].map((opt) => (
            <button
              key={opt}
              onClick={() => {
                setFilter(opt);
                setPage(1);
              }}
              className={`rounded-lg border px-3 py-1 text-sm font-medium ${
                filter === opt
                  ? "border-blue-400 bg-blue-50 text-blue-700"
                  : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50"
              }`}
            >
              {opt === "all"
                ? "All"
                : opt === "flagged"
                ? "Flagged"
                : "Hidden"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
        {error ? (
          <div className="p-4 text-red-700 bg-red-50 border-b border-red-200">
            Error loading reviews: {error}
          </div>
        ) : loading ? (
          <div className="p-4 text-sm text-neutral-500">Loading…</div>
        ) : visible.length === 0 ? (
          <div className="p-6 text-center text-sm text-neutral-500">
            No reviews found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-neutral-800">
              <thead className="sticky top-0 bg-neutral-100 text-[12px] uppercase text-neutral-600">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Rating</th>
                  <th className="px-4 py-3 text-left font-semibold w-[320px]">
                    Comment
                  </th>
                  <th className="px-4 py-3 text-left font-semibold w-[180px]">
                    Club
                  </th>
                  <th className="px-4 py-3 text-left font-semibold w-[160px]">
                    User
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">Category</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {visible.map((rev) => (
                  <tr
                    key={rev.id}
                    className="hover:bg-neutral-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-semibold text-neutral-900">
                      {rev.rating ?? "-"}
                    </td>
                    <td className="px-4 py-3 leading-relaxed text-neutral-700 break-words">
                      {rev.comment || "(no comment)"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-neutral-900">
                        {rev.club_name || rev.club_id || "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-neutral-900 break-all">
                        {rev.user_id || "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <CategoryBadge category={rev.category} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <FlagBadge flagged={rev.flagged} />
                        <HiddenBadge hidden={rev.hidden} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-neutral-500 whitespace-nowrap">
                      {formatTimestamp(rev.inserted_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && filtered.length > pageSize && (
          <div className="flex justify-between items-center border-t border-neutral-200 px-4 py-3 text-sm text-neutral-600">
            <div>
              Page {page} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-md border border-neutral-300 px-3 py-1 disabled:opacity-50"
              >
                Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-md border border-neutral-300 px-3 py-1 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
