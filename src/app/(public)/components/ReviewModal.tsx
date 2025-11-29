"use client";

import Link from "next/link";

export default function ReviewModal({ clubId }: { clubId: string }) {
  return (
    <Link
      href={`/reviews/submit?club_id=${clubId}`}
      className="px-4 py-2 bg-black text-white rounded-md inline-block hover:bg-gray-800 transition-colors"
    >
      Write a Review
    </Link>
  );
}
