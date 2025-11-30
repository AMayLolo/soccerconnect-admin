"use client";

import { useMemo, useState } from "react";

type Review = {
  id: string;
  rating: number | null;
  inserted_at: string;
  club_id: string;
  clubs: { club_name: string } | null;
};

type Discussion = {
  id: string;
  inserted_at: string;
  club_id: string;
};

type Club = {
  id: string;
  club_name: string;
  inserted_at: string;
  updated_at: string | null;
};

export default function AnalyticsClient({
  reviews,
  discussions,
  clubs,
}: {
  reviews: Review[];
  discussions: Discussion[];
  clubs: Club[];
}) {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "all">("30d");

  // Filter data by time range
  const filteredReviews = useMemo(() => {
    if (timeRange === "all") return reviews;
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return reviews.filter(r => new Date(r.inserted_at) >= cutoff);
  }, [reviews, timeRange]);

  const filteredDiscussions = useMemo(() => {
    if (timeRange === "all") return discussions;
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return discussions.filter(d => new Date(d.inserted_at) >= cutoff);
  }, [discussions, timeRange]);

  // Calculate stats
  const stats = useMemo(() => {
    const avgRating = filteredReviews.filter(r => r.rating)
      .reduce((sum, r) => sum + (r.rating || 0), 0) / 
      (filteredReviews.filter(r => r.rating).length || 1);

    return {
      totalReviews: filteredReviews.length,
      totalDiscussions: filteredDiscussions.length,
      avgRating: avgRating || 0,
      totalClubs: clubs.length,
    };
  }, [filteredReviews, filteredDiscussions, clubs]);

  // Reviews by rating
  const reviewsByRating = useMemo(() => {
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    filteredReviews.forEach(r => {
      if (r.rating && r.rating >= 1 && r.rating <= 5) {
        counts[r.rating]++;
      }
    });
    return counts;
  }, [filteredReviews]);

  // Most reviewed clubs
  const mostReviewedClubs = useMemo(() => {
    const clubCounts: Record<string, { name: string; count: number }> = {};
    filteredReviews.forEach(r => {
      const clubName = r.clubs?.club_name || "Unknown";
      if (!clubCounts[clubName]) {
        clubCounts[clubName] = { name: clubName, count: 0 };
      }
      clubCounts[clubName].count++;
    });
    return Object.values(clubCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [filteredReviews]);

  // Activity trend (by day)
  const activityTrend = useMemo(() => {
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : timeRange === "90d" ? 90 : 365;
    const trendData: { date: string; reviews: number; discussions: number }[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      trendData.push({
        date: dateStr,
        reviews: filteredReviews.filter(r => r.inserted_at.startsWith(dateStr)).length,
        discussions: filteredDiscussions.filter(d => d.inserted_at.startsWith(dateStr)).length,
      });
    }
    
    return trendData;
  }, [filteredReviews, filteredDiscussions, timeRange]);

  const maxActivity = Math.max(...activityTrend.map(d => Math.max(d.reviews, d.discussions)), 1);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Platform insights and trends</p>
        </div>

        {/* Time Range Selector */}
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0d7a9b]"
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Total Reviews</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalReviews}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Total Discussions</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalDiscussions}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Average Rating</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.avgRating.toFixed(1)}★</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Total Clubs</p>
          <p className="text-2xl font-bold text-[#0d7a9b]">{stats.totalClubs}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Activity Trend Chart */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Activity Trend</h3>
          <div className="space-y-2">
            {activityTrend.map((day, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-20">
                  {new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
                <div className="flex-1 flex gap-1">
                  <div
                    className="bg-[#0d7a9b] h-6 rounded transition-all"
                    style={{ width: `${(day.reviews / maxActivity) * 100}%`, minWidth: day.reviews > 0 ? '4px' : '0' }}
                    title={`${day.reviews} reviews`}
                  />
                  <div
                    className="bg-purple-500 h-6 rounded transition-all"
                    style={{ width: `${(day.discussions / maxActivity) * 100}%`, minWidth: day.discussions > 0 ? '4px' : '0' }}
                    title={`${day.discussions} discussions`}
                  />
                </div>
                <span className="text-xs text-gray-600 w-8 text-right">
                  {day.reviews + day.discussions}
                </span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-4 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#0d7a9b] rounded" />
              <span>Reviews</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded" />
              <span>Discussions</span>
            </div>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Rating Distribution</h3>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = reviewsByRating[rating];
              const percentage = stats.totalReviews > 0 
                ? (count / stats.totalReviews * 100).toFixed(0)
                : '0';
              
              return (
                <div key={rating} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700 w-10">{rating}★</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                    <div
                      className="bg-yellow-500 h-full flex items-center justify-end px-2 transition-all"
                      style={{ width: `${percentage}%` }}
                    >
                      {count > 0 && (
                        <span className="text-xs font-medium text-white">{count}</span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-gray-600 w-12 text-right">{percentage}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Most Reviewed Clubs */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Most Reviewed Clubs</h3>
        <div className="space-y-2">
          {mostReviewedClubs.length === 0 ? (
            <p className="text-gray-500 text-sm">No reviews yet</p>
          ) : (
            mostReviewedClubs.map((club, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b last:border-b-0">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-500 w-6">{idx + 1}</span>
                  <span className="text-sm text-gray-900">{club.name}</span>
                </div>
                <span className="text-sm font-medium text-[#0d7a9b]">{club.count} reviews</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
