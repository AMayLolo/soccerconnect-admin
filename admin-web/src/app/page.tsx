// admin-web/src/app/page.tsx
import { sb } from '@/lib/supabaseServer';
import Link from 'next/link';

type Row = {
  id: string;
  rating: number | null;
  comment: string | null;
  inserted_at: string | null;
  clubs?: { name: string } | null;
};

export default async function AdminHome() {
  const { data, error } = await sb<Row[]>(
    `reviews?select=id,rating,comment,inserted_at,clubs(name)&order=inserted_at.desc&limit=20`
  );

  return (
    <main className="min-h-screen bg-white px-6 py-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-extrabold text-sky-700">Soccer Connect • Admin</h1>
        <p className="text-sm text-slate-600 mt-1">Read-only overview</p>

        <div className="flex gap-3 mt-6">
          <Link href="/slack" className="px-3 py-2 rounded bg-sky-600 text-white text-sm font-semibold">
            Send Slack test
          </Link>
          <Link href="/reviews" className="px-3 py-2 rounded border text-sm font-semibold">
            Reviews (full list)
          </Link>
        </div>

        <h2 className="text-xl font-bold mt-8">Latest 20 Reviews</h2>
        {error && <pre className="text-red-600">{JSON.stringify(error, null, 2)}</pre>}

        <ul className="mt-4 space-y-4">
          {(data ?? []).map(r => (
            <li key={r.id} className="rounded border p-4">
              <div className="flex justify-between">
                <strong>{r.clubs?.name ?? 'Unknown club'}</strong>
                <span className="text-sm text-slate-500">{r.inserted_at?.slice(0,10)}</span>
              </div>
              <div className="text-sm mt-1">Rating: {r.rating ?? '-'}/5</div>
              {r.comment && <p className="mt-2 text-slate-800">{r.comment}</p>}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
