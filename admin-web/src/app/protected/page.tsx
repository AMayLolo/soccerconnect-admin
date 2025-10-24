// admin-web/src/app/protected/page.tsx
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import FlaggedTableClient, { FlaggedRow } from './flagged/FlaggedTableClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}

// Small helper: count total reviews, avg rating, distinct clubs, etc.
async function loadDashboardStats() {
  const supabase = await getSupabase();

  // total reviews
  const { count: totalReviews } = await supabase
    .from('reviews')
    .select('id', { count: 'exact', head: true });

  // distinct clubs with at least 1 review
  const { data: clubRows } = await supabase
    .from('reviews')
    .select('club_id')
    .not('club_id', 'is', null);
  const clubSet = new Set((clubRows || []).map((r: any) => r.club_id));
  const clubsWithReviews = clubSet.size;

  // avg rating
  const { data: ratings } = await supabase
    .from('reviews')
    .select('rating')
    .not('rating', 'is', null);
  const nums = (ratings || [])
    .map((r: any) => Number(r.rating))
    .filter((n: number) => !Number.isNaN(n));
  const avgRating =
    nums.length === 0
      ? null
      : nums.reduce((sum: number, n: number) => sum + n, 0) / nums.length;

  return {
    totalReviews: totalReviews ?? 0,
    clubsWithReviews,
    avgRating,
  };
}

// flagged preview (first 5 unresolved)
async function loadFlaggedPreview(): Promise<FlaggedRow[]> {
  const supabase = await getSupabase();

  const { data } = await supabase
    .from('review_reports')
    .select(
      `
        id,
        created_at,
        reason,
        resolved,
        reviews (
          id,
          rating,
          comment,
          clubs (
            id,
            name
          )
        )
      `
    )
    .eq('resolved', false)
    .order('created_at', { ascending: false })
    .limit(5);

  const rows: FlaggedRow[] = (data || []).map((row: any) => ({
    report_id: row.id,
    created_at: row.created_at,
    reason: row.reason,
    review_id: row.reviews?.id,
    review_comment: row.reviews?.comment ?? null,
    review_rating: row.reviews?.rating ?? null,
    club_name: row.reviews?.clubs?.name ?? 'Unknown club',
  }));

  return rows;
}

export default async function AdminDashboardPage() {
  const [stats, flaggedPreview] = await Promise.all([
    loadDashboardStats(),
    loadFlaggedPreview(),
  ]);

  return (
    <main className="p-6 space-y-6">
      {/* Header row */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-600">
            High-level health of SoccerConnect.
          </p>
        </div>

        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Sign out
          </button>
        </form>
      </header>

      {/* Metrics cards */}
      <section className="grid gap-4 sm:grid-cols-3">
        {/* Total Reviews */}
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="text-sm text-gray-500 font-semibold">Total Reviews</div>
          <div className="mt-1 flex items-baseline gap-2">
            <div className="text-2xl font-bold text-gray-900">
              {stats.totalReviews}
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            All-time submitted reviews
          </div>
        </div>

        {/* Clubs Covered */}
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="text-sm text-gray-500 font-semibold">Clubs Covered</div>
          <div className="mt-1 text-2xl font-bold text-gray-900">
            {stats.clubsWithReviews}
          </div>
          <div className="mt-2 text-xs text-gray-400">
            Unique clubs with at least one review
          </div>
        </div>

        {/* Avg Rating */}
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="text-sm text-gray-500 font-semibold">Avg Rating</div>
          <div className="mt-1 flex items-baseline gap-2">
            <div className="text-2xl font-bold text-gray-900">
              {stats.avgRating === null
                ? '–'
                : stats.avgRating.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500">/5</div>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            Overall community score
          </div>
        </div>
      </section>

      {/* Needs attention */}
      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Needs attention
            </h2>
            <p className="text-sm text-gray-600">
              The most recently reported reviews. Resolve = keep it on record as handled.
            </p>
          </div>

          <a
            href="/protected/flagged"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            View all →
          </a>
        </div>

        <FlaggedTableClient initial={flaggedPreview} />
      </section>
    </main>
  );
}
