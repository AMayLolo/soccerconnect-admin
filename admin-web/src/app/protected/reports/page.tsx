// admin-web/src/app/protected/reports/page.tsx
import { createSupabaseServer } from '@/lib/supabaseServer';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Row = {
  id: string;
  created_at: string | null;
  status: number | null;
  payload: any | null;
};

export default async function ReportsIndex() {
  const supabase = await createSupabaseServer();

  const { data, error } = await supabase
    .from('review_helpful_weekly_audit')
    .select('id, created_at, status, payload')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold mb-4">Weekly Helpful Audit</h1>
        <p className="text-red-600">Error loading reports: {error.message}</p>
      </main>
    );
  }

  const rows = (data ?? []) as Row[];

  return (
    <main className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Weekly Helpful Audit</h1>
        <Link
          href="/protected"
          className="text-sm underline text-blue-700"
        >
          ← Back to dashboard
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="border rounded p-4">No reports yet.</div>
      ) : (
        <div className="overflow-x-auto border rounded">
          <table className="min-w-[700px] w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-3 py-2 border-b">Created</th>
                <th className="text-left px-3 py-2 border-b">Status</th>
                <th className="text-left px-3 py-2 border-b">Preview</th>
                <th className="text-left px-3 py-2 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const created =
                  r.created_at ? new Date(r.created_at).toLocaleString() : '—';
                const statusBadge =
                  r.status && r.status >= 200 && r.status < 300
                    ? 'bg-green-100 text-green-800 border-green-300'
                    : 'bg-red-100 text-red-800 border-red-300';

                // Tiny preview: try pull a count field if present; otherwise show block count or payload keys
                let preview = '—';
                try {
                  if (r.payload && typeof r.payload === 'object') {
                    if (r.payload.summary?.total_reviews != null) {
                      preview = `reviews: ${r.payload.summary.total_reviews}`;
                    } else if (Array.isArray(r.payload.blocks)) {
                      preview = `blocks: ${r.payload.blocks.length}`;
                    } else {
                      preview = Object.keys(r.payload).slice(0, 3).join(', ') || 'json';
                    }
                  }
                } catch {
                  preview = 'json';
                }

                return (
                  <tr key={r.id}>
                    <td className="px-3 py-2 border-b">{created}</td>
                    <td className="px-3 py-2 border-b">
                      <span className={`inline-block text-xs px-2 py-1 border rounded ${statusBadge}`}>
                        {r.status ?? '—'}
                      </span>
                    </td>
                    <td className="px-3 py-2 border-b">{preview}</td>
                    <td className="px-3 py-2 border-b">
                      <Link
                        href={`/protected/reports/${r.id}`}
                        className="underline text-blue-700"
                      >
                        View JSON
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
