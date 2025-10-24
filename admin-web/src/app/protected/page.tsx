// admin-web/src/app/protected/page.tsx
import { createSupabaseServer } from '@/lib/supabaseServer';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type StatCardProps = {
  label: string;
  value: string | number;
  sub?: string;
};

function StatCard({ label, value, sub }: StatCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-gray-900">{value}</div>
      {sub ? <div className="mt-1 text-xs text-gray-400">{sub}</div> : null}
    </div>
  );
}

export default async function ProtectedDashboardPage() {
  const supabase = await createSupabaseServer();

  //
  // 1. Pull high-level stats
  //
  // total reviews
  const { data: totalReviewsData } = await supabase
    .from('reviews')
    .select('id', { count: 'exact', head: true });
  const totalReviews = totalReviewsData?.length ?? 0; // count:'exact' + head:true puts count in response.count in older clients,
  // but newer clients sometimes return 0 rows plus count in data?.length is undefined.
  // Fallback just in case:
  // NOTE: if your client library exposes `count` on the response, use that instead:
  // const totalReviews = totalReviewsCount ?? 0;

  // avg rating
  const { data: avgData } = await supabase.rpc('avg_review_rating'); // optional RPC if you made one
  // If you *don't* have an RPC, we can just select and compute manually:
  // const { data: ratingsRows } = await supabase.from('reviews').select('rating');
  // const avgRating =
  //   ratingsRows && ratingsRows.length
  //     ? (
  //         ratingsRows.reduce((sum, r) => sum + (r.rating ?? 0), 0) /
  //         ratingsRows.length
  //       ).toFixed(2)
  //     : '—';

  const avgRating =
    typeof avgData === 'number'
      ? avgData.toFixed(2)
      : '—';

  // unique clubs with at least one review
  const { data: clubsCountRows, error: clubsCountErr } = await supabase
    .from('reviews')
    .select('club_id', { count: 'exact' })
    .neq('club_id', null);
  const clubsWithReviews =
    clubsCountErr || !clubsCountRows ? 0 : new Set(clubsCountRows.map(r => r.club_id)).size;

  // open moderation queue (unresolved review_reports)
  const { data: openReportsRows, error: openReportsErr } = await supabase
    .from('review_reports')
    .select('id', { count: 'exact' })
    .eq('resolved', false);

  // similar comment as above re: count. We’ll fall back to length.
  const openReports =
    openReportsErr || !openReportsRows
      ? 0
      : openReportsRows.length;

  //
  // 2. Pull the 5 most recent *unresolved* reports with join info
  //
  // NOTE: Supabase JS can't currently do a 2-table join with arbitrary aliasing AND
  // complex select unless row-level security allows it. We’re doing two steps:
  //   a) get unresolved reports
  //   b) for each, look up its review + club
  //
  // This is fine right now (5 rows); if it grows we can write a SQL view.
  //
  const { data: reportsRaw } = await supabase
    .from('review_reports')
    .select('id, review_id, reason, created_at')
    .eq('resolved', false)
    .order('created_at', { ascending: false })
    .limit(5);

  // hydrate each report with its review + club
  let flagged: {
    id: string;
    reason: string | null;
    created_at: string;
    review_comment: string | null;
    review_rating: number | null;
    club_name: string | null;
  }[] = [];

  if (reportsRaw && reportsRaw.length > 0) {
    const reviewIds = reportsRaw.map(r => r.review_id);

    // get those review rows + club name
    const { data: reviewRows } = await supabase
      .from('reviews')
      .select('id, comment, rating, clubs(name)')
      .in('id', reviewIds);

    flagged = reportsRaw.map(r => {
      const match = reviewRows?.find(rv => rv.id === r.review_id);
      return {
        id: r.id,
        reason: r.reason ?? null,
        created_at: r.created_at,
        review_comment: match?.comment ?? null,
        review_rating: match?.rating ?? null,
        club_name: (match as any)?.clubs?.name ?? null,
      };
    });
  }

  //
  // 3. Temporary placeholder "Last 7 days chart / Rating distribution"
  //    For now it's static boxes.
  //

  return (
    <main className="p-6 space-y-8">
      {/* HEADER ROW */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Overview of club feedback, app health, and moderation.
          </p>
        </div>

        <div className="mt-4 flex flex-row flex-wrap gap-4 md:mt-0 md:flex-row">
          <StatCard
            label="Total Reviews"
            value={totalReviews ?? '—'}
            sub="All-time"
          />
          <StatCard
            label="Avg Rating"
            value={avgRating}
            sub="All clubs"
          />
          <StatCard
            label="Clubs Reviewed"
            value={clubsWithReviews ?? '—'}
            sub="At least 1 review"
          />
          <StatCard
            label="Open Reports"
            value={openReports ?? '0'}
            sub="Needs review"
          />
        </div>
      </div>

      {/* 2-COLUMN GRID */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* LEFT: Moderation queue */}
        <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <div>
              <h2 className="text-sm font-medium text-gray-900">
                Needs Attention
              </h2>
              <p className="text-xs text-gray-500">
                Most recently flagged reviews (unresolved)
              </p>
            </div>
            <Link
              href="/protected/flagged"
              className="text-xs font-medium text-blue-600 hover:underline"
            >
              View all
            </Link>
          </div>

          {flagged.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-500">
              No open reports. 🎉
            </div>
          ) : (
            <ul className="divide-y divide-gray-200 text-sm">
              {flagged.map(item => (
                <li key={item.id} className="px-4 py-4">
                  <div className="flex items-start justify-between">
                    <div className="max-w-[75%]">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                        {item.club_name ? (
                          <span className="font-medium text-gray-700">
                            {item.club_name}
                          </span>
                        ) : (
                          <span className="text-gray-400">Unknown Club</span>
                        )}
                        {item.review_rating != null && (
                          <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[10px] leading-none text-gray-700">
                            {item.review_rating}/5
                          </span>
                        )}
                        <span className="rounded bg-rose-100 px-1.5 py-0.5 font-mono text-[10px] leading-none text-rose-700">
                          Flagged
                        </span>
                      </div>

                      <p className="mt-2 line-clamp-2 text-gray-900">
                        {item.review_comment || 'No review text'}
                      </p>

                      {item.reason ? (
                        <p className="mt-2 text-[11px] text-gray-500">
                          <span className="font-medium text-gray-700">
                            Reason:
                          </span>{' '}
                          {item.reason}
                        </p>
                      ) : null}
                    </div>

                    <div className="ml-4 flex flex-col items-end text-right text-[10px] text-gray-400">
                      <span>
                        {new Date(item.created_at).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <span>
                        {new Date(item.created_at).toLocaleTimeString(
                          undefined,
                          {
                            hour: 'numeric',
                            minute: '2-digit',
                          }
                        )}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* RIGHT: Charts / trends placeholder */}
        <section className="flex flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h2 className="text-sm font-medium text-gray-900">
                Trends
              </h2>
              <p className="text-xs text-gray-500">
                Last 7 days (coming soon)
              </p>
            </div>

            <Link
              href="/protected/reports"
              className="text-xs font-medium text-blue-600 hover:underline"
            >
              Reports (beta)
            </Link>
          </div>

          <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-dashed border-gray-300 p-4 text-center text-xs text-gray-400">
              <div className="font-medium text-gray-500">Review volume</div>
              <div className="mt-1 text-[11px] text-gray-400">
                tiny sparkline here
              </div>
            </div>

            <div className="rounded-lg border border-dashed border-gray-300 p-4 text-center text-xs text-gray-400">
              <div className="font-medium text-gray-500">Avg rating</div>
              <div className="mt-1 text-[11px] text-gray-400">
                gauge / donut here
              </div>
            </div>

            <div className="rounded-lg border border-dashed border-gray-300 p-4 text-center text-xs text-gray-400 sm:col-span-2">
              <div className="font-medium text-gray-500">
                Category mix (Parent / Player / Staff)
              </div>
              <div className="mt-1 text-[11px] text-gray-400">
                stacked bar here
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
