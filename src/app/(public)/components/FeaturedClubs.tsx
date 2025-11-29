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
    <section className="max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-[#1c3f60] mb-3">Find Clubs Near You</h2>
        <p className="text-lg text-gray-600">Browse clubs by state or search by name</p>
      </div>

      {/* State Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-10">
        {popularStates.map(({ state, count }) => (
          <Link
            key={state}
            href={`/clubs?state=${encodeURIComponent(state)}`}
            className="group relative overflow-hidden rounded-xl border-2 border-gray-200 bg-white p-5 text-center hover:border-[#0d7a9b] hover:shadow-lg transition-all duration-200"
          >
            <div className="text-2xl font-bold text-[#1c3f60] group-hover:text-[#0d7a9b] transition-colors mb-1">
              {state}
            </div>
            <div className="text-xs text-gray-500 font-medium">
              {count} club{count !== 1 ? 's' : ''}
            </div>
            <div className="absolute inset-0 bg-linear-to-br from-[#0d7a9b]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </Link>
        ))}
      </div>

      {/* Call to Action */}
      <div className="text-center">
        <Link
          href="/clubs"
          className="inline-flex items-center px-8 py-3.5 text-base font-medium text-white bg-[#0d7a9b] rounded-lg hover:bg-[#0a5f7a] transition-colors shadow-md hover:shadow-lg"
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
