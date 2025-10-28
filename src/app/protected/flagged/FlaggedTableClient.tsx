"use client";

import { useState } from "react";
import { ResolveFlaggedButton } from "./ResolveFlaggedButton";

type Report = {
  id: string;
  review_id: string;
  reason?: string;
  reported_by?: string;
  resolved?: boolean;
};

export function FlaggedTableClient({ reports }: { reports: Report[] }) {
  const [filter, setFilter] = useState<"all" | "pending" | "resolved">("all");

  const filteredReports = reports.filter((r) => {
    if (filter === "pending") return !r.resolved;
    if (filter === "resolved") return r.resolved;
    return true;
  });

  if (!reports?.length) {
    return <p className="text-gray-500">No flagged reports found.</p>;
  }

  return (
    <div className="space-y-4">
      {/* 🔹 Filter Buttons */}
      <div className="flex gap-2">
        {[
          { key: "all", label: "All" },
          { key: "pending", label: "Pending" },
          { key: "resolved", label: "Resolved" },
        ].map((b) => (
          <button
            key={b.key}
            onClick={() => setFilter(b.key as typeof filter)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium border transition-colors ${
              filter === b.key
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
          >
            {b.label}
          </button>
        ))}
      </div>

      {/* 🔹 Results Summary */}
      <p className="text-xs text-gray-500">
        Showing {filteredReports.length} of {reports.length} reports
      </p>

      {/* 🔹 Reports Table */}
      <div className="overflow-x-auto border rounded-xl bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs font-semibold">
            <tr>
              <th className="px-4 py-3 text-left">Review ID</th>
              <th className="px-4 py-3 text-left">Reason</th>
              <th className="px-4 py-3 text-left">Reported By</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredReports.map((r) => {
              const isResolved = r.resolved;
              return (
                <tr
                  key={r.id}
                  className={`transition-colors ${
                    isResolved
                      ? "bg-gray-50 text-gray-500"
                      : "hover:bg-gray-50 text-gray-800"
                  }`}
                >
                  <td className="px-4 py-3 font-mono text-xs text-gray-700">
                    {r.review_id}
                  </td>

                  <td className="px-4 py-3">{r.reason || "—"}</td>

                  <td className="px-4 py-3">
                    {r.reported_by || (
                      <span className="italic text-gray-400">Unknown</span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    {isResolved ? (
                      <span className="flex items-center gap-1 text-green-600 font-medium">
                        ✅ Resolved
                      </span>
                    ) : (
                      <span className="text-red-500 font-medium">Pending</span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    {!isResolved ? (
                      <ResolveFlaggedButton reportId={r.id} />
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
