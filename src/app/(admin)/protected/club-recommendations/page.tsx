import { getSupabaseServerAdmin } from "@/lib/supabaseServerAdmin";
import { getCurrentUser } from "@/utils/auth";
import { redirect } from "next/navigation";
import RecommendationsTableClient from "./RecommendationsTableClient";

export default async function ClubRecommendationsPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/login?redirect=/protected/club-recommendations");
  }

  const supabase = getSupabaseServerAdmin();

  // Fetch all pending recommendations
  const { data: recommendations, error } = await supabase
    .from("club_recommendations")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching recommendations:", error);
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Club Recommendations
          </h1>
          <p className="text-red-600">
            Error loading recommendations: {error.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Club Recommendations
        </h1>
        <p className="text-gray-600">
          Review and manage club recommendations from the community
        </p>
      </div>

      <RecommendationsTableClient recommendations={recommendations || []} />
    </div>
  );
}
