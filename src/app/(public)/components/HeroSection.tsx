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
    <section className="relative pt-24 pb-32 bg-linear-to-br from-[#0d7a9b]/5 via-white to-[#1c3f60]/5 overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-[#0d7a9b]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#1c3f60]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#0d7a9b]/10 text-[#0d7a9b] rounded-full text-sm font-medium mb-6">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          Trusted by youth soccer families nationwide
        </div>

        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-[#1c3f60] leading-tight">
          Find the Right Youth Soccer Club.
        </h1>
        <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
          Discover real parent reviews, compare clubs, and make informed decisions
          for your player's development — all in one place.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mt-12 max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-3 bg-white rounded-xl shadow-lg p-2 border border-gray-200">
            <div className="flex-1 flex items-center gap-3 px-4">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for a club by name..."
                className="flex-1 py-3 text-base border-none focus:outline-none focus:ring-0"
              />
            </div>
            <button
              type="submit"
              className="px-8 py-3 bg-[#0d7a9b] text-white rounded-lg hover:bg-[#0a5f7a] transition-colors font-medium shadow-sm"
            >
              Search
            </button>
          </div>
        </form>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <a 
            href="/clubs"
            className="px-6 py-3 border-2 border-[#0d7a9b] text-[#0d7a9b] rounded-lg hover:bg-[#0d7a9b] hover:text-white transition-colors font-medium"
          >
            Browse All Clubs
          </a>
          <a 
            href="/auth/signup"
            className="px-6 py-3 text-gray-600 hover:text-[#0d7a9b] transition-colors font-medium inline-flex items-center gap-2"
          >
            Leave a Review
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
