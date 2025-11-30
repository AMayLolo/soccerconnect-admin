"use client";

import { Badge } from "@/components/ui/badge";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { useEffect, useMemo, useState } from "react";
import { useDebouncedValue } from "../../../../../hooks/useDebouncedValue";

type User = {
  user_id: string;
  full_name: string | null;
  email: string | null;
  approved_role: string | null;
  status: string | null;
  is_banned?: boolean;
  is_suspended?: boolean;
  updated_at: string | null;
  reviewCount: number;
  discussionCount: number;
};

export default function UserManagementClient({
  initialUsers,
}: {
  initialUsers: User[];
}) {
  const supabase = getSupabaseBrowserClient();
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebouncedValue(searchTerm, 300);
  const [filterRole, setFilterRole] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return window.localStorage.getItem("users_filterRole") || "all";
    }
    return "all";
  });
  const [filterStatus, setFilterStatus] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return window.localStorage.getItem("users_filterStatus") || "all";
    }
    return "all";
  });
  const [sortBy, setSortBy] = useState<"name" | "recent" | "reviews" | "discussions">(() => {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem("users_sortBy") as any;
      return saved || "recent";
    }
    return "recent";
  });
  const [activityUserId, setActivityUserId] = useState<string | null>(null);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityError, setActivityError] = useState<string | null>(null);
  const [recentReviews, setRecentReviews] = useState<Array<{ id: string; club_id: string | null; club_name: string | null; rating: number | null; inserted_at: string }>>([]);
  const [recentDiscussions, setRecentDiscussions] = useState<Array<{ id: string; club_id: string | null; club_name: string | null; inserted_at: string }>>([]);
  const [itemsPerPage, setItemsPerPage] = useState<10 | 25 | 50 | 100>(() => {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem("users_itemsPerPage");
      if (saved) return parseInt(saved) as 10 | 25 | 50 | 100;
    }
    return 25;
  });
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("users_itemsPerPage", String(itemsPerPage));
    }
  }, [itemsPerPage]);
  const [currentPage, setCurrentPage] = useState(1);

  // Persist filters & sort selections
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("users_filterRole", filterRole);
    }
  }, [filterRole]);
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("users_filterStatus", filterStatus);
    }
  }, [filterStatus]);
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("users_sortBy", sortBy);
    }
  }, [sortBy]);

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    let filtered = [...users];

    // Search filter
    if (debouncedSearch) {
      filtered = filtered.filter(u =>
        u.full_name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        u.email?.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }

    // Role filter
    if (filterRole !== "all") {
      filtered = filtered.filter(u => u.approved_role === filterRole);
    }

    // Status filter
    if (filterStatus === "banned") {
      filtered = filtered.filter(u => u.is_banned);
    } else if (filterStatus === "suspended") {
      filtered = filtered.filter(u => u.is_suspended);
    } else if (filterStatus === "active") {
      filtered = filtered.filter(u => !u.is_banned && !u.is_suspended);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === "name") {
        return (a.full_name || "").localeCompare(b.full_name || "");
      } else if (sortBy === "recent") {
        const aDate = a.updated_at ? new Date(a.updated_at).getTime() : 0;
        const bDate = b.updated_at ? new Date(b.updated_at).getTime() : 0;
        return bDate - aDate;
      } else if (sortBy === "reviews") {
        return b.reviewCount - a.reviewCount;
      } else if (sortBy === "discussions") {
        return b.discussionCount - a.discussionCount;
      }
      return 0;
    });

    return filtered;
  }, [users, debouncedSearch, filterRole, filterStatus, sortBy]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  function goToPage(page: number) {
    const next = Math.min(Math.max(page, 1), totalPages);
    setCurrentPage(next);
  }

  // Stats
  const stats = useMemo(() => {
    return {
      total: users.length,
      banned: users.filter(u => u.is_banned).length,
      suspended: users.filter(u => u.is_suspended).length,
      active: users.filter(u => !u.is_banned && !u.is_suspended).length,
    };
  }, [users]);

  // User actions
  async function toggleBan(userId: string, currentlyBanned: boolean) {
    const action = currentlyBanned ? "unban" : "ban";
    let reason: string | null = null;
    
    if (!currentlyBanned) {
      reason = prompt("Enter ban reason (optional):");
      if (reason === null) return; // User cancelled
    }
    
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;

    const { error } = await supabase
      .from("profiles")
      .update({ 
        is_banned: !currentlyBanned, 
        banned_at: !currentlyBanned ? new Date().toISOString() : null,
        ban_reason: !currentlyBanned ? reason : null,
        updated_at: new Date().toISOString() 
      })
      .eq("user_id", userId);

    if (error) {
      alert(`Error: ${error.message}`);
      return;
    }

    setUsers(prev => prev.map(u =>
      u.user_id === userId ? { ...u, is_banned: !currentlyBanned } : u
    ));
  }

  async function toggleSuspend(userId: string, currentlySuspended: boolean) {
    const action = currentlySuspended ? "unsuspend" : "suspend";
    let reason: string | null = null;
    
    if (!currentlySuspended) {
      reason = prompt("Enter suspension reason (optional):");
      if (reason === null) return; // User cancelled
    }
    
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;

    const { error } = await supabase
      .from("profiles")
      .update({ 
        is_suspended: !currentlySuspended,
        suspended_at: !currentlySuspended ? new Date().toISOString() : null,
        suspension_reason: !currentlySuspended ? reason : null,
        updated_at: new Date().toISOString() 
      })
      .eq("user_id", userId);

    if (error) {
      alert(`Error: ${error.message}`);
      return;
    }

    setUsers(prev => prev.map(u =>
      u.user_id === userId ? { ...u, is_suspended: !currentlySuspended } : u
    ));
  }

  async function viewUserActivity(userId: string) {
    setActivityUserId(userId);
    setActivityLoading(true);
    setActivityError(null);
    setRecentReviews([]);
    setRecentDiscussions([]);

    // Fetch latest 10 reviews for the user with club names
    const { data: reviewsData, error: reviewsError } = await supabase
      .from("reviews")
      .select(
        `id, rating, inserted_at, club_id, clubs:club_id ( club_name )`
      )
      .eq("user_id", userId)
      .order("inserted_at", { ascending: false })
      .limit(10);

    if (reviewsError) {
      setActivityError(reviewsError.message);
    } else {
      const mapped = (reviewsData || []).map((r: any) => ({
        id: r.id,
        rating: r.rating,
        inserted_at: r.inserted_at,
        club_id: r.club_id ?? null,
        club_name: Array.isArray(r.clubs) && r.clubs.length > 0 ? r.clubs[0]?.club_name : null,
      }));
      setRecentReviews(mapped);
    }

    // Fetch latest 10 discussions for the user with club names
    const { data: discData, error: discError } = await supabase
      .from("discussions")
      .select(
        `id, inserted_at, club_id, clubs:club_id ( club_name )`
      )
      .eq("user_id", userId)
      .order("inserted_at", { ascending: false })
      .limit(10);

    if (discError) {
      setActivityError(discError.message);
    } else {
      const mapped = (discData || []).map((d: any) => ({
        id: d.id,
        inserted_at: d.inserted_at,
        club_id: d.club_id ?? null,
        club_name: Array.isArray(d.clubs) && d.clubs.length > 0 ? d.clubs[0]?.club_name : null,
      }));
      setRecentDiscussions(mapped);
    }

    setActivityLoading(false);
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              // Export filtered users to CSV
              const headers = [
                'User ID','Name','Email','Role','Status','Banned','Suspended','Reviews','Discussions','Updated At'
              ];
              const rows = filteredUsers.map(u => [
                u.user_id,
                u.full_name || '',
                u.email || '',
                u.approved_role || '',
                u.status || '',
                u.is_banned ? 'Yes' : 'No',
                u.is_suspended ? 'Yes' : 'No',
                String(u.reviewCount),
                String(u.discussionCount),
                u.updated_at || ''
              ]);
              const csv = [headers.join(','), ...rows.map(r => r.map(v => {
                const s = String(v);
                if (s.includes(',') || s.includes('"') || s.includes('\n')) {
                  return '"' + s.replace(/"/g, '""') + '"';
                }
                return s;
              }).join(','))].join('\n');
              const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
          >
            📥 Export Users CSV
          </button>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Total Users</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Active</p>
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">⏸️ Suspended</p>
          <p className="text-2xl font-bold text-orange-600">{stats.suspended}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">🚫 Banned</p>
          <p className="text-2xl font-bold text-red-600">{stats.banned}</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0d7a9b]"
            />
          </div>

          {/* Role Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0d7a9b]"
            >
              <option value="all">All Roles</option>
              <option value="site_admin">Site Admin</option>
              <option value="club_admin">Club Admin</option>
              <option value="parent">Parent</option>
              <option value="player">Player</option>
              <option value="staff">Staff</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0d7a9b]"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="banned">Banned</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0d7a9b]"
            >
              <option value="recent">Most Recent</option>
              <option value="name">Name (A-Z)</option>
              <option value="reviews">Most Reviews</option>
              <option value="discussions">Most Discussions</option>
            </select>
          </div>
        </div>

        {/* Results count & per page */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {paginatedUsers.length} of {filteredUsers.length} filtered users
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterRole("all");
                setFilterStatus("all");
                setSortBy("recent");
                setItemsPerPage(25);
                setCurrentPage(1);
                if (typeof window !== "undefined") {
                  localStorage.removeItem("users_filterRole");
                  localStorage.removeItem("users_filterStatus");
                  localStorage.removeItem("users_sortBy");
                  localStorage.removeItem("users_itemsPerPage");
                }
              }}
              className="px-3 py-1 border rounded text-sm hover:bg-gray-100"
            >
              Reset Filters
            </button>
            <label className="text-sm text-gray-700">Per page:</label>
            <select
              value={itemsPerPage}
              onChange={(e) => { setItemsPerPage(parseInt(e.target.value) as any); setCurrentPage(1); }}
              className="px-2 py-1 border border-gray-300 rounded text-sm"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users List */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No users found matching your filters</p>
        </div>
      ) : (
        <>
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedUsers.map((user) => (
                <tr key={user.user_id} className="hover:bg-gray-50">
                  {/* User Info */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {user.full_name || "Anonymous"}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant="secondary" className="text-xs capitalize">
                      {user.approved_role || "none"}
                    </Badge>
                  </td>

                  {/* Activity */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex gap-3">
                      <span title="Reviews">📝 {user.reviewCount}</span>
                      <span title="Discussions">💬 {user.discussionCount}</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.is_banned ? (
                      <Badge variant="destructive" className="text-xs">
                        🚫 Banned
                      </Badge>
                    ) : user.is_suspended ? (
                      <Badge variant="outline" className="text-xs bg-orange-100 border-orange-300">
                        ⏸️ Suspended
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs bg-green-100 border-green-300 text-green-800">
                        ✓ Active
                      </Badge>
                    )}
                  </td>

                  {/* Joined Date */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.updated_at ? new Date(user.updated_at).toLocaleDateString() : 'N/A'}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => viewUserActivity(user.user_id)}
                        className="text-[#0d7a9b] hover:underline"
                      >
                        View
                      </button>
                      <button
                        onClick={() => toggleSuspend(user.user_id, user.is_suspended || false)}
                        className={`hover:underline ${
                          user.is_suspended ? "text-blue-600" : "text-orange-600"
                        }`}
                      >
                        {user.is_suspended ? "Unsuspend" : "Suspend"}
                      </button>
                      <button
                        onClick={() => toggleBan(user.user_id, user.is_banned || false)}
                        className={`hover:underline ${
                          user.is_banned ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {user.is_banned ? "Unban" : "Ban"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>

          {/* Pagination Controls */}
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50"
              >
                First
              </button>
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50"
              >
                Next
              </button>
              <button
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50"
              >
                Last
              </button>
            </div>
          </div>

          {/* Activity Modal */}
          {activityUserId && (
            <div
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={(e) => {
                if (e.target === e.currentTarget) { setActivityUserId(null); setActivityError(null); }
              }}
            >
              <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full overflow-hidden">
                {/* Header */}
                <div className="p-5 border-b flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">User Activity</h2>
                    <p className="text-sm text-gray-600">Recent interactions from this user</p>
                  </div>
                  <button
                    onClick={() => { setActivityUserId(null); setActivityError(null); }}
                    className="inline-flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100 text-gray-600"
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>

                {/* Body */}
                <div className="p-5">
                  {activityLoading ? (
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="animate-spin inline-block w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full" />
                      Loading activity...
                    </div>
                  ) : activityError ? (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded">
                      {activityError}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Reviews column */}
                      <div className="bg-gray-50 rounded-lg p-4 border">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-medium text-gray-900">Recent Reviews</h3>
                          <span className="text-xs px-2 py-1 bg-white border rounded text-gray-700">
                            {recentReviews.length}
                          </span>
                        </div>
                        {recentReviews.length === 0 ? (
                          <p className="text-sm text-gray-500">No recent reviews</p>
                        ) : (
                          <ul className="space-y-2 max-h-64 overflow-y-auto pr-1">
                            {recentReviews.map(r => (
                              <li key={r.id} className="text-sm text-gray-800 flex items-center justify-between">
                                <div className="min-w-0">
                                  <span className="font-medium truncate">{r.club_name || 'Unknown Club'}</span>
                                  {typeof r.rating === 'number' && (
                                    <span className="ml-2 text-yellow-600">{r.rating}★</span>
                                  )}
                                  <span className="ml-2 text-gray-500">{new Date(r.inserted_at).toLocaleDateString()}</span>
                                </div>
                                {r.club_id && (
                                  <a
                                    href={`/protected/clubs/${r.club_id}/reviews`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="ml-2 text-[#0d7a9b] hover:underline whitespace-nowrap"
                                  >
                                    View Thread ↗
                                  </a>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {/* Discussions column */}
                      <div className="bg-gray-50 rounded-lg p-4 border">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-medium text-gray-900">Recent Discussions</h3>
                          <span className="text-xs px-2 py-1 bg-white border rounded text-gray-700">
                            {recentDiscussions.length}
                          </span>
                        </div>
                        {recentDiscussions.length === 0 ? (
                          <p className="text-sm text-gray-500">No recent discussions</p>
                        ) : (
                          <ul className="space-y-2 max-h-64 overflow-y-auto pr-1">
                            {recentDiscussions.map(d => (
                              <li key={d.id} className="text-sm text-gray-800 flex items-center justify-between">
                                <div className="min-w-0">
                                  <span className="font-medium truncate">{d.club_name || 'Unknown Club'}</span>
                                  <span className="ml-2 text-gray-500">{new Date(d.inserted_at).toLocaleDateString()}</span>
                                </div>
                                {d.club_id && (
                                  <a
                                    href={`/protected/clubs/${d.club_id}/reviews`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="ml-2 text-[#0d7a9b] hover:underline whitespace-nowrap"
                                  >
                                    View Thread ↗
                                  </a>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="p-5 border-t bg-gray-50 flex items-center justify-end gap-2">
                  <button
                    onClick={() => { setActivityUserId(null); setActivityError(null); }}
                    className="px-4 py-2 border rounded hover:bg-gray-100"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
          </>
        )}
    </div>
  );
}
