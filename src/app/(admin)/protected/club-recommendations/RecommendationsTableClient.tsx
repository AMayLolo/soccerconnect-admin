"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Recommendation = {
  id: number;
  club_name: string;
  city: string;
  state: string;
  website_url?: string;
  additional_info?: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  submitted_by?: string;
};

export default function RecommendationsTableClient({
  recommendations,
}: {
  recommendations: Recommendation[];
}) {
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [processing, setProcessing] = useState<number | null>(null);
  const router = useRouter();

  const filteredRecommendations = recommendations.filter((rec) => {
    if (filter === "all") return true;
    return rec.status === filter;
  });

  const handleUpdateStatus = async (id: number, newStatus: "approved" | "rejected") => {
    setProcessing(id);
    try {
      const response = await fetch("/api/clubs/recommend/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert("Failed to update status");
      }
    } catch (error) {
      alert("An error occurred");
    } finally {
      setProcessing(null);
    }
  };

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
    approved: "bg-green-100 text-green-800 border-green-300",
    rejected: "bg-red-100 text-red-800 border-red-300",
  };

  return (
    <div>
      {/* Filter Tabs */}
      <div className="mb-6 flex gap-2 flex-wrap">
        {(["all", "pending", "approved", "rejected"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === status
                ? "bg-[#0d7a9b] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            <span className="ml-2 text-sm">
              ({recommendations.filter((r) => status === "all" || r.status === status).length})
            </span>
          </button>
        ))}
      </div>

      {/* Recommendations Table */}
      {filteredRecommendations.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No {filter} recommendations</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Club Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Website
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRecommendations.map((rec) => (
                  <tr key={rec.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{rec.club_name}</div>
                      {rec.additional_info && (
                        <div className="text-sm text-gray-500 mt-1">{rec.additional_info}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {rec.city}, {rec.state}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {rec.website_url ? (
                        <a
                          href={rec.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#0d7a9b] hover:underline"
                        >
                          Visit Site
                        </a>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${
                          statusColors[rec.status]
                        }`}
                      >
                        {rec.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(rec.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {rec.status === "pending" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateStatus(rec.id, "approved")}
                            disabled={processing === rec.id}
                            className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(rec.id, "rejected")}
                            disabled={processing === rec.id}
                            className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Reject
                          </button>
                        </div>
                      )}
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
