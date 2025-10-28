import { createServerClientInstance } from "@/utils/supabase/server";

export const metadata = {
  title: "Reviews | SoccerConnect Admin",
  description: "Manage submitted club reviews",
};

// Define a type that matches what Supabase returns
type ReviewRecord = {
  id: string;
  rating: number | null;
  comment: string | null;
  created_at: string;
  club: { name: string }[]; // Supabase joins return arrays
  user: { email: string }[];
};

export default async function ReviewsPage() {
  const supabase = await createServerClientInstance();

  const { data: reviews, error } = await supabase
    .from("reviews")
    .select(`
      id,
      rating,
      comment,
      created_at,
      club:clubs(name),
      user:users(email)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching reviews:", error.message);
  }

  const typedReviews = (reviews ?? []) as ReviewRecord[];

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Reviews</h1>

      {!typedReviews.length ? (
        <p className="text-gray-500">No reviews found.</p>
      ) : (
        <ul className="divide-y border rounded-lg bg-white">
          {typedReviews.map((r) => (
            <li key={r.id} className="p-4 hover:bg-gray-50">
              <div className="flex justify-between">
                <div className="font-medium">
                  {/* ✅ Safe lookup with fallback */}
                  {r.club?.[0]?.name ?? "Unknown Club"}
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(r.created_at).toLocaleDateString()}
                </div>
              </div>

              <div className="mt-1 text-gray-700">
                {r.comment || "No comment"}
              </div>

              <div className="mt-2 text-sm text-gray-500">
                ⭐ {r.rating ?? "N/A"} — {r.user?.[0]?.email ?? "Anonymous"}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
