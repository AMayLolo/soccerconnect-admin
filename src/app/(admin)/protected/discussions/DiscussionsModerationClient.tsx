"use client";

import { Badge } from "@/components/ui/badge";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import Link from "next/link";
import { useMemo, useState } from "react";

type Discussion = {
  id: string;
  content?: string;
  inserted_at: string;
  is_flagged?: boolean;
  is_removed?: boolean;
  flag_reason?: string | null;
  role?: string | null;
  club_id: string;
  parent_id?: string | null;
  clubs: {
    id: string;
    club_name: string;
  } | null;
};

type Stats = {
  total: number;
  flagged: number;
  removed: number;
};

export default function DiscussionsModerationClient({
  initialDiscussions,
  stats,
}: {
  initialDiscussions: Discussion[];
  stats: Stats;
}) {
  const supabase = getSupabaseBrowserClient();
  const [discussions, setDiscussions] = useState<Discussion[]>(initialDiscussions);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "flagged" | "removed" | "active">("all");
  const [sortBy, setSortBy] = useState<"recent" | "flagged">("recent");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Filter and sort discussions
  const filteredDiscussions = useMemo(() => {
    let filtered = [...discussions];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(d => 
        d.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.clubs?.club_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus === "flagged") {
      filtered = filtered.filter(d => d.is_flagged && !d.is_removed);
    } else if (filterStatus === "removed") {
      filtered = filtered.filter(d => d.is_removed);
    } else if (filterStatus === "active") {
      filtered = filtered.filter(d => !d.is_flagged && !d.is_removed);
    }

    // Sort discussions
    filtered.sort((a, b) => {
      if (sortBy === "recent") {
        return new Date(b.inserted_at).getTime() - new Date(a.inserted_at).getTime();
      } else if (sortBy === "flagged") {
        if (a.is_flagged && !b.is_flagged) return -1;
        if (!a.is_flagged && b.is_flagged) return 1;
        return new Date(b.inserted_at).getTime() - new Date(a.inserted_at).getTime();
      }
      return 0;
    });

    return filtered;
  }, [discussions, searchTerm, filterStatus, sortBy]);

  // Moderation actions
  async function toggleFlag(discussionId: string, currentlyFlagged: boolean) {
    if (!currentlyFlagged) {
      const reason = prompt("Flag reason (visible to admins only)?");
      if (reason === null) return;
      
      await supabase
        .from("discussions")
        .update({ is_flagged: true, flag_reason: reason })
        .eq("id", discussionId);
    } else {
      await supabase
        .from("discussions")
        .update({ is_flagged: false, flag_reason: null })
        .eq("id", discussionId);
    }
    
    setDiscussions(prev => prev.map(d => 
      d.id === discussionId 
        ? { ...d, is_flagged: !currentlyFlagged, flag_reason: currentlyFlagged ? null : d.flag_reason }
        : d
    ));
  }

  async function toggleRemove(discussionId: string, currentlyRemoved: boolean) {
    const action = currentlyRemoved ? "restore" : "remove";
    if (!confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} this discussion?`)) return;

    await supabase
      .from("discussions")
      .update({ is_removed: !currentlyRemoved })
      .eq("id", discussionId);
    
    setDiscussions(prev => prev.map(d => 
      d.id === discussionId ? { ...d, is_removed: !currentlyRemoved } : d
    ));
  }

  async function deleteDiscussion(discussionId: string) {
    if (!confirm("Permanently delete this discussion? This cannot be undone.")) return;

    await supabase.from("discussions").delete().eq("id", discussionId);
    setDiscussions(prev => prev.filter(d => d.id !== discussionId));
  }

  // Bulk actions
  function toggleSelectAll() {
    if (selectedIds.size === filteredDiscussions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredDiscussions.map(d => d.id)));
    }
  }

  function toggleSelect(discussionId: string) {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(discussionId)) {
        newSet.delete(discussionId);
      } else {
        newSet.add(discussionId);
      }
      return newSet;
    });
  }

  async function bulkFlag() {
    if (selectedIds.size === 0) return;
    const reason = prompt(`Flag ${selectedIds.size} selected discussions? Enter reason:`);
    if (reason === null) return;

    const idsArray = Array.from(selectedIds);
    await supabase
      .from("discussions")
      .update({ is_flagged: true, flag_reason: reason })
      .in("id", idsArray);

    setDiscussions(prev => prev.map(d =>
      selectedIds.has(d.id) ? { ...d, is_flagged: true, flag_reason: reason } : d
    ));
    setSelectedIds(new Set());
  }

  async function bulkRemove() {
    if (selectedIds.size === 0) return;
    if (!confirm(`Remove ${selectedIds.size} selected discussions?`)) return;

    const idsArray = Array.from(selectedIds);
    await supabase
      .from("discussions")
      .update({ is_removed: true })
      .in("id", idsArray);

    setDiscussions(prev => prev.map(d =>
      selectedIds.has(d.id) ? { ...d, is_removed: true } : d
    ));
    setSelectedIds(new Set());
  }

  async function bulkDelete() {
    if (selectedIds.size === 0) return;
    if (!confirm(`Permanently delete ${selectedIds.size} selected discussions? This cannot be undone.`)) return;

    const idsArray = Array.from(selectedIds);
    await supabase.from("discussions").delete().in("id", idsArray);

    setDiscussions(prev => prev.filter(d => !selectedIds.has(d.id)));
    setSelectedIds(new Set());
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Discussions Moderation</h1>
        <p className="text-gray-600">Monitor, flag, and manage all Q&A discussions</p>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Total Discussions</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">🚩 Flagged</p>
          <p className="text-2xl font-bold text-red-600">{stats.flagged}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Removed</p>
          <p className="text-2xl font-bold text-orange-600">{stats.removed}</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search content or club..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0d7a9b]"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0d7a9b]"
            >
              <option value="all">All Discussions</option>
              <option value="flagged">🚩 Flagged Only</option>
              <option value="removed">Removed Only</option>
              <option value="active">Active Only</option>
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
              <option value="flagged">Flagged First</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredDiscussions.length} of {discussions.length} discussions
          {selectedIds.size > 0 && ` • ${selectedIds.size} selected`}
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="bg-[#0d7a9b] text-white rounded-lg p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-semibold">{selectedIds.size} selected</span>
            <div className="h-4 w-px bg-white/30" />
            <button
              onClick={bulkFlag}
              className="px-4 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md font-medium text-sm transition-colors"
            >
              🚩 Flag Selected
            </button>
            <button
              onClick={bulkRemove}
              className="px-4 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-md font-medium text-sm transition-colors"
            >
              Remove Selected
            </button>
            <button
              onClick={bulkDelete}
              className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium text-sm transition-colors"
            >
              Delete Selected
            </button>
          </div>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="text-white/80 hover:text-white text-sm"
          >
            Clear Selection
          </button>
        </div>
      )}

      {/* Discussions List */}
      {filteredDiscussions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No discussions found matching your filters</p>
        </div>
      ) : (
        <>
          {/* Select All Checkbox */}
          <div className="flex items-center gap-2 mb-4 px-2">
            <input
              type="checkbox"
              checked={selectedIds.size === filteredDiscussions.length && filteredDiscussions.length > 0}
              onChange={toggleSelectAll}
              className="w-4 h-4 text-[#0d7a9b] border-gray-300 rounded focus:ring-[#0d7a9b]"
            />
            <label className="text-sm font-medium text-gray-700">
              Select All ({filteredDiscussions.length})
            </label>
          </div>

          <div className="space-y-4">
            {filteredDiscussions.map((discussion) => (
              <div
                key={discussion.id}
                className={`bg-white border rounded-lg p-6 hover:shadow-md transition-shadow ${
                  discussion.is_flagged && !discussion.is_removed ? "border-red-300 bg-red-50/30" : ""
                } ${discussion.is_removed ? "opacity-60" : ""} ${selectedIds.has(discussion.id) ? "ring-2 ring-[#0d7a9b]" : ""}`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedIds.has(discussion.id)}
                      onChange={() => toggleSelect(discussion.id)}
                      className="w-4 h-4 text-[#0d7a9b] border-gray-300 rounded focus:ring-[#0d7a9b]"
                      onClick={(e) => e.stopPropagation()}
                    />
                  <Badge variant="outline" className="text-xs">💬 Discussion</Badge>

                  {/* Club Name */}
                  {discussion.clubs && (
                    <Link
                      href={`/protected/clubs/${discussion.club_id}`}
                      className="text-[#0d7a9b] hover:underline font-medium"
                    >
                      {discussion.clubs.club_name}
                    </Link>
                  )}

                  {/* Role Badge */}
                  {discussion.role && (
                    <Badge variant="secondary" className="text-xs capitalize">
                      {discussion.role}
                    </Badge>
                  )}

                  {/* Status Badges */}
                  {discussion.is_flagged && !discussion.is_removed && (
                    <Badge variant="destructive" className="text-xs">
                      🚩 Flagged
                    </Badge>
                  )}
                  {discussion.is_removed && (
                    <Badge variant="outline" className="text-xs bg-orange-100 border-orange-300">
                      Removed
                    </Badge>
                  )}
                </div>

                <span className="text-xs text-gray-500">
                  {new Date(discussion.inserted_at).toLocaleDateString()}
                </span>
              </div>

              {/* Content */}
              <p className="text-gray-900 mb-3 whitespace-pre-line">
                {discussion.is_removed ? (
                  <span className="italic text-gray-400">[removed]</span>
                ) : discussion.content ? (
                  discussion.content
                ) : (
                  <span className="italic text-gray-400">[No content available]</span>
                )}
              </p>

              {/* Flag Reason */}
              {discussion.is_flagged && discussion.flag_reason && (
                <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
                  <strong>Flag reason:</strong> {discussion.flag_reason}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3 text-xs">
                <Link
                  href={`/protected/clubs/${discussion.club_id}/reviews`}
                  className="text-[#0d7a9b] hover:underline font-medium"
                >
                  View Thread
                </Link>
                <button
                  onClick={() => toggleFlag(discussion.id, discussion.is_flagged || false)}
                  className={`hover:underline font-medium ${
                    discussion.is_flagged ? "text-green-600" : "text-yellow-600"
                  }`}
                >
                  {discussion.is_flagged ? "Unflag" : "Flag"}
                </button>
                <button
                  onClick={() => toggleRemove(discussion.id, discussion.is_removed || false)}
                  className={`hover:underline font-medium ${
                    discussion.is_removed ? "text-blue-600" : "text-orange-600"
                  }`}
                >
                  {discussion.is_removed ? "Restore" : "Remove"}
                </button>
                <button
                  onClick={() => deleteDiscussion(discussion.id)}
                  className="text-red-600 hover:underline font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          </div>
        </>
      )}
    </div>
  );
}
