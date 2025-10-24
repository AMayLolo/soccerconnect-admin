// src/app/protected/flagged/FlaggedTableClient.tsx
'use client';

type FlaggedRow = {
  id: string;
  rating: number | null;
  comment: string | null;
  category: string | null;
  inserted_at: string;
  club_name: string | null;
};

export default function FlaggedTableClient({
  initialRows,
}: {
  initialRows: FlaggedRow[];
}) {
  const rows = initialRows ?? [];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="px-4 py-2 font-medium">Club</th>
            <th className="px-4 py-2 font-medium">Rating</th>
            <th className="px-4 py-2 font-medium">Category</th>
            <th className="px-4 py-2 font-medium">Comment</th>
            <th className="px-4 py-2 font-medium">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {rows.length === 0 ? (
            <tr>
              <td
                className="px-4 py-4 text-gray-500 text-center"
                colSpan={5}
              >
                No flagged reviews. 🎉
              </td>
            </tr>
          ) : (
            rows.map((r) => (
              <tr key={r.id} className="align-top">
                <td className="px-4 py-3 text-gray-900 font-medium">
                  {r.club_name ?? 'Unknown Club'}
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {r.rating ?? '—'}/5
                </td>
                <td className="px-4 py-3">
                  <span className="inline-block rounded border border-red-300 bg-red-50 px-1.5 py-0.5 text-xs text-red-700">
                    {r.category ?? '—'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-800 text-xs leading-snug max-w-xs">
                  {r.comment || 'No comment'}
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                  {new Date(r.inserted_at).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
