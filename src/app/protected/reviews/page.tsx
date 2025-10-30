"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Role = "parent" | "staff" | "club_admin" | null;

type ReviewRow = {
  id: string;
  club_id: string;
  user_id: string | null;
  rating: number | null;
  content: string;
  parent_id: string | null;
  role: Role;
  is_removed: boolean;
  is_flagged: boolean;
  flag_reason: string | null;
  moderator_note: string | null;
  inserted_at: string;
};

type DiscussionRow = {
  id: string;
  club_id: string;
  user_id: string | null;
  content: string;
  parent_id: string | null;
  role: Role;
  is_removed: boolean;
  is_flagged: boolean;
  flag_reason: string | null;
  moderator_note: string | null;
  inserted_at: string;
};

export default function ClubReviewsAndDiscussionPage() {
  const supabase = createClientComponentClient();
  const params = useParams();
  const clubId = params?.id as string;

  const [activeTab, setActiveTab] = useState<"reviews" | "discussion">("reviews");

  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [threads, setThreads] = useState<DiscussionRow[]>([]);

  const [newReviewText, setNewReviewText] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newThreadText, setNewThreadText] = useState("");

  const [replyTarget, setReplyTarget] = useState<{ type: "review" | "discussion"; id: string } | null>(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    if (!clubId) return;
    fetchReviews();
    fetchDiscussion();
  }, [clubId]);

  async function fetchReviews() {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("club_id", clubId)
      .order("inserted_at", { ascending: false });

    if (!error && data) setReviews(data);
  }

  async function fetchDiscussion() {
    const { data, error } = await supabase
      .from("discussions")
      .select("*")
      .eq("club_id", clubId)
      .order("inserted_at", { ascending: false });

    if (!error && data) setThreads(data);
  }

  // -----------------------------
  // NESTED TREE BUILDERS
  // -----------------------------
  const { reviewParents, reviewReplies } = useMemo(() => {
    const parents: ReviewRow[] = [];
    const map: Record<string, ReviewRow[]> = {};
    for (const r of reviews) {
      if (r.is_removed) continue;
      if (!r.parent_id) {
        parents.push(r);
      } else {
        if (!map[r.parent_id]) map[r.parent_id] = [];
        map[r.parent_id].push(r);
      }
    }
    return { reviewParents: parents, reviewReplies: map };
  }, [reviews]);

  const { discussionParents, discussionReplies } = useMemo(() => {
    const parents: DiscussionRow[] = [];
    const map: Record<string, DiscussionRow[]> = {};
    for (const t of threads) {
      if (t.is_removed) continue;
      if (!t.parent_id) {
        parents.push(t);
      } else {
        if (!map[t.parent_id]) map[t.parent_id] = [];
        map[t.parent_id].push(t);
      }
    }
    return { discussionParents: parents, discussionReplies: map };
  }, [threads]);

  // -----------------------------
  // ROLE BADGE
  // -----------------------------
  function RoleBadge({ role }: { role: Role }) {
    if (!role) return null;
    const label = role === "club_admin" ? "Club Admin" : "Parent / Staff";
    const color =
      role === "club_admin"
        ? "bg-purple-100 text-purple-700 border-purple-200"
        : "bg-gray-100 text-gray-700 border-gray-200";
    const icon = role === "club_admin" ? "✅" : "👤";
    return (
      <span
        className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 border rounded ${color}`}
      >
        <span>{icon}</span>
        {label}
      </span>
    );
  }

  // -----------------------------
  // MODERATION ACTIONS
  // -----------------------------
  async function markRemoved(type: "review" | "discussion", id: string) {
    if (!confirm("Remove this post from visibility?")) return;
    const table = type === "review" ? "reviews" : "discussions";
    await supabase.from(table).update({ is_removed: true }).eq("id", id);
    if (type === "review") await fetchReviews();
    else await fetchDiscussion();
  }

  async function flagItem(type: "review" | "discussion", id: string) {
    const reason = prompt("Flag reason (visible to admins only)?");
    if (reason === null) return;
    const table = type === "review" ? "reviews" : "discussions";
    await supabase.from(table).update({ is_flagged: true, flag_reason: reason }).eq("id", id);
    if (type === "review") await fetchReviews();
    else await fetchDiscussion();
  }

  // -----------------------------
  // POSTING HELPERS
  // -----------------------------
  async function getUserRole(): Promise<Role> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return "parent";

    const { data: profile } = await supabase
      .from("profiles")
      .select("approved_role")
      .eq("user_id", user.id)
      .single();

    return (profile?.approved_role as Role) ?? "parent";
  }

  async function submitReview() {
    const role = await getUserRole();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      alert("Please sign in first.");
      return;
    }
    if (!newReviewText.trim()) {
      alert("Write something first.");
      return;
    }
    const { error } = await supabase.from("reviews").insert({
      club_id: clubId,
      user_id: user.id,
      rating: newReviewRating,
      content: newReviewText.trim(),
      parent_id: null,
      role,
    });
    if (error) alert(error.message);
    else {
      setNewReviewText("");
      setNewReviewRating(5);
      fetchReviews();
    }
  }

  async function submitThread() {
    const role = await getUserRole();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      alert("Please sign in first.");
      return;
    }
    if (!newThreadText.trim()) {
      alert("Write something first.");
      return;
    }
    const { error } = await supabase.from("discussions").insert({
      club_id: clubId,
      user_id: user.id,
      content: newThreadText.trim(),
      parent_id: null,
      role,
    });
    if (error) alert(error.message);
    else {
      setNewThreadText("");
      fetchDiscussion();
    }
  }

  async function submitReply() {
    if (!replyTarget) return;
    const role = await getUserRole();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      alert("Please sign in first.");
      return;
    }
    if (!replyText.trim()) {
      alert("Reply cannot be empty.");
      return;
    }
    const table = replyTarget.type === "review" ? "reviews" : "discussions";
    const { error } = await supabase.from(table).insert({
      club_id: clubId,
      user_id: user.id,
      content: replyText.trim(),
      parent_id: replyTarget.id,
      rating: replyTarget.type === "review" ? null : undefined,
      role,
    });
    if (error) alert(error.message);
    else {
      setReplyText("");
      setReplyTarget(null);
      replyTarget.type === "review" ? fetchReviews() : fetchDiscussion();
    }
  }

  // -----------------------------
  // REVIEW ITEM
  // -----------------------------
  function ReviewItem({ review }: { review: ReviewRow }) {
    const children = reviewReplies[review.id] || [];
    return (
      <div className="border rounded-lg p-4 bg-white">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 text-sm">
              {review.rating ? (
                <span className="text-yellow-500 font-medium">
                  ★ {review.rating}/5
                </span>
              ) : (
                <span className="text-xs text-gray-400 italic">reply</span>
              )}
              <RoleBadge role={review.role} />
              {review.is_flagged && (
                <span className="text-[10px] px-2 py-0.5 border rounded bg-red-100 text-red-700 border-red-200">
                  🚩 flagged
                </span>
              )}
            </div>
            {review.role === "club_admin" && (
              <div className="text-xs text-purple-600 font-medium mt-1">
                Official Club Response
              </div>
            )}
            <p className="text-gray-800 text-sm mt-2 whitespace-pre-line leading-relaxed">
              {review.is_removed ? (
                <span className="italic text-gray-400">[removed]</span>
              ) : (
                review.content
              )}
            </p>
            <div className="flex items-center gap-3 mt-3 text-[11px] text-gray-500">
              <span>{new Date(review.inserted_at).toLocaleString()}</span>
              {!review.is_removed && (
                <button
                  className="text-blue-600 hover:underline"
                  onClick={() =>
                    setReplyTarget({ type: "review", id: review.id })
                  }
                >
                  Reply
                </button>
              )}
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => markRemoved("review", review.id)}
              >
                Remove
              </button>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => flagItem("review", review.id)}
              >
                Flag
              </button>
            </div>
          </div>
        </div>

        {children.length > 0 && (
          <div className="mt-4 pl-4 border-l space-y-4">
            {children.map((child) => (
              <div key={child.id} className="bg-gray-50 border rounded-lg p-3">
                <RoleBadge role={child.role} />
                {child.role === "club_admin" && (
                  <div className="text-xs text-purple-600 font-medium mt-1">
                    Official Club Response
                  </div>
                )}
                <p className="text-gray-800 text-sm mt-2 whitespace-pre-line leading-relaxed">
                  {child.is_removed ? (
                    <span className="italic text-gray-400">[removed]</span>
                  ) : (
                    child.content
                  )}
                </p>
                <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-500">
                  <span>{new Date(child.inserted_at).toLocaleString()}</span>
                  {!child.is_removed && (
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() =>
                        setReplyTarget({ type: "review", id: child.id })
                      }
                    >
                      Reply
                    </button>
                  )}
                  <button
                    className="text-gray-500 hover:text-gray-700"
                    onClick={() => markRemoved("review", child.id)}
                  >
                    Remove
                  </button>
                  <button
                    className="text-gray-500 hover:text-gray-700"
                    onClick={() => flagItem("review", child.id)}
                  >
                    Flag
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // -----------------------------
  // DISCUSSION ITEM
  // -----------------------------
  function DiscussionItem({ post }: { post: DiscussionRow }) {
    const children = discussionReplies[post.id] || [];
    return (
      <div className="border rounded-lg p-4 bg-white">
        <RoleBadge role={post.role} />
        {post.role === "club_admin" && (
          <div className="text-xs text-purple-600 font-medium mt-1">
            Official Club Response
          </div>
        )}
        <p className="text-gray-800 text-sm mt-2 whitespace-pre-line leading-relaxed">
          {post.is_removed ? (
            <span className="italic text-gray-400">[removed]</span>
          ) : (
            post.content
          )}
        </p>
        <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-500">
          <span>{new Date(post.inserted_at).toLocaleString()}</span>
          {!post.is_removed && (
            <button
              className="text-blue-600 hover:underline"
              onClick={() =>
                setReplyTarget({ type: "discussion", id: post.id })
              }
            >
              Reply
            </button>
          )}
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={() => markRemoved("discussion", post.id)}
          >
            Remove
          </button>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={() => flagItem("discussion", post.id)}
          >
            Flag
          </button>
        </div>

        {children.length > 0 && (
          <div className="mt-4 pl-4 border-l space-y-4">
            {children.map((child) => (
              <div key={child.id} className="bg-gray-50 border rounded-lg p-3">
                <RoleBadge role={child.role} />
                {child.role === "club_admin" && (
                  <div className="text-xs text-purple-600 font-medium mt-1">
                    Official Club Response
                  </div>
                )}
                <p className="text-gray-800 text-sm mt-2 whitespace-pre-line leading-relaxed">
                  {child.is_removed ? (
                    <span className="italic text-gray-400">[removed]</span>
                  ) : (
                    child.content
                  )}
                </p>
                <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-500">
                  <span>{new Date(child.inserted_at).toLocaleString()}</span>
                  {!child.is_removed && (
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() =>
                        setReplyTarget({
                          type: "discussion",
                          id: child.id,
                        })
                      }
                    >
                      Reply
                    </button>
                  )}
                  <button
                    className="text-gray-500 hover:text-gray-700"
                    onClick={() => markRemoved("discussion", child.id)}
                  >
                    Remove
                  </button>
                  <button
                    className="text-gray-500 hover:text-gray-700"
                    onClick={() => flagItem("discussion", child.id)}
                  >
                    Flag
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // -----------------------------
  // MAIN RENDER
  // -----------------------------
  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold mb-6">
        Reviews & Discussion
      </h1>

      {/* Tabs */}
      <div className="flex gap-4 border-b mb-8 text-sm">
        {["reviews", "discussion"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`pb-2 ${
              activeTab === tab
                ? "text-blue-600 border-b-2 border-blue-600 font-medium"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab === "reviews" ? "⭐ Reviews" : "💬 Discussion"}
          </button>
        ))}
      </div>

      {/* Reviews Tab */}
      {activeTab === "reviews" && (
        <>
          <div className="mb-10 border rounded-lg p-4 bg-white">
            <h2 className="font-medium text-gray-800 mb-3">
              Leave a Review
            </h2>
            <div className="flex items-center gap-2 mb-3 text-sm">
              <label>Your rating:</label>
              <select
                value={newReviewRating}
                onChange={(e) => setNewReviewRating(Number(e.target.value))}
                className="border rounded px-2 py-1 text-sm"
              >
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>
                    {r} ★
                  </option>
                ))}
              </select>
            </div>
            <textarea
              value={newReviewText}
              onChange={(e) => setNewReviewText(e.target.value)}
              placeholder="Describe your experience..."
              className="w-full border rounded p-2 h-28 text-sm mb-3"
            />
            <button
              onClick={submitReview}
              className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              Post Review
            </button>
          </div>

          {reviewParents.length === 0 ? (
            <p className="text-gray-500 text-sm">No reviews yet.</p>
          ) : (
            <div className="space-y-6">
              {reviewParents.map((rev) => (
                <ReviewItem key={rev.id} review={rev} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Discussion Tab */}
      {activeTab === "discussion" && (
        <>
          <div className="mb-10 border rounded-lg p-4 bg-white">
            <h2 className="font-medium text-gray-800 mb-3">
              Start a Discussion
            </h2>
            <textarea
              value={newThreadText}
              onChange={(e) => setNewThreadText(e.target.value)}
              placeholder="Ask a question or start a conversation..."
              className="w-full border rounded p-2 h-28 text-sm mb-3"
            />
            <button
              onClick={submitThread}
              className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              Post
            </button>
          </div>

          {discussionParents.length === 0 ? (
            <p className="text-gray-500 text-sm">No discussions yet.</p>
          ) : (
            <div className="space-y-6">
              {discussionParents.map((post) => (
                <DiscussionItem key={post.id} post={post} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Reply Box */}
      {replyTarget && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">
                Replying to a {replyTarget.type}
              </span>
              <button
                onClick={() => setReplyTarget(null)}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                ✖ Close
              </button>
            </div>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write your reply..."
              className="w-full border rounded p-2 h-24 text-sm mb-3"
            />
            <button
              onClick={submitReply}
              className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              Post Reply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
