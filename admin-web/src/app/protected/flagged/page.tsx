// admin-web/src/app/protected/flagged/page.tsx
import { getSupabaseServerReadOnly } from '@/lib/supabaseServerReadOnly';
import FlaggedTableClient from './FlaggedTableClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function FlaggedPage() {
  const supabase = await getSupabaseServerReadOnly();

  // unresolved reports joined to review + club
  const { data, error } = await supabase
    .from('review_reports')
    .select(
      `
        id,
        review_id,
        reason,
        created_at,
        resolved,
        reviews (
          rating,
          comment,
          category,
          inserted_at,
          clubs (
            name
          )
        )
      `
    )
    .eq('resolved', false)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    return (
      <div className="space-y-4">
        <header>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Flagged
          </h1>
          <p className="mt-1 text-gray-500 text-lg">
            Reviews that were reported as inappropriate.
          </p>
        </header>

        <div className="rounded-md border border-red-300 bg-red-50 p-4 text-red-700 text-sm">
          Error loading flagged reviews: {error.message}
        </div>
      </div>
    );
  }

  // reshape into rows suitable for the client table
  const rows =
    data?.map((row: any) => ({
      // report metadata
      report_id: row.id,
      reason: row.reason ?? '(no reason provided)',
      reported_at: row.created_at,

      // review details
      review_id: row.review_id,
      rating: row.reviews?.rating ?? null,
      comment: row.reviews?.comment ?? '(no comment)',
      category: row.reviews?.category ?? null,
      inserted_at: row.reviews?.inserted_at ?? null,
      club_name: row.reviews?.clubs?.name ?? 'Unknown Club',
    })) ?? [];

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Flagged
        </h1>
        <p className="mt-1 text-gray-500 text-lg">
          Reviews reported as abusive / inappropriate. Mark them as handled
          once you’ve reviewed.
        </p>
      </header>

      <div className="rounded-md border border-gray-200 bg-white shadow-sm">
        <FlaggedTableClient initialRows={rows} />
      </div>
    </div>
  );
}
