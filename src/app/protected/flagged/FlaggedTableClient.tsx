"use client";

import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import { handleResolve } from "./resolveFlaggedAction";

// shape of each flagged report row
export type FlaggedReport = {
  id: string;
  report_type: string | null;
  comment: string | null;
  status: string | null;
  created_at: string | null;
  club_name: string | null;
};

type Props = {
  initialReports: FlaggedReport[];
};

export default function FlaggedTableClient({ initialReports }: Props) {
  const [reports, setReports] = useState(initialReports);
  const [isPending, startTransition] = useTransition();

  // call the server action to resolve a report,
  // then optimistically update UI
  async function onResolve(reportId: string) {
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("report_id", reportId);

        // call the server action directly
        await handleResolve(formData);

        // optimistic UI update: mark this row as resolved
        setReports((prev) =>
          prev.map((r) =>
            r.id === reportId ? { ...r, status: "resolved" } : r
          )
        );

        toast.success("Marked resolved ✅");
      } catch (err) {
        console.error("resolve failed", err);
        toast.error("Failed to resolve");
      }
    });
  }

  return (
    <div className="rounded border border-gray-300 bg-white overflow-x-auto">
      <table className="min-w-full text-sm text-left text-gray-800">
        <thead className="bg-gray-100 text-xs uppercase text-gray-600">
          <tr>
            <th className="px-3 py-2">Club</th>
            <th className="px-3 py-2">Type</th>
            <th className="px-3 py-2">Comment</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Created</th>
            <th className="px-3 py-2">Action</th>
          </tr>
        </thead>

        <tbody>
          {reports.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="px-3 py-4 text-center text-gray-500 italic"
              >
                No flagged reports 🎉
              </td>
            </tr>
          ) : (
            reports.map((r) => (
              <tr
                key={r.id}
                className="border-t border-gray-200 align-top text-gray-900"
              >
                <td className="px-3 py-2 font-medium">{r.club_name}</td>
                <td className="px-3 py-2">{r.report_type}</td>
                <td className="px-3 py-2 whitespace-pre-wrap max-w-xs break-words">
                  {r.comment}
                </td>
                <td className="px-3 py-2">
                  {r.status === "resolved" ? (
                    <span className="inline-block rounded bg-green-100 px-2 py-1 text-[10px] font-semibold text-green-700">
                      Resolved
                    </span>
                  ) : (
                    <span className="inline-block rounded bg-red-100 px-2 py-1 text-[10px] font-semibold text-red-700">
                      {r.status ?? "open"}
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 text-xs text-gray-500">
                  {r.created_at
                    ? new Date(r.created_at).toLocaleString()
                    : "—"}
                </td>
                <td className="px-3 py-2">
                  {r.status === "resolved" ? (
                    <button
                      disabled
                      className="cursor-not-allowed rounded bg-gray-200 px-2 py-1 text-[11px] font-medium text-gray-500"
                    >
                      Done
                    </button>
                  ) : (
                    <button
                      onClick={() => onResolve(r.id)}
                      disabled={isPending}
                      className="rounded bg-green-600 px-2 py-1 text-[11px] font-medium text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      {isPending ? "..." : "Mark Resolved"}
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
