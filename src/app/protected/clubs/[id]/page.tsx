import { createSupabaseServerClient } from "@/utils/supabase/server";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ClubDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();
  const { data: club, error } = await supabase
    .from("clubs")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !club) {
    console.error("Club fetch error:", error);
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text)]">{club.club_name}</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {club.city}, {club.state}
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/protected/clubs"
            className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            ← Back
          </Link>

          <Link
            href={`/protected/clubs/${club.id}/update`}
            className="px-4 py-2 bg-[var(--color-teal)] text-white rounded-md hover:opacity-90 transition"
          >
            Edit Club
          </Link>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-8 items-start">
        {/* Logo */}
        {club.logo_url ? (
          <div className="relative w-40 h-40 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm">
            <Image
              src={club.logo_url}
              alt={`${club.club_name} Logo`}
              fill
              className="object-contain"
            />
          </div>
        ) : (
          <div className="w-40 h-40 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 text-sm">
            No logo
          </div>
        )}

        {/* Details */}
        <div className="flex-1 space-y-3">
          <p>
            <span className="font-semibold">Website:</span>{" "}
            {club.website_url ? (
              <a
                href={club.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-teal)] hover:underline"
              >
                {club.website_url}
              </a>
            ) : (
              "N/A"
            )}
          </p>

          <p>
            <span className="font-semibold">Competition Level:</span>{" "}
            {club.competition_level || "N/A"}
          </p>

          <p>
            <span className="font-semibold">Ages:</span> {club.ages || "N/A"}
          </p>

          <p className="pt-2">
            <span className="font-semibold">About:</span>
          </p>
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
            {club.about || "No description yet."}
          </p>
        </div>
      </div>

      {/* Timestamp */}
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Updated {club.updated_at ? new Date(club.updated_at).toLocaleString() : "N/A"}
      </p>
    </div>
  );
}
