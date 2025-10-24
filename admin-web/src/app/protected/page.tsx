// src/app/protected/page.tsx
import { createSupabaseServer } from '@/lib/supabaseServer';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type CountRow = { label: string; count: number };
type FlaggedRow = {
  id: string;
  rating: number;
  comment: string | null;
  category: string | null;
  inserted_at: string;
  club_name: string | null;
};

export default async function AdminDashboardPage() {
  const supabase = await createSupabaseServer();

  // 1. Total reviews per club (top 5 activity)
  const { data: reviewActivity } = await supabase
    .from('reviews')
    .select('club_id, clubs(name)')
    .limit(2000); // cheap-ish sample, we just summarize in JS

  const activityMap: Record<string, { name: string; count: number }> = {};
  (reviewActivity ?? []).forEach((row: any) => {
    const clubId = row.club_id ?? 'unknown';
    const clubName = row.clubs?.name ?? 'Unknown Club';
    if (!activityMap[clubId]) {
      activityMap[clubId] = { name: clubName, count: 0 };
    }
    activityMap[clubId].count += 1;
  });

  const topActivity = Object.values(activityMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // 2. Latest 5 real reviews (for "Recent Reviews" list)
  const { data: latestReviews } = await supabase
    .from('reviews')
    .select(
      `
        id,
        rating,
        comment,
        category,
        inserted_at,
        clubs (
          name
        )
      `
    )
    .order('inserted_at', { ascending: false })
    .limit(5);

  // 3. Count flagged/inappropriate reviews (category = 'staff' for now)
  const { count: flaggedCount } = await supabase
    .from('reviews')
    .select('id', { count: 'exact', head: true })
    .eq('category', 'staff'); // this is our "flagged" stand-in for now

  // We'll also grab a preview list of flagged to show top 3 in the card
  const { data: flaggedRows } = await supabase
    .from('reviews')
    .select(
      `
        id,
        rating,
        comment,
        category,
        inserted_at,
        clubs (
          name
        )
      `
    )
    .eq('category', 'staff')
    .order('inserted_at', { ascending: false })
    .limit(3);

  // Shape data for rendering
  const recentReviews = (latestReviews ?? []).map((r: any) => ({
    id: r.id,
    club: r.clubs?.name ?? 'Unknown Club',
    rating: r.rating,
    comment: r.comment ?? '',
    category: r.category ?? null,
    inserted_at: r.inserted_at,
  }));

  const flaggedPreview: FlaggedRow[] = (flaggedRows ?? []).map((r: any) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment ?? '',
    category: r.category ?? null,
    inserted_at: r.inserted_at,
    club_name: r.clubs?.name ?? 'Unknown Club',
  }));

  return (
    <div className="flex flex-col gap-8">
      {/* HEADER BAR */}
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-gray-900">
          SoccerConnect • Admin
        </h1>
        <p className="text-sm text-gray-500">
          Internal moderation dashboard
        </p>
      </header>

      {/* METRIC CARDS GRID */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Top Clubs by Recent Activity */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-medium text-gray-700">
              Most Active Clubs
            </h2>
            <span className="text-[11px] text-gray-400">last ~2k reviews</span>
          </div>
          <ul className="mt-3 space-y-2 text-sm text-gray-800">
            {topActivity.length === 0 && (
              <li className="text-gray-400 text-sm italic">
                No recent activity
              </li>
            )}
            {topActivity.map((row) => (
              <li
                key={row.name}
                className="flex items-baseline justify-between"
              >
                <span className="font-medium">{row.name}</span>
                <span className="text-gray-500">{row.count}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Flagged / Needs Review */}
        <div className="rounded-xl border border-rose-200 bg-white p-4 shadow-sm">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-medium text-gray-700">
              Flagged Reviews
            </h2>
            <Link
              href="/protected/flagged"
              className="text-[11px] font-medium text-rose-600 hover:underline"
            >
              View all
            </Link>
          </div>

          <p className="mt-2 text-3xl font-semibold text-rose-600 leading-none">
            {flaggedCount ?? 0}
          </p>
          <p className="text-[11px] text-gray-500">
            Marked as “Staff / Needs Attention”
          </p>

          <ul className="mt-4 space-y-3 max-h-32 overflow-y-auto pr-1">
            {flaggedPreview.length === 0 && (
              <li className="text-gray-400 text-sm italic">
                Nothing flagged 🎉
              </li>
            )}

            {flaggedPreview.map((f) => (
              <li
                key={f.id}
                className="rounded border border-gray-200 bg-gray-50 p-2 text-xs text-gray-700"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-medium">{f.club_name}</span>
                  <span className="text-[10px] text-gray-400">
                    {new Date(f.inserted_at).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="mt-1 line-clamp-2 text-[11px] text-gray-600">
                  {f.comment || '—'}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Recent Reviews (count only) */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-medium text-gray-700">
              Recent Reviews
            </h2>
            <Link
              href="/protected/reviews"
              className="text-[11px] font-medium text-blue-600 hover:underline"
            >
              View all
            </Link>
          </div>

          <p className="mt-2 text-3xl font-semibold text-gray-900 leading-none">
            {recentReviews.length}
          </p>
          <p className="text-[11px] text-gray-500">
            Last 5 submitted
          </p>

          <ul className="mt-4 space-y-3 max-h-32 overflow-y-auto pr-1">
            {recentReviews.length === 0 && (
              <li className="text-gray-400 text-sm italic">
                No recent reviews
              </li>
            )}

            {recentReviews.map((r) => (
              <li
                key={r.id}
                className="rounded border border-gray-200 bg-gray-50 p-2 text-xs text-gray-700"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-medium">{r.club}</span>
                  <span className="text-[10px] text-gray-400">
                    {new Date(r.inserted_at).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-[11px] text-gray-600">
                  <span className="font-semibold text-gray-800">
                    {r.rating}/5
                  </span>
                  <span className="line-clamp-1">{r.comment || '—'}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FOOTNOTE / LINKS ROW */}
      <footer className="text-[11px] text-gray-400">
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/protected/reviews"
            className="text-blue-600 hover:underline"
          >
            Full Reviews
          </Link>
          <Link
            href="/protected/flagged"
            className="text-rose-600 hover:underline"
          >
            Flagged Reviews
          </Link>
          <Link
            href="/protected/reports"
            className="text-gray-500 hover:underline"
          >
            Reports (coming soon)
          </Link>
        </div>
      </footer>
    </div>
  );
}
