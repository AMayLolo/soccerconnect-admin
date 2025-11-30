"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  name: string;
  onChange?: (value: number) => void;
};

export function StarRatingInput({ name, onChange }: Props) {
  const [rating, setRating] = useState(0);

  return (
    <div className="flex items-center gap-2 text-3xl text-yellow-500">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => {
            setRating(star);
            onChange?.(star);
          }}
          className={cn(
            "transition-transform",
            star <= rating ? "scale-110" : "opacity-40"
          )}
        >
          ⭐
        </button>
      ))}

      {/* Hidden input for server action */}
      <input type="hidden" name={name} value={rating} />
    </div>
  );
}
