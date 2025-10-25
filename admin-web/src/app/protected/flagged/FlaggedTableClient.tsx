'use client';

import { useState, useTransition } from 'react';
import { resolveFlaggedReport } from './resolveFlaggedReport';

export type FlaggedRow = {
  report_id: string;
  review_id: string;
  rating: number | null;
  comment: string | null;
  category: string | null;
  inserted_at: string; // timestamp string
  club_name: string | null;
  resolved: boolean;
  reason: string | null;
  reported_at: string; // timestamp string
};

type Props = {
  initialRows: FlaggedRow[];
};

export default function FlaggedTableClient({ initialRows }: Props) {
  const [rows, setRows] = useState<FlaggedRow[]>(initialRows);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleResolveClick(reportId: string) {
    setErrorMsg(null);

    startTransition(async () => {
      const res = await resolveFlaggedReport(reportId);

      if (!res.ok) {
        setErrorMsg(res.error ?? 'Failed to resolve report');
        return;
      }

      // Optimistically update UI: mark that row as resolved
      setRows((prev) =>
        prev.map((r) =>
          r.report_id === reportId ? { ...r, resolved: true } : r
        )
      );
    });
  }

  return (
    <div className="space-y-4">
      {errorMsg ? (
        <div className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMsg}
        </div>
      ) : null}

      <div className="overflow-x-auto rounded border border-gray-200 bg-white shadow">
        <table className="min-w-[800px] w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2">Club</th>
              <th className="px-4 py-2">Rating</th>
              <th className="px-4 py-2">Comment</th>
              <th className="px-4 py-2">Category</th>
              <th className="px-4 py-2">Reported at</th>
              <th className="px-4 py-2">Reason</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 text-gray-700">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-6 text-center text-sm text-gray-400"
                >
                  Nothing flagged. 🎉
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.report_id} className="align-top">
                  <td className="px-4 py-3">
                    <div className="font-medium">
                      {row.club_name ?? 'Unknown club'}
                    </div>
                    <div className="text-[11px] text-gray-400">
                      review {row.review_id.slice(0, 8)}…
                    </div>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {row.rating}/5
                  </td>

                  <td className="px-4 py-3 text-sm leading-snug">
                    {row.comment}
                  </td>

                    <td className="px-4 py-3 whitespace-nowrap text-xs">
                      {row.category ?? '—'}
                    </td>

                  <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                    {new Date(row.reported_at).toLocaleString()}
                  </td>

                  <td className="px-4 py-3 text-xs text-gray-700">
                    {row.reason ?? '—'}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap text-xs">
                    {row.resolved ? (
                      <span className="rounded-full bg-green-100 px-2 py-1 text-[10px] font-medium text-green-800 ring-1 ring-green-300">
                        Resolved
                      </span>
                    ) : (
                      <span className="rounded-full bg-yellow-100 px-2 py-1 text-[10px] font-medium text-yellow-800 ring-1 ring-yellow-300">
                        Needs review
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-right text-xs">
                    <button
                      disabled={row.resolved || isPending}
                      onClick={() => handleResolveClick(row.report_id)}
                      className={`rounded border px-2 py-1 font-medium ${
                        row.resolved
                          ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {row.resolved ? 'Resolved' : isPending ? 'Saving…' : 'Resolve'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-[11px] text-gray-400">
        Staff can mark a report &quot;Resolved&quot; after it&apos;s been reviewed.
      </p>
    </div>
  );
}
