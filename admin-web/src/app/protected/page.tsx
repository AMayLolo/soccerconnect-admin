// admin-web/src/app/protected/page.tsx
import { cookies } from 'next/headers';
import { createSupabaseServer } from '@/lib/supabaseServer';
import FlaggedTableClient from './flagged/FlaggedTableClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// ----------------------
// Types that mirror DB
// ----------------------
type ReviewRow = {
  id: string;
  rating: number | null;
  comment: string | null;
  category: 'parent' | 'player' | 'staff' | null;
  inserted_at: string; // timestamptz -> string
  club_name: string | null;
};

type FlaggedRow = {
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

function avg(nums: (number | null | undefined)[]) {
  const only = nums.filter((n): n is number => typeof n === 'number');
  if (only.length === 0) return null;
  const total = only.reduce((acc, n) => acc + n, 0);
  return total / only.length;
}

export default async function AdminDashboardPage() {
  // helper to build supabase with cookie bridge
  async function getSupabaseForRequest() {
    const cookieStore = await cookies(); // cookies() in Next 16 is async
    return createSupabaseServer({
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
    });
  }

  const supabase = await getSupabaseForRequest();

  // ---- 1. Latest 10 reviews
  const { data: latestRaw, error: latestErr } = await supabase
    .from('reviews')
    .select(
      `
        id,
        rating,
        comment,
        category,
        inserted_at,
        clubs:clubs!inner ( name )
      `
    )
    .order('inserted_at', { ascending: false })
    .limit(10);

  // Shape -> ReviewRow[]
  const latestReviews: ReviewRow[] =
    (latestRaw ?? []).map((row: any) => ({
      id: row.id,
      rating: row.rating ?? null,
      comment: row.comment ?? null,
      category: row.category ?? null,
      inserted_at: row.inserted_at,
      club_name: row.clubs?.name ?? 'Unknown Club',
    })) ?? [];

  // ---- 2. Stats: total reviews + avg rating
  const { count: totalReviews } = await supabase
    .from('reviews')
    .select('id', { count: 'exact', head: true });

  const averageRating = avg(latestReviews.map((r) => r.rating));

  // ---- 3. Flagged (unresolved) list for moderation queue box
  // We assume you already joined review_reports -> reviews -> clubs in your `page.tsx` before.
  const { data: flaggedRaw } = await supabase
    .from('review_reports')
    .select(
      `
        report_id:id,
        reason,
        reported_at:created_at,
        resolved,
        reviews:reviews!inner (
          id,
          rating,
          comment,
          category,
          inserted_at,
          clubs:clubs!inner ( name )
        )
      `
    )
    .eq('resolved', false) // unresolved only
    .order('created_at', { ascending: false })
    .limit(10);

  const flaggedRows: FlaggedRow[] =
    (flaggedRaw ?? []).map((row: any) => ({
      report_id: row.report_id,
      reason: row.reason ?? '',
      reported_at: row.reported_at,
      resolved: row.resolved ?? false,
      review_id: row.reviews?.id ?? '',
      rating: row.reviews?.rating ?? null,
      comment: row.reviews?.comment ?? null,
      category: row.reviews?.category ?? null,
      inserted_at: row.reviews?.inserted_at ?? '',
      club_name: row.reviews?.clubs?.name ?? 'Unknown Club',
    })) ?? [];

  // split page into summary cards + detail sections
  return (
    <div className="space-y-8">
      {/* Top cards row */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card: Total Reviews */}
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="text-sm font-medium text-gray-500">
            Total reviews
          </div>
          <div className="mt-2 text-3xl font-semibold text-gray-900">
            {totalReviews ?? 0}
          </div>
          <div className="mt-1 text-xs text-gray-400">
            All-time submitted reviews
          </div>
        </div>

        {/* Card: Avg rating */}
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="text-sm font-medium text-gray-500">
            Average rating (latest 10)
          </div>
          <div className="mt-2 text-3xl font-semibold text-gray-900">
            {averageRating ? averageRating.toFixed(2) : '—'}
          </div>
          <div className="mt-1 text-xs text-gray-400">
            Based on most recent reviews
          </div>
        </div>

        {/* Card: Latest clubs */}
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="text-sm font-medium text-gray-500">
            Latest reviewers
          </div>
          <ul className="mt-2 space-y-1 text-sm text-gray-900">
            {latestReviews.slice(0, 3).map((r: ReviewRow) => (
              <li key={r.id}>
                <span className="font-medium">
                  {r.club_name ?? 'Unknown Club'}
                </span>{' '}
                <span className="text-gray-500">
                  — {r.rating ?? 'NR'}/5
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-1 text-xs text-gray-400">
            Most recent submissions
          </div>
        </div>

        {/* Card: Open moderation */}
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="text-sm font-medium text-gray-500">
            Needs review
          </div>
          <div className="mt-2 text-3xl font-semibold text-gray-900">
            {flaggedRows.length}
          </div>
          <div className="mt-1 text-xs text-red-500">
            Unresolved reports
          </div>
        </div>
      </section>

      {/* Latest Reviews table */}
      <section className="rounded-lg border bg-white shadow-sm">
        <header className="flex items-baseline justify-between border-b px-4 py-3">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Latest Reviews
            </h2>
            <p className="text-xs text-gray-500">
              Most recent activity across all clubs.
            </p>
          </div>
          <div className="text-xs text-gray-400">
            {latestErr ? (
              <span className="text-red-600">
                Error loading reviews: {latestErr.message}
              </span>
            ) : (
              <span>{latestReviews.length} shown</span>
            )}
          </div>
        </header>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-left text-xs font-medium uppercase text-gray-500">
              <tr>
                <th className="px-4 py-2">Club</th>
                <th className="px-4 py-2">Rating</th>
                <th className="px-4 py-2">Category</th>
                <th className="px-4 py-2">Comment</th>
                <th className="px-4 py-2 whitespace-nowrap">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white text-gray-900">
              {latestReviews.map((row: ReviewRow) => (
                <tr key={row.id} className="align-top">
                  <td className="px-4 py-3 font-medium">
                    {row.club_name ?? 'Unknown Club'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {row.rating ?? 'NR'}/5
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                      {row.category ?? '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <div className="line-clamp-2 whitespace-pre-line">
                      {row.comment ?? '(no comment)'}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                    {new Date(row.inserted_at).toLocaleString()}
                  </td>
                </tr>
              ))}

              {latestReviews.length === 0 && !latestErr && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-sm text-gray-500"
                  >
                    No reviews yet.
                  </td>
                </tr>
              )}

              {latestErr && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-sm text-red-600"
                  >
                    Error loading reviews: {latestErr.message}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Moderation queue */}
      <section className="rounded-lg border bg-white shadow-sm">
        <header className="flex items-baseline justify-between border-b px-4 py-3">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Needs Attention
            </h2>
            <p className="text-xs text-gray-500">
              Unresolved reports marked as inappropriate.
            </p>
          </div>
          <div className="text-xs text-red-500">
            {flaggedRows.length} open
          </div>
        </header>

        {/* We pass flaggedRows down into the client component for “Resolve” buttons */}
        <div className="p-4">
          <FlaggedTableClient initialRows={flaggedRows} />
        </div>
      </section>
    </div>
  );
}
