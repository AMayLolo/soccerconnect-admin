"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useMemo, useState } from "react";
import ReviewModal from "./ReviewModal";

type Review = {
  id: string;
  reviewer_name: string | null;
  reviewer_type: string | null;
  rating: number | null;
  comment: string | null;
  inserted_at: string;
};

export function ReviewsSection({
  initialReviews,
  clubId,
  loading = false,
}: {
  initialReviews: Review[];
  clubId: string;
  loading?: boolean;
}) {
  const [sort, setSort] = useState("newest");

  const sortedReviews = useMemo(() => {
    const reviews = [...initialReviews];

    if (sort === "newest") {
      return reviews.sort(
        (a, b) =>
          new Date(b.inserted_at).getTime() -
          new Date(a.inserted_at).getTime()
      );
    }

    if (sort === "highest") {
      return reviews.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    if (sort === "lowest") {
      return reviews.sort((a, b) => (a.rating || 0) - (b.rating || 0));
    }

    return reviews;
  }, [sort, initialReviews]);

  // Calculate separate averages
  const ratingStats = useMemo(() => {
    const memberReviews = initialReviews.filter(r => 
      r.reviewer_type === 'parent' || r.reviewer_type === 'player'
    );
    const staffReviews = initialReviews.filter(r => 
      r.reviewer_type === 'staff'
    );

    const memberAvg = memberReviews.length > 0
      ? memberReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / memberReviews.length
      : null;

    const staffAvg = staffReviews.length > 0
      ? staffReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / staffReviews.length
      : null;

    return {
      memberAvg,
      memberCount: memberReviews.length,
      staffAvg,
      staffCount: staffReviews.length,
    };
  }, [initialReviews]);

  return (
    <div className="space-y-6">
      {/* HEADER + SORTING + WRITE BUTTON */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">Reviews</h2>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort by:</span>

          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="highest">Highest Rated</SelectItem>
              <SelectItem value="lowest">Lowest Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Write Review */}
        <ReviewModal clubId={clubId} />
      </div>

      {/* RATING SUMMARY */}
      {!loading && initialReviews.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          {ratingStats.memberAvg !== null && (
            <div className="border rounded-lg p-4 bg-linear-to-br from-[#0d7a9b]/5 to-transparent">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[#1c3f60]">Member Experience</span>
                <span className="text-xs text-gray-500">Parents & Players</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-[#0d7a9b]">
                  {ratingStats.memberAvg.toFixed(1)}
                </span>
                <span className="text-lg text-gray-400">★</span>
                <span className="text-sm text-gray-500">
                  ({ratingStats.memberCount} {ratingStats.memberCount === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            </div>
          )}
          
          {ratingStats.staffAvg !== null && (
            <div className="border rounded-lg p-4 bg-linear-to-br from-[#1c3f60]/5 to-transparent">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[#1c3f60]">Workplace Rating</span>
                <span className="text-xs text-gray-500">Staff & Coaches</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-[#1c3f60]">
                  {ratingStats.staffAvg.toFixed(1)}
                </span>
                <span className="text-lg text-gray-400">★</span>
                <span className="text-sm text-gray-500">
                  ({ratingStats.staffCount} {ratingStats.staffCount === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* REVIEWS LIST */}
      {loading ? (
        <div className="space-y-4" aria-label="Loading reviews">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="border rounded-lg p-4 bg-card shadow-sm animate-pulse flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <div className="h-3 w-24 bg-muted rounded" />
                <div className="h-3 w-10 bg-muted rounded" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full bg-muted rounded" />
                <div className="h-3 w-5/6 bg-muted rounded" />
                <div className="h-3 w-3/5 bg-muted rounded" />
              </div>
              <div className="h-2 w-20 bg-muted rounded" />
            </div>
          ))}
        </div>
      ) : sortedReviews.length === 0 ? (
        <p className="text-muted-foreground">No reviews yet.</p>
      ) : (
        <div className="space-y-4">
          {sortedReviews.map((rev) => (
            <div
              key={rev.id}
              className="border rounded-lg p-4 bg-card shadow-sm flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">
                    {rev.reviewer_name || "Anonymous"}
                  </span>
                  {rev.reviewer_type && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#0d7a9b]/10 text-[#0d7a9b] font-medium">
                      {rev.reviewer_type === 'parent' ? 'Parent' : 
                       rev.reviewer_type === 'player' ? 'Player' : 
                       rev.reviewer_type === 'staff' ? 'Staff' : rev.reviewer_type}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-primary font-medium">
                    {rev.rating ?? "—"} ★
                  </span>
                  {rev.reviewer_type === 'staff' && (
                    <span className="text-xs text-muted-foreground">
                      (workplace)
                    </span>
                  )}
                </div>
              </div>

              <p className="text-sm leading-normal">{rev.comment}</p>

              <span className="text-xs text-muted-foreground pt-1">
                {new Date(rev.inserted_at).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
