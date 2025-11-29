import Image from "next/image";
import Link from "next/link";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export default async function FeaturedClubs() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );

  const { data } = await supabase
    .from("clubs")
    .select("id, club_name, city, state, badge_logo_url, review_count, avg_rating")
    .order("review_count", { ascending: false })
    .limit(6);

  return (
    <section className="max-w-6xl mx-auto px-4">
      <h2 className="text-2xl font-semibold text-center mb-10">
        Featured Clubs
      </h2>

      <div className="grid md:grid-cols-3 gap-8">
        {data?.map((club) => (
          <Link
            key={club.id}
            href={`/clubs/${club.id}`}
            className="border rounded-xl p-6 hover:shadow-lg transition"
          >
            <div className="flex justify-center mb-4">
              <Image
                src={club.badge_logo_url || "/placeholder.png"}
                width={80}
                height={80}
                alt={club.club_name}
                className="rounded-md"
              />
            </div>

            <h3 className="font-semibold text-lg text-center">{club.club_name}</h3>

            <p className="text-gray-600 text-sm text-center">
              {club.city}, {club.state}
            </p>

            <p className="text-center text-sm mt-2 text-gray-800">
              ⭐ {club.avg_rating?.toFixed(1) || "—"}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
