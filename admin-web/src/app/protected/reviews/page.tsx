// admin-web/src/app/protected/reviews/page.tsx
import { createSupabaseServer } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// This page shows ALL reviews in a simple table.
// You can make this fancier later (search, filters, moderation actions).

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
  user_id: string | null;
};

export default async function AllReviewsPage() {
  // 1. Get server-side supabase with cookies/session
  const supabase = await createSupabaseServer();

  // 2. Confirm user is logged in + is admin
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Not logged in → show minimal fallback.
    // (layout.tsx in /protected should already be redirecting,
    // but this is extra safety for when layout is bypassed during build)
    return (
      <main className="p-6 text-sm text-gray-700">
        <h1 className="text-lg font-semibold text-gray-900">Reviews</h1>
        <p className="text-red-600 mt-2">
          You must be signed in to view this page.
        </p>
      </main>
    );
  }

  // 3. (Optional) enforce admin role
  const { data: adminRow } = await supabase
    .from('admin_users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (!adminRow) {
    return (
      <main className="p-6 text-sm text-gray-700">
        <h1 className="text-lg font-semibold text-gray-900">Reviews</h1>
        <p className="text-red-600 mt-2">
          Your account is not authorized for admin access.
        </p>
      </main>
    );
  }

  // 4. Pull recent reviews with club + user_id
  const { data, error } = await supabase
    .from('reviews')
    .select(
      `
        id,
        rating,
        comment,
        category,
        inserted_at,
        user_id,
        clubs (
          id,
          name
        )
      `
    )
    .order('inserted_at', { ascending: false })
    .limit(100);

  if (error) {
    return (
      <main className="p-6 text-sm text-gray-700">
        <h1 className="text-lg font-semibold text-gray-900">Reviews</h1>
        <p className="text-red-600 mt-2">
          Error loading reviews: {error.message}
        </p>
      </main>
    );
  }

  const rows: ReviewRow[] = (data ?? []).map((r: any) => ({
    id: String(r.id),
    rating: r.rating ?? null,
    comment: r.comment ?? null,
    category: r.category ?? null,
    inserted_at: r.inserted_at ?? '',
    user_id: r.user_id ?? null,
    clubs: Array.isArray(r.clubs)
      ? r.clubs.map((c: any) => ({
          id: String(c.id),
          name: String(c.name ?? 'Unknown club'),
        }))
      : [],
  }));

  return (
    <main className="p-6 space-y-6">
      {/* Top bar / header */}
      <header className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Reviews
          </h1>
          <p className="text-xs text-gray-500">
            Most recent 100 reviews across all clubs.
          </p>
        </div>

        {/* little nav back to dashboard */}
        <a
          href="/protected"
          className="text-xs font-medium text-blue-600 hover:text-blue-500 underline underline-offset-2"
        >
          ← Back to dashboard
        </a>
      </header>

      {/* Table-ish list */}
      <div className="overflow-x-auto rounded border border-gray-200 bg-white">
        <table className="min-w-full text-left text-xs text-gray-700">
          <thead className="bg-gray-50 text-[11px] uppercase text-gray-500">
            <tr>
              <th className="px-3 py-2 font-semibold">Club</th>
              <th className="px-3 py-2 font-semibold">Rating</th>
              <th className="px-3 py-2 font-semibold">Category</th>
              <th className="px-3 py-2 font-semibold">Comment</th>
              <th className="px-3 py-2 font-semibold whitespace-nowrap">User</th>
              <th className="px-3 py-2 font-semibold whitespace-nowrap">When</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-4 text-center text-gray-400"
                >
                  No reviews yet.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="align-top">
                  <td className="px-3 py-3 font-medium text-gray-900">
                    {row.clubs[0]?.name ?? 'Unknown Club'}
                  </td>

                  <td className="px-3 py-3 whitespace-nowrap">
                    <span className="rounded bg-gray-100 px-2 py-0.5 font-medium text-gray-800">
                      {row.rating ?? '—'}/5
                    </span>
                  </td>

                  <td className="px-3 py-3 whitespace-nowrap">
                    {row.category ? (
                      <span className="rounded bg-blue-100 px-2 py-0.5 font-medium text-blue-800 capitalize">
                        {row.category}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>

                  <td className="px-3 py-3 max-w-xs">
                    {row.comment ? (
                      <div className="text-gray-800 whitespace-pre-line break-words">
                        {row.comment}
                      </div>
                    ) : (
                      <span className="text-gray-400">No comment</span>
                    )}
                  </td>

                  <td className="px-3 py-3 text-gray-500 text-[11px] whitespace-nowrap">
                    {row.user_id ?? 'Anon'}
                  </td>

                  <td className="px-3 py-3 text-gray-500 text-[11px] whitespace-nowrap">
                    {new Date(row.inserted_at).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
