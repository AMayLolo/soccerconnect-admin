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
        <h1 className="text-3xl font-semibold mb-2">Browse Clubs</h1>
        {stateFilter && (
          <p className="text-gray-600">
            Showing clubs in <span className="font-semibold">{stateFilter}</span>
            {" · "}
            <Link href="/clubs" className="text-blue-600 hover:underline">
              Clear filter
            </Link>
          </p>
        )}
      </div>

      <SearchBar placeholder="Search clubs by name..." />

      {data && data.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No clubs found. Try adjusting your search.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {data?.map((club) => (
            <Link
              key={club.id}
              href={`/clubs/${club.id}`}
              className="group border rounded-lg p-5 bg-white hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={club.badge_logo_url || "/placeholder.png"}
                  alt={`${club.club_name} logo`}
                  className="w-12 h-12 object-contain"
                />
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                    {club.club_name}
                  </h2>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                {club.city}, {club.state}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
