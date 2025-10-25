"use client";

import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import { resolveFlaggedReport } from "./resolveFlaggedReport";

export type FlaggedReport = {
  id: string;
  reason: string;
  created_at: string;
  reported_at: string;
  resolved: boolean;
  club_name: string;
};

interface Props {
  initialReports: FlaggedReport[];
}

export default function FlaggedTableClient({ initialReports }: Props) {
  const [reports, setReports] = useState(initialReports);
  const [showResolved, setShowResolved] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleResolve(id: string) {
    startTransition(async () => {
      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, resolved: true } : r))
      );

      const res = await resolveFlaggedReport(id);
      if (!res.ok) {
        toast.error(`Failed to resolve: ${res.error}`);
        setReports((prev) =>
          prev.map((r) => (r.id === id ? { ...r, resolved: false } : r))
        );
      } else {
        toast.success("✅ Report marked as resolved");
      }
    });
  }

  const filtered = reports.filter((r) =>
    showResolved ? r.resolved : !r.resolved
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-900">
          {showResolved ? "Resolved Reports" : "Unresolved Reports"}
        </h1>
        <button
          onClick={() => setShowResolved(!showResolved)}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition"
        >
          {showResolved ? "Show Unresolved" : "Show Resolved"}
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-500 text-sm">No reports to display.</p>
      ) : (
        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-2 border">Club</th>
              <th className="px-4 py-2 border">Reason</th>
              <th className="px-4 py-2 border">Reported</th>
              <th className="px-4 py-2 border">Status</th>
              <th className="px-4 py-2 border text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">{r.club_name}</td>
                <td className="px-4 py-2">{r.reason}</td>
                <td className="px-4 py-2">
                  {r.reported_at
                    ? new Date(r.reported_at).toLocaleDateString()
                    : "—"}
                </td>
                <td
                  className={`px-4 py-2 font-medium ${
                    r.resolved ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {r.resolved ? "Resolved" : "Unresolved"}
                </td>
                <td className="px-4 py-2 text-right">
                  {r.resolved ? (
                    <span className="text-gray-400 text-sm">—</span>
                  ) : (
                    <button
                      disabled={isPending}
                      onClick={() => handleResolve(r.id)}
                      className="text-blue-600 hover:underline disabled:opacity-50"
                    >
                      {isPending ? "Marking..." : "Mark as Resolved"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
