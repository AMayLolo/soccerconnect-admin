// admin-web/src/app/protected/page.tsx
import { createSupabaseServer } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Use the exact FK name from Supabase -> reviews → Foreign keys
const FK_REVIEWS_CLUB = 'reviews_club_id_fkey';

type Row = {
  id: string;
  rating: number | null;
  comment: string | null;
  category: 'parent' | 'player' | 'staff' | null;
  inserted_at: string | null;
  clubs: { id: string; name: string } | null; // joined club
};

export default async function ProtectedPage() {
  const supabase = await createSupabaseServer();

  const { data, error } = await supabase
    .from('reviews')
    .select(
      `
      id,
      rating,
      comment,
      category,
      inserted_at,
      clubs:clubs!${FK_REVIEWS_CLUB} ( id, name )
    `
    )
    .order('inserted_at', { ascending: false })
    .limit(20);

  if (error) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-semibold">Admin • Reviews</h1>
        <p className="mt-4 text-red-600">Error: {error.message}</p>
      </main>
    );
  }

  const rows = (data ?? []) as Row[];

  return (
    <main className="p-6 space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Latest Reviews</h1>
      </header>

      <div className="overflow-x-auto rounded-xl border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="px-3 py-2 text-left">Club</th>
              <th className="px-3 py-2 text-left">Category</th>
              <th className="px-3 py-2 text-left">Rating</th>
              <th className="px-3 py-2 text-left">Comment</th>
              <th className="px-3 py-2 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-3 py-2">{r.clubs?.name ?? '—'}</td>
                <td className="px-3 py-2 capitalize">{r.category ?? '—'}</td>
                <td className="px-3 py-2">{r.rating ?? '—'}</td>
                <td
                  className="px-3 py-2 max-w-[520px] truncate"
                  title={r.comment ?? ''}
                >
                  {r.comment ?? '—'}
                </td>
                <td className="px-3 py-2">
                  {r.inserted_at
                    ? new Date(r.inserted_at).toLocaleString()
                    : '—'}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-gray-500">
                  No reviews yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-500">
        Joined via FK:&nbsp;
        <code className="rounded bg-gray-100 px-1 py-0.5">
          clubs:clubs!{FK_REVIEWS_CLUB}(id,name)
        </code>
      </p>
    </main>
  );
}
