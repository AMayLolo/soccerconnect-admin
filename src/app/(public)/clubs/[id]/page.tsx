import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import Image from "next/image";
import { ReviewModal } from "../../components/ReviewModal";
import { StarRatingDisplay } from "../../components/StarRatingDisplay";
import { ReviewsSection } from "../../components/ReviewsSection";

/* -----------------------------------------
   TYPES
----------------------------------------- */

type Club = {
  id: string;
  club_name: string;
  city: string | null;
  state: string | null;
  competition_level: string | null;
  badge_logo_url: string | null;
  website_url: string | null;
  tryout_info_url: string | null;
  about: string | null;
};

type Review = {
  id: string;
  reviewer_name: string | null;
  rating: number | null;
  comment: string | null;
  inserted_at: string;
};

/* -----------------------------------------
   MAIN PAGE (SERVER COMPONENT)
----------------------------------------- */

export default async function ClubDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: { get: (name) => cookieStore.get(name)?.value },
    }
  );

  /* FETCH CLUB */
  const { data: clubData } = await supabase
    .from("clubs")
    .select(
      "id, club_name, city, state, competition_level, badge_logo_url, website_url, tryout_info_url, about"
    )
    .eq("id", params.id)
    .single();

  const club = clubData as Club | null;

  if (!club) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-semibold">Club not found</h1>
      </div>
    );
  }

  /* FETCH REVIEWS */
  const { data: reviewsRaw } = await supabase
    .from("reviews")
    .select("id, reviewer_name, rating, comment, inserted_at")
    .eq("club_id", params.id)
    .eq("is_removed", false);

  const reviews: Review[] = (reviewsRaw || []) as Review[];

  /* AVERAGE RATING */
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
      : 0;

  return (
    <div className="space-y-12">
      {/* CLUB HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        <Image
          src={club.badge_logo_url || "/placeholder.png"}
          width={110}
          height={110}
          alt={club.club_name}
          className="rounded-md object-cover shadow"
        />

        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight">
            {club.club_name}
          </h1>

          <p className="text-muted-foreground text-lg">
            {club.city}, {club.state}
          </p>

          {/* ⭐ AVERAGE RATING */}
          <div className="flex items-center gap-3">
            <StarRatingDisplay rating={averageRating} />
            {reviews.length > 0 ? (
              <span className="text-sm text-muted-foreground">
                {averageRating.toFixed(1)} ({reviews.length} reviews)
              </span>
            ) : (
              <span className="text-sm text-muted-foreground">
                No reviews yet
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            {club.website_url && (
              <a
                href={club.website_url}
                target="_blank"
                className="text-sm underline text-primary"
              >
                Visit Website
              </a>
            )}

            {club.tryout_info_url && (
              <a
                href={club.tryout_info_url}
                target="_blank"
                className="text-sm underline text-primary"
              >
                Tryout Information
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ABOUT */}
      <div>
        <h2 className="text-xl font-semibold mb-3">About</h2>
        <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
          {club.about || "No information available."}
        </p>
      </div>

      {/* REVIEWS (Client Component) */}
      <ReviewsSection initialReviews={reviews} clubId={club.id} />
    </div>
  );
}
