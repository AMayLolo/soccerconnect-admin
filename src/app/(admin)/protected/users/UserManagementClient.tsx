"use client";

import { Badge } from "@/components/ui/badge";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { useMemo, useState } from "react";

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
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "recent" | "reviews" | "discussions">("recent");

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    let filtered = [...users];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(u =>
        u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
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
  }, [users, searchTerm, filterRole, filterStatus, sortBy]);

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
    // TODO: Navigate to user activity detail page or open modal
    alert(`View activity for user ${userId} - Feature coming soon!`);
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
        <p className="text-gray-600">Monitor and manage platform users</p>
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

        {/* Results count */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>

      {/* Users List */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No users found matching your filters</p>
        </div>
      ) : (
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
              {filteredUsers.map((user) => (
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
      )}
    </div>
  );
}
