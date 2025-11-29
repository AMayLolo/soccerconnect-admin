// src/app/(public)/reviews/submit/page.tsx
import { env } from "@/env.mjs";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ReviewForm } from "./ReviewForm";
import Link from "next/link";

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
        
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-gray-600 mb-6">Browse our clubs directory to find the club you want to review</p>
          <Link 
            href="/clubs"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#0d7a9b] text-white rounded-lg hover:bg-[#0a5f7a] transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Browse Clubs
          </Link>
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
    redirect(`/login?redirect=/reviews/submit?club_id=${club_id}`);
  }

  return <ReviewForm clubId={club_id} clubName={club?.club_name || "this club"} />;
}
