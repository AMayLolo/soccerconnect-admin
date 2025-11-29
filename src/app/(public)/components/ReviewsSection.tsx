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
  rating: number | null;
  comment: string | null;
  inserted_at: string;
};

export function ReviewsSection({
  initialReviews,
  clubId,
}: {
  initialReviews: Review[];
  clubId: string;
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
              <SelectValue placeholder="Newest" />
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

      {/* REVIEWS LIST */}
      {sortedReviews.length === 0 ? (
        <p className="text-muted-foreground">No reviews yet.</p>
      ) : (
        <div className="space-y-4">
          {sortedReviews.map((rev) => (
            <div
              key={rev.id}
              className="border rounded-lg p-4 bg-card shadow-sm flex flex-col gap-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm">
                  {rev.reviewer_name || "Anonymous"}
                </span>
                <span className="text-sm text-primary">
                  {rev.rating ?? "—"} ★
                </span>
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
