// admin-web/app/(protected)/page.tsx
import { createSupabaseServer } from '@/lib/supabaseServer';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Admin • Reviews' };
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Raw row coming back from Supabase. We keep clubs:any because
 * Supabase may return an object OR an array for the relation
 * depending on how the FK is defined / inferred.
 */
type RowDB = {
  id: string;
  rating: number | null;
  comment: string | null;
  inserted_at: string | null;
  clubs: any; // could be {name:string}|null OR [{name:string}]|null
};

type RowView = {
  id: string;
  rating: number | null;
  comment: string | null;
  inserted_at: string | null;
  clubName: string | null;
};

function getClubName(clubs: any): string | null {
  if (!clubs) return null;
  if (Array.isArray(clubs)) return clubs[0]?.name ?? null;
  return clubs?.name ?? null;
}

export default async function AdminHome() {
  const supabase = await createSupabaseServer();

  const { data, error } = await supabase
    .from('reviews')
    .select('id,rating,comment,inserted_at,clubs(name)')
    .order('inserted_at', { ascending: false })
    .limit(20);

  if (error) {
    return (
      <main style={{ padding: 24 }}>
        <h1 style={{ fontWeight: 800, fontSize: 22 }}>Admin dashboard</h1>
        <p style={{ color: 'crimson', marginTop: 12 }}>Error: {error.message}</p>
      </main>
    );
  }

  const rows: RowView[] = (data as RowDB[] | null)?.map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    inserted_at: r.inserted_at,
    clubName: getClubName(r.clubs),
  })) ?? [];

  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ fontWeight: 800, fontSize: 22 }}>Admin dashboard</h1>

      {rows.length === 0 ? (
        <p style={{ marginTop: 12, opacity: 0.7 }}>No reviews yet.</p>
      ) : (
        <ul style={{ marginTop: 16, display: 'grid', gap: 10, listStyle: 'none', padding: 0 }}>
          {rows.map((r) => (
            <li
              key={r.id}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: 10,
                padding: 12,
                background: 'white',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                <strong>{r.clubName ?? 'Unknown club'}</strong>
                <span style={{ opacity: 0.6 }}>
                  {r.inserted_at ? new Date(r.inserted_at).toLocaleString() : ''}
                </span>
              </div>
              <div style={{ marginTop: 6 }}>
                <b>{r.rating ?? '—'}/5</b>
              </div>
              {r.comment ? (
                <p style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>{r.comment}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
