"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function ClubsPage() {
  const [clubs, setClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchClubs() {
      try {
        const { data, error } = await supabase
          .from("clubs")
          .select("id, club_name, city, state, logo_url");

        if (error) {
          console.error("🛑 Supabase SELECT error:", error);
          setClubs([]);
        } else {
          console.log("✅ Clubs data fetched:", data);
          setClubs(data || []);
        }
      } catch (err) {
        console.error("💥 Unexpected fetch error:", err);
        setClubs([]);
      } finally {
        setLoading(false);
      }
    }

    fetchClubs();
  }, [supabase]);

  if (loading) {
    return (
      <div className="text-gray-500 text-sm py-8 text-center">
        Loading clubs...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Clubs Directory
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
          Manage, review, and update all registered soccer clubs.
        </p>
      </div>

      {/* Filter + Add button */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <select className="border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-sm bg-white dark:bg-gray-800">
          <option>All Cities</option>
          {/* Future dynamic options */}
        </select>

        <Link
          href="/protected/clubs/new"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-4 py-2 rounded-lg transition"
        >
          <span className="text-lg leading-none">+</span>
          New Club
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 font-medium">Logo</th>
              <th className="px-4 py-3 font-medium">Club Name</th>
              <th className="px-4 py-3 font-medium">City</th>
              <th className="px-4 py-3 font-medium">State</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {clubs.length > 0 ? (
              clubs.map((club) => (
                <tr
                  key={club.id}
                  onClick={() =>
                    (window.location.href = `/protected/clubs/${club.id}`)
                  }
                  className="hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer transition"
                >
                  {/* Logo */}
                  <td className="px-4 py-3">
                    {club.logo_url ? (
                      <img
                        src={club.logo_url}
                        alt={club.club_name}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-400 text-xs">N/A</span>
                    )}
                  </td>

                  {/* Club Name */}
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                    {club.club_name || "N/A"}
                  </td>

                  {/* City */}
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    {club.city || "—"}
                  </td>

                  {/* State */}
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    {club.state || "—"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                >
                  No clubs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
