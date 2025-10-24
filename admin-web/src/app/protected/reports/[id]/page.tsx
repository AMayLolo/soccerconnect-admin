// admin-web/src/app/protected/reports/[id]/page.tsx

import { cookies } from 'next/headers';
import { createSupabaseServer } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type PageProps = {
  params: {
    id: string;
  };
};

export default async function ReportDetailPage({ params }: PageProps) {
  const { id } = params;

  // create a server-side supabase client using the Next 16 cookie API
  const cookieStore = await cookies();

  const supabase = await createSupabaseServer({
    get(name: string) {
      return cookieStore.get(name)?.value;
    },
  });

  // TODO: fetch whatever data you actually want for this report
  // example: look up the flagged report + review info
  //
  // const { data, error } = await supabase
  //   .from('review_reports')
  //   .select(
  //     `
  //       report_id:id,
  //       review_id,
  //       reason,
  //       resolved,
  //       reported_at:created_at,
  //       reviews(
  //         id,
  //         rating,
  //         comment,
  //         category,
  //         inserted_at,
  //         clubs(name)
  //       )
  //     `
  //   )
  //   .eq('id', id)
  //   .single();
  //
  // we'll keep it stubbed for now so TypeScript and the build are happy.

  return (
    <main className="p-6 space-y-4">
      <header>
        <h1 className="text-2xl font-semibold text-gray-900">
          Report detail
        </h1>
        <p className="text-gray-500 text-sm">
          Report ID: <code className="font-mono">{id}</code>
        </p>
      </header>

      <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <p className="text-gray-700 text-sm">
          This is a placeholder for the detailed report view.
          You can flesh this out later with the offending review,
          reporter reason, timestamps, and a “Mark resolved” action.
        </p>
      </section>
    </main>
  );
}
