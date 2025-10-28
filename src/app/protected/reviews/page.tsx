import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export default async function ReviewsPage() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
      },
    }
  );

  const { data: reviews, error } = await supabase
    .from("reviews")
    .select("*, club:clubs(name), profile:profiles(email)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[ReviewsPage] Supabase error:", error.message);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Reviews</h1>
      {reviews?.length ? (
        <ul className="divide-y rounded-lg border bg-white">
          {reviews.map((r) => (
            <li key={r.id} className="p-4 hover:bg-gray-50">
              <div className="font-medium">{r.club?.name ?? "Unknown Club"}</div>
              <div className="text-sm text-gray-700">{r.text}</div>
              <div className="text-sm text-gray-500">
                {r.profile?.email ?? "Anonymous"}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No reviews found.</p>
      )}
    </div>
  );
}
