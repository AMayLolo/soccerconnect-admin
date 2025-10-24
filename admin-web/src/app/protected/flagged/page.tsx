// admin-web/src/app/protected/flagged/page.tsx
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import FlaggedTableClient, { FlaggedRow } from './FlaggedTableClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function loadFlagged() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
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

  // grab unresolved reports with review + club context
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
    .limit(100);

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

export default async function FlaggedPage() {
  const flagged = await loadFlagged();

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Flagged reviews</h1>
      <p className="text-sm text-gray-600">
        Reports that parents, players, or staff marked as inappropriate.
      </p>

      <FlaggedTableClient initial={flagged} />
    </main>
  );
}
