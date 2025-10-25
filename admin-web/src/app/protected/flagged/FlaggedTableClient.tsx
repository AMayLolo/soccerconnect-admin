"use client";

import * as React from "react";
import { resolveFlaggedReport } from "./actions";

export type FlaggedReport = {
  id: string;
  club_name: string;
  reason: string;
  created_at: string;
};

export default function FlaggedTableClient({
  initialReports,
}: {
  initialReports: FlaggedReport[];
}) {
  // Local working copy so we can hide rows optimistically
  const [rows, setRows] = React.useState<FlaggedReport[]>(initialReports);

  // Track which rows are in-flight so we can disable their button
  const [busyIds, setBusyIds] = React.useState<Record<string, boolean>>({});

  // Any last error from the server
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  async function handleResolve(id: string) {
    setErrorMsg(null);

    // mark busy
    setBusyIds((prev) => ({ ...prev, [id]: true }));

    // optimistic: remove from list immediately
    setRows((prev) => prev.filter((r) => r.id !== id));

    const result = await resolveFlaggedReport(id);

    if (!result.ok) {
      // restore if failed
      const original = initialReports.find((r) => r.id === id);
      setRows((prev) => (original ? [...prev, original] : prev));

      setErrorMsg(result.error ?? "Unable to resolve");
    }

    // clear busy flag
    setBusyIds((prev) => {
      const { [id]: _removed, ...rest } = prev;
      return rest;
    });
  }

  return (
    <div className="space-y-4">
      {errorMsg && (
        <div className="rounded-lg bg-red-500/10 text-red-400 text-sm px-3 py-2 border border-red-500/30">
          {errorMsg}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/40">
        <table className="min-w-full text-left text-sm text-zinc-200">
          <thead className="bg-zinc-900/70 text-xs uppercase text-zinc-500 tracking-wide">
            <tr>
              <th className="px-4 py-3 font-medium">Club</th>
              <th className="px-4 py-3 font-medium">Reason</th>
              <th className="px-4 py-3 font-medium">Reported</th>
              <th className="px-4 py-3 font-medium text-right">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-800">
            {rows.length === 0 ? (
              <tr>
                <td
                  className="px-4 py-6 text-center text-zinc-500 text-sm"
                  colSpan={4}
                >
                  🎉 Nothing flagged. Clean sheet.
                </td>
              </tr>
            ) : (
              rows.map((report) => (
                <tr
                  key={report.id}
                  className="hover:bg-zinc-800/30 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-zinc-100">
                    {report.club_name}
                  </td>

                  <td className="px-4 py-3 text-zinc-300 whitespace-pre-wrap">
                    {report.reason}
                  </td>

                  <td className="px-4 py-3 text-zinc-400 text-xs">
                    {new Date(report.created_at).toLocaleString()}
                  </td>

                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleResolve(report.id)}
                      disabled={!!busyIds[report.id]}
                      className="inline-flex items-center rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {busyIds[report.id] ? "Resolving..." : "Resolve"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
