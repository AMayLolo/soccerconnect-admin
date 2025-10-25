// admin-web/src/app/protected/flagged/FlaggedTableClient.tsx
'use client';

import { useState, useTransition } from 'react';
import type { FlaggedRow } from '../types';
import { resolveFlaggedReport } from './resolveFlaggedReports';

type Props = {
  initialRows: FlaggedRow[];
};

export default function FlaggedTableClient({ initialRows }: Props) {
  const [rows, setRows] = useState<FlaggedRow[]>(initialRows);
  const [isPending, startTransition] = useTransition();

  async function handleResolve(reportId: string) {
    startTransition(async () => {
      const ok = await resolveFlaggedReport(reportId);
      if (!ok) return;
      // optimistically remove it from UI
      setRows(curr => curr.filter(r => r.report_id !== reportId));
    });
  }

  if (rows.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic py-4">
        No unresolved reports. 🎉
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm text-left text-gray-700">
        <thead className="bg-gray-50 text-gray-500 uppercase text-xs border-b">
          <tr>
            <th className="px-4 py-2 font-medium">Club</th>
            <th className="px-4 py-2 font-medium">Rating</th>
            <th className="px-4 py-2 font-medium">Comment</th>
            <th className="px-4 py-2 font-medium">Category</th>
            <th className="px-4 py-2 font-medium">Created</th>
            <th className="px-4 py-2 font-medium text-right">Action</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200 bg-white">
          {rows.map((row) => (
            <tr key={row.report_id} className="align-top">
              <td className="px-4 py-3 whitespace-nowrap text-gray-900">
                {row.club_name ?? 'Unknown Club'}
              </td>

              <td className="px-4 py-3 text-gray-900">
                {row.rating != null ? `${row.rating}/5` : '—'}
              </td>

              <td className="px-4 py-3 text-gray-700 max-w-xs break-words">
                {row.comment ?? <span className="text-gray-400 italic">No comment</span>}
              </td>

              <td className="px-4 py-3">
                <span className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 ring-1 ring-slate-200">
                  {row.category}
                </span>
              </td>

              <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                {new Date(row.inserted_at).toLocaleString()}
              </td>

              <td className="px-4 py-3 text-right">
                <button
                  disabled={isPending}
                  onClick={() => handleResolve(row.report_id)}
                  className="text-xs font-medium text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed rounded px-2 py-1 shadow-sm"
                >
                  {isPending ? 'Resolving...' : 'Mark Resolved'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
