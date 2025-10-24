// admin-web/src/app/protected/flagged/FlaggedTableClient.tsx
'use client';

import React, { useState, useTransition } from 'react';
import { resolveReport } from '../actions';

export type FlaggedRow = {
  report_id: string;
  created_at: string;
  reason: string;
  review_id: string;
  review_comment: string | null;
  review_rating: number | null;
  club_name: string;
};

export default function FlaggedTableClient({ initial }: { initial: FlaggedRow[] }) {
  const [rows, setRows] = useState<FlaggedRow[]>(initial);
  const [isPending, startTransition] = useTransition();

  async function handleResolve(id: string) {
    startTransition(async () => {
      const res = await resolveReport(id);
      if (res.ok) {
        // remove it locally
        setRows((prev) => prev.filter((r) => r.report_id !== id));
      } else {
        alert('Could not resolve: ' + res.error);
      }
    });
  }

  if (!rows.length) {
    return (
      <div className="border rounded-lg p-4 bg-white text-sm text-gray-600">
        No unresolved reports 🎉
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border rounded-lg bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
          <tr>
            <th className="px-4 py-2">Club</th>
            <th className="px-4 py-2">Rating</th>
            <th className="px-4 py-2">Comment</th>
            <th className="px-4 py-2">Reason</th>
            <th className="px-4 py-2">Reported</th>
            <th className="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.report_id} className="border-t">
              <td className="px-4 py-3 align-top font-semibold text-gray-900">
                {r.club_name}
              </td>

              <td className="px-4 py-3 align-top text-gray-800">
                {r.review_rating ?? '–'}/5
              </td>

              <td className="px-4 py-3 align-top text-gray-700 max-w-xs break-words">
                {r.review_comment || <span className="text-gray-400 italic">No comment</span>}
              </td>

              <td className="px-4 py-3 align-top">
                <span className="inline-block rounded-full border border-red-300 bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-800">
                  {r.reason}
                </span>
              </td>

              <td className="px-4 py-3 align-top text-gray-500 whitespace-nowrap text-xs">
                {new Date(r.created_at).toLocaleString()}
              </td>

              <td className="px-4 py-3 align-top text-right">
                <button
                  onClick={() => handleResolve(r.report_id)}
                  disabled={isPending}
                  className="text-xs font-semibold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1.5 rounded-md shadow-sm"
                >
                  {isPending ? '...' : 'Resolve'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
