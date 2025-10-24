// admin-web/src/app/protected/page.tsx
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type ClubRow = {
  club_name: string | null;
  total_reviews: number;
};

export default async function AdminHome() {
  // create Supabase server client using cookies from this request
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set() {
          /* no-op for RSC */
        },
        remove() {
          /* no-op for RSC */
        },
      },
    }
  );

  // get some data you want to show on dashboard
  // example: count reviews per club
  // (this is what you had working visually)
  const { data, error } = await supabase
    .from('reviews')
    .select('clubs(name), club_id')
    .order('inserted_at', { ascending: false })
    .limit(100);

  // collapse into counts per club_id
  const countsByClub: Record<
    string,
    { club_name: string | null; total_reviews: number }
  > = {};

  if (data) {
    for (const row of data as any[]) {
      const clubId = row.club_id ?? 'unknown';
      if (!countsByClub[clubId]) {
        countsByClub[clubId] = {
          club_name: row.clubs?.name ?? 'Unknown Club',
          total_reviews: 0,
        };
      }
      countsByClub[clubId].total_reviews += 1;
    }
  }

  const clubs: ClubRow[] = Object.values(countsByClub);

  return (
    <main className="p-6">
      {/* HEADER BAR */}
      <header className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">
            SoccerConnect • Admin
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Internal dashboard
          </p>
        </div>

        {/* Sign out */}
        <form
          action="/auth/signout"
          method="post"
          className="self-start"
        >
          <button
            type="submit"
            className="inline-flex items-center rounded-md bg-red-600 text-white text-sm font-medium px-4 py-2 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Sign out
          </button>
        </form>
      </header>

      {/* BODY CONTENT */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Clubs by review count
        </h2>

        {error && (
          <p className="text-red-600 text-sm">
            Failed to load data: {error.message}
          </p>
        )}

        <ul className="text-lg text-gray-900 leading-relaxed space-y-3">
          {clubs.map((c, i) => (
            <li key={i} className="font-medium">
              {c.club_name ?? 'Unknown Club'} — {c.total_reviews}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
