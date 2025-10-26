// admin-web/src/app/protected/reports/page.tsx
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Tiny helper – server-side Supabase client using service role or anon.
// We're using anon key here because you're already protecting this route
// with auth + role checks in /protected/layout.tsx.
function getServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

// Types for what we're showing
type ClubStat = {
  club_id: string | null;
  club_name: string;
  review_count: number;
  avg_rating: number;
};

export default async function ReportsPage() {
  const supabase = getServerClient();

  // 1. Total reviews overall
  const { count: totalReviews } = await supabase
    .from('reviews')
    .select('*', { count: 'exact', head: true });

  // 2. Ratings per club
  //
  // We’ll select:
  //   - club_id
  //   - clubs.name (via foreign key)
  //   - rating
  //
  // Then we’ll group/aggregate in Node because Supabase JS client
  // doesn't do GROUP BY for you without RPC.
  const { data: rawRows, error } = await supabase
    .from('reviews')
    .select(
      `
        club_id,
        rating,
        clubs (
          name
        )
      `
    )
    .limit(500); // safety cap for now

  if (error) {
    console.error('reports query error:', error.message);
  }

  // Aggregate in-memory
  const statsMap: Record<
    string,
    { name: string; sum: number; count: number }
  > = {};

  for (const row of rawRows ?? []) {
    const clubId = row.club_id ?? 'unknown';
    const clubName =
      (row as any).clubs?.name ??
      (row.club_id ? 'Unknown Club' : 'No Club');

    if (!statsMap[clubId]) {
      statsMap[clubId] = { name: clubName, sum: 0, count: 0 };
    }

    // rating is smallint in DB, could be null
    if (row.rating != null) {
      statsMap[clubId].sum += row.rating;
    }
    statsMap[clubId].count += 1;
  }

  const clubStats: ClubStat[] = Object.entries(statsMap).map(
    ([club_id, info]) => ({
      club_id,
      club_name: info.name,
      review_count: info.count,
      avg_rating:
        info.count > 0 ? Number((info.sum / info.count).toFixed(2)) : 0,
    })
  );

  // Sort: highest review_count first
  clubStats.sort((a, b) => b.review_count - a.review_count);

  return (
    <main className="p-6 flex flex-col gap-6">
      {/* Top header row */}
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold leading-tight">
          Reports & Trends
        </h1>
        <p className="text-sm text-gray-600">
          High-level signals across clubs based on recent reviews.
        </p>
      </header>

      {/* KPI cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-gray-500 tracking-wide">
            Total Reviews
          </p>
          <p className="text-3xl font-semibold mt-1">
            {totalReviews ?? 0}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-gray-500 tracking-wide">
            Clubs Reviewed
          </p>
          <p className="text-3xl font-semibold mt-1">
            {clubStats.length}
          </p>
        </div>

        {/* Example placeholder metrics for now */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-gray-500 tracking-wide">
            Avg Rating (All Clubs)
          </p>
          <p className="text-3xl font-semibold mt-1">
            {calcGlobalAvg(clubStats)}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-gray-500 tracking-wide">
            Most Reviewed Club
          </p>
          <p className="text-base font-medium mt-1 leading-tight">
            {clubStats[0]
              ? clubStats[0].club_name
              : '—'}
          </p>
          <p className="text-xs text-gray-500">
            {clubStats[0]
              ? `${clubStats[0].review_count} reviews`
              : 'No data'}
          </p>
        </div>
      </section>

      {/* Table: clubs by volume */}
      <section className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-800">
            Reviews by Club
          </h2>
          <p className="text-xs text-gray-500">
            Sorted by volume
          </p>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-600 text-xs uppercase tracking-wide">
            <tr>
              <th className="px-4 py-2 font-medium">Club</th>
              <th className="px-4 py-2 font-medium text-right">
                Reviews
              </th>
              <th className="px-4 py-2 font-medium text-right">
                Avg Rating
              </th>
            </tr>
          </thead>
          <tbody>
            {clubStats.length === 0 ? (
              <tr>
                <td
                  className="px-4 py-6 text-center text-gray-500 text-sm"
                  colSpan={3}
                >
                  No reviews yet.
                </td>
              </tr>
            ) : (
              clubStats.map((stat) => (
                <tr
                  key={stat.club_id}
                  className="border-t border-gray-100"
                >
                  <td className="px-4 py-3 text-gray-900 font-medium">
                    {stat.club_name}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {stat.review_count}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {stat.avg_rating.toFixed(2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      {/* TODO: later */}
      {/* charts / time filters / sentiment breakdown */}
    </main>
  );
}

// simple helper to compute global average rating across all clubs
function calcGlobalAvg(list: ClubStat[]) {
  let totalReviews = 0;
  let weightedSum = 0;
  for (const c of list) {
    totalReviews += c.review_count;
    weightedSum += c.avg_rating * c.review_count;
  }
  if (!totalReviews) return '—';
  return (weightedSum / totalReviews).toFixed(2);
}
