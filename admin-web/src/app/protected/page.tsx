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

export default async function AdminDashboardPage() {
  const supabase = await createSupabaseServer();

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

  if (error) {
    return (
      <section className="space-y-2">
        <h1 className="text-xl font-semibold text-gray-900">
          Latest Reviews
        </h1>
        <p className="text-red-600 text-sm">
          Error loading reviews: {error.message}
        </p>
      </section>
    );
  }

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
    <section className="space-y-4">
      <header>
        <h1 className="text-xl font-semibold text-gray-900">
          Latest Reviews
        </h1>
        <p className="text-xs text-gray-500">
          Read-only snapshot of the 20 most recent reviews across clubs.
        </p>
      </header>

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
                  <span>
                    {new Date(row.inserted_at).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </span>
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
  );
}
