import { createClientRSC } from "@/lib/supabase/rsc";
import { isClubProfileComplete, getProfileCompletionPercentage } from "@/utils/clubProfileCompletion";
import Link from "next/link";

export default async function AdminClubsPage() {
  const supabase = createClientRSC();

  const { data, error } = await supabase
    .from("clubs")
    .select("*");

  const completeClubs = data?.filter(club => isClubProfileComplete(club)) ?? [];
  const incompleteClubs = data?.filter(club => !isClubProfileComplete(club)) ?? [];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Clubs</h1>
        <p className="text-gray-600">View and manage all soccer clubs in the directory</p>
        
        {/* Stats Summary */}
        <div className="mt-4 flex gap-4">
          <div className="px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
            <span className="text-sm font-medium text-green-700">{completeClubs.length} Complete Profiles</span>
          </div>
          <div className="px-4 py-2 bg-orange-50 border border-orange-200 rounded-lg">
            <span className="text-sm font-medium text-orange-700">{incompleteClubs.length} Incomplete Profiles</span>
          </div>
        </div>
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
          {data.map((club) => {
            const isComplete = isClubProfileComplete(club);
            const completionPercent = getProfileCompletionPercentage(club);
            
            return (
              <Link
                key={club.id}
                href={`/protected/clubs/${club.id}`}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow relative"
              >
                {/* Completion Badge */}
                <div className="absolute top-4 right-4">
                  {isComplete ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-300">
                      ✓ Complete
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-300">
                      {completionPercent}%
                    </span>
                  )}
                </div>

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
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
