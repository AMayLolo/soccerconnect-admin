// admin-web/src/app/protected/page.tsx
import { createSupabaseServer } from '@/lib/supabaseServer';
import Link from 'next/link';

// helper to build the async supabase client with cookies
async function makeSb() {
  const supabase = await createSupabaseServer({
    get: async (name: string) => {
      const jar = await import('next/headers').then(m => m.cookies());
      return (await jar).get(name)?.value;
    },
  });
  return supabase;
}

// get dashboard summary data
async function getDashboardData() {
  const supabase = await makeSb();

  // 1. total # of clubs (or whatever you were showing already)
  const { data: clubsData } = await supabase
    .from('clubs')
    .select('id, name');

  // 2. latest reviews across all clubs (limit 5 for dashboard)
  const { data: latestReviewsData } = await supabase
    .from('reviews')
    .select(
      `
        id,
        rating,
        comment,
        category,
        inserted_at,
        clubs:club_id (
          name
        )
      `
    )
    .order('inserted_at', { ascending: false })
    .limit(5);

  // 3. flagged reports preview (unresolved first)
  // We DON'T need full joined shape here, just enough to show a summary tile
  const { data: flaggedPreviewData } = await supabase
    .from('review_reports')
    .select(
      `
        id,
        reason,
        reported_at,
        resolved,
        reviews:review_id (
          comment,
          clubs:club_id (
            name
          )
        )
      `
    )
    .order('reported_at', { ascending: false })
    .limit(5);

  // massage data into friendlier dashboard bits

  const clubCount = clubsData?.length ?? 0;

  const latestReviews = (latestReviewsData ?? []).map((r: any) => ({
    id: r.id,
    rating: r.rating ?? null,
    comment: r.comment ?? null,
    category: r.category ?? null,
    inserted_at: r.inserted_at ?? '',
    club_name: r.clubs?.name ?? 'Unknown Club',
  }));

  // unresolved + recent flagged items
  const flaggedPreview = (flaggedPreviewData ?? []).map((fr: any) => ({
    report_id: fr.id,
    reason: fr.reason ?? null,
    reported_at: fr.reported_at ?? '',
    club_name: fr.reviews?.clubs?.name ?? 'Unknown Club',
    excerpt:
      fr.reviews?.comment
        ? fr.reviews.comment.slice(0, 120)
        : '(no comment)',
    resolved: !!fr.resolved,
  }));

  const unresolvedCount = flaggedPreview.filter(f => !f.resolved).length;

  return {
    clubCount,
    latestReviews,
    flaggedPreview,
    unresolvedCount,
  };
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardPage() {
  const {
    clubCount,
    latestReviews,
    flaggedPreview,
    unresolvedCount,
  } = await getDashboardData();

  return (
    <section className="space-y-8">
      {/* Header / intro */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          SoccerConnect • Admin
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Internal moderation dashboard
        </p>
      </div>

      {/* Stat cards row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Clubs */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="text-sm text-gray-500">Clubs onboarded</div>
          <div className="mt-2 text-3xl font-semibold text-gray-900">
            {clubCount}
          </div>
        </div>

        {/* Latest review rating avg, etc. You can customize or add more cards */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="text-sm text-gray-500">
            Latest review score
          </div>
          <div className="mt-2 text-3xl font-semibold text-gray-900">
            {latestReviews.length > 0 && latestReviews[0].rating != null
              ? `${latestReviews[0].rating}/5`
              : '—'}
          </div>
          <div className="mt-1 text-xs text-gray-500">
            {latestReviews.length > 0
              ? latestReviews[0].club_name
              : 'No recent reviews'}
          </div>
        </div>

        {/* Unresolved flags */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm text-gray-500">
                Unresolved reports
              </div>
              <div className="mt-2 text-3xl font-semibold text-gray-900">
                {unresolvedCount}
              </div>
            </div>
            <Link
              href="/protected/flagged"
              className="text-xs font-medium text-blue-600 hover:underline"
            >
              View all →
            </Link>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {unresolvedCount > 0
              ? 'Needs moderation'
              : 'All clear 👌'}
          </div>
        </div>

        {/* Placeholder "Reports (coming soon)" */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="text-sm text-gray-500">
            Reports (coming soon)
          </div>
          <div className="mt-2 text-3xl font-semibold text-gray-900">
            —
          </div>
          <div className="mt-1 text-xs text-gray-500">
            Automated health metrics
          </div>
        </div>
      </div>

      {/* Latest Reviews block */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">
              Latest Reviews
            </h2>
            <Link
              href="/protected/reviews"
              className="text-sm text-blue-600 hover:underline"
            >
              View all →
            </Link>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Most recent activity across all clubs.
          </p>
        </div>

        <ul className="divide-y divide-gray-200">
          {latestReviews.length === 0 && (
            <li className="p-4 text-sm text-gray-500">
              No recent reviews.
            </li>
          )}

          {latestReviews.map((r) => (
            <li key={r.id} className="p-4 text-sm leading-5">
              <div className="flex items-start justify-between">
                <div className="font-medium text-gray-900">
                  {r.club_name}
                </div>
                <div className="ml-4 text-xs text-gray-500">
                  {new Date(r.inserted_at).toLocaleString()}
                </div>
              </div>

              <div className="mt-1 text-gray-800">
                <span className="text-xs font-semibold text-gray-700 bg-gray-100 rounded px-1.5 py-0.5 mr-2">
                  {r.rating ?? '—'}/5
                </span>
                {r.comment ?? '(no comment)'}
              </div>

              {r.category && (
                <div className="mt-1">
                  <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">
                    {r.category}
                  </span>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Flagged Reports Preview block */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">
              Flagged Reports
            </h2>
            <Link
              href="/protected/flagged"
              className="text-sm text-blue-600 hover:underline"
            >
              Review →
            </Link>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Most recently reported reviews (user-submitted flags).
          </p>
        </div>

        <ul className="divide-y divide-gray-200">
          {flaggedPreview.length === 0 && (
            <li className="p-4 text-sm text-gray-500">
              Nothing flagged. 🎉
            </li>
          )}

          {flaggedPreview.map((f) => (
            <li key={f.report_id} className="p-4 text-sm leading-5">
              <div className="flex items-start justify-between">
                <div className="font-medium text-gray-900">
                  {f.club_name}
                </div>
                <div className="ml-4 text-xs text-gray-500">
                  {f.reported_at
                    ? new Date(f.reported_at).toLocaleString()
                    : '—'}
                </div>
              </div>

              <div className="mt-1 text-gray-800">
                <span className="mr-2 inline-flex rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700">
                  {f.resolved ? 'Resolved' : 'Flagged'}
                </span>

                <span className="text-gray-700">
                  {f.excerpt}
                </span>
              </div>

              {f.reason && (
                <div className="mt-1 text-xs text-gray-500">
                  Reason: {f.reason}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
