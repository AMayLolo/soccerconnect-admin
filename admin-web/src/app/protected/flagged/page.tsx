// admin-web/src/app/protected/flagged/page.tsx

import { cookies } from 'next/headers';
import { createSupabaseServer } from '@/lib/supabaseServer';
import FlaggedTableClient, { FlaggedRow } from './FlaggedTableClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function FlaggedPage() {
  // auth-bound Supabase client with cookies (Next 16 style)
  const cookieStore = await cookies();
  const supabase = await createSupabaseServer({
    get(name: string) {
      return cookieStore.get(name)?.value;
    },
  });

  // pull unresolved & resolved reports with their review details
  const { data, error } = await supabase
    .from('review_reports')
    .select(
      `
        id,
        review_id,
        reason,
        resolved,
        created_at,
        reviews (
          id,
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
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    return (
      <main className="p-6 space-y-4">
        <h1 className="text-2xl font-semibold text-gray-900">Flagged</h1>
        <p className="text-sm text-gray-500">
          Reviews reported by users for moderation.
        </p>

        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700 text-sm">
          Error loading flagged reviews: {error.message}
        </div>
      </main>
    );
  }

  // massage DB shape -> FlaggedRow[]
  const rows: FlaggedRow[] =
    (data ?? []).map((r: any) => {
      const review = r.reviews ?? {};
      return {
        report_id: r.id,
        reason: r.reason ?? '',
        reported_at: r.created_at ?? null,
        resolved: !!r.resolved,

        review_id: review.id ?? null,
        rating: review.rating ?? null,
        comment: review.comment ?? '',
        category: review.category ?? null,
        inserted_at: review.inserted_at ?? null,
        club_name: review.clubs?.[0]?.name ?? review.clubs?.name ?? 'Unknown club',
      };
    }) ?? [];

  const unresolvedCount = rows.filter((row) => !row.resolved).length;

  return (
    <main className="p-6 space-y-4">
      <header className="flex flex-col gap-1">
        <div className="flex items-baseline justify-between flex-wrap gap-2">
          <h1 className="text-2xl font-semibold text-gray-900">Flagged</h1>
          {unresolvedCount > 0 ? (
            <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 border border-red-200">
              {unresolvedCount} needs review
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 border border-green-200">
              All resolved
            </span>
          )}
        </div>

        <p className="text-sm text-gray-500">
          Reviews reported by parents / players / staff. Click &quot;Mark
          resolved&quot; to clear items once handled.
        </p>
      </header>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <FlaggedTableClient initialRows={rows} />
      </div>
    </main>
  );
}
