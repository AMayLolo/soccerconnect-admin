// admin-web/src/app/protected/page.tsx
import { createSupabaseServer } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Club = { id: string; name: string };
type Row = {
  id: string;
  rating: number | null;
  comment: string | null;
  category: 'parent' | 'player' | 'staff' | null;
  inserted_at: string;
  club: Club | null; // normalized single club
};

export default async function AdminHome() {
  const supabase = await createSupabaseServer();

  // NOTE: reviews.club_id -> public.clubs.id (one-to-one). Some setups still
  // return an array for the embedded relation. We normalize below.
  const { data, error } = await supabase
    .from('reviews')
    .select('id,rating,comment,category,inserted_at,clubs(id,name)')
    .order('inserted_at', { ascending: false })
    .limit(20);

  if (error) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold">Admin dashboard</h1>
        <p className="text-red-600 mt-2">Error: {error.message}</p>
      </main>
    );
  }

  // Normalize: if `clubs` is an array, take first item; if it's an object, use it;
  // otherwise set null. Also coerce primitives to the Row shape.
  const rows: Row[] = (data ?? []).map((r: any) => {
    const c = r?.clubs;
    const club: Club | null = Array.isArray(c)
      ? (c[0] ? { id: String(c[0].id), name: String(c[0].name) } : null)
      : c
      ? { id: String(c.id), name: String(c.name) }
      : null;

    return {
      id: String(r.id),
      rating: r.rating ?? null,
      comment: r.comment ?? null,
      category: (r.category ?? null) as Row['category'],
      inserted_at: String(r.inserted_at),
      club,
    };
  });

  return (
    <main className="p-6 space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin dashboard</h1>
      </header>

      <ul className="space-y-3">
        {rows.map((row) => (
          <li key={row.id} className="rounded border p-4">
            <div className="flex items-center justify-between">
              <strong>{row.club?.name ?? 'Unknown club'}</strong>
              <span className="text-sm text-gray-500">
                {new Date(row.inserted_at).toLocaleString()}
              </span>
            </div>
            <div className="mt-1 text-sm text-gray-600">
              Rating: {row.rating ?? '—'} • Category: {row.category ?? '—'}
            </div>
            {row.comment && <p className="mt-2">{row.comment}</p>}
          </li>
        ))}
      </ul>
    </main>
  );
}
