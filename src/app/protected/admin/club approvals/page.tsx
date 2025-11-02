"use client";

import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

const SUPER_ADMINS = [
  "abby.lossa@marsh.com",
  "admin@soccerconnectusa.com",
  // Add other authorized emails here
];

export default function ClubApprovalsPage() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();

  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);

  // -----------------------------
  // AUTH CHECK
  // -----------------------------
  const checkAuthorization = useCallback(async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      setAuthorized(false);
      router.push("/login");
      return;
    }

    setCurrentUser(user.email || "Unknown");

    const allowed = user.email && SUPER_ADMINS.includes(user.email);
    if (!allowed) {
      toast.error("Access Denied: Admins Only");
      setAuthorized(false);
      setTimeout(() => router.push("/protected"), 2000);
      return;
    }

    setAuthorized(true);
  }, [supabase, router]);

  // -----------------------------
  // FETCH PENDING CLUB ADMIN REQUESTS
  // -----------------------------
  const fetchRequests = useCallback(async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("club_admin_requests")
      .select(`
        id,
        user_id,
        club_id,
        reason,
        status,
        created_at,
        profiles(full_name),
        clubs(club_name),
        auth_user:auth.users(email)
      `)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      toast.error("Failed to load requests");
    } else {
      setRequests(data || []);
    }

    setLoading(false);
  }, [supabase]);

  // -----------------------------
  // HANDLE APPROVE / REJECT
  // -----------------------------
  async function handleAction(userId: string, requestId: string, approve: boolean) {
    const newStatus = approve ? "active" : "rejected";

    // Update club_admin_requests
    const { error: requestError } = await supabase
      .from("club_admin_requests")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", requestId);

    // Update profiles table
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ status: newStatus })
      .eq("user_id", userId);

    if (requestError || profileError) {
      console.error(requestError || profileError);
      toast.error("Failed to update status");
    } else {
      toast.success(approve ? "✅ Club Admin Approved" : "❌ Club Admin Rejected");
      fetchRequests();
    }
  }

  // -----------------------------
  // EFFECTS
  // -----------------------------
  useEffect(() => {
    const run = async () => {
      await checkAuthorization();
    };
    run();
  }, [checkAuthorization]);

  useEffect(() => {
    if (!authorized) return;
    const run = async () => {
      await fetchRequests();
    };
    run();
  }, [authorized, fetchRequests]);

  // -----------------------------
  // UI
  // -----------------------------
  if (authorized === false)
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-gray-600 text-lg font-medium">Access Denied</p>
        <p className="text-sm text-gray-500 mt-2">
          Only approved super admins can view this page.
        </p>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Toaster position="bottom-right" />
      <h1 className="text-2xl font-bold mb-1">Club Admin Approvals</h1>
      <p className="text-sm text-gray-600 mb-6">
        Logged in as <strong>{currentUser}</strong>
      </p>

      {loading ? (
        <p className="text-gray-500">Loading pending requests...</p>
      ) : requests.length === 0 ? (
        <p className="text-gray-600">🎉 No pending club admin requests.</p>
      ) : (
        <div className="overflow-x-auto border rounded-lg shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Club</th>
                <th className="p-3">Reason</th>
                <th className="p-3">Submitted</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id} className="border-t hover:bg-gray-50 transition-colors">
                  <td className="p-3">{req.profiles?.full_name || "—"}</td>
                  <td className="p-3">{req.auth_user?.email || "—"}</td>
                  <td className="p-3">{req.clubs?.club_name || "—"}</td>
                  <td className="p-3 max-w-xs truncate">
                    {req.reason?.length > 50 ? (
                      <button
                        onClick={() => setSelectedReason(req.reason)}
                        className="text-blue-600 underline hover:text-blue-800"
                      >
                        View
                      </button>
                    ) : (
                      req.reason || "—"
                    )}
                  </td>
                  <td className="p-3">
                    {new Date(req.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-3 text-center space-x-2">
                    <button
                      onClick={() => handleAction(req.user_id, req.id, true)}
                      className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction(req.user_id, req.id, false)}
                      className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedReason && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-lg font-semibold mb-2">Reason for Applying</h2>
            <p className="text-gray-700 whitespace-pre-line mb-4">{selectedReason}</p>
            <button
              onClick={() => setSelectedReason(null)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
