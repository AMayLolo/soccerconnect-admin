import { createClientRSC } from "@/lib/supabase/rsc";
import Link from "next/link";

export default async function FeaturedClubs() {
  const supabase = createClientRSC();

  // Get unique states with club counts
  const { data: states } = await supabase
    .from("clubs")
    .select("state")
    .order("state");

  // Count clubs per state
  const stateCounts = states?.reduce((acc: Record<string, number>, club) => {
    acc[club.state] = (acc[club.state] || 0) + 1;
    return acc;
  }, {});

  // Get popular states (with most clubs)
  const popularStates = Object.entries(stateCounts || {})
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 12)
    .map(([state, count]) => ({ state, count }));

  return (
    <section className="max-w-6xl mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-3">Find Clubs Near You</h2>
        <p className="text-gray-600">Browse clubs by state or search by name</p>
      </div>

      {/* State Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        {popularStates.map(({ state, count }) => (
          <Link
            key={state}
            href={`/clubs?state=${encodeURIComponent(state)}`}
            className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white p-4 text-center hover:border-gray-300 hover:shadow-md transition-all"
          >
            <div className="text-2xl font-bold text-gray-900 mb-1">{state}</div>
            <div className="text-xs text-gray-500">{count} club{count !== 1 ? 's' : ''}</div>
            <div className="absolute inset-0 bg-linear-to-br from-transparent to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </Link>
        ))}
      </div>

      {/* Call to Action */}
      <div className="text-center">
        <Link
          href="/clubs"
          className="inline-flex items-center px-6 py-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400 transition-colors"
        >
          View All Clubs
          <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
