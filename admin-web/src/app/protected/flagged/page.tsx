// admin-web/src/app/protected/flagged/page.tsx
import { fetchFlaggedReports } from '../data';
import FlaggedTableClient from './FlaggedTableClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function FlaggedPage() {
  const flaggedRows = await fetchFlaggedReports();

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold text-gray-900">
          Flagged Reviews
        </h1>
        <p className="text-sm text-gray-500">
          Reports that still need moderator review.
        </p>
      </header>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-4">
        <FlaggedTableClient initialRows={flaggedRows} />
      </div>
    </section>
  );
}
