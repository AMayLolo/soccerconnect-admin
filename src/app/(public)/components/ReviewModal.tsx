"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import { StarRating } from "./StarRating";

export function ReviewModal({ clubId }: { clubId: string }) {
  const supabase = createClientComponentClient();

  const [open, setOpen] = useState(false);
  const [reviewerName, setReviewerName] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);

  async function submitReview() {
    if (rating === 0 || comment.trim().length === 0) return;

    setLoading(true);

    await supabase.from("reviews").insert({
      club_id: clubId,
      reviewer_name: reviewerName || "Anonymous",
      comment,
      rating,
    });

    setLoading(false);
    setOpen(false);

    // Optional: Refresh page
    window.location.reload();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="mt-4">
          Write a Review
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
          <DialogDescription>
            Share your experience with this club.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Name */}
          <Input
            placeholder="Your name (optional)"
            value={reviewerName}
            onChange={(e) => setReviewerName(e.target.value)}
          />

          {/* Rating */}
          <div>
            <p className="text-sm mb-2">Your Rating</p>
            <StarRating rating={rating} onChange={setRating} />
          </div>

          {/* Comment */}
          <Textarea
            placeholder="Write your review..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[120px]"
          />
        </div>

        <DialogFooter>
          <Button onClick={submitReview} disabled={loading || rating === 0}>
            {loading ? "Submitting..." : "Submit Review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
