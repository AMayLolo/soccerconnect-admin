// admin-web/src/app/protected/page.tsx
import { createSupabaseServer } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type ReviewRow = {
  id: string;
  rating: number | null;
  comment: string | null;
  category: 'parent' | 'player' | 'staff' | null;
  inserted_at: string;
  clubs: {
    id: string;
    name: string;
  }[];
};

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default async function AdminDashboardPage() {
  const supabase = await createSupabaseServer();

  // who is logged in?
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // grab admin row
  const { data: adminRow } = await supabase
    .from('admin_users')
    .select('role')
    .eq('id', user?.id ?? '___nope___')
    .maybeSingle();

  // recent activity feed
  const { data, error } = await supabase
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
    .order('inserted_at', { ascending: false })
    .limit(20);

  // normalize rows
  const rows: ReviewRow[] = (data ?? []).map((r: any) => ({
    id: String(r.id),
    rating: r.rating ?? null,
    comment: r.comment ?? null,
    category: r.category ?? null,
    inserted_at: r.inserted_at ?? '',
    clubs: Array.isArray(r.clubs)
      ? r.clubs.map((c: any) => ({
          id: String(c.id),
          name: String(c.name ?? 'Unknown club'),
        }))
      : [],
  }));

  return (
    <main className="p-6 space-y-6">
      {/* Header bar */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            SoccerConnect Admin
          </h1>
          <p className="text-xs text-gray-500">
            Internal moderation dashboard
          </p>

          <div className="mt-2 text-[11px] text-gray-500">
            <div>Signed in as: {user?.email ?? 'unknown'}</div>
            <div>Role: {adminRow?.role ?? '—'}</div>
          </div>
        </div>

        <form action="/auth/signout" method="post">
          <button
            className="self-start rounded bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 ring-1 ring-red-200 hover:bg-red-100"
            type="submit"
          >
            Log out
          </button>
        </form>
      </header>

      {/* nav links */}
      <nav className="flex flex-wrap gap-3 text-xs text-blue-600 font-medium">
        <a
          href="/protected/reviews"
          className="underline underline-offset-2 hover:text-blue-500"
        >
          Reviews
        </a>

        <a
          href="/protected/reports"
          className="underline underline-offset-2 hover:text-blue-500"
        >
          Reports
        </a>
      </nav>

      {/* Latest Reviews card list */}
      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Latest Reviews
          </h2>
          <p className="text-[11px] text-gray-500">
            Most recent activity across all clubs.
          </p>
          {error && (
            <p className="text-red-600 text-xs mt-2">
              Error loading reviews: {error.message}
            </p>
          )}
        </div>

        <ul className="divide-y divide-gray-200 rounded border border-gray-200 bg-white">
          {rows.length === 0 ? (
            <li className="p-4 text-sm text-gray-500">
              No reviews yet.
            </li>
          ) : (
            rows.map((row) => (
              <li key={row.id} className="p-4 text-sm">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className="font-medium text-gray-900">
                    {row.clubs[0]?.name ?? 'Unknown Club'}
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-gray-500">
                    {/* rating */}
                    <span className="rounded bg-gray-100 px-1.5 py-0.5 font-medium text-gray-700">
                      {row.rating ?? '—'}/5
                    </span>

                    {/* category */}
                    {row.category && (
                      <span className="rounded bg-blue-100 px-1.5 py-0.5 font-medium text-blue-700 capitalize">
                        {row.category}
                      </span>
                    )}

                    {/* timestamp */}
                    <span>{fmtDate(row.inserted_at)}</span>
                  </div>
                </div>

                {row.comment && (
                  <p className="mt-2 whitespace-pre-line text-gray-700">
                    {row.comment}
                  </p>
                )}
              </li>
            ))
          )}
        </ul>
      </section>
    </main>
  );
}
