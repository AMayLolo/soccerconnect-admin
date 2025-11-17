import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { env } from "@/env.mjs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReportReviewButton } from "@/components/reviews/ReportReviewButton";

export default async function ClubPublicPage({ params }: { params: { id: string } }) {
  const cookieStore = cookies();

  // SSR Supabase client
  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );

  const clubId = params.id;

  // -----------------------------
  // FETCH CLUB DATA
  // -----------------------------
  const { data: club } = await supabase
    .from("clubs")
    .select("id, club_name, city, state, about, logo_url")
    .eq("id", clubId)
    .single();

  if (!club) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Club not found.
      </div>
    );
  }

  // -----------------------------
  // FETCH REVIEWS
  // -----------------------------
  const { data: reviews } = await supabase
    .from("reviews")
    .select(
      `id, rating, comment, hidden, flagged, inserted_at, profiles(full_name)`
    )
    .eq("club_id", clubId)
    .order("inserted_at", { ascending: false });

  // -----------------------------
  // SESSION
  // -----------------------------
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return (
    <div className="space-y-10">
      {/* HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-6">
        <div className="flex items-center gap-6">
          {club.logo_url && (
            <img
              src={club.logo_url}
              alt={club.club_name}
              className="h-20 w-20 rounded-lg object-cover border"
            />
          )}

          <div>
            <h1 className="text-4xl font-bold">{club.club_name}</h1>
            <p className="text-muted-foreground">
              {club.city}, {club.state}
            </p>
          </div>
        </div>

        {/* Desktop Write Review */}
        <a
          href={`/reviews/submit?club_id=${club.id}`}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-lg hidden md:inline-block"
        >
          ⭐ Write a Review
        </a>
      </div>

      {/* ABOUT */}
      {club.about && (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-2">About</h2>
            <p className="text-muted-foreground leading-relaxed">{club.about}</p>
          </CardContent>
        </Card>
      )}

      {/* Reviews header + Write Review (desktop) */}
      <div className="flex justify-between items-center pt-10 pb-4">
        <h2 id="reviews" className="text-2xl font-semibold">
          Reviews
        </h2>

        <a
          href={`/reviews/submit?club_id=${club.id}`}
          className="text-primary hover:underline hidden md:inline-block"
        >
          Write a Review
        </a>
      </div>

      {/* REVIEWS LIST */}
      <div className="space-y-6">
        {reviews?.length === 0 && (
          <p className="text-muted-foreground">No reviews yet.</p>
        )}

        {reviews?.map((review) => (
          <Card key={review.id} className="border rounded-lg">
            <CardContent className="p-6 space-y-4">
              {/* Hidden Review Placeholder */}
              {review.hidden ? (
                <p className="italic text-muted-foreground">
                  This review was removed for violating our community guidelines.
                </p>
              ) : (
                <>
                  {/* Reviewer Name + Date */}
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">
                      {review.profiles?.full_name || "Anonymous"}
                    </span>

                    <span className="text-sm text-muted-foreground">
                      {new Date(review.inserted_at).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1 text-yellow-500">
                    {"⭐".repeat(review.rating)}
                  </div>

                  {/* Comment */}
                  <p className="leading-relaxed">{review.comment}</p>
                </>
              )}

              {/* Report Button (only if authenticated) */}
              {!review.hidden && session && (
                <ReportReviewButton
                  reviewId={review.id}
                  token={session.access_token}
                />
              )}

              {!review.hidden && !session && (
                <p className="text-sm text-muted-foreground italic">
                  Login to report inappropriate reviews.
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Mobile Floating FAB */}
      <a
        href={`/reviews/submit?club_id=${club.id}`}
        className="
          fixed bottom-6 right-6 bg-primary text-primary-foreground 
          px-5 py-3 rounded-full shadow-lg text-lg
          md:hidden
        "
      >
        📝 Write Review
      </a>
    </div>
  );
}
