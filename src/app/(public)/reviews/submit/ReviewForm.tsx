"use client";

import { StarRatingInput } from "@/components/reviews/StarRatingInput";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { submitReview } from "./action";

export function ReviewForm({ clubId, clubName }: { clubId: string; clubName: string }) {
  const [reviewerType, setReviewerType] = useState<string>("");

  const getRatingLabel = () => {
    if (reviewerType === "staff") return "Workplace Rating";
    return "Overall Experience";
  };

  const getPlaceholder = () => {
    if (reviewerType === "staff") {
      return "Share your experience working here... Describe work environment, leadership, compensation, professional development, work-life balance, team culture...";
    }
    return "Share your experience... Describe coaching quality, communication, development opportunities, playing time, cost/value, club culture...";
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold">Write a Review</h1>
      <p className="text-muted-foreground text-lg">
        For <span className="font-semibold">{clubName}</span>
      </p>

      <form action={submitReview} className="space-y-6">
        <input type="hidden" name="club_id" value={clubId} />

        <div>
          <label className="block font-medium mb-2">I am reviewing as a:</label>
          <select 
            name="reviewer_type" 
            value={reviewerType}
            onChange={(e) => setReviewerType(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#0d7a9b] focus:border-transparent"
          >
            <option value="">Select your role...</option>
            <option value="parent">Parent</option>
            <option value="player">Player</option>
            <option value="staff">Staff/Coach</option>
          </select>
          <p className="text-sm text-gray-500 mt-1">
            {reviewerType === "staff" 
              ? "Rating this club as an employer" 
              : "This helps others understand your perspective"}
          </p>
        </div>

        {reviewerType && (
          <>
            <div>
              <label className="block font-medium mb-2">{getRatingLabel()}</label>
              <StarRatingInput name="rating" />
              {reviewerType === "staff" && (
                <p className="text-sm text-gray-500 mt-1">
                  Rate your experience as an employee/coach
                </p>
              )}
            </div>

            <div>
              <label className="block font-medium mb-2">
                {reviewerType === "staff" ? "Your Experience" : "Comment"}
              </label>
              <Textarea
                name="comment"
                rows={6}
                placeholder={getPlaceholder()}
                required
              />
            </div>

            <Button type="submit" className="w-full text-lg py-3">
              Submit Review
            </Button>
          </>
        )}
      </form>
    </div>
  );
}
