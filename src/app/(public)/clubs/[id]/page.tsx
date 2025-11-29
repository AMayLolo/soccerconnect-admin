import { createClientRSC } from "@/lib/supabase/rsc";
import StarRatingDisplay from "../../components/StarRatingDisplay";
import ReviewModal from "../../components/ReviewModal";

export default async function ClubDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClientRSC();
  const clubId = params.id;

  const { data: club } = await supabase
    .from("clubs")
    .select("*")
    .eq("id", clubId)
    .single();

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*")
    .eq("club_id", clubId)
    .order("inserted_at", { ascending: false });

  if (!club) return <div className="p-20">Club not found</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-16 space-y-12">

      <div className="flex items-center gap-6">
        <img
          src={club.badge_logo_url || "/placeholder.png"}
          className="w-24 h-24 object-contain"
        />
        
        <div>
          <h1 className="text-4xl font-bold">{club.club_name}</h1>
          <p className="text-gray-600">
            {club.city}, {club.state}
          </p>
          <StarRatingDisplay value={club.average_rating} />
        </div>
      </div>

      <ReviewModal clubId={club.id} />

      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Recent Reviews</h2>

        {reviews?.map((review) => (
          <div key={review.id} className="border rounded-xl p-6 bg-white">
            <StarRatingDisplay value={review.rating} />
            <p className="text-gray-700 mt-2">{review.comment}</p>
            <p className="text-gray-400 text-xs mt-2">
              {new Date(review.inserted_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
