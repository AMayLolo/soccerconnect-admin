// src/app/(public)/reviews/submit/page.tsx
import { env } from "@/env.mjs";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ReviewForm } from "./ReviewForm";

export default async function SubmitReviewPage({ 
  searchParams 
}: { 
  searchParams: { club_id?: string } 
}) {
  const cookieStore = await cookies();

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

  if (!session) {
    // Redirect to login with return URL
    redirect(`/login?redirect=/reviews/submit?club_id=${club_id}`);
  }

  return <ReviewForm clubId={club_id} clubName={club?.club_name || "this club"} />;
}
