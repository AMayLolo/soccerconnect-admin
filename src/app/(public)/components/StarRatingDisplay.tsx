import { Star } from "lucide-react";

export function StarRatingDisplay({ rating }: { rating: number }) {
  const fullStars = Math.round(rating);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          className={`w-5 h-5 ${
            value <= fullStars
              ? "fill-yellow-400 text-yellow-500"
              : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
}
