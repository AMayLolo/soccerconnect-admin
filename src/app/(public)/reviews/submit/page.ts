// src/app/(public)/reviews/submit/page.tsx
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { env } from "@/env.mjs";
import { submitReview } from "./action";
import { redirect } from "next/navigation";
import { StarRatingInput } from "@/components/reviews/StarRatingInput";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default async function SubmitReviewPage({ searchParams }) {
  const cookieStore = cookies();

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );

  const club_id = searchParams.club_id;

  if (!club_id) {
    return <p className="text-red-500">Missing club ID.</p>;
  }

  // Fetch club name
  const { data: club } = await supabase
    .from("clubs")
    .select("club_name")
    .eq("id", club_id)
    .single();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect("/auth/login");

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold">Write a Review</h1>
      <p className="text-muted-foreground text-lg">
        For <span className="font-semibold">{club?.club_name}</span>
      </p>

      <form action={submitReview} className="space-y-6">
        <input type="hidden" name="club_id" value={club_id} />

        <div>
          <label className="block font-medium mb-1">Rating</label>
          <StarRatingInput name="rating" />
        </div>

        <div>
          <label className="block font-medium mb-1">Comment</label>
          <Textarea
            name="comment"
            rows={5}
            placeholder="Share your experience…"
            required
          />
        </div>

        <Button type="submit" className="w-full text-lg py-3">
          Submit Review
        </Button>
      </form>
    </div>
  );
}
