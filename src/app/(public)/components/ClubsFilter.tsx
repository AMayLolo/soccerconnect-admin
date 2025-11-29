"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ClubsFilter({
  states,
  currentState,
  currentQuery,
}: {
  states: string[];
  currentState: string;
  currentQuery: string;
}) {
  const [query, setQuery] = useState(currentQuery);
  const [selectedState, setSelectedState] = useState(currentState);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (selectedState) params.set("state", selectedState);
    router.push(`/clubs${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const handleStateChange = (state: string) => {
    setSelectedState(state);
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (state) params.set("state", state);
    router.push(`/clubs${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const clearFilters = () => {
    setQuery("");
    setSelectedState("");
    router.push("/clubs");
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* State Filter */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by State
          </label>
          <select
            value={selectedState}
            onChange={(e) => handleStateChange(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d7a9b] focus:border-transparent"
          >
            <option value="">All States</option>
            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search by Name
          </label>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Club name..."
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d7a9b] focus:border-transparent"
            />
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#0d7a9b] text-white rounded-lg hover:bg-[#0a5f7a] transition-colors font-medium"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Active Filters */}
      {(currentState || currentQuery) && (
        <div className="flex items-center gap-3 pt-2 border-t border-gray-200">
          <span className="text-sm text-gray-600">Active filters:</span>
          <div className="flex flex-wrap gap-2">
            {currentState && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#0d7a9b]/10 text-[#0d7a9b] rounded-full text-sm font-medium">
                State: {currentState}
              </span>
            )}
            {currentQuery && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#0d7a9b]/10 text-[#0d7a9b] rounded-full text-sm font-medium">
                Search: {currentQuery}
              </span>
            )}
          </div>
          <button
            onClick={clearFilters}
            className="ml-auto text-sm text-gray-600 hover:text-[#0d7a9b] font-medium"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
