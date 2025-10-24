// admin-web/src/app/protected/reviews/page.tsx
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function fetchAllReviews() {
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
    .limit(50); // you can page later

  if (error) return { rows: [], error: error.message };

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

export default async function ReviewsPage() {
  const { rows, error } = await fetchAllReviews();

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold text-gray-900">
          Reviews
        </h1>
        <p className="text-sm text-gray-500">
          All recent reviews (most recent first).
        </p>
      </header>

      <section className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm bg-white">
        {error ? (
          <div className="p-4 text-sm text-red-600">
            Error loading reviews: {error}
          </div>
        ) : rows.length === 0 ? (
          <div className="p-4 text-sm text-gray-500">
            No reviews found.
          </div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-2">Club</th>
                <th className="px-4 py-2">Rating</th>
                <th className="px-4 py-2">Category</th>
                <th className="px-4 py-2">Comment</th>
                <th className="px-4 py-2 whitespace-nowrap">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {rows.map((rev) => (
                <tr key={rev.id} className="align-top">
                  <td className="px-4 py-2 font-medium text-gray-900">
                    {rev.club_name}
                  </td>
                  <td className="px-4 py-2 text-gray-700">
                    {rev.rating != null ? `${rev.rating}/5` : '—'}
                  </td>
                  <td className="px-4 py-2">
                    {rev.category ? (
                      <span className="inline-block rounded border border-blue-200 bg-blue-50 text-blue-600 text-xs px-1.5 py-0.5">
                        {rev.category}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-gray-800 whitespace-pre-wrap break-words max-w-[28rem]">
                    {rev.comment || <span className="text-gray-400">No comment</span>}
                  </td>
                  <td className="px-4 py-2 text-gray-500 text-xs whitespace-nowrap">
                    {rev.inserted_at
                      ? new Date(rev.inserted_at).toLocaleString('en-US', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
