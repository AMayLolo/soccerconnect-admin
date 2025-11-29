// src/app/(public)/reviews/submit/page.tsx
import { env } from "@/env.mjs";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import ClubPicker from "./ClubPicker";
import { ReviewForm } from "./ReviewForm";

export default async function SubmitReviewPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ club_id?: string }> 
}) {
  const params = await searchParams;
  const cookieStore = await cookies();

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );

  const club_id = params.club_id;

  if (!club_id) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#1c3f60] mb-3">Write a Review</h1>
          <p className="text-gray-600">First, select a club to review</p>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <ClubPicker />
          <div className="text-center mt-6">
            <Link 
              href="/clubs"
              className="inline-flex items-center gap-2 px-4 py-2 text-[#0d7a9b] hover:underline font-medium"
            >
              Or browse all clubs
            </Link>
          </div>
        </div>
      </div>
    );
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

  if (!session) {
    // Redirect to login with return URL
    redirect(`/auth/login?redirect=/reviews/submit?club_id=${club_id}`);
  }

  return <ReviewForm clubId={club_id} clubName={club?.club_name || "this club"} />;
}
