"use client";

import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { useCallback, useEffect, useState } from "react";

export default function ProfilePage() {
  const supabase = getSupabaseBrowserClient();

  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [clubId, setClubId] = useState("");
  const [role, setRole] = useState("parent");
  const [clubs, setClubs] = useState<any[]>([]);
  const [statusMessage, setStatusMessage] = useState("");
  const fetchClubs = useCallback(async () => {
    const { data, error } = await supabase
      .from("clubs")
      .select("id, club_name")
      .order("club_name");
    if (!error && data) setClubs(data);
  }, [supabase]);

  const fetchProfile = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!error && data) {
      setDisplayName(data.display_name || "");
      setClubId(data.club_id || "");
      setRole(data.requested_role || "parent");
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    const run = async () => {
      await fetchProfile();
      await fetchClubs();
    };
    run();
  }, [fetchProfile, fetchClubs]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatusMessage("");
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setStatusMessage("You must be signed in.");
      setLoading(false);
      return;
    }

    const status = role === "club_admin" ? "pending_review" : "active";
    const approved_role = role === "club_admin" ? "parent" : role;

    const { error } = await supabase.from("profiles").upsert({
      user_id: user.id,
      display_name: displayName.trim(),
      club_id: clubId || null,
      requested_role: role,
      approved_role,
      status,
    });

    if (error) {
      setStatusMessage("Error saving profile: " + error.message);
    } else {
      setStatusMessage(
        status === "pending_review"
          ? "Submitted! Your Club Admin request is pending approval."
          : "Profile saved successfully."
      );
    }
    setLoading(false);
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold mb-6">Your Profile</h1>
      <p className="text-sm text-gray-600 mb-8">
        Choose your role. Club Admin requests will require manual approval.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">
            Display Name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            className="w-full border rounded px-3 py-2 text-sm"
            placeholder="e.g. Coach Ryan, Parent 2013 Girls"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Associated Club
          </label>
          <select
            value={clubId}
            onChange={(e) => setClubId(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
          >
            <option value="">– Select a Club –</option>
            {clubs.map((c) => (
              <option key={c.id} value={c.id}>
                {c.club_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">I am a...</label>
          <div className="space-y-2">
            {["parent", "staff", "club_admin"].map((r) => (
              <label key={r} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="role"
                  value={r}
                  checked={role === r}
                  onChange={(e) => setRole(e.target.value)}
                />
                <span className="capitalize">
                  {r === "club_admin"
                    ? "Club Admin / Official Rep"
                    : r === "staff"
                    ? "Club Staff / Coach"
                    : "Parent / Guardian"}
                </span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
        >
          {loading ? "Saving..." : "Save Profile"}
        </button>

        {statusMessage && (
          <p
            className={`mt-4 text-sm ${
              statusMessage.includes("Error")
                ? "text-red-600"
                : "text-green-600"
            }`}
          >
            {statusMessage}
          </p>
        )}
      </form>
    </div>
  );
}
