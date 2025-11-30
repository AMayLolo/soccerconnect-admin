import { getSupabaseServerAdmin } from "@/lib/supabaseServerAdmin";
import { getCurrentUser } from "@/utils/auth";
import { redirect } from "next/navigation";
import ReviewsModerationClient from "./ReviewsModerationClient";

export default async function AdminReviewsPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/login");
  }

  const supabase = getSupabaseServerAdmin();

  // Fetch all reviews with club information
  const { data: reviews, error } = await supabase
    .from("reviews")
    .select(`
      id,
      rating,
      inserted_at,
      club_id,
      clubs:club_id (
        id,
        club_name
      )
    `)
    .order("inserted_at", { ascending: false });

  if (error) {
    console.error("Error fetching reviews:", error);
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reviews Moderation</h1>
          <p className="text-red-600">
            Error loading reviews: {error.message}
          </p>
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalReviews = reviews?.length || 0;
  const flaggedReviews = 0; // Flagging not available in current schema
  const removedReviews = 0; // Removal not available in current schema
  const avgRating = reviews?.filter(r => r.rating)
    .reduce((sum, r) => sum + (r.rating || 0), 0) / 
    (reviews?.filter(r => r.rating).length || 1);

  return (
    <ReviewsModerationClient 
      initialReviews={reviews || []}
      stats={{
        total: totalReviews,
        flagged: flaggedReviews,
        removed: removedReviews,
        avgRating: avgRating || 0
      }}
    />
  );
}
