// admin-web/src/app/protected/page.tsx
import { createSupabaseServer } from '@/lib/supabaseServer';
import Link from 'next/link';

// Helpers to compute relative time like "2h ago"
function formatWhen(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return d.toLocaleDateString();
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminDashboardPage() {
  const supabase = await createSupabaseServer();

  //
  // 1. Pull the signed-in admin info (for the greeting)
  //
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // get role from admin_users
  let role = null as string | null;
  if (user) {
    const { data: row } = await supabase
      .from('admin_users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();
    role = row?.role ?? null;
  }

  //
  // 2. Stats
  //   - total reviews
  //   - total clubs
  //   - new reviews in last 7 days
  //
  // total reviews
  const { count: totalReviewsCount } = await supabase
    .from('reviews')
    .select('id', { count: 'exact', head: true });

  // total clubs
  const { count: totalClubsCount } = await supabase
    .from('clubs')
    .select('id', { count: 'exact', head: true });

  // new this week (last 7 days)
  const since = new Date();
  since.setDate(since.getDate() - 7);
  const { count: newThisWeekCount } = await supabase
    .from('reviews')
    .select('id', { count: 'exact', head: true })
    .gte('inserted_at', since.toISOString());

  //
  // 3. Flagged queue preview (top 5 most recent reports)
  //
  // We join review_reports -> reviews -> clubs so you can see context.
  // You might have multiple reports for the same review; for a simple preview,
  // we'll just show distinct review_ids, most-recent first.
  const { data: flaggedRowsRaw } = await supabase
    .from('review_reports')
    .select(`
      id,
      created_at,
      reason,
      review_id,
      reviews (
        id,
        rating,
        comment,
        inserted_at,
        clubs (
          id,
          name
        )
      )
    `)
    .order('created_at', { ascending: false })
    .limit(20);

  // reduce duplicates by review_id (show latest report per review)
  const flaggedMap: Record<string, any> = {};
  (flaggedRowsRaw || []).forEach(rep => {
    if (!rep.review_id) return;
    if (!flaggedMap[rep.review_id]) {
      flaggedMap[rep.review_id] = rep;
    }
  });
  const flaggedRows = Object.values(flaggedMap)
    .slice(0, 5)
    .map((rep: any) => {
      return {
        review_id: rep.review_id,
        reason: rep.reason,
        reported_at: rep.created_at,
        rating: rep.reviews?.rating ?? null,
        comment: rep.reviews?.comment ?? '',
        clubName: rep.reviews?.clubs?.[0]?.name ?? rep.reviews?.clubs?.name ?? 'Unknown club',
      };
    });

  //
  // 4. Recent reviews activity (latest 5 reviews site-wide)
  //
  const { data: recentReviewsRaw } = await supabase
    .from('reviews')
    .select(`
      id,
      rating,
      comment,
      inserted_at,
      category,
      clubs (
        id,
        name
      )
    `)
    .order('inserted_at', { ascending: false })
    .limit(5);

  const recentReviews = (recentReviewsRaw || []).map((r: any) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    when: r.inserted_at,
    category: r.category,
    clubName: r.clubs?.[0]?.name ?? r.clubs?.name ?? 'Unknown club',
  }));

  //
  // Layout:
  // - Header / greeting
  // - Grid of 3 stat cards
  // - Two-column section:
  //     left: Flagged for Review
  //     right: Recent Activity
  //

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <section className="flex flex-col gap-1">
        <div className="text-sm font-semibold text-gray-900">
          Hi {user?.email ?? 'admin'}
        </div>
        <div className="text-xs text-gray-500">
          Role: {role ?? '—'}
        </div>
        <div className="text-[11px] text-gray-400">
          Here’s what’s happening across SoccerConnect.
        </div>
      </section>

      {/* STATS CARDS */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Reviews */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
            Total Reviews
          </div>
          <div className="mt-2 text-3xl font-bold text-gray-900">
            {totalReviewsCount ?? 0}
          </div>
          <div className="mt-1 text-xs text-gray-500">
            All-time reviews from parents, players & staff
          </div>
          <Link
            href="/protected/reviews"
            className="mt-3 inline-block text-xs font-medium text-green-700 hover:text-green-800"
          >
            View all reviews →
          </Link>
        </div>

        {/* Total Clubs */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
            Clubs in System
          </div>
          <div className="mt-2 text-3xl font-bold text-gray-900">
            {totalClubsCount ?? 0}
          </div>
          <div className="mt-1 text-xs text-gray-500">
            Across all states (live + seeded)
          </div>
          <div className="mt-3 text-[11px] text-gray-400">
            Import more clubs as you expand
          </div>
        </div>

        {/* New This Week */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
            New This Week
          </div>
          <div className="mt-2 text-3xl font-bold text-gray-900">
            {newThisWeekCount ?? 0}
          </div>
          <div className="mt-1 text-xs text-gray-500">
            Reviews in the last 7 days
          </div>
          <div className="mt-3 text-[11px] text-gray-400">
            Helps track engagement growth
          </div>
        </div>
      </section>

      {/* TWO-COLUMN CONTENT */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* FLAGGED QUEUE */}
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm flex flex-col">
          <div className="border-b border-gray-200 p-4 flex items-baseline justify-between">
            <div>
              <div className="text-sm font-semibold text-gray-900">
                Flagged for Review
              </div>
              <div className="text-[11px] text-gray-500">
                Latest reports from users
              </div>
            </div>

            <Link
              href="/protected/flagged"
              className="text-[11px] font-medium text-green-700 hover:text-green-800"
            >
              View all →
            </Link>
          </div>

          {flaggedRows.length === 0 ? (
            <div className="flex-1 p-4 text-sm text-gray-500">
              No reported reviews right now. 🎉
            </div>
          ) : (
            <ul className="flex-1 divide-y divide-gray-100 text-sm">
              {flaggedRows.map((f: any) => (
                <li key={f.review_id} className="p-4 flex flex-col gap-2">
                  <div className="flex items-start justify-between">
                    <div className="font-semibold text-gray-900">
                      {f.clubName}
                    </div>
                    <div className="text-[11px] text-gray-500">
                      {formatWhen(f.reported_at)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2 py-[2px] font-semibold text-red-700">
                      Reported: {f.reason || '—'}
                    </span>
                    {f.rating != null && (
                      <span className="inline-flex items-center rounded-full border border-yellow-200 bg-yellow-50 px-2 py-[2px] font-semibold text-yellow-700">
                        {f.rating}/5
                      </span>
                    )}
                  </div>

                  {f.comment ? (
                    <div className="text-gray-700 text-[13px] leading-snug line-clamp-3">
                      “{f.comment}”
                    </div>
                  ) : (
                    <div className="text-gray-400 text-[13px] italic">
                      (no comment text)
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Link
                      href={`/protected/reviews?focus=${encodeURIComponent(
                        f.review_id
                      )}`}
                      className="text-[11px] font-medium text-green-700 hover:text-green-800"
                    >
                      Moderate →
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* RECENT ACTIVITY */}
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm flex flex-col">
          <div className="border-b border-gray-200 p-4 flex items-baseline justify-between">
            <div>
              <div className="text-sm font-semibold text-gray-900">
                Recent Activity
              </div>
              <div className="text-[11px] text-gray-500">
                Latest public reviews
              </div>
            </div>

            <Link
              href="/protected/reviews"
              className="text-[11px] font-medium text-green-700 hover:text-green-800"
            >
              View all →
            </Link>
          </div>

          {recentReviews.length === 0 ? (
            <div className="flex-1 p-4 text-sm text-gray-500">
              No recent reviews yet.
            </div>
          ) : (
            <ul className="flex-1 divide-y divide-gray-100 text-sm">
              {recentReviews.map((r) => (
                <li key={r.id} className="p-4 flex flex-col gap-2">
                  <div className="flex items-start justify-between">
                    <div className="font-semibold text-gray-900">
                      {r.clubName}
                    </div>
                    <div className="text-[11px] text-gray-500">
                      {formatWhen(r.when)}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {r.rating != null && (
                      <span className="inline-flex items-center rounded-full border border-yellow-200 bg-yellow-50 px-2 py-[2px] font-semibold text-yellow-700">
                        {r.rating}/5
                      </span>
                    )}

                    {r.category && (
                      <span className="inline-flex items-center rounded-full border border-gray-300 bg-gray-100 px-2 py-[2px] font-semibold text-gray-700">
                        {String(r.category).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {r.comment ? (
                    <div className="text-gray-700 text-[13px] leading-snug line-clamp-3">
                      “{r.comment}”
                    </div>
                  ) : (
                    <div className="text-gray-400 text-[13px] italic">
                      (no comment text)
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Link
                      href={`/protected/reviews?focus=${encodeURIComponent(
                        r.id
                      )}`}
                      className="text-[11px] font-medium text-green-700 hover:text-green-800"
                    >
                      View full →
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
