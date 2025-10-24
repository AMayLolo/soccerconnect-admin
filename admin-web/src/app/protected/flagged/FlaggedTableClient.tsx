'use client';

import { useState, useTransition } from 'react';
import { resolveFlaggedReport } from './resolveFlaggedReport';

export type FlaggedRow = {
  report_id: string;
  review_id: string;
  club_name: string;
  rating: number | null;
  category: string | null;
  comment: string;
  reported_at: string; // ISO
  reason: string;
};

export default function FlaggedTableClient({
  initialRows,
}: {
  initialRows: FlaggedRow[];
}) {
  const [rows, setRows] = useState<FlaggedRow[]>(initialRows || []);
  const [isPending, startTransition] = useTransition();
  const [errMsg, setErrMsg] = useState<string | null>(null);

  async function handleResolve(reportId: string) {
    setErrMsg(null);

    startTransition(async () => {
      const result = await resolveFlaggedReport(reportId);

      if (result.ok) {
        // remove this row from local UI
        setRows((prev) => prev.filter((r) => r.report_id !== reportId));
      } else {
        setErrMsg(result.error ?? 'Failed to resolve.');
      }
    });
  }

  return (
    <div className="p-4 sm:p-6">
      {/* optional global error */}
      {errMsg && (
        <div className="mb-4 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errMsg}
        </div>
      )}

      {rows.length === 0 ? (
        <div className="text-sm text-gray-500 py-8 text-center">
          No unresolved reports. 🎉
        </div>
      ) : (
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-left text-gray-500 uppercase text-[11px] font-medium tracking-wide">
              <tr>
                <th className="px-4 py-2">Club</th>
                <th className="px-4 py-2">Comment</th>
                <th className="px-4 py-2">Rating</th>
                <th className="px-4 py-2">Category</th>
                <th className="px-4 py-2">Reason</th>
                <th className="px-4 py-2 whitespace-nowrap">Reported</th>
                <th className="px-4 py-2 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 bg-white text-gray-900 align-top">
              {rows.map((row) => (
                <tr key={row.report_id} className="align-top">
                  {/* Club */}
                  <td className="px-4 py-3 font-medium text-gray-900 text-[13px]">
                    {row.club_name || 'Unknown Club'}
                    <div className="text-[11px] text-gray-500 font-normal break-all">
                      #{row.review_id}
                    </div>
                  </td>

                  {/* Comment */}
                  <td className="px-4 py-3 text-[13px] leading-relaxed text-gray-700 max-w-xs break-words">
                    {row.comment}
                  </td>

                  {/* Rating */}
                  <td className="px-4 py-3 text-[13px] text-gray-700">
                    {row.rating != null ? (
                      <span className="inline-flex items-center rounded bg-gray-100 px-1.5 py-0.5 text-[11px] font-medium text-gray-800 ring-1 ring-gray-300/80">
                        {row.rating}/5
                      </span>
                    ) : (
                      <span className="text-gray-400 text-[11px] italic">
                        —
                      </span>
                    )}
                  </td>

                  {/* Category */}
                  <td className="px-4 py-3 text-[13px]">
                    {row.category ? (
                      <span className="inline-flex items-center rounded bg-blue-50 px-1.5 py-0.5 text-[11px] font-medium text-blue-700 ring-1 ring-blue-200">
                        {row.category}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-[11px] italic">
                        none
                      </span>
                    )}
                  </td>

                  {/* Reason (why flagged) */}
                  <td className="px-4 py-3 text-[13px] text-red-700 max-w-[10rem] break-words">
                    {row.reason || '(no reason)'}
                  </td>

                  {/* Reported at */}
                  <td className="px-4 py-3 text-[11px] text-gray-500 whitespace-nowrap">
                    {new Date(row.reported_at).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </td>

                  {/* Resolve button */}
                  <td className="px-4 py-3 text-right text-[13px]">
                    <button
                      disabled={isPending}
                      onClick={() => handleResolve(row.report_id)}
                      className="inline-flex items-center rounded-md border border-green-600 bg-green-50 px-2 py-1 text-[12px] font-semibold text-green-700 shadow-sm hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isPending ? 'Saving…' : 'Resolve'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* (optional) batch footer could go here later */}
        </div>
      )}
    </div>
  );
}
