import { createClientRSC } from "@/lib/supabase/rsc";
import Link from "next/link";

export default async function FeaturedClubs() {
  const supabase = createClientRSC();

  const { data } = await supabase
    .from("clubs")
    .select("id, club_name, city, state, badge_logo_url, review_count")
    .order("review_count", { ascending: false })
    .limit(6);

  return (
    <section className="max-w-6xl mx-auto px-4">
      <h2 className="text-3xl font-semibold mb-8">Top Rated Clubs</h2>

      <div className="grid md:grid-cols-3 gap-8">
        {data?.map((club) => (
          <Link
            key={club.id}
            href={`/clubs/${club.id}`}
            className="border rounded-xl p-6 hover:shadow-md transition bg-white"
          >
            <img
              src={club.badge_logo_url || "/placeholder.png"}
              className="w-16 h-16 object-contain mb-4"
            />

            <h3 className="text-lg font-semibold">{club.club_name}</h3>
            <p className="text-gray-500 text-sm">
              {club.city}, {club.state}
            </p>

            <p className="mt-4 text-gray-800 font-medium">
              ⭐ {club.review_count} reviews
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
