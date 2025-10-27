"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import TableShimmer from "@/components/admin/TableShimmer";
import PaginationBar from "@/components/admin/PaginationBar";
import StatusBadge from "@/components/admin/StatusBadge";

export const dynamic = "force-dynamic";

type Report = {
  id: string;
  review_id: string;
  user_id: string | null;
  reason: string | null;
  created_at: string | null;
  resolved: boolean | null;
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

export default function ReportsPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const router = useRouter();
  const searchParams = useSearchParams();

  const [reports, setReports] = useState<Report[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState(searchParams.get("filter") || "all");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams();
      if (filter !== "all") params.set("filter", filter);
      if (search) params.set("search", search);
      if (page > 1) params.set("page", String(page));
      router.replace(`/protected/reports?${params.toString()}`);
      fetchData();
    }, 400);
    return () => clearTimeout(timeout);
  }, [filter, search, page]);

  async function fetchData() {
    setLoading(true);
    try {
      let query = supabase
        .from("review_reports")
        .select("*", { count: "exact" })
        .range(from, to)
        .order("created_at", { ascending: false });

      if (filter === "resolved") query = query.eq("resolved", true);
      if (filter === "unresolved") query = query.eq("resolved", false);

      if (search) {
        query = query.or(
          `reason.ilike.%${search}%,review_id.ilike.%${search}%`
        );
      }

      const { data, count, error } = await query;
      if (error) throw error;

      setReports(data || []);
      setTotal(count || 0);
    } catch (err) {
      console.error("Error loading reports:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const startItem = from + 1;
  const endItem = Math.min(to + 1, total);

  function resetFilters() {
    setSearch("");
    setFilter("all");
    setPage(1);
    router.replace("/protected/reports");
    fetchData();
  }

  return (
    <section className="space-y-6 animate-fadeIn">
      {/* Header */}
      <header className="animate-slideUpBlur delay-75 flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
            Reports
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Review moderation queue and report details
          </p>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search by reason or review ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
        />

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {["all", "resolved", "unresolved"].map((key) => (
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

        {/* Reset link */}
        <button
          onClick={resetFilters}
          className="w-fit text-xs text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
        >
          Reset Filters ↺
        </button>
      </header>

      {/* Table container */}
      <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
        <PaginationBar
          page={page}
          totalPages={totalPages}
          startItem={startItem}
          endItem={endItem}
          total={total}
          onPageChange={setPage}
        />

        <div className="relative overflow-x-auto">
          {loading && <TableShimmer />}
          <table className="min-w-full text-sm text-neutral-800 dark:text-neutral-200">
            <thead className="sticky top-0 bg-neutral-100 text-[11px] uppercase text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400">
              <tr>
                <th className="px-4 py-2 text-left font-medium">Reason</th>
                <th className="px-4 py-2 text-left font-medium">Review ID</th>
                <th className="px-4 py-2 text-left font-medium">User</th>
                <th className="px-4 py-2 text-left font-medium whitespace-nowrap">
                  Created
                </th>
                <th className="px-4 py-2 text-left font-medium">Status</th>
              </tr>
            </thead>

            <tbody>
              {reports.map((rep, i) => (
                <tr
                  key={rep.id}
                  className={`border-t border-neutral-200 dark:border-neutral-700 ${
                    i % 2 ? "bg-neutral-50 dark:bg-neutral-800/40" : ""
                  }`}
                >
                  <td className="px-4 py-2 text-neutral-700 dark:text-neutral-300 break-words max-w-md">
                    {rep.reason || "(no reason provided)"}
                  </td>
                  <td className="px-4 py-2">
                    <a
                      href={`/protected/reviews`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline dark:text-blue-400"
                    >
                      {rep.review_id.slice(0, 8)}...
                    </a>
                  </td>
                  <td className="px-4 py-2 text-neutral-600 dark:text-neutral-400">
                    {rep.user_id ? rep.user_id.slice(0, 8) + "..." : "—"}
                  </td>
                  <td className="px-4 py-2 text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                    <div>{formatDate(rep.created_at)}</div>
                    <div className="text-[11px] text-neutral-500 dark:text-neutral-500">
                      {timeAgo(rep.created_at)}
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <StatusBadge value={!!rep.resolved} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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
