import { getSupabaseServerAdmin } from "@/lib/supabaseServerAdmin";
import { getCurrentUser } from "@/utils/auth";
import { redirect } from "next/navigation";
import AnalyticsClient from "./AnalyticsClient";

export default async function AnalyticsPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/login?redirect=/protected/analytics");
  }

  const supabase = getSupabaseServerAdmin();

  // Fetch analytics data
  const [
    { data: reviews },
    { data: discussions },
    { data: clubs },
  ] = await Promise.all([
    supabase
      .from("reviews")
      .select("id, rating, inserted_at, club_id, clubs:club_id(club_name)")
      .order("inserted_at", { ascending: false })
      .limit(1000), // Last 1000 reviews
    supabase
      .from("discussions")
      .select("id, inserted_at, club_id")
      .order("inserted_at", { ascending: false })
      .limit(1000),
    supabase
      .from("clubs")
      .select("id, club_name, inserted_at, updated_at"),
  ]);

  // Transform reviews data
  const transformedReviews = reviews?.map(r => ({
    ...r,
    clubs: Array.isArray(r.clubs) && r.clubs.length > 0 ? r.clubs[0] : null
  })) || [];

  return (
    <AnalyticsClient 
      reviews={transformedReviews}
      discussions={discussions || []}
      clubs={clubs || []}
    />
  );
}
