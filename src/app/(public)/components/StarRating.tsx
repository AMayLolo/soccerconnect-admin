"use client";

import { useState } from "react";
import { Star } from "lucide-react";

type Props = {
  rating: number;
  onChange: (value: number) => void;
};

export function StarRating({ rating, onChange }: Props) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((value) => {
        const isFilled =
          hoverValue !== null ? value <= hoverValue : value <= rating;

        return (
          <Star
            key={value}
            className={`w-6 h-6 cursor-pointer transition ${
              isFilled ? "fill-yellow-400 text-yellow-500" : "text-gray-400"
            }`}
            onMouseEnter={() => setHoverValue(value)}
            onMouseLeave={() => setHoverValue(null)}
            onClick={() => onChange(value)}
          />
        );
      })}
    </div>
  );
}
