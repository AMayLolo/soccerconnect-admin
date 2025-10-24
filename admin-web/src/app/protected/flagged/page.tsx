// src/app/protected/flagged/page.tsx
import { createSupabaseServer } from '@/lib/supabaseServer';
import FlaggedTableClient from '../flagged/FlaggedTableClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function FlaggedPage() {
  const supabase = await createSupabaseServer();

  // Pull more rows here than the dashboard preview — like 50
  const { data: flaggedRaw } = await supabase
    .from('reviews')
    .select(
      `
        id,
        rating,
        comment,
        category,
        inserted_at,
        clubs (
          id,
          name
        )
      `
    )
    .eq('category', 'inappropriate')
    .order('inserted_at', { ascending: false })
    .limit(50);

  const rows = (flaggedRaw ?? []).map((r: any) => ({
    id: r.id,
    rating: r.rating ?? null,
    comment: r.comment ?? null,
    category: r.category ?? null,
    inserted_at: r.inserted_at,
    club_name: r.clubs?.name ?? null,
  }));

  return (
    <main className="p-6 space-y-4">
      <header>
        <h1 className="text-2xl font-semibold text-gray-900">
          Needs Attention
        </h1>
        <p className="text-sm text-gray-500">
          These reviews were flagged as inappropriate and may require moderation.
        </p>
      </header>

      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        <p className="font-medium">
          Reminder: please handle sensitive content carefully.
        </p>
        <p>
          Mark false positives as OK, or escalate serious reports if needed.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <FlaggedTableClient initialRows={rows} />
      </div>
    </main>
  );
}
