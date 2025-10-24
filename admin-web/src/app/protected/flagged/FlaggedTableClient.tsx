'use client';

import React, { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

type Row = {
  review_id: string;
  clubName: string;
  rating: number | null;
  comment: string;
  hidden: boolean;
  category: string | null;
  created_at_pretty: string;
  first_reported_at_pretty: string;
  last_reason: string | null;
  author_user_id: string | null;
  reports: Array<{
    reason: string | null;
    reported_at: string | null;
    reporter_id: string | null;
  }>;
};

export default function FlaggedTableClient({ rows }: { rows: Row[] }) {
  const supabase = createClientComponentClient();
  const [localRows, setLocalRows] = useState(rows);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function updateHidden(review_id: string, hide: boolean) {
    try {
      setLoadingId(review_id);

      const { error } = await supabase
        .from('reviews')
        .update({ hidden: hide })
        .eq('id', review_id);

      if (error) {
        alert('Error updating review: ' + error.message);
        return;
      }

      // update local optimistic state
      setLocalRows((prev) =>
        prev.map((r) =>
          r.review_id === review_id ? { ...r, hidden: hide } : r
        )
      );
    } finally {
      setLoadingId(null);
    }
  }

  function maskUser(id: string | null) {
    if (!id) return 'unknown';
    // just show first 6 chars so you can tell if it's same person repeating abuse
    return id.slice(0, 6) + '…';
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full text-left text-sm text-gray-800">
        <thead className="bg-gray-50 text-[11px] uppercase text-gray-500 tracking-wide border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 font-semibold">Club / Review</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold">Reported</th>
            <th className="px-4 py-3 font-semibold">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100 text-[13px]">
          {localRows.length === 0 ? (
            <tr>
              <td className="px-4 py-6 text-center text-gray-500" colSpan={4}>
                Nothing is flagged 🎉
              </td>
            </tr>
          ) : (
            localRows.map((row) => (
              <tr key={row.review_id} className="align-top">
                {/* Club / Review */}
                <td className="px-4 py-4">
                  <div className="font-semibold text-gray-900">
                    {row.clubName}{' '}
                    {row.rating != null && (
                      <span className="ml-2 inline-flex items-center rounded-full border border-yellow-200 bg-yellow-50 px-2 py-[2px] text-[11px] font-semibold text-yellow-700">
                        {row.rating}/5
                      </span>
                    )}
                    {row.category && (
                      <span className="ml-2 inline-flex items-center rounded-full border border-gray-300 bg-gray-100 px-2 py-[2px] text-[10px] font-semibold text-gray-700">
                        {String(row.category).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="mt-1 text-gray-700 leading-snug">
                    {row.comment ? (
                      <span className="line-clamp-3 break-words">
                        “{row.comment}”
                      </span>
                    ) : (
                      <span className="italic text-gray-400">(no comment)</span>
                    )}
                  </div>

                  <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-gray-500">
                    <span>Posted {row.created_at_pretty}</span>
                    <span className="text-gray-300">•</span>
                    <span>By {maskUser(row.author_user_id)}</span>
                  </div>
                </td>

                {/* Status */}
                <td className="px-4 py-4 whitespace-nowrap">
                  {row.hidden ? (
                    <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2 py-[2px] text-[11px] font-semibold text-red-700">
                      Hidden
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-2 py-[2px] text-[11px] font-semibold text-green-700">
                      Visible
                    </span>
                  )}
                </td>

                {/* Reported */}
                <td className="px-4 py-4 text-[12px] text-gray-600 min-w-[160px]">
                  <div>
                    <div className="font-medium text-gray-800">
                      {row.last_reason || '—'}
                    </div>
                    <div className="text-[11px] text-gray-500 leading-tight">
                      {row.reports.length} report
                      {row.reports.length === 1 ? '' : 's'} ·{' '}
                      {row.first_reported_at_pretty}
                    </div>
                    <div className="text-[11px] text-gray-400 leading-tight">
                      Last reporter {maskUser(row.reports[0]?.reporter_id ?? null)}
                    </div>
                  </div>
                </td>

                {/* Actions */}
                <td className="px-4 py-4 text-[12px] text-gray-700">
                  <div className="flex flex-col gap-2">
                    {row.hidden ? (
                      <button
                        disabled={loadingId === row.review_id}
                        onClick={() => updateHidden(row.review_id, false)}
                        className="rounded-md border border-green-300 bg-green-50 px-2 py-1 text-[12px] font-semibold text-green-700 hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Restore / Make Visible
                      </button>
                    ) : (
                      <button
                        disabled={loadingId === row.review_id}
                        onClick={() => updateHidden(row.review_id, true)}
                        className="rounded-md border border-red-300 bg-red-50 px-2 py-1 text-[12px] font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Hide from App
                      </button>
                    )}

                    <button
                      disabled
                      className="rounded-md border border-gray-300 bg-white px-2 py-1 text-[12px] font-semibold text-gray-600 opacity-50 cursor-not-allowed"
                      title="Not wired yet"
                    >
                      Ban User (soon)
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
