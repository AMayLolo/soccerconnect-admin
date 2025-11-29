import { createClientRSC } from "@/lib/supabase/rsc";

export default async function AdminClubDetail({ params }: { params: { id: string } }) {
  const supabase = createClientRSC();
  const clubId = params.id;

  const { data: club } = await supabase
    .from("clubs")
    .select("*")
    .eq("id", clubId)
    .single();

  // Get review count
  const { count: reviewCount } = await supabase
    .from("reviews")
    .select("*", { count: "exact", head: true })
    .eq("club_id", clubId);

  if (!club) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Club not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{club.club_name}</h1>
        <p className="text-gray-600">{club.city}, {club.state}</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="grid md:grid-cols-2 gap-6">
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
                <a href={club.website_url} target="_blank" rel="noopener noreferrer" className="text-[#0d7a9b] hover:underline">
                  {club.website_url}
                </a>
              ) : (
                <span className="text-gray-400">—</span>
              )}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">Reviews</label>
            <p className="mt-1 text-lg text-gray-900">{reviewCount || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
