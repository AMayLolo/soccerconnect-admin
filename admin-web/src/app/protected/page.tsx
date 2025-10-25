// admin-web/src/app/protected/page.tsx
import { fetchLatestReviews, fetchFlaggedReports } from './data';
import type { ReviewRow, FlaggedRow } from './types';
import FlaggedTableClient from './flagged/FlaggedTableClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardPage() {
  // Fetch both in parallel for perf
  const [latestReviews, flaggedRows] = await Promise.all([
    fetchLatestReviews(),   // ReviewRow[]
    fetchFlaggedReports(),  // FlaggedRow[]
  ]);

  // little helpers
  const totalRecent = latestReviews.length;
  const avgRating =
    totalRecent === 0
      ? null
      : (
          latestReviews
            .map(r => r.rating ?? 0)
            .reduce((sum, n) => sum + n, 0) / totalRecent
        ).toFixed(1);

  const flaggedCount = flaggedRows.length;

  // just grab top 5 for dashboard preview
  const previewFlagged = flaggedRows.slice(0, 5);
  const previewReviews = latestReviews.slice(0, 5);

  return (
    <section className="space-y-8">
      {/* === METRIC CARDS ROW === */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Card: Recent Reviews */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Reviews (latest 20)
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <div className="text-2xl font-semibold text-gray-900">
              {totalRecent}
            </div>
            <div className="text-sm text-gray-500">submitted</div>
          </div>
        </div>

        {/* Card: Avg Rating */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Avg Rating
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <div className="text-2xl font-semibold text-gray-900">
              {avgRating ?? '—'}
            </div>
            <div className="text-sm text-gray-500">/ 5</div>
          </div>
        </div>

        {/* Card: Needs Review */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Needs Review
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <div className="text-2xl font-semibold text-red-600">
              {flaggedCount}
            </div>
            <div className="text-sm text-gray-500">open reports</div>
          </div>
        </div>
      </div>

      {/* === FLAGGED REPORTS PREVIEW === */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Needs Review ({flaggedCount})
            </h2>
            <p className="text-sm text-gray-500">
              Reports awaiting moderator action
            </p>
          </div>

          <a
            href="/protected/flagged"
            className="text-sm font-medium text-red-600 hover:text-red-500"
          >
            View all →
          </a>
        </div>

        <div className="p-4">
          {/* We reuse the same client table here, but only pass first few rows */}
          <FlaggedTableClient initialRows={previewFlagged} />
        </div>
      </div>

      {/* === LATEST REVIEWS PREVIEW === */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Latest Reviews
            </h2>
            <p className="text-sm text-gray-500">
              Most recent activity across all clubs
            </p>
          </div>

          <a
            href="/protected/reviews"
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            View all →
          </a>
        </div>

        <div className="divide-y divide-gray-200">
          {previewReviews.length === 0 ? (
            <div className="p-4 text-sm text-gray-500 italic">
              No recent reviews.
            </div>
          ) : (
            previewReviews.map((r: ReviewRow) => (
              <div key={r.id} className="p-4">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <div className="text-sm font-semibold text-gray-900">
                    {r.club_name ?? 'Unknown Club'}
                  </div>

                  <div className="text-xs text-gray-500">
                    {new Date(r.inserted_at).toLocaleString()}
                  </div>

                  <div className="ml-auto flex items-center gap-2 text-xs">
                    {r.rating != null && (
                      <span className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 font-medium text-slate-700 ring-1 ring-slate-200">
                        {r.rating}/5
                      </span>
                    )}
                    <span className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 font-medium text-slate-700 ring-1 ring-slate-200">
                      {r.category}
                    </span>
                  </div>
                </div>

                <div className="mt-2 text-sm text-gray-700 leading-snug whitespace-pre-line break-words">
                  {r.comment ?? (
                    <span className="text-gray-400 italic">No comment</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
