"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

export default function AdminDashboard() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    async function fetchProfiles() {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, role, club_id, created_at")
        .order("created_at", { ascending: false });

      if (error) console.error("Error loading profiles:", error.message);
      setProfiles(data || []);
      setLoading(false);
    }

    fetchProfiles();
  }, []);

  if (loading)
    return <p className="text-center text-gray-500 mt-8">Loading dashboard...</p>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <table className="min-w-full border border-gray-300 rounded-lg">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left">Name</th>
            <th className="px-4 py-2 text-left">Role</th>
            <th className="px-4 py-2 text-left">Club ID</th>
            <th className="px-4 py-2 text-left">Created</th>
          </tr>
        </thead>
        <tbody>
          {profiles.map((p) => (
            <tr key={p.full_name} className="border-t">
              <td className="px-4 py-2">{p.full_name}</td>
              <td className="px-4 py-2 capitalize">{p.role}</td>
              <td className="px-4 py-2 text-gray-500">{p.club_id ?? "—"}</td>
              <td className="px-4 py-2 text-gray-500">
                {new Date(p.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
