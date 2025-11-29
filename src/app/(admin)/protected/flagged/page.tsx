import { createClientRSC } from "@/lib/supabase/rsc";

export default async function FlaggedReviewsPage() {
  const supabase = createClientRSC();

  const { data } = await supabase
    .from("reviews")
    .select("*")
    .eq("is_flagged", true);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Flagged Reviews</h1>
        <p className="text-gray-600">Review and moderate flagged content from the community</p>
      </div>

      {!data || data.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No flagged reviews at this time 🎉</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((review) => (
            <div key={review.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <p className="font-semibold text-lg text-gray-900">{review.rating}★</p>
                <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full border bg-red-100 text-red-800 border-red-300">
                  Flagged
                </span>
              </div>
              <p className="text-gray-900 mb-4">{review.comment}</p>
              <p className="text-gray-500 text-sm">
                {new Date(review.inserted_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
