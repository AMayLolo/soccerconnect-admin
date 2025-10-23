// admin-web/app/page.tsx
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function getSupabaseServer(cookiesIn: { get: (name: string) => string | undefined }) {
  // Minimal response-like cookie adapter for SSR
  const cookieStore = new Map<string, string | undefined>();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          // read from Next cookies first, then our temp store
          return cookiesIn.get(name) ?? cookieStore.get(name);
        },
        set(name: string, value: string, _opts: CookieOptions) {
          cookieStore.set(name, value);
        },
        remove(name: string, _opts: CookieOptions) {
          cookieStore.set(name, '');
        },
      },
    }
  );
}

export default async function AdminHome() {
  // Next 16: cookies() is async
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies(); // ← await here

  const supabase = getSupabaseServer({
    get: (name) => cookieStore.get(name)?.value, // ← use the awaited store
  });

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
