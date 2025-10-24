// admin-web/src/app/protected/page.tsx
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function fetchLatest() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );

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
    .limit(5);

  if (error) return { rows: [], error: error.message };

  // normalize rows for display
  const rows =
    (data ?? []).map((r: any) => ({
      id: r.id as string,
      rating: r.rating ?? null,
      comment: r.comment ?? '',
      category: r.category ?? null,
      inserted_at: r.inserted_at ?? null,
      club_name: r.clubs?.[0]?.name ?? r.clubs?.name ?? 'Unknown club',
    })) ?? [];

  return { rows, error: null };
}

export default async function DashboardPage() {
  const { rows, error } = await fetchLatest();

  return (
    <div className="space-y-8">
      {/* Page header */}
      <section className="space-y-1">
        <h1 className="text-xl font-semibold text-gray-900">
          Dashboard
        </h1>
        <p className="text-sm text-gray-500">
          Most recent activity across all clubs.
        </p>
      </section>

      {/* Latest Reviews card */}
      <section className="border border-gray-200 rounded-lg shadow-sm overflow-hidden bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <div>
            <h2 className="text-base font-medium text-gray-900">
              Latest Reviews
            </h2>
            <p className="text-xs text-gray-500">
              Last 5 submissions (newest first)
            </p>
          </div>

          <Link
            href="/protected/reviews"
            className="text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            View all →
          </Link>
        </div>

        {error ? (
          <div className="p-4 text-sm text-red-600">
            Error loading reviews: {error}
          </div>
        ) : rows.length === 0 ? (
          <div className="p-4 text-sm text-gray-500">
            No recent reviews.
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 text-sm">
            {rows.map((rev) => (
              <li key={rev.id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="font-medium text-gray-900">
                    {rev.club_name}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    {rev.rating != null && (
                      <span className="rounded border border-gray-300 px-1.5 py-0.5">
                        {rev.rating}/5
                      </span>
                    )}

                    {rev.category && (
                      <span className="rounded border border-blue-200 bg-blue-50 text-blue-600 px-1.5 py-0.5">
                        {rev.category}
                      </span>
                    )}

                    {rev.inserted_at && (
                      <span>
                        {new Date(rev.inserted_at).toLocaleString(
                          'en-US',
                          {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          }
                        )}
                      </span>
                    )}
                  </div>
                </div>

                {rev.comment && (
                  <p className="mt-2 text-gray-800 leading-relaxed break-words whitespace-pre-wrap">
                    {rev.comment}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
