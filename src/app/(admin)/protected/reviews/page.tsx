import { createClientRSC } from "@/lib/supabase/rsc";

export default async function AdminReviewsPage() {
  const supabase = createClientRSC();

  const { data } = await supabase
    .from("reviews")
    .select("id, comment, rating, inserted_at, club_id");

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">All Reviews</h1>
        <p className="text-gray-600">View and manage all reviews submitted to the platform</p>
      </div>

      {!data || data.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No reviews found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((r) => (
            <div key={r.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <p className="font-semibold text-lg text-gray-900">Rating: {r.rating}★</p>
              </div>
              <p className="text-gray-900 mb-4">{r.comment}</p>
              <p className="text-gray-500 text-sm">
                {new Date(r.inserted_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
