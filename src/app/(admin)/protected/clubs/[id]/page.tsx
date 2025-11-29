import { createClientRSC } from "@/lib/supabase/rsc";
import Link from "next/link";

export default async function AdminClubDetail({ params }: { params: Promise<{ id: string }> }) {
  const supabase = createClientRSC();
  const { id: clubId } = await params;

  console.log("=== CLUB DETAIL PAGE ===");
  console.log("Received club ID:", clubId);
  console.log("ID type:", typeof clubId);

  const { data: club, error } = await supabase
    .from("clubs")
    .select("*")
    .eq("id", clubId)
    .single();

  console.log("Club query result:", { club, error, clubId });

  // Get review count
  const { count: reviewCount } = await supabase
    .from("reviews")
    .select("*", { count: "exact", head: true })
    .eq("club_id", clubId);

  if (!club) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center py-12 bg-red-50 rounded-lg border border-red-200">
          <p className="text-red-600 font-semibold mb-2">Club not found</p>
          <p className="text-sm text-red-500">ID: {clubId}</p>
          <p className="text-sm text-red-500">Error: {error?.message || 'No error message'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header with Logo */}
      <div className="mb-8 flex items-start gap-6">
        {(club.badge_logo_url || club.logo_url) && (
          <img
            src={club.badge_logo_url || club.logo_url}
            alt={`${club.club_name} logo`}
            className="w-24 h-24 object-contain border border-gray-200 rounded-lg p-2"
          />
        )}
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{club.club_name}</h1>
          <p className="text-gray-600 text-lg">{club.city}, {club.state}</p>
          {club.competition_level && (
            <p className="text-sm text-gray-500 mt-2">{club.competition_level}</p>
          )}
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500 mb-1">Total Reviews</div>
          <div className="text-3xl font-bold text-[#0d7a9b]">{reviewCount || 0}</div>
        </div>
      </div>

      {/* About Section */}
      {club.about && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">About</h2>
          <p className="text-gray-700 leading-relaxed">{club.about}</p>
        </div>
      )}

      {/* Club Details Grid */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Club Details</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">City</label>
            <p className="mt-1 text-lg text-gray-900">{club.city}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">State</label>
            <p className="mt-1 text-lg text-gray-900">{club.state}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">Website</label>
            <p className="mt-1 text-lg">
              {club.website_url ? (
                <a href={club.website_url} target="_blank" rel="noopener noreferrer" className="text-[#0d7a9b] hover:underline break-all">
                  Visit Website →
                </a>
              ) : (
                <span className="text-gray-400">—</span>
              )}
            </p>
          </div>
          {club.ages && (
            <div>
              <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">Age Groups</label>
              <p className="mt-1 text-lg text-gray-900">{club.ages}</p>
            </div>
          )}
          {club.founded && (
            <div>
              <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">Founded</label>
              <p className="mt-1 text-lg text-gray-900">{club.founded}</p>
            </div>
          )}
          {club.tryout_info_url && (
            <div>
              <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">Tryout Info</label>
              <p className="mt-1 text-lg">
                <a href={club.tryout_info_url} target="_blank" rel="noopener noreferrer" className="text-[#0d7a9b] hover:underline">
                  View Tryouts →
                </a>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Link
          href={`/protected/clubs/${club.id}/update`}
          className="px-4 py-2 bg-[#0d7a9b] text-white rounded-md hover:bg-[#0a5f7a] transition-colors"
        >
          Edit Club
        </Link>
        <Link
          href={`/protected/clubs/${club.id}/reviews`}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
        >
          View Reviews
        </Link>
        <Link
          href="/protected/clubs"
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
        >
          Back to Clubs
        </Link>
      </div>
    </div>
  );
}
