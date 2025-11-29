import { createClientRSC } from "@/lib/supabase/rsc";

export default async function FlaggedReviewsPage() {
  const supabase = createClientRSC();

  const { data } = await supabase
    .from("reviews")
    .select("*")
    .eq("is_flagged", true);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Flagged Reviews</h1>

      {data?.map((review) => (
        <div key={review.id} className="p-6 bg-white border rounded-xl mb-4">
          <p className="font-semibold">{review.rating}★</p>
          <p>{review.comment}</p>
          <p className="text-gray-400 text-sm mt-2">
            {new Date(review.inserted_at).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}
