// admin-web/src/app/protected/flagged/page.tsx
import { createSupabaseServer } from '@/lib/supabaseServer';
import FlaggedTableClient from './FlaggedTableClient';

// fetch flagged reports + review + club info
async function fetchFlaggedRows() {
  const supabase = await createSupabaseServer({
    // Next.js 16 cookies() is async, so we pass an async getter
    get: async (name: string) => {
      const jar = await import('next/headers').then(m => m.cookies());
      return (await jar).get(name)?.value;
    },
  });

  // Pull review_reports joined to reviews and clubs
  // (reviews = the actual user review text; review_reports = moderation reports)
  const { data, error } = await supabase
    .from('review_reports')
    .select(
      `
        id,
        reason,
        reported_at,
        resolved,
        reviews:review_id (
          id,
          rating,
          comment,
          category,
          inserted_at,
          clubs:club_id (
            name
          )
        )
      `
    )
    .order('reported_at', { ascending: false });

  if (error) {
    console.error('fetchFlaggedRows error:', error);
    return [];
  }

  // Normalize / flatten data into the shape our client expects
  const rows = (data ?? []).map((r: any) => ({
    report_id: r.id,                            // report row id
    reason: r.reason ?? null,
    reported_at: r.reported_at,                 // timestamp when flagged
    review_id: r.reviews?.id ?? '',             // original review id
    rating: r.reviews?.rating ?? null,
    comment: r.reviews?.comment ?? null,
    category: r.reviews?.category ?? null,
    inserted_at: r.reviews?.inserted_at ?? '',  // when the review was created
    club_name: r.reviews?.clubs?.name ?? null,  // club name from join
    resolved: !!r.resolved,                     // ensure boolean
  }));

  return rows;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function FlaggedPage() {
  const flaggedRows = await fetchFlaggedRows();

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Flagged</h1>
        <p className="mt-1 text-sm text-gray-500">
          Reviews reported by users as inappropriate or unsafe.
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <FlaggedTableClient initialRows={flaggedRows} />
      </div>
    </section>
  );
}
