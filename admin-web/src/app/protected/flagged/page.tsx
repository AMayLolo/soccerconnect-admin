// admin-web/src/app/protected/flagged/page.tsx
import { createSupabaseServer } from '@/lib/supabaseServer';
import FlaggedTableClient from './FlaggedTableClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Small helper to format relative time ("2h ago")
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

export default async function FlaggedPage() {
  const supabase = await createSupabaseServer();

  // 1. Get all reports with context
  const { data: reportsRaw, error } = await supabase
    .from('review_reports')
    .select(`
      id,
      created_at,
      reason,
      review_id,
      user_id,
      reviews (
        id,
        rating,
        comment,
        inserted_at,
        hidden,
        category,
        user_id,
        clubs (
          id,
          name
        )
      )
    `)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold text-gray-900">Flagged reviews</h1>
        <p className="text-red-600 text-sm">Error loading reports: {error.message}</p>
      </div>
    );
  }

  // 2. Dedupe so each review only shows once
  const map: Record<string, any> = {};
  (reportsRaw || []).forEach((rep: any) => {
    if (!rep.review_id) return;
    const r = rep.reviews;
    if (!r) return;

    if (!map[rep.review_id]) {
      map[rep.review_id] = {
        review_id: rep.review_id,
        first_reported_at: rep.created_at,
        last_reason: rep.reason || null,
        last_reporter: rep.user_id || null,
        rating: r.rating ?? null,
        comment: r.comment ?? '',
        hidden: r.hidden ?? false,
        category: r.category ?? null,
        created_at: r.inserted_at ?? null,
        clubName: r.clubs?.[0]?.name ?? r.clubs?.name ?? 'Unknown club',
        author_user_id: r.user_id ?? null,
        reports: [
          {
            reason: rep.reason,
            reported_at: rep.created_at,
            reporter_id: rep.user_id,
          },
        ],
      };
    } else {
      // add to existing
      map[rep.review_id].reports.push({
        reason: rep.reason,
        reported_at: rep.created_at,
        reporter_id: rep.user_id,
      });
    }
  });

  const flaggedRows = Object.values(map).map((row: any) => ({
    ...row,
    first_reported_at_pretty: formatWhen(row.first_reported_at),
    created_at_pretty: formatWhen(row.created_at),
  }));

  return (
    <div className="space-y-6">
      {/* Page header */}
      <section className="flex flex-col gap-1">
        <div className="text-sm font-semibold text-gray-900">
          Flagged Reviews
        </div>
        <div className="text-[11px] text-gray-500 leading-tight">
          These reviews were reported by users. You can hide them from the app or restore them.
        </div>
        <div className="text-[11px] text-gray-400 leading-tight">
          Total unique flagged reviews: {flaggedRows.length}
        </div>
      </section>

      {/* Table */}
      <FlaggedTableClient rows={flaggedRows} />
    </div>
  );
}
