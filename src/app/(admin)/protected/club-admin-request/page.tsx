"use client";

import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function ClubAdminRequestPage() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();

  const [clubs, setClubs] = useState<any[]>([]);
  const [selectedClub, setSelectedClub] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [user, setUser] = useState<any>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  // -----------------------------
  // AUTH CHECK + FETCH CLUBS
  // -----------------------------
  const init = useCallback(async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Please sign in first");
        router.push("/login");
        return;
      }

      setUser(user);

      const { data, error } = await supabase
        .from("clean_clubs_view")
        .select("id, club_name")
        .order("club_name", { ascending: true });

      if (error) {
        console.error(error);
        toast.error("Failed to load clubs");
      } else {
        setClubs(data || []);
      }

      setLoading(false);
  }, [supabase, router]);

  useEffect(() => {
    const run = async () => {
      await init();
    };
    run();
  }, [init]);

  // -----------------------------
  // SUBMIT REQUEST
  // -----------------------------
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedClub) {
      toast.error("Please select your club");
      return;
    }

    setLoading(true);

    // 1️⃣ Upsert in profiles
    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        user_id: user.id,
        club_id: selectedClub,
        approved_role: "club_admin",
        status: "pending",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    if (profileError) {
      console.error(profileError);
      toast.error("Error saving profile update");
      setLoading(false);
      return;
    }

    // 2️⃣ Insert into club_admin_requests
    const { error: requestError } = await supabase
      .from("club_admin_requests")
      .insert({
        user_id: user.id,
        club_id: selectedClub,
        reason,
        status: "pending",
      });

    if (requestError) {
      console.error(requestError);
      toast.error("Error saving admin request");
      setLoading(false);
      return;
    }

    setLoading(false);
    setSubmitted(true);
    toast.success("Application submitted for review");
  }

  // -----------------------------
  // UI
  // -----------------------------
  if (loading) return <p className="p-6 text-gray-600">Loading...</p>;

  if (submitted)
    return (
      <div className="max-w-lg mx-auto mt-12 border border-green-200 bg-green-50 p-6 rounded-xl shadow-sm text-center">
        <Toaster position="bottom-right" />
        <h2 className="text-2xl font-bold text-green-700 mb-2">
          Application Submitted 🎉
        </h2>
        <p className="text-gray-700 mb-4">
          Thank you, {user?.email}. Your request to become a{" "}
          <strong>Club Admin</strong> for{" "}
          <span className="font-semibold">
            {clubs.find((c) => c.id === selectedClub)?.club_name}
          </span>{" "}
          has been submitted for review.
        </p>
        <button
          onClick={() => router.push("/protected")}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
        >
          Back to Dashboard
        </button>
      </div>
    );

  return (
    <div className="max-w-lg mx-auto mt-10 bg-white p-8 border rounded-xl shadow-sm">
      <Toaster position="bottom-right" />
      <h1 className="text-2xl font-bold mb-4 text-gray-800">
        Club Admin Request Form
      </h1>
      <p className="text-gray-600 mb-6">
        Fill out the form below to request Club Admin access. Your request will
        be reviewed by SoccerConnect administrators.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your Email
          </label>
          <input
            type="email"
            value={user?.email || ""}
            disabled
            className="w-full border-gray-300 rounded-md p-2 bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Your Club
          </label>
          <select
            value={selectedClub}
            onChange={(e) => setSelectedClub(e.target.value)}
            className="w-full border-gray-300 rounded-md p-2"
          >
            <option value="">-- Choose a club --</option>
            {clubs.map((club) => (
              <option key={club.id} value={club.id}>
                {club.club_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reason for Applying
          </label>
          <textarea
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Tell us why you should be a club admin..."
            className="w-full border-gray-300 rounded-md p-2"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-[#0d7a9b] text-white rounded-md hover:bg-[#0a5f7a] transition disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Request"}
        </button>
      </form>
    </div>
  );
}
