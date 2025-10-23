// admin-web/app/protected/page.tsx
import { createSupabaseServer } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Row = {
  id: string;
  rating: number | null;
  comment: string | null;
  inserted_at: string | null;
  clubs: { name: string | null } | null;
};

export default async function AdminHome() {
  const supabase = await createSupabaseServer();

  const { data, error } = await supabase
    .from('reviews')
    .select('id,rating,comment,inserted_at,clubs(name)')
    .order('inserted_at', { ascending: false })
    .limit(20);

  const rows = ((data ?? []) as any[]).map((r): Row => ({
    id: String(r.id),
    rating: r.rating ?? null,
    comment: r.comment ?? null,
    inserted_at: r.inserted_at ?? null,
    clubs: r.clubs ? { name: r.clubs.name ?? null } : null,
  }));

  return (
    <main>
      <h1 style={{ marginBottom: 8 }}>Admin dashboard</h1>
      {error ? (
        <p style={{ color: 'crimson' }}>Error: {error.message}</p>
      ) : (
        <ul style={{ marginTop: 12 }}>
          {rows.map((r) => (
            <li key={r.id}>
              <strong>{r.clubs?.name ?? 'Unknown club'}</strong> — {r.rating ?? '-'} / 5
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
