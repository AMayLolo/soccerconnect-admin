// src/app/protected/page.tsx
import { createSupabaseServer } from '@/lib/supabaseServer';
import Link from 'next/link';
import FlaggedTableClient from './flagged/FlaggedTableClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type LatestRow = {
  id: string;
  rating: number | null;
  comment: string | null;
  category: 'parent' | 'player' | 'staff' | null;
  inserted_at: string;
  club_name: string | null;
};

export default async function AdminDashboard() {
  const supabase = await createSupabaseServer();

  // ---- 1) Stats for the cards at top ----
  const [
    totalCountRes,
    avgRatingRes,
    flaggedCountRes,
  ] = await Promise.all([
    supabase.from('reviews').select('id', { count: 'exact', head: true }),
    supabase.rpc('avg_review_rating'), // you may not have this fn yet; fallback below
    supabase
      .from('reviews')
      .select('id', { count: 'exact', head: true })
      .eq('category', 'inappropriate'), // or whatever you end up storing for flagged
  ]);

  const totalReviews = totalCountRes.count ?? 0;
  // if you haven't created avg_review_rating() yet, just compute a fallback:
  const avgRating =
    (avgRatingRes.data as number | null) ??
    0; // feels nicer than undefined

  const flaggedCount = flaggedCountRes.count ?? 0;

  // ---- 2) Latest 5 reviews for "Latest Reviews" panel ----
  const { data: latestRaw } = await supabase
    .from('reviews')
    .select(
      `
        id,
        rating,
        comment,
        category,
        inserted_at,
        clubs (
          id,
          name
        )
      `
    )
    .order('inserted_at', { ascending: false })
    .limit(5);

  const latestRows: LatestRow[] = (latestRaw ?? []).map((r: any) => ({
    id: r.id,
    rating: r.rating ?? null,
    comment: r.comment ?? null,
    category: r.category ?? null,
    inserted_at: r.inserted_at,
    club_name: r.clubs?.name ?? null,
  }));

  // ---- 3) Needs Attention (flagged) preview ----
  // For the preview table, we'll reuse the client component <FlaggedTableClient/>
  // It expects rows shaped like:
  // { id, rating, comment, category, inserted_at, club_name }
  //
  // We'll just filter where category = 'inappropriate' (or whatever flag means).
  const { data: flaggedRaw } = await supabase
    .from('reviews')
    .select(
      `
        id,
        rating,
        comment,
        category,
        inserted_at,
        clubs (
          id,
          name
        )
      `
    )
    .eq('category', 'inappropriate')
    .order('inserted_at', { ascending: false })
    .limit(5);

  const flaggedRows = (flaggedRaw ?? []).map((r: any) => ({
    id: r.id,
    rating: r.rating ?? null,
    comment: r.comment ?? null,
    category: r.category ?? null,
    inserted_at: r.inserted_at,
    club_name: r.clubs?.name ?? null,
  }));

  // ---- Render ----
  return (
    <div className="space-y-8 p-6">
      {/* Top stats row */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Total Reviews */}
        <div className="rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-sm text-gray-500">Total Reviews</p>
          <p className="mt-1 text-3xl font-semibold">{totalReviews}</p>
          <p className="text-xs text-gray-400 mt-2">
            All-time across all clubs
          </p>
        </div>

        {/* Average Rating */}
        <div className="rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-sm text-gray-500">Average Rating</p>
          <p className="mt-1 text-3xl font-semibold">
            {Number(avgRating).toFixed(1)}
            <span className="text-base text-gray-500"> /5</span>
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Overall satisfaction
          </p>
        </div>

        {/* Needs Attention Count */}
        <div className="rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-sm text-gray-500">Needs Attention</p>
          <p className="mt-1 text-3xl font-semibold">{flaggedCount}</p>
          <p className="text-xs text-red-500 mt-2">
            Marked inappropriate / review asap
          </p>
        </div>
      </section>

      {/* Two-column: Latest Reviews + Needs Attention */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Latest Reviews panel */}
        <div className="rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-start justify-between p-4 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Latest Reviews
              </h2>
              <p className="text-xs text-gray-500">
                Most recent feedback across all clubs
              </p>
            </div>
            <Link
              href="/protected/reviews"
              className="text-xs font-medium text-blue-600 hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="divide-y divide-gray-100">
            {latestRows.length === 0 ? (
              <div className="p-4 text-sm text-gray-500">
                No recent reviews.
              </div>
            ) : (
              latestRows.map((row) => (
                <div key={row.id} className="p-4 text-sm">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div className="font-medium text-gray-900">
                      {row.club_name ?? 'Unknown Club'}
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="rounded border border-gray-300 px-1.5 py-0.5 text-gray-600">
                        {row.rating ?? '—'}/5
                      </span>
                      {row.category && (
                        <span className="rounded border border-gray-300 px-1.5 py-0.5 text-gray-600">
                          {row.category}
                        </span>
                      )}
                      <span className="text-gray-400">
                        {new Date(row.inserted_at).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                  {row.comment && (
                    <p className="mt-2 text-gray-700 leading-snug line-clamp-4">
                      {row.comment}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Needs Attention panel */}
        <div className="rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-start justify-between p-4 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Needs Attention
              </h2>
              <p className="text-xs text-gray-500">
                Reviews flagged as inappropriate
              </p>
            </div>
            <Link
              href="/protected/flagged"
              className="text-xs font-medium text-blue-600 hover:underline"
            >
              Review all
            </Link>
          </div>

          {/* reuse the same row shape we mapped, but rendered using your client table */}
          <div className="p-0">
            <FlaggedTableClient initialRows={flaggedRows} />
          </div>
        </div>
      </section>
    </div>
  );
}
