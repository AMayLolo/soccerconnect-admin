// admin-web/src/app/protected/reports/[id]/page.tsx
import { createSupabaseServer } from '@/lib/supabaseServer';
import Link from 'next/link';
import PrettyJson from '@/components/PrettyJson';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Row = {
  id: string;
  created_at: string | null;
  status: number | null;
  payload: any | null;
  error?: string | null;
  webhook_url?: string | null;
};

export default async function ReportDetail({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from('review_helpful_weekly_audit')
    .select('id, created_at, status, payload, error, webhook_url')
    .eq('id', params.id)
    .maybeSingle();

  if (error) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold mb-4">Report</h1>
        <p className="text-red-600">Error: {error.message}</p>
      </main>
    );
  }

  const row = (data ?? null) as Row | null;
  if (!row) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold mb-4">Report</h1>
        <p>Not found.</p>
      </main>
    );
  }

  const created =
    row.created_at ? new Date(row.created_at).toLocaleString() : '—';

  return (
    <main className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Report</h1>
        <Link href="/protected/reports" className="underline text-blue-700">
          ← Back to reports
        </Link>
      </div>

      <div className="border rounded p-3 text-sm space-y-1">
        <div><span className="font-semibold">ID:</span> {row.id}</div>
        <div><span className="font-semibold">Created:</span> {created}</div>
        <div><span className="font-semibold">Status:</span> {row.status ?? '—'}</div>
        {row.webhook_url ? (
          <div className="truncate">
            <span className="font-semibold">Webhook:</span>{' '}
            <span className="text-gray-600">{row.webhook_url}</span>
          </div>
        ) : null}
        {row.error ? (
          <div className="text-red-700">
            <span className="font-semibold">Error:</span> {row.error}
          </div>
        ) : null}
      </div>

      <div className="space-y-2">
        <h2 className="font-semibold">Payload</h2>
        <PrettyJson value={row.payload} />
      </div>
    </main>
  );
}
