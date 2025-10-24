// admin-web/src/app/protected/page.tsx
import { getSupabaseServerReadOnly } from '@/lib/supabaseServerReadOnly';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type MetricCounts = {
  totalReviews: number;
  totalClubs: number;
  openFlags: number;
  recentToday: number;
};

type OpenReportRow = {
  id: string;
  review_id: string;
  reason: string | null;
  created_at: string;
  comment_snippet: string;
  club_name: string | null;
};

export default async function DashboardPage() {
  const supabase = await getSupabaseServerReadOnly();

  //
  // 1. basic metrics
  //

  // totalReviews
  const { count: totalReviews = 0 } = await supabase
    .from('reviews')
    .select('id', { count: 'exact', head: true });

  // totalClubs
  const { count: totalClubs = 0 } = await supabase
    .from('clubs')
    .select('id', { count: 'exact', head: true });

  // recentToday (reviews in last 24h)
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count: recentToday = 0 } = await supabase
    .from('reviews')
    .select('id', { count: 'exact', head: true })
    .gte('inserted_at', since);

  // openFlags = number of unresolved review_reports
  const { count: openFlags = 0 } = await supabase
    .from('review_reports')
    .select('id', { count: 'exact', head: true })
    .eq('resolved', false);

  const metrics: MetricCounts = {
    totalReviews,
    totalClubs,
    openFlags,
    recentToday,
  };

  //
  // 2. "needs attention" list
  //    Get the latest unresolved review_reports joined to review/comment + club
  //

  const { data: rawReports, error: reportsError } = await supabase
    .from('review_reports')
    .select(
      `
        id,
        review_id,
        reason,
        created_at,
        resolved,
        reviews (
          comment,
          clubs (
            name
          )
        )
      `
    )
    .eq('resolved', false)
    .order('created_at', { ascending: false })
    .limit(5);

  let openReportRows: OpenReportRow[] = [];

  if (!reportsError && rawReports) {
    openReportRows = rawReports.map((rep: any) => ({
      id: rep.id,
      review_id: rep.review_id,
      reason: rep.reason ?? null,
      created_at: rep.created_at,
      comment_snippet:
        (rep.reviews?.comment || '(no comment)').slice(0, 160),
      club_name: rep.reviews?.clubs?.name ?? 'Unknown Club',
    }));
  }

  return (
    <div className="space-y-8">
      {/* Page heading */}
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Dashboard
        </h1>
        <p className="mt-1 text-gray-500 text-lg">
          High-level activity and items that may need moderation.
        </p>
      </header>

      {/* Metric cards */}
      <section>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Reviews"
            value={metrics.totalReviews}
            helper="All time"
          />
          <StatCard
            label="Clubs"
            value={metrics.totalClubs}
            helper="Active orgs"
          />
          <StatCard
            label="New (24h)"
            value={metrics.recentToday}
            helper="Fresh feedback"
          />
          <StatCard
            label="Open Flags"
            value={metrics.openFlags}
            helper="Needs review"
            tone="alert"
          />
        </div>
      </section>

      {/* Needs attention list */}
      <section className="max-w-3xl">
        <div className="rounded-md border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-4 py-3 sm:px-6">
            <h2 className="text-base font-semibold text-gray-900">
              Needs attention
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Latest reports marked as inappropriate or concerning.
            </p>
          </div>

          {reportsError ? (
            <div className="px-4 py-4 text-sm text-red-600">
              Error loading reports: {reportsError.message}
            </div>
          ) : openReportRows.length === 0 ? (
            <div className="px-4 py-6 text-sm text-gray-500">
              No unresolved reports. 🎉
            </div>
          ) : (
            <ul className="divide-y divide-gray-100 text-sm">
              {openReportRows.map((r) => (
                <li key={r.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="text-gray-900 font-medium">
                        {r.club_name}
                      </div>
                      <div className="mt-1 text-gray-700 leading-snug text-[13px]">
                        {r.comment_snippet}
                      </div>

                      {r.reason && (
                        <div className="mt-2 inline-block rounded-md bg-red-50 px-2 py-1 text-[11px] font-medium text-red-700 ring-1 ring-red-200">
                          {r.reason}
                        </div>
                      )}
                    </div>

                    <div className="ml-4 flex-shrink-0 text-right text-[11px] text-gray-500">
                      {new Date(r.created_at).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="border-t border-gray-100 bg-gray-50 px-4 py-3 text-right sm:px-6">
            <a
              href="/protected/flagged"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              View flagged queue →
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

// tiny stat card component
function StatCard({
  label,
  value,
  helper,
  tone,
}: {
  label: string;
  value: number;
  helper?: string;
  tone?: 'alert';
}) {
  const isAlert = tone === 'alert';

  return (
    <div
      className={`rounded-md border shadow-sm p-4 bg-white ${
        isAlert
          ? 'border-red-200 ring-1 ring-red-200/60'
          : 'border-gray-200 ring-1 ring-gray-200/60'
      }`}
    >
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        {label}
      </div>
      <div
        className={`mt-2 text-3xl font-semibold ${
          isAlert ? 'text-red-600' : 'text-gray-900'
        }`}
      >
        {value}
      </div>
      {helper && (
        <div className="mt-1 text-[13px] text-gray-500">{helper}</div>
      )}
    </div>
  );
}
