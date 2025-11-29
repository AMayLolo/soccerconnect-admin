// src/components/reviews/ReviewListClient.tsx

"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ReportReviewButton } from "@/components/reviews/ReportReviewButton";

export function ReviewListClient({
  initialReviews,
  initialCursor,
  clubId,
  userToken,
}: {
  initialReviews: any[];
  initialCursor: string | null;
  clubId: string;
  userToken?: string | null;
}) {
  const [reviews, setReviews] = useState(initialReviews);
  const [cursor, setCursor] = useState(initialCursor);
  const [loading, setLoading] = useState(false);
  const [mobile, setMobile] = useState(false);

  // Detect mobile for infinite scroll
  useEffect(() => {
    setMobile(window.innerWidth < 768);
  }, []);

  const loadMore = useCallback(async () => {
    if (!cursor || loading) return;

    setLoading(true);

    const res = await fetch(
      `/api/reviews/list?club_id=${clubId}&cursor=${encodeURIComponent(
        cursor
      )}&limit=10`
    );
    const json = await res.json();

    setReviews((prev) => [...prev, ...json.reviews]);
    setCursor(json.nextCursor);
    setLoading(false);
  }, [cursor, loading, clubId]);

  // Infinite scroll (mobile only)
  useEffect(() => {
    if (!mobile) return;

    const onScroll = () => {
      if (loading || !cursor) return;

      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 300) {
        loadMore();
      }
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [mobile, loading, cursor, loadMore]);

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <Card key={review.id} className="border rounded-lg">
          <CardContent className="p-6 space-y-4">
            {review.hidden ? (
              <p className="italic text-muted-foreground">
                This review was removed for violating our community guidelines.
              </p>
            ) : (
              <>
                {/* Reviewer + Date */}
                <div className="flex items-center justify-between">
                  <span className="font-semibold">
                    {review.profiles?.full_name || "Anonymous"}
                  </span>

                  <span className="text-sm text-muted-foreground">
                    {new Date(review.inserted_at).toLocaleDateString()}
                  </span>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 text-yellow-500">
                  {"⭐".repeat(review.rating)}
                </div>

                <p className="leading-relaxed">{review.comment}</p>
              </>
            )}

            {!review.hidden && userToken && (
              <ReportReviewButton reviewId={review.id} token={userToken} />
            )}
          </CardContent>
        </Card>
      ))}

      {/* Desktop Load More Button */}
      {!mobile && cursor && (
        <button
          onClick={loadMore}
          className="mx-auto block mt-6 bg-primary text-primary-foreground px-5 py-2 rounded-lg"
        >
          {loading ? "Loading…" : "Load More Reviews"}
        </button>
      )}

      {!cursor && (
        <p className="text-center text-muted-foreground py-4">
          No more reviews.
        </p>
      )}
    </div>
  );
}
