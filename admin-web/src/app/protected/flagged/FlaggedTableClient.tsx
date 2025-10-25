"use client";

import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import { resolveFlaggedReports } from "./resolveFlaggedReports";

export type FlaggedReport = {
  id: string;
  club_name: string;
  reason: string;
  reported_at: string;
  created_at: string;
  resolved: boolean;
  comment?: string;
  rating?: number | null;
  category?: string;
};

type Props = {
  initialReports: FlaggedReport[];
  totalCount: number;
  currentPage: number;
  rowsPerPage: number;
  refreshReports: () => Promise<void>;
};

export default function FlaggedTableClient({
  initialReports,
  totalCount,
  currentPage,
  rowsPerPage,
  refreshReports,
}: Props) {
  const [reports, setReports] = useState(initialReports);
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);
  const [limit, setLimit] = useState(rowsPerPage);

  const totalPages = Math.ceil(totalCount / limit);

  const handlePageChange = (newPage: number) => {
    const url = `?page=${newPage}&limit=${limit}`;
    window.location.href = url;
  };

  const handleLimitChange = (newLimit: number) => {
    const url = `?page=1&limit=${newLimit}`;
    window.location.href = url;
  };

  const handleResolve = async (id: string) => {
    setLoading(true);
    try {
      const result = await resolveFlaggedReports(id);
      if (result.ok) {
        toast.success("✅ Report marked as resolved!");
        startTransition(async () => {
          await refreshReports();
        });
        setReports((prev) => prev.filter((r) => r.id !== id));
      } else {
        toast.error(result.error || "Failed to resolve report");
      }
    } catch (err) {
      console.error("Resolve error:", err);
      toast.error("Unexpected error resolving report");
    } finally {
      setLoading(false);
    }
  };

  const PaginationControls = ({ position }: { position: "top" | "bottom" }) => (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 ${
        position === "top"
          ? "border-b bg-gray-50"
          : "border-t bg-gray-50 mt-4 rounded-b-lg"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Rows per page:</span>
        <select
          className="rounded border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500"
          value={limit}
          onChange={(e) => handleLimitChange(Number(e.target.value))}
        >
          {[10, 25, 50].map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2 mt-2 sm:mt-0">
        <button
          disabled={currentPage <= 1}
          onClick={() => handlePageChange(currentPage - 1)}
          className={`px-3 py-1.5 rounded-md border text-sm ${
            currentPage <= 1
              ? "bg-gray-100 text-gray-400 border-gray-200"
              : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:text-blue-700"
          }`}
        >
          Prev
        </button>

        <span className="text-sm text-gray-600">
          Page {currentPage} of {totalPages || 1}
        </span>

        <button
          disabled={currentPage >= totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
          className={`px-3 py-1.5 rounded-md border text-sm ${
            currentPage >= totalPages
              ? "bg-gray-100 text-gray-400 border-gray-200"
              : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:text-blue-700"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
      <PaginationControls position="top" />

      <table className="min-w-full text-sm text-gray-800">
        <thead className="bg-blue-50 text-blue-700 font-medium border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left">Club</th>
            <th className="px-4 py-3 text-left">Reason</th>
            <th className="px-4 py-3 text-left">Reported</th>
            <th className="px-4 py-3 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          {reports.length > 0 ? (
            reports.map((r) => (
              <tr
                key={r.id}
                className="border-b last:border-0 hover:bg-gray-50 transition"
              >
                <td className="px-4 py-3 font-medium">{r.club_name}</td>
                <td className="px-4 py-3">{r.reason}</td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(r.reported_at).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <button
                    disabled={loading || isPending}
                    onClick={() => handleResolve(r.id)}
                    className={`px-3 py-1.5 rounded-md text-white text-sm font-medium transition ${
                      loading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {loading ? "..." : "Mark Resolved"}
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={4}
                className="text-center text-gray-500 py-6 italic"
              >
                No unresolved reports 🎉
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <PaginationControls position="bottom" />
    </div>
  );
}
