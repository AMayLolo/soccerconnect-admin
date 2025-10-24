// admin-web/src/app/protected/page.tsx
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getDashboardStats() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );

  // total reviews
  const { count: totalReviews } = await supabase
    .from('reviews')
    .select('*', { count: 'exact', head: true });

  // reviews in last 7 days
  const since = new Date();
  since.setDate(since.getDate() - 7);

  const { count: recentReviews } = await supabase
    .from('reviews')
    .select('*', { count: 'exact', head: true })
    .gte('inserted_at', since.toISOString());

  // average rating
  // NOTE: Supabase JS doesn't do avg() client-side without RPC unless you expose it,
  // so we’ll just fetch a small aggregate manually.
  // This is fine for now; if table grows huge, we’ll switch to a DB view or RPC.
  const { data: ratingRows } = await supabase
    .from('reviews')
    .select('rating')
    .not('rating', 'is', null)
    .limit(5000); // safety cap

  let avgRating: string | null = null;
  if (ratingRows && ratingRows.length > 0) {
    const sum = ratingRows.reduce(
      (acc: number, r: any) => acc + (typeof r.rating === 'number' ? r.rating : 0),
      0
    );
    const computed = sum / ratingRows.length;
    avgRating = computed.toFixed(2); // "4.21"
  }

  // flagged / inappropriate reviews
  // requires `flagged` boolean column on reviews
  const { count: flaggedReviews } = await supabase
    .from('reviews')
    .select('*', { count: 'exact', head: true })
    .eq('flagged', true);

  return {
    totalReviews: totalReviews ?? 0,
    recentReviews: recentReviews ?? 0,
    avgRating,
    flaggedReviews: flaggedReviews ?? 0,
  };
}

export default async function DashboardPage() {
  const {
    totalReviews,
    recentReviews,
    avgRating,
    flaggedReviews,
  } = await getDashboardStats();

  return (
    <div className="space-y-8">
      {/* Page header */}
      <section className="space-y-1">
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">
          Snapshot of club feedback activity and moderation.
        </p>
      </section>

      {/* Cards grid */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Reviews */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500 tracking-wide uppercase">
            Total Reviews
          </p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {totalReviews}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            All-time submissions
          </p>
        </div>

        {/* New This Week */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500 tracking-wide uppercase">
            New (7 days)
          </p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {recentReviews}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Reviews posted in the last 7 days
          </p>
        </div>

        {/* Avg Rating */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500 tracking-wide uppercase">
            Avg Rating
          </p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {avgRating ?? '—'}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Across all reviews
          </p>
        </div>

        {/* Flagged / Needs Review */}
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 shadow-sm">
          <p className="text-xs font-medium text-red-600 tracking-wide uppercase">
            Needs Attention
          </p>
          <p className="mt-2 text-3xl font-semibold text-red-700">
            {flaggedReviews}
          </p>
          <p className="mt-1 text-xs text-red-600">
            Marked inappropriate / waiting for admin review
          </p>
        </div>
      </section>

      {/* Future: we can drop in charts, trends, etc. */}
    </div>
  );
}
