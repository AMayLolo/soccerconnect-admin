"use client";

import { supabase } from "@/lib/supabase/client";
import { useState } from "react";
import { StarRating } from "./StarRating";

export default function ReviewModal({ clubId }: { clubId: string }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);

  async function submitReview(e: any) {
    e.preventDefault();

    const comment = e.target.comment.value;

    await supabase.from("reviews").insert({
      club_id: clubId,
      rating,
      comment,
    });

    setOpen(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-black text-white rounded-md"
      >
        Write a Review
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
          <form
            onSubmit={submitReview}
            className="bg-white rounded-xl p-6 w-full max-w-md space-y-6"
          >
            <h2 className="text-xl font-semibold">Write a Review</h2>

            <StarRating rating={rating} onChange={setRating} />

            <textarea
              name="comment"
              required
              className="w-full border rounded-md px-3 py-2 h-32"
            />

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="border px-4 py-2 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-black text-white px-4 py-2 rounded-md"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
