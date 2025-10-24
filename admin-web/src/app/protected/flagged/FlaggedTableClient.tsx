'use client';

import { useState } from 'react';

export type FlaggedRow = {
  report_id: string;
  reason: string;
  reported_at: string;
  review_id: string;
  rating: number | null;
  comment: string | null;
  category: string | null;
  inserted_at: string;
  club_name: string | null;
  resolved: boolean;
};

export default function FlaggedTableClient({
  initialRows,
}: {
  initialRows: FlaggedRow[];
}) {
  const [rows, setRows] = useState<FlaggedRow[]>(initialRows);

  // you'll later wire up resolve() here
  // ...

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50 text-left text-xs font-medium uppercase text-gray-500">
          <tr>
            <th className="px-4 py-2">Club</th>
            <th className="px-4 py-2">Reason</th>
            <th className="px-4 py-2">Comment</th>
            <th className="px-4 py-2 whitespace-nowrap">Reported</th>
            <th className="px-4 py-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white text-gray-900">
          {rows.map((row) => (
            <tr key={row.report_id} className="align-top">
              <td className="px-4 py-3 font-medium">
                {row.club_name ?? 'Unknown Club'}
              </td>
              <td className="px-4 py-3 text-sm text-red-600">
                {row.reason}
              </td>
              <td className="px-4 py-3 text-sm text-gray-700 max-w-xs">
                <div className="line-clamp-2 whitespace-pre-line">
                  {row.comment ?? '(no comment)'}
                </div>
                <div className="mt-1 text-[10px] text-gray-400">
                  {row.rating ?? 'NR'}/5 • {row.category ?? '—'}
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                {new Date(row.reported_at).toLocaleString()}
              </td>
              <td className="px-4 py-3 text-right text-xs">
                {row.resolved ? (
                  <span className="rounded bg-green-100 px-2 py-1 text-green-700">
                    Resolved
                  </span>
                ) : (
                  <button
                    className="rounded border border-gray-300 px-2 py-1 text-gray-700 hover:bg-gray-50"
                    // onClick={() => handleResolve(row.report_id)}
                  >
                    Resolve
                  </button>
                )}
              </td>
            </tr>
          ))}

          {rows.length === 0 && (
            <tr>
              <td
                colSpan={5}
                className="px-4 py-6 text-center text-sm text-gray-500"
              >
                Nothing needs review 🎉
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
