import { createClientRSC } from "@/lib/supabase/rsc";
import Link from "next/link";

export default async function AdminClubsPage() {
  const supabase = createClientRSC();

  const { data, error } = await supabase
    .from("clubs")
    .select("id, club_name, city, state, badge_logo_url, review_count");

  console.log("Clubs data:", data, "Error:", error);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Clubs</h1>
        <p className="text-gray-600">View and manage all soccer clubs in the directory</p>
      </div>

      {error ? (
        <div className="text-center py-12 bg-red-50 rounded-lg border border-red-200">
          <p className="text-red-600">Error loading clubs: {error.message}</p>
        </div>
      ) : !data || data.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No clubs found</p>
          <Link 
            href="/protected/clubs/new"
            className="mt-4 inline-block px-4 py-2 bg-[#0d7a9b] text-white rounded-md hover:bg-[#0a5f7a] transition-colors"
          >
            Add Your First Club
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((club) => (
            <Link
              key={club.id}
              href={`/protected/clubs/${club.id}`}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              {club.badge_logo_url && (
                <img
                  src={club.badge_logo_url}
                  alt={`${club.club_name} logo`}
                  className="w-16 h-16 mb-4 object-contain"
                />
              )}
              <h2 className="text-lg font-semibold text-gray-900 mb-2">{club.club_name}</h2>
              <p className="text-gray-600 text-sm">
                {club.city}, {club.state}
              </p>
              {club.review_count > 0 && (
                <p className="text-gray-500 text-sm mt-2">
                  {club.review_count} review{club.review_count !== 1 ? 's' : ''}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
