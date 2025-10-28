import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export default async function ClubsPage() {
  const cookieStore = await cookies();

  // ✅ Hybrid syntax: works on all Supabase SSR versions
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => Array.from(cookieStore.getAll()),
        setAll: () => {}, // not needed for read-only
      },
    }
  );

  const { data: clubs, error } = await supabase
    .from("clubs")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching clubs:", error.message);
  }

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Clubs</h1>

      {clubs?.length ? (
        <ul className="divide-y border rounded-lg bg-white">
          {clubs.map((club) => (
            <li key={club.id} className="p-4 hover:bg-gray-50">
              <div className="font-medium">{club.name}</div>
              <div className="text-sm text-gray-500">
                {club.city}, {club.state}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No clubs found.</p>
      )}
    </div>
  );
}
