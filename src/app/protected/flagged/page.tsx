"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import PaginationBar from "@/components/admin/PaginationBar";
import TableShimmer from "@/components/admin/TableShimmer";
import StatusBadge from "@/components/admin/StatusBadge";
import toast from "react-hot-toast";

export const dynamic = "force-dynamic";

type FlagReport = {
  id: string;
  review_id: string;
  user_id: string;
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

export default function FlaggedReportsPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [reports, setReports] = useState<FlagReport[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState<"all" | "resolved" | "unresolved">("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  async function fetchReports() {
    setLoading(true);
    try {
      let query = supabase
        .from("review_reports")
        .select("*", { count: "exact" })
        .range(from, to)
        .order("created_at", { ascending: false });

      if (filter === "resolved") query = query.eq("resolved", true);
      if (filter === "unresolved") query = query.eq("resolved", false);

      if (search.trim() !== "") {
        query = query.or(
          `reason.ilike.%${search}%,review_id.ilike.%${search}%,user_id.ilike.%${search}%`
        );
      }

      const { data, count, error } = await query;
      if (error) throw error;

      setReports(data || []);
      setTotal(count ?? 0);
    } catch (err) {
      console.error("Error loading reports:", err);
      toast.error("Failed to load flagged reports");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, search, page]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const startItem = from + 1;
  const endItem = Math.min(to + 1, total);

  // ---- Moderation Actions ----
  async function resolveReport(reportId: string) {
    try {
      const { error } = await supabase
        .from("review_reports")
        .update({ resolved: true })
        .eq("id", reportId);

      if (error) throw error;

      toast.success("Report marked as resolved ✅", {
        duration: 2500,
      });

      await fetchReports();
    } catch (err) {
      console.error("Error resolving report:", err);
      toast.error("Failed to resolve report");
    }
  }

  return (
    <section className="space-y-6 animate-fadeIn">
      {/* Header */}
      <header className="animate-slideUpBlur delay-75 flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
            Flagged Reports
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {total} total flagged reports • newest first
          </p>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search by reason, user, or review ID…"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
        />

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {(["all", "unresolved", "resolved"] as const).map((key) => (
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

      {/* Table Card */}
      <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
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
                <th className="px-4 py-2 text-left font-medium">Reason</th>
                <th className="px-4 py-2 text-left font-medium">Review ID</th>
                <th className="px-4 py-2 text-left font-medium">User</th>
                <th className="px-4 py-2 text-left font-medium whitespace-nowrap">
                  Created
                </th>
                <th className="px-4 py-2 text-left font-medium whitespace-nowrap">
                  Moderation
                </th>
              </tr>
            </thead>

            <tbody>
              {reports.map((r, i) => (
                <tr
                  key={r.id}
                  className={`border-t border-neutral-200 dark:border-neutral-700 ${
                    i % 2 ? "bg-neutral-50 dark:bg-neutral-800/40" : ""
                  }`}
                >
                  <td className="px-4 py-2 align-top">
                    {r.reason || "(no reason provided)"}
                  </td>
                  <td className="px-4 py-2 align-top text-[12px] break-all text-blue-600 underline hover:text-blue-700 dark:text-blue-400">
                    <a
                      href={`/protected/reviews?review=${r.review_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {r.review_id}
                    </a>
                  </td>
                  <td className="px-4 py-2 align-top text-[12px] break-all">
                    {r.user_id || "—"}
                  </td>
                  <td className="px-4 py-2 align-top whitespace-nowrap">
                    <div>{formatDate(r.created_at)}</div>
                    <div className="text-[11px] text-neutral-500 dark:text-neutral-500">
                      {timeAgo(r.created_at)}
                    </div>
                  </td>
                  <td className="px-4 py-2 align-top text-[12px] text-neutral-600 dark:text-neutral-300">
                    {r.resolved ? (
                      <StatusBadge
                        value={true}
                        trueLabel="Resolved"
                        falseLabel=""
                      />
                    ) : (
                      <button
                        onClick={() => resolveReport(r.id)}
                        className="rounded-md border border-neutral-300 bg-white px-2 py-1 text-[12px] font-medium text-neutral-700 hover:border-blue-500 hover:text-blue-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:text-blue-400"
                      >
                        Resolve
                      </button>
                    )}
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
