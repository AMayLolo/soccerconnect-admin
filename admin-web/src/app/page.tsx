import { createSupabaseServer } from '@/lib/supabaseServer';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminHome() {
  const supabase = await createSupabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data, error } = await supabase
    .from('reviews')
    .select('id,rating,comment,inserted_at,clubs(name)')
    .order('inserted_at', { ascending: false })
    .limit(10);

  return (
    <main style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <h1 style={{ fontWeight: 800, fontSize: 22 }}>SoccerConnect • Admin</h1>
        <Link href="/auth/signout" style={{ fontWeight: 600, color: '#1565C0' }}>
          Sign out
        </Link>
      </header>

      {error ? (
        <p style={{ color: 'crimson' }}>Error: {error.message}</p>
      ) : (
        <ul style={{ marginTop: 8, lineHeight: 1.5 }}>
          {(data ?? []).map((r: any) => (
            <li key={r.id}>
              <strong>{r.clubs?.name ?? 'Unknown club'}</strong> — {r.rating ?? '-'}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
