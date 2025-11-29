import { createClientRSC } from "@/lib/supabase/rsc";
import Link from "next/link";
import SearchBar from "../components/SearchBar";

export default async function ClubsPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const supabase = createClientRSC();

  const query = searchParams.q || "";

  const { data } = await supabase
    .from("clubs")
    .select("id, club_name, city, state, badge_logo_url")
    .ilike("club_name", `%${query}%`)
    .order("club_name");

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">
      <h1 className="text-3xl font-semibold">Browse Clubs</h1>

      <SearchBar placeholder="Search clubs..." />

      <div className="grid md:grid-cols-3 gap-8">
        {data?.map((club) => (
          <Link
            key={club.id}
            href={`/clubs/${club.id}`}
            className="border rounded-xl p-6 bg-white hover:shadow-md transition"
          >
            <img
              src={club.badge_logo_url || "/placeholder.png"}
              className="w-16 h-16 object-contain mb-4"
            />

            <h2 className="text-lg font-semibold">{club.club_name}</h2>
            <p className="text-gray-500 text-sm">
              {club.city}, {club.state}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
