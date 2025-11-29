import { createClientRSC } from "@/lib/supabase/rsc";
import Link from "next/link";

export default async function AdminClubsPage() {
  const supabase = createClientRSC();

  const { data } = await supabase
    .from("clubs")
    .select("id, club_name, city, state, badge_logo_url, review_count");

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Manage Clubs</h1>

      <div className="grid md:grid-cols-3 gap-8">
        {data?.map((club) => (
          <Link
            key={club.id}
            href={`/admin/protected/clubs/${club.id}`}
            className="p-6 bg-white border rounded-xl hover:shadow-md transition"
          >
            <img
              src={club.badge_logo_url || "/placeholder.png"}
              className="w-16 h-16 mb-4"
            />
            <h2 className="text-lg font-semibold">{club.club_name}</h2>
            <p className="text-gray-500">
              {club.city}, {club.state}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
