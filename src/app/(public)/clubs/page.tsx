import { createClientRSC } from "@/lib/supabase/rsc";
import Link from "next/link";
import ClubsFilter from "../components/ClubsFilter";
import RecommendClubModal from "../components/RecommendClubModal";

export default async function ClubsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; state?: string }>;
}) {
  const supabase = createClientRSC();
  
  const params = await searchParams;
  const query = params.q || "";
  const stateFilter = params.state || "";

  // Get all unique states for the filter
  const { data: allStates } = await supabase
    .from("clubs")
    .select("state")
    .order("state");

  const states = [...new Set(allStates?.map(c => c.state) || [])];

  // Build the club query
  let clubQuery = supabase
    .from("clubs")
    .select("id, club_name, city, state, badge_logo_url");

  if (query) {
    // Search in both club_name and city
    clubQuery = clubQuery.or(`club_name.ilike.%${query}%,city.ilike.%${query}%`);
  }

  if (stateFilter) {
    clubQuery = clubQuery.eq("state", stateFilter);
  }

    const { data: clubs, error: clubsError } = await clubQuery.order("club_name").limit(500);
  
    if (clubsError) {
      console.error("Error fetching clubs:", clubsError);
    }

  // Group clubs by state if no filter is applied
  const groupedClubs = !stateFilter && !query && clubs
    ? clubs.reduce((acc, club) => {
        if (!acc[club.state]) acc[club.state] = [];
        acc[club.state].push(club);
        return acc;
      }, {} as Record<string, typeof clubs>)
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header Section */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#1c3f60] mb-3">
            Browse Youth Soccer Clubs
          </h1>
          <p className="text-gray-600 text-lg">
            Find and compare clubs across the United States
          </p>
        </div>
        <RecommendClubModal />
      </div>

      {/* Filter & Search */}
      <ClubsFilter 
        states={states} 
        currentState={stateFilter} 
        currentQuery={query}
      />

      {/* Results */}
      <div className="mt-8">
        {clubs && clubs.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-xl">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-700 text-lg mb-1">No clubs match your filters</p>
            <p className="text-gray-500 mb-6">Try clearing filters, or recommend a club and we’ll add it.</p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/clubs" className="text-[#0d7a9b] hover:underline font-medium">
                Clear filters and view all
              </Link>
              <div className="inline-flex">
                <RecommendClubModal />
              </div>
            </div>
          </div>
        ) : groupedClubs ? (
          // Grouped by state view (default)
          <div className="space-y-8">
            {Object.entries(groupedClubs)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([state, stateClubs]) => (
                <div key={state} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-linear-to-r from-[#1c3f60] to-[#0d7a9b] px-6 py-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-white">{state}</h2>
                      <p className="text-white/80 text-sm">{stateClubs.length} club{stateClubs.length !== 1 ? 's' : ''}</p>
                    </div>
                    <Link
                      href={`/clubs?state=${encodeURIComponent(state)}`}
                      className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      View All →
                    </Link>
                  </div>
                  <div className="p-6">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {stateClubs.slice(0, 6).map((club) => (
                        <Link
                          key={club.id}
                          href={`/clubs/${club.id}`}
                          className="group flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                            <img
                              src={club.badge_logo_url || "/placeholder.png"}
                              alt=""
                              className="w-8 h-8 object-contain"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm text-[#1c3f60] group-hover:text-[#0d7a9b] transition-colors truncate">
                              {club.club_name}
                            </h3>
                            <p className="text-xs text-gray-500">{club.city}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                    {stateClubs.length > 6 && (
                      <div className="mt-4 text-center">
                        <Link
                          href={`/clubs?state=${encodeURIComponent(state)}`}
                          className="text-[#0d7a9b] hover:underline text-sm font-medium"
                        >
                          + {stateClubs.length - 6} more clubs in {state}
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          // List view (filtered)
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold text-[#1c3f60]">{clubs?.length || 0}</span> club{clubs?.length !== 1 ? 's' : ''}
                {stateFilter && <> in <span className="font-semibold text-[#0d7a9b]">{stateFilter}</span></>}
                {query && <> matching "<span className="font-semibold text-[#0d7a9b]">{query}</span>"</>}
              </p>
            </div>
            <div className="divide-y divide-gray-200">
              {clubs?.map((club) => (
                <Link
                  key={club.id}
                  href={`/clubs/${club.id}`}
                  className="group flex items-center gap-4 p-5 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                    <img
                      src={club.badge_logo_url || "/placeholder.png"}
                      alt=""
                      className="w-12 h-12 object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[#1c3f60] group-hover:text-[#0d7a9b] transition-colors mb-1">
                      {club.club_name}
                    </h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      {club.city}, {club.state}
                    </p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-[#0d7a9b] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
