"use client";

import { Badge } from "@/components/ui/badge";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import Link from "next/link";
import { useState, useMemo } from "react";

type Review = {
  id: string;
  content?: string;
  rating: number | null;
  inserted_at: string;
  is_flagged?: boolean;
  is_removed?: boolean;
  flag_reason?: string | null;
  role?: string | null;
  club_id: string;
  parent_id?: string | null;
  clubs: {
    id: string;
    club_name: string;
  } | null;
};

type Stats = {
  total: number;
  flagged: number;
  removed: number;
  avgRating: number;
};

export default function ReviewsModerationClient({
  initialReviews,
  stats,
}: {
  initialReviews: Review[];
  stats: Stats;
}) {
  const supabase = getSupabaseBrowserClient();
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "flagged" | "removed" | "active">("all");
  const [filterRating, setFilterRating] = useState<"all" | "1" | "2" | "3" | "4" | "5">("all");
  const [sortBy, setSortBy] = useState<"recent" | "flagged" | "rating-low" | "rating-high">("recent");

  // Filter and sort reviews
  const filteredReviews = useMemo(() => {
    let filtered = [...reviews];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(r => 
        r.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.clubs?.club_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus === "flagged") {
      filtered = filtered.filter(r => r.is_flagged && !r.is_removed);
    } else if (filterStatus === "removed") {
      filtered = filtered.filter(r => r.is_removed);
    } else if (filterStatus === "active") {
      filtered = filtered.filter(r => !r.is_flagged && !r.is_removed);
    }

    // Filter by rating
    if (filterRating !== "all") {
      filtered = filtered.filter(r => r.rating === parseInt(filterRating));
    }

    // Sort reviews
    filtered.sort((a, b) => {
      if (sortBy === "recent") {
        return new Date(b.inserted_at).getTime() - new Date(a.inserted_at).getTime();
      } else if (sortBy === "flagged") {
        if (a.is_flagged && !b.is_flagged) return -1;
        if (!a.is_flagged && b.is_flagged) return 1;
        return new Date(b.inserted_at).getTime() - new Date(a.inserted_at).getTime();
      } else if (sortBy === "rating-low") {
        return (a.rating || 0) - (b.rating || 0);
      } else if (sortBy === "rating-high") {
        return (b.rating || 0) - (a.rating || 0);
      }
      return 0;
    });

    return filtered;
  }, [reviews, searchTerm, filterStatus, filterRating, sortBy]);

  // Moderation actions
  async function toggleFlag(reviewId: string, currentlyFlagged: boolean) {
    if (!currentlyFlagged) {
      const reason = prompt("Flag reason (visible to admins only)?");
      if (reason === null) return;
      
      await supabase
        .from("reviews")
        .update({ is_flagged: true, flag_reason: reason })
        .eq("id", reviewId);
    } else {
      await supabase
        .from("reviews")
        .update({ is_flagged: false, flag_reason: null })
        .eq("id", reviewId);
    }
    
    // Update local state
    setReviews(prev => prev.map(r => 
      r.id === reviewId 
        ? { ...r, is_flagged: !currentlyFlagged, flag_reason: currentlyFlagged ? null : r.flag_reason }
        : r
    ));
  }

  async function toggleRemove(reviewId: string, currentlyRemoved: boolean) {
    const action = currentlyRemoved ? "restore" : "remove";
    if (!confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} this review?`)) return;

    await supabase
      .from("reviews")
      .update({ is_removed: !currentlyRemoved })
      .eq("id", reviewId);
    
    setReviews(prev => prev.map(r => 
      r.id === reviewId ? { ...r, is_removed: !currentlyRemoved } : r
    ));
  }

  async function deleteReview(reviewId: string) {
    if (!confirm("Permanently delete this review? This cannot be undone.")) return;

    await supabase.from("reviews").delete().eq("id", reviewId);
    setReviews(prev => prev.filter(r => r.id !== reviewId));
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reviews Moderation</h1>
        <p className="text-gray-600">Monitor, flag, and manage all platform reviews</p>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Total Reviews</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">🚩 Flagged</p>
          <p className="text-2xl font-bold text-red-600">{stats.flagged}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Removed</p>
          <p className="text-2xl font-bold text-orange-600">{stats.removed}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Average Rating</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.avgRating.toFixed(1)}★</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search content or club..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0d7a9b]"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0d7a9b]"
            >
              <option value="all">All Reviews</option>
              <option value="flagged">🚩 Flagged Only</option>
              <option value="removed">Removed Only</option>
              <option value="active">Active Only</option>
            </select>
          </div>

          {/* Rating Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0d7a9b]"
            >
              <option value="all">All Ratings</option>
              <option value="5">5★</option>
              <option value="4">4★</option>
              <option value="3">3★</option>
              <option value="2">2★</option>
              <option value="1">1★</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0d7a9b]"
            >
              <option value="recent">Most Recent</option>
              <option value="flagged">Flagged First</option>
              <option value="rating-low">Lowest Rating</option>
              <option value="rating-high">Highest Rating</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredReviews.length} of {reviews.length} reviews
        </div>
      </div>

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No reviews found matching your filters</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div
              key={review.id}
              className={`bg-white border rounded-lg p-6 hover:shadow-md transition-shadow ${
                review.is_flagged && !review.is_removed ? "border-red-300 bg-red-50/30" : ""
              } ${review.is_removed ? "opacity-60" : ""}`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Rating */}
                  {review.rating && (
                    <span className="text-yellow-500 font-semibold text-lg">
                      {review.rating}★
                    </span>
                  )}
                  {!review.rating && review.parent_id && (
                    <Badge variant="outline" className="text-xs">Reply</Badge>
                  )}

                  {/* Club Name */}
                  {review.clubs && (
                    <Link
                      href={`/protected/clubs/${review.club_id}`}
                      className="text-[#0d7a9b] hover:underline font-medium"
                    >
                      {review.clubs.club_name}
                    </Link>
                  )}

                  {/* Role Badge */}
                  {review.role && (
                    <Badge variant="secondary" className="text-xs capitalize">
                      {review.role}
                    </Badge>
                  )}

                  {/* Status Badges */}
                  {review.is_flagged && !review.is_removed && (
                    <Badge variant="destructive" className="text-xs">
                      🚩 Flagged
                    </Badge>
                  )}
                  {review.is_removed && (
                    <Badge variant="outline" className="text-xs bg-orange-100 border-orange-300">
                      Removed
                    </Badge>
                  )}
                </div>

                <span className="text-xs text-gray-500">
                  {new Date(review.inserted_at).toLocaleDateString()}
                </span>
              </div>

              {/* Content */}
              <p className="text-gray-900 mb-3 whitespace-pre-line">
                {review.is_removed ? (
                  <span className="italic text-gray-400">[removed]</span>
                ) : review.content ? (
                  review.content
                ) : (
                  <span className="italic text-gray-400">[No content - rating only]</span>
                )}
              </p>

              {/* Flag Reason */}
              {review.is_flagged && review.flag_reason && (
                <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
                  <strong>Flag reason:</strong> {review.flag_reason}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3 text-xs">
                <Link
                  href={`/protected/clubs/${review.club_id}/reviews`}
                  className="text-[#0d7a9b] hover:underline font-medium"
                >
                  View Thread
                </Link>
                <button
                  onClick={() => toggleFlag(review.id, review.is_flagged || false)}
                  className={`hover:underline font-medium ${
                    review.is_flagged ? "text-green-600" : "text-yellow-600"
                  }`}
                >
                  {review.is_flagged ? "Unflag" : "Flag"}
                </button>
                <button
                  onClick={() => toggleRemove(review.id, review.is_removed || false)}
                  className={`hover:underline font-medium ${
                    review.is_removed ? "text-blue-600" : "text-orange-600"
                  }`}
                >
                  {review.is_removed ? "Restore" : "Remove"}
                </button>
                <button
                  onClick={() => deleteReview(review.id)}
                  className="text-red-600 hover:underline font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
