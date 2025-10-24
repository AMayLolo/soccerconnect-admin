'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

type FlaggedRow = {
  id: string;
  rating: number | null;
  comment: string | null;
  category: string | null;
  inserted_at: string;
  clubs: { id: string; name: string }[];
};

function getSupabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export default function FlaggedTableClient() {
  const [rows, setRows] = useState<FlaggedRow[]>([]);
  const [loading, setLoading] = useState(true);

  // load flagged reviews on mount
  useEffect(() => {
    const load = async () => {
      const supabase = getSupabaseBrowser();

      const { data, error } = await supabase
        .from('reviews')
        .select(
          `id, rating, comment, category, inserted_at,
           clubs ( id, name )`
        )
        .eq('flagged', true)
        .order('inserted_at', { ascending: false });

      if (!error && data) {
        setRows(
          data.map((r: any) => ({
            id: r.id,
            rating: r.rating ?? null,
            comment: r.comment ?? null,
            category: r.category ?? null,
            inserted_at: r.inserted_at,
            clubs: r.clubs ? (Array.isArray(r.clubs) ? r.clubs : [r.clubs]) : [],
          }))
        );
      }

      setLoading(false);
    };

    load();
  }, []);

  async function resolveFlag(reviewId: string) {
    const supabase = getSupabaseBrowser();

    // Clear the flag (set flagged=false or whatever your schema uses)
    const { error } = await supabase
      .from('reviews')
      .update({ flagged: false })
      .eq('id', reviewId);

    if (!error) {
      setRows((prev) => prev.filter((r) => r.id !== reviewId));
    }
  }

  async function deleteReview(reviewId: string) {
    const supabase = getSupabaseBrowser();

    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (!error) {
      setRows((prev) => prev.filter((r) => r.id !== reviewId));
    }
  }

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-500">
        Loading flagged reviews…
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
        🎉 Nothing flagged right now. Looks clean.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full text-left text-sm text-gray-800">
        <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
          <tr>
            <th className="px-4 py-2">Club</th>
            <th className="px-4 py-2">Rating</th>
            <th className="px-4 py-2">Category</th>
            <th className="px-4 py-2">Comment</th>
            <th className="px-4 py-2 whitespace-nowrap">Date</th>
            <th className="px-4 py-2 text-right">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200">
          {rows.map((row) => (
            <tr key={row.id} className="align-top">
              {/* Club name */}
              <td className="px-4 py-3 font-medium text-gray-900">
                {row.clubs && row.clubs[0]?.name
                  ? row.clubs[0].name
                  : 'Unknown Club'}
              </td>

              {/* Rating */}
              <td className="px-4 py-3 text-gray-700">
                {row.rating != null ? `${row.rating}/5` : '—'}
              </td>

              {/* Category */}
              <td className="px-4 py-3">
                <span className="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-[11px] font-medium leading-tight text-gray-700 ring-1 ring-gray-300">
                  {row.category ?? '—'}
                </span>
              </td>

              {/* Comment */}
              <td className="px-4 py-3 max-w-[28ch] text-gray-700">
                <div className="line-clamp-3 whitespace-pre-wrap break-words text-[13px] leading-snug">
                  {row.comment ?? '—'}
                </div>
              </td>

              {/* Date */}
              <td className="px-4 py-3 whitespace-nowrap text-gray-500 text-xs">
                {new Date(row.inserted_at).toLocaleString()}
              </td>

              {/* Actions */}
              <td className="px-4 py-3 text-right whitespace-nowrap text-xs">
                <button
                  className="mr-2 rounded border border-gray-300 bg-white px-2 py-1 text-gray-700 hover:bg-gray-50"
                  onClick={() => resolveFlag(row.id)}
                >
                  Resolve
                </button>
                <button
                  className="rounded border border-red-300 bg-red-50 px-2 py-1 text-red-700 hover:bg-red-100"
                  onClick={() => deleteReview(row.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
