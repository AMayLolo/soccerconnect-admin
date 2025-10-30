import Link from "next/link";
import { createSupabaseServerClient } from "@/utils/supabase/server";

export default async function ClubsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: clubs, error } = await supabase.from("clean_clubs_view").select("*").order("club_name");

  if (error) console.error(error);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-[var(--color-text)]">All Clubs</h1>
        <Link
          href="/protected/clubs/new"
          className="px-4 py-2 bg-[var(--color-teal)] text-white rounded-md hover:opacity-90 transition"
        >
          + New Club
        </Link>
      </div>

      {(!clubs || clubs.length === 0) && <p>No clubs found.</p>}

      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {clubs?.map((club) => (
          <li key={club.id} className="py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
            <Link href={`/protected/clubs/${club.id}`} className="flex items-center justify-between">
              <span className="font-medium">{club.club_name}</span>
              <span className="text-sm text-gray-500">{club.state}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
