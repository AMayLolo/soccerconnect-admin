"use client";

import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { useCallback, useEffect, useState } from "react";

export default function ApprovalsPage() {
  const supabase = getSupabaseBrowserClient();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select(
        `
        user_id,
        display_name,
        requested_role,
        approved_role,
        status,
        inserted_at,
        clubs!inner(id, club_name)
      `
      )
      .eq("status", "pending_review");

    if (!error && data) setRequests(data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    const run = async () => {
      await fetchRequests();
    };
    run();
  }, [fetchRequests]);

  async function handleAction(userId: string, approve: boolean) {
    setMessage("");
    const { error } = await supabase
      .from("profiles")
      .update(
        approve
          ? { approved_role: "club_admin", status: "active" }
          : { approved_role: "parent", status: "rejected" }
      )
      .eq("user_id", userId);

    if (error) {
      setMessage("Error updating role: " + error.message);
    } else {
      setMessage(approve ? "Approved ✅" : "Rejected ❌");
      fetchRequests();
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Club Admin Approvals</h1>
        <p className="text-gray-600">Review and approve club administrator access requests</p>
      </div>
      
      {message && (
        <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200">
          <p className="text-green-700 text-sm font-medium">{message}</p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Loading requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No pending requests 🎉</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Club</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {requests.map((r) => (
                  <tr key={r.user_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{r.display_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{r.clubs?.club_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 capitalize">{r.requested_role}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(r.inserted_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleAction(r.user_id, true)}
                          className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction(r.user_id, false)}
                          className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
