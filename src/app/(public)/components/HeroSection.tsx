"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HeroSection() {
  const [search, setSearch] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/clubs?q=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <section className="pt-20 pb-32 bg-linear-to-b from-white to-gray-50">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-black">
          Find the Right Youth Soccer Club.
        </h1>
        <p className="mt-6 text-lg text-gray-600">
          Discover real parent reviews, compare clubs, and make informed decisions
          for your player's development — all in one place.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mt-10 max-w-2xl mx-auto">
          <div className="flex gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for a club by name..."
              className="flex-1 px-6 py-4 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
            <button
              type="submit"
              className="px-8 py-4 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors font-medium"
            >
              Search
            </button>
          </div>
        </form>

        <div className="mt-8 flex justify-center gap-4">
          <a 
            href="/clubs"
            className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
          >
            Browse All Clubs
          </a>
          <a 
            href="/auth/signup"
            className="px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors"
          >
            Leave a Review →
          </a>
        </div>
      </div>
    </section>
  );
}
