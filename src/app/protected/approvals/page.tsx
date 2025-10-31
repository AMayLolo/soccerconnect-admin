"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useCallback, useEffect, useState } from "react";

export default function ApprovalsPage() {
  const supabase = createClientComponentClient();
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
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold mb-6">Club Admin Approvals</h1>
      {message && <p className="text-green-600 mb-4 text-sm">{message}</p>}

      {loading ? (
        <p>Loading…</p>
      ) : requests.length === 0 ? (
        <p className="text-gray-600">No pending requests 🎉</p>
      ) : (
        <table className="w-full text-sm border rounded-lg overflow-hidden">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Club</th>
              <th className="p-3">Requested</th>
              <th className="p-3">Date</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.user_id} className="border-t hover:bg-gray-50">
                <td className="p-3">{r.display_name}</td>
                <td className="p-3">{r.clubs?.club_name}</td>
                <td className="p-3 capitalize">{r.requested_role}</td>
                <td className="p-3">
                  {new Date(r.inserted_at).toLocaleDateString()}
                </td>
                <td className="p-3 text-center space-x-2">
                  <button
                    onClick={() => handleAction(r.user_id, true)}
                    className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction(r.user_id, false)}
                    className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
