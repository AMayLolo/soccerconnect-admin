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
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Club Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.map((club) => {
                  const isComplete = isClubProfileComplete(club);
                  const completionPercent = getProfileCompletionPercentage(club);
                  
                  return (
                    <tr key={club.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {club.badge_logo_url && (
                            <img
                              src={club.badge_logo_url}
                              alt={`${club.club_name} logo`}
                              className="w-10 h-10 object-contain"
                            />
                          )}
                          <span className="font-medium text-gray-900">{club.club_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {club.city}, {club.state}
                      </td>
                      <td className="px-6 py-4">
                        {isComplete ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-300">
                            ✓ Complete
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-300">
                            {completionPercent}% Complete
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/protected/clubs/${club.id}`}
                          className="text-[#0d7a9b] hover:text-[#0a5f7a] font-medium text-sm"
                        >
                          View Details →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
