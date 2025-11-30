"use client";

import { getMissingFields, getProfileCompletionPercentage, isClubProfileComplete } from "@/utils/clubProfileCompletion";
import Link from "next/link";
import { useMemo, useState } from "react";

type Club = {
  id: string;
  club_name: string;
  city: string | null;
  state: string | null;
  website_url: string | null;
  ages: string | null;
  competition_level: string | null;
  about: string | null;
  founded: string | null;
  logo_url: string | null;
  badge_logo_url: string | null;
  inserted_at: string;
  updated_at: string | null;
};

export default function ClubsClient({ initialClubs }: { initialClubs: Club[] }) {
  const [clubs] = useState<Club[]>(initialClubs);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "complete" | "incomplete">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Filter and search clubs
  const filteredClubs = useMemo(() => {
    let filtered = [...clubs];

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(club => 
        club.club_name.toLowerCase().includes(search) ||
        club.city?.toLowerCase().includes(search) ||
        club.state?.toLowerCase().includes(search)
      );
    }

    // Status filter
    if (filterStatus === "complete") {
      filtered = filtered.filter(club => isClubProfileComplete(club));
    } else if (filterStatus === "incomplete") {
      filtered = filtered.filter(club => !isClubProfileComplete(club));
    }

    return filtered;
  }, [clubs, searchTerm, filterStatus]);

  // Pagination
  const totalPages = Math.ceil(filteredClubs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedClubs = filteredClubs.slice(startIndex, endIndex);

  // Stats
  const completeClubs = clubs.filter(club => isClubProfileComplete(club));
  const incompleteClubs = clubs.filter(club => !isClubProfileComplete(club));

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, itemsPerPage]);

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white border rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Clubs</label>
            <input
              type="text"
              placeholder="Search by club name, city, or state..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0d7a9b]"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Profile Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0d7a9b]"
            >
              <option value="all">All Clubs</option>
              <option value="complete">Complete Profiles</option>
              <option value="incomplete">Incomplete Profiles</option>
            </select>
        </div>
      </div>

      {/* Results count & controls */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing {paginatedClubs.length} of {filteredClubs.length} clubs
          {searchTerm && ` (filtered from ${clubs.length} total)`}
        </div>
        <button
          onClick={() => {
            setSearchTerm("");
            setFilterStatus("all");
            setItemsPerPage(25);
            setCurrentPage(1);
          }}
          className="px-3 py-1 border rounded text-sm hover:bg-gray-100"
        >
          Reset Filters
        </button>
      </div>
    </div>      {/* Clubs Table */}
      {paginatedClubs.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border">
          <p className="text-gray-500">
            {searchTerm || filterStatus !== "all" 
              ? "No clubs match your search criteria" 
              : "No clubs found"}
          </p>
          {(searchTerm || filterStatus !== "all") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterStatus("all");
              }}
              className="mt-4 text-[#0d7a9b] hover:underline text-sm"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Club Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedClubs.map((club) => {
                    const isComplete = isClubProfileComplete(club);
                    const completionPercent = getProfileCompletionPercentage(club);
                    const missingFields = getMissingFields(club);
                    const detailUrl = `/protected/clubs/${club.id}`;
                    const editUrl = `/protected/clubs/${club.id}/update`;

                    return (
                      <tr key={club.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <Link href={detailUrl} className="flex items-center gap-3 group">
                            <div className="w-10 h-10 shrink-0 flex items-center justify-center">
                              {club.badge_logo_url ? (
                                <img
                                  src={club.badge_logo_url}
                                  alt={`${club.club_name} logo`}
                                  className="w-10 h-10 object-contain"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs font-medium">
                                  {club.club_name.substring(0, 2).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div>
                              <span className="font-medium text-gray-900 group-hover:text-[#0d7a9b] transition-colors block">
                                {club.club_name}
                              </span>
                              {!isComplete && missingFields.length > 0 && (
                                <span className="text-xs text-orange-600 mt-1 block">
                                  Missing: {missingFields.slice(0, 3).join(", ")}
                                  {missingFields.length > 3 && ` +${missingFields.length - 3} more`}
                                </span>
                              )}
                            </div>
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {club.city}, {club.state}
                        </td>
                        <td className="px-6 py-4">
                          {isComplete ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-300">
                              ✓ Complete
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-300">
                              {completionPercent}% Complete
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {!isComplete && (
                              <Link
                                href={editUrl}
                                className="px-3 py-1.5 bg-orange-600 text-white rounded-md hover:bg-orange-700 font-medium text-xs transition"
                              >
                                Quick Edit
                              </Link>
                            )}
                            <Link
                              href={detailUrl}
                              className="text-[#0d7a9b] hover:text-[#0a5f7a] font-medium text-sm"
                            >
                              View Details →
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls */}
          <div className="bg-white border rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Items per page */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700">Show:</label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0d7a9b]"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-sm text-gray-700">per page</span>
              </div>

              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
            </div>

            {/* Page buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                First
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Last
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
