// admin-web/src/app/protected/reviews/page.tsx
import { getSupabaseServerReadOnly } from '@/lib/supabaseServerReadOnly';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type ReviewRow = {
  id: string;
  rating: number | null;
  comment: string | null;
  category: 'parent' | 'player' | 'staff' | null;
  inserted_at: string;
  club_name: string | null;
};

export default async function AllReviewsPage() {
  const supabase = await getSupabaseServerReadOnly();

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
          name
        )
      `
    )
    .order('inserted_at', { ascending: false })
    .limit(50);

  if (error) {
    return (
      <div className="rounded-md border border-red-300 bg-red-50 p-4 text-red-700 text-sm">
        Error loading reviews: {error.message}
      </div>
    );
  }

  // shape rows for display
  const rows: ReviewRow[] = (data ?? []).map((r: any) => ({
    id: r.id,
    rating: r.rating ?? null,
    comment: r.comment ?? null,
    category: r.category ?? null,
    inserted_at: r.inserted_at,
    club_name: r.clubs?.name ?? 'Unknown Club',
  }));

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">
        Reviews
      </h1>
      <p className="text-gray-500 text-lg">
        All recent reviews (most recent first).
      </p>

      <div className="overflow-hidden rounded-md border border-gray-200 shadow-sm bg-white">
        {/* header row */}
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 border-b bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-600">
          <div>Club / Comment</div>
          <div className="text-right w-10">★</div>
          <div className="text-center w-16">Type</div>
          <div className="text-right w-32">Date</div>
        </div>

        {rows.length === 0 ? (
          <div className="p-4 text-sm text-gray-500">No reviews yet.</div>
        ) : (
          rows.map((row) => (
            <div
              key={row.id}
              className="grid grid-cols-[1fr_auto_auto_auto] gap-4 border-b last:border-b-0 px-4 py-3 text-sm"
            >
              {/* col 1: club + comment */}
              <div className="text-gray-900">
                <div className="font-semibold text-gray-800">
                  {row.club_name}
                </div>
                <div className="text-gray-600 text-[13px] leading-snug line-clamp-2">
                  {row.comment || '(no comment)'}
                </div>
              </div>

              {/* rating */}
              <div className="text-right text-gray-700 font-medium w-10">
                {row.rating ?? '–'}
              </div>

              {/* badge */}
              <div className="flex items-start justify-center w-16">
                <span className="rounded-full border border-gray-300 bg-gray-100 px-2 py-[2px] text-[11px] font-medium text-gray-700">
                  {row.category ?? '—'}
                </span>
              </div>

              {/* date */}
              <div className="text-right text-gray-500 text-[12px] w-32">
                {new Date(row.inserted_at).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
