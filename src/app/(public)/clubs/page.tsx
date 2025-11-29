import { createClientRSC } from "@/lib/supabase/rsc";
import Link from "next/link";
import SearchBar from "../components/SearchBar";

export default async function ClubsPage({
  searchParams,
}: {
  searchParams: { q?: string; state?: string };
}) {
  const supabase = createClientRSC();

  const query = searchParams.q || "";
  const stateFilter = searchParams.state || "";

  let clubQuery = supabase
    .from("clubs")
    .select("id, club_name, city, state, badge_logo_url");

  if (query) {
    clubQuery = clubQuery.ilike("club_name", `%${query}%`);
  }

  if (stateFilter) {
    clubQuery = clubQuery.eq("state", stateFilter);
  }

  const { data } = await clubQuery.order("club_name");

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-[#1c3f60] mb-2">Browse Clubs</h1>
        {stateFilter && (
          <p className="text-gray-600">
            Showing clubs in <span className="font-semibold text-[#0d7a9b]">{stateFilter}</span>
            {" · "}
            <Link href="/clubs" className="text-[#0d7a9b] hover:underline font-medium">
              Clear filter
            </Link>
          </p>
        )}
      </div>

      <SearchBar placeholder="Search clubs by name..." />

      {data && data.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-500 text-lg">No clubs found. Try adjusting your search.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {data?.map((club) => (
            <Link
              key={club.id}
              href={`/clubs/${club.id}`}
              className="group border-2 border-gray-200 rounded-xl p-5 bg-white hover:border-[#0d7a9b] hover:shadow-xl transition-all duration-200"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden">
                  <img
                    src={club.badge_logo_url || "/placeholder.png"}
                    alt={`${club.club_name} logo`}
                    className="w-10 h-10 object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-semibold text-[#1c3f60] truncate group-hover:text-[#0d7a9b] transition-colors">
                    {club.club_name}
                  </h2>
                </div>
              </div>
              <p className="text-sm text-gray-500 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                {club.city}, {club.state}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
