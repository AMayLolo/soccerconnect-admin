"use client";

import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useState } from "react";

type FlaggedReview = {
  id: string;
  rating: number | null;
  inserted_at: string;
  club_id: string;
  clubs: { club_name: string } | null;
};

type FlaggedDiscussion = {
  id: string;
  inserted_at: string;
  club_id: string;
  clubs: { club_name: string } | null;
};

type PendingApproval = {
  user_id: string;
  full_name: string | null;
  requested_role: string | null;
  status: string | null;
  inserted_at: string;
};

export default function NotificationsClient({
  flaggedReviews,
  flaggedDiscussions,
  pendingApprovals,
}: {
  flaggedReviews: FlaggedReview[];
  flaggedDiscussions: FlaggedDiscussion[];
  pendingApprovals: PendingApproval[];
}) {
  const [filter, setFilter] = useState<"all" | "reviews" | "discussions" | "approvals">("all");

  const totalNotifications = flaggedReviews.length + flaggedDiscussions.length + pendingApprovals.length;

  // Combined notifications with type
  const allNotifications = [
    ...flaggedReviews.map(r => ({
      type: "review" as const,
      id: r.id,
      clubName: r.clubs?.club_name || "Unknown Club",
      clubId: r.club_id,
      rating: r.rating,
      time: r.inserted_at,
      message: `Review flagged for moderation`,
      link: `/protected/reviews`,
    })),
    ...flaggedDiscussions.map(d => ({
      type: "discussion" as const,
      id: d.id,
      clubName: d.clubs?.club_name || "Unknown Club",
      clubId: d.club_id,
      time: d.inserted_at,
      message: `Discussion flagged for moderation`,
      link: `/protected/discussions`,
    })),
    ...pendingApprovals.map(a => ({
      type: "approval" as const,
      id: a.user_id,
      userName: a.full_name || "Anonymous",
      requestedRole: a.requested_role || "unknown",
      time: a.inserted_at,
      message: `User requesting ${a.requested_role || "role"} access`,
      link: `/protected/approvals`,
    })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  const filteredNotifications = filter === "all" 
    ? allNotifications
    : allNotifications.filter(n => {
        if (filter === "reviews") return n.type === "review";
        if (filter === "discussions") return n.type === "discussion";
        if (filter === "approvals") return n.type === "approval";
        return true;
      });

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
        <p className="text-gray-600">Items requiring your attention</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Total</p>
          <p className="text-2xl font-bold text-gray-900">{totalNotifications}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">🚩 Flagged Reviews</p>
          <p className="text-2xl font-bold text-yellow-600">{flaggedReviews.length}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">🚩 Flagged Discussions</p>
          <p className="text-2xl font-bold text-purple-600">{flaggedDiscussions.length}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Pending Approvals</p>
          <p className="text-2xl font-bold text-green-600">{pendingApprovals.length}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white border rounded-lg p-4 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              filter === "all"
                ? "bg-[#0d7a9b] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All ({totalNotifications})
          </button>
          <button
            onClick={() => setFilter("reviews")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              filter === "reviews"
                ? "bg-[#0d7a9b] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Reviews ({flaggedReviews.length})
          </button>
          <button
            onClick={() => setFilter("discussions")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              filter === "discussions"
                ? "bg-[#0d7a9b] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Discussions ({flaggedDiscussions.length})
          </button>
          <button
            onClick={() => setFilter("approvals")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              filter === "approvals"
                ? "bg-[#0d7a9b] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Approvals ({pendingApprovals.length})
          </button>
        </div>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <p className="text-gray-500">🎉 No notifications! Everything is up to date.</p>
        </div>
      ) : (
        <div className="bg-white border rounded-lg divide-y">
          {filteredNotifications.map((notification, idx) => (
            <Link
              key={`${notification.type}-${notification.id}-${idx}`}
              href={notification.link}
              className="block p-4 hover:bg-gray-50 transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {notification.type === "review" && (
                      <Badge variant="outline" className="bg-yellow-100 border-yellow-300 text-yellow-800">
                        🚩 Review
                      </Badge>
                    )}
                    {notification.type === "discussion" && (
                      <Badge variant="outline" className="bg-purple-100 border-purple-300 text-purple-800">
                        🚩 Discussion
                      </Badge>
                    )}
                    {notification.type === "approval" && (
                      <Badge variant="outline" className="bg-green-100 border-green-300 text-green-800">
                        Approval
                      </Badge>
                    )}
                    {notification.type === "review" && notification.rating && (
                      <span className="text-xs text-yellow-600 font-medium">
                        {notification.rating}★
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500">
                    {"clubName" in notification && notification.clubName}
                    {"userName" in notification && notification.userName}
                  </p>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                  {new Date(notification.time).toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
