import { createClientRSC } from "@/lib/supabase/rsc";

export default async function AdminReviewsPage() {
  const supabase = createClientRSC();

  const { data } = await supabase
    .from("reviews")
    .select("id, comment, rating, inserted_at, club_id");

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">All Reviews</h1>

      <div className="space-y-6">
        {data?.map((r) => (
          <div key={r.id} className="p-6 border-rounded-xl bg-white">
            <p className="font-semibold">Rating: {r.rating}★</p>
            <p>{r.comment}</p>
            <p className="text-gray-400 text-sm">
              {new Date(r.inserted_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
