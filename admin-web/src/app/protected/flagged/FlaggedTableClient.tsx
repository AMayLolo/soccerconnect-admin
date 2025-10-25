'use client';

import { useOptimistic } from 'react';
import { resolveFlaggedReport } from './resolveFlaggedReports';

// shape that BOTH the server page and this client agree on
export type Row = {
  report_id: string;
  reason: string | null;
  reported_at: string;
  review_id: string;
  rating: number | null;
  comment: string | null;
  category: string | null;
  inserted_at: string;
  club_name: string | null;
  resolved: boolean;
};

type Props = {
  initialRows: Row[];
};

export default function FlaggedTableClient({ initialRows }: Props) {
  // optimistic local state so we can flip "resolved" without reload
  const [rows, apply] = useOptimistic(
    initialRows,
    (state: Row[], action: { reportId: string }) => {
      return state.map(r =>
        r.report_id === action.reportId ? { ...r, resolved: true } : r
      );
    }
  );

  async function handleResolve(reportId: string) {
    // optimistic update
    apply({ reportId });

    // server call to flip resolved=true in DB
    const ok = await resolveFlaggedReport(reportId);
    if (!ok) {
      console.error('Failed to mark report resolved on server');
      // (optional: could roll it back here if we want)
    }
  }

  return (
    <div className="overflow-x-auto rounded-md border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full text-sm leading-5">
        <thead className="bg-gray-50 text-left text-gray-500">
          <tr>
            <th className="px-4 py-2 font-medium">Club</th>
            <th className="px-4 py-2 font-medium">Rating</th>
            <th className="px-4 py-2 font-medium">Comment</th>
            <th className="px-4 py-2 font-medium">Reason</th>
            <th className="px-4 py-2 font-medium">Reported</th>
            <th className="px-4 py-2 font-medium">Status</th>
            <th className="px-4 py-2 font-medium"></th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200 text-gray-800">
          {rows.map((row: Row) => (
            <tr key={row.report_id} className="align-top">
              <td className="px-4 py-3">
                {row.club_name ?? 'Unknown Club'}
              </td>

              <td className="px-4 py-3">
                {row.rating ?? '—'}
              </td>

              <td className="px-4 py-3 max-w-md whitespace-pre-line">
                {row.comment ?? '(no comment)'}
              </td>

              <td className="px-4 py-3 text-gray-600">
                {row.reason ?? '(no reason)'}
              </td>

              <td className="px-4 py-3 text-gray-500 text-xs">
                {new Date(row.reported_at).toLocaleString()}
              </td>

              <td className="px-4 py-3">
                {row.resolved ? (
                  <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                    Resolved
                  </span>
                ) : (
                  <span className="inline-flex rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700">
                    Needs review
                  </span>
                )}
              </td>

              <td className="px-4 py-3 text-right">
                {!row.resolved && (
                  <button
                    className="rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
                    onClick={() => handleResolve(row.report_id)}
                  >
                    Mark resolved
                  </button>
                )}
              </td>
            </tr>
          ))}

          {rows.length === 0 && (
            <tr>
              <td
                colSpan={7}
                className="px-4 py-6 text-center text-gray-500 text-sm"
              >
                No flagged reviews 🎉
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
