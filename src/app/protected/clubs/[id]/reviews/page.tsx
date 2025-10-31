"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

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

  // Reviews state
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [newReviewText, setNewReviewText] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);

  // Discussion state
  const [threads, setThreads] = useState<DiscussionRow[]>([]);
  const [newThreadText, setNewThreadText] = useState("");

  // Reply box shared state
  const [replyTarget, setReplyTarget] = useState<{ type: "review" | "discussion"; id: string } | null>(null);
  const [replyText, setReplyText] = useState("");

  // Load data helpers
  const fetchReviews = useCallback(async () => {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("club_id", clubId)
      .order("inserted_at", { ascending: false });

    if (!error && data) {
      setReviews(data);
    }
  }, [supabase, clubId]);

  const fetchDiscussion = useCallback(async () => {
    const { data, error } = await supabase
      .from("discussions")
      .select("*")
      .eq("club_id", clubId)
      .order("inserted_at", { ascending: false });

    if (!error && data) {
      setThreads(data);
    }
  }, [supabase, clubId]);

  // Load data effect — invoke async helpers so state updates happen asynchronously
  useEffect(() => {
    if (!clubId) return;
    const run = async () => {
      await fetchReviews();
      await fetchDiscussion();
    };
    run();
  }, [clubId, fetchReviews, fetchDiscussion]);

  // Build nested tree for reviews
  const { reviewParents, reviewReplies } = useMemo(() => {
    const parents: ReviewRow[] = [];
    const map: Record<string, ReviewRow[]> = {};
    for (const r of reviews) {
      if (r.is_removed) continue; // hide removed
      if (!r.parent_id) {
        parents.push(r);
      } else {
        if (!map[r.parent_id]) map[r.parent_id] = [];
        map[r.parent_id].push(r);
      }
    }
    return { reviewParents: parents, reviewReplies: map };
  }, [reviews]);

  // Build nested tree for discussions
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

  // --- Helpers ---

  function RoleBadge({ role }: { role: Role }) {
    if (!role) return null;
    const label =
      role === "club_admin"
        ? "Club Admin"
        : role === "staff"
        ? "Staff"
        : "Parent";
    const color =
      role === "club_admin"
        ? "bg-purple-100 text-purple-700 border-purple-200"
        : role === "staff"
        ? "bg-blue-100 text-blue-700 border-blue-200"
        : "bg-gray-100 text-gray-700 border-gray-200";
    return (
      <span className={`text-[10px] px-2 py-0.5 border rounded ${color}`}>
        {label}
      </span>
    );
  }

  // Moderation actions
  async function markRemoved(type: "review" | "discussion", id: string) {
    if (!confirm("Remove this post from visibility?")) return;

    if (type === "review") {
      await supabase.from("reviews").update({ is_removed: true }).eq("id", id);
      await fetchReviews();
    } else {
      await supabase.from("discussions").update({ is_removed: true }).eq("id", id);
      await fetchDiscussion();
    }
  }

  async function flagItem(type: "review" | "discussion", id: string) {
    const reason = prompt("Flag reason (visible to admins only)?");
    if (reason === null) return; // cancel

    if (type === "review") {
      await supabase
        .from("reviews")
        .update({ is_flagged: true, flag_reason: reason })
        .eq("id", id);
      await fetchReviews();
    } else {
      await supabase
        .from("discussions")
        .update({ is_flagged: true, flag_reason: reason })
        .eq("id", id);
      await fetchDiscussion();
    }
  }

  // Compose a new top-level review
  async function submitReview() {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      alert("You must be signed in.");
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
      role: "parent", // TODO: upgrade to staff/admin depending on current user
    });

    if (error) {
      alert("Error submitting review: " + error.message);
    } else {
      setNewReviewText("");
      setNewReviewRating(5);
      await fetchReviews();
    }
  }

  // Compose a new top-level discussion thread
  async function submitThread() {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      alert("You must be signed in.");
      return;
    }
    if (!newThreadText.trim()) {
      alert("Ask something first.");
      return;
    }

    const { error } = await supabase.from("discussions").insert({
      club_id: clubId,
      user_id: user.id,
      content: newThreadText.trim(),
      parent_id: null,
      role: "parent",
    });

    if (error) {
      alert("Error starting thread: " + error.message);
    } else {
      setNewThreadText("");
      await fetchDiscussion();
    }
  }

  // Post reply to either review or discussion
  async function submitReply() {
    if (!replyTarget) return;
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      alert("You must be signed in.");
      return;
    }
    if (!replyText.trim()) {
      alert("Reply can't be empty.");
      return;
    }

    if (replyTarget.type === "review") {
      const { error } = await supabase.from("reviews").insert({
        club_id: clubId,
        user_id: user.id,
        rating: null,
        content: replyText.trim(),
        parent_id: replyTarget.id,
        role: "parent",
      });

      if (error) {
        alert("Error replying: " + error.message);
      } else {
        setReplyText("");
        setReplyTarget(null);
        await fetchReviews();
      }
    } else {
      const { error } = await supabase.from("discussions").insert({
        club_id: clubId,
        user_id: user.id,
        content: replyText.trim(),
        parent_id: replyTarget.id,
        role: "parent",
      });

      if (error) {
        alert("Error replying: " + error.message);
      } else {
        setReplyText("");
        setReplyTarget(null);
        await fetchDiscussion();
      }
    }
  }

  // Review item component (with nested replies)
  function ReviewItem({ review }: { review: ReviewRow }) {
    const children = reviewReplies[review.id] || [];
    return (
      <div className="border rounded-lg p-4 bg-white">
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap text-sm">
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

          <div className="text-[11px] text-gray-400">
            {review.is_removed ? "hidden" : "visible"}
          </div>
        </div>

        {/* Replies */}
        {children.length > 0 && (
          <div className="mt-4 pl-4 border-l space-y-4">
            {children.map((child) => (
              <div
                key={child.id}
                className="bg-gray-50 border border-gray-200 rounded-lg p-3"
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 flex-wrap text-xs text-gray-600">
                    <RoleBadge role={child.role} />
                    {child.is_flagged && (
                      <span className="text-[10px] px-2 py-0.5 border rounded bg-red-100 text-red-700 border-red-200">
                        🚩 flagged
                      </span>
                    )}
                  </div>
                  <p className="text-gray-800 text-sm mt-2 whitespace-pre-line leading-relaxed">
                    {child.is_removed ? (
                      <span className="italic text-gray-400">[removed]</span>
                    ) : (
                      child.content
                    )}
                  </p>
                  <div className="flex items-center gap-3 mt-3 text-[11px] text-gray-500">
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
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Discussion item component (with nested replies)
  function DiscussionItem({ post }: { post: DiscussionRow }) {
    const children = discussionReplies[post.id] || [];
    return (
      <div className="border rounded-lg p-4 bg-white">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 flex-wrap text-sm">
            <RoleBadge role={post.role} />
            {post.is_flagged && (
              <span className="text-[10px] px-2 py-0.5 border rounded bg-red-100 text-red-700 border-red-200">
                🚩 flagged
              </span>
            )}
          </div>

          <p className="text-gray-800 text-sm mt-2 whitespace-pre-line leading-relaxed">
            {post.is_removed ? (
              <span className="italic text-gray-400">[removed]</span>
            ) : (
              post.content
            )}
          </p>

          <div className="flex items-center gap-3 mt-3 text-[11px] text-gray-500">
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
        </div>

        {/* Replies */}
        {children.length > 0 && (
          <div className="mt-4 pl-4 border-l space-y-4">
            {children.map((child) => (
              <div
                key={child.id}
                className="bg-gray-50 border border-gray-200 rounded-lg p-3"
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 flex-wrap text-xs text-gray-600">
                    <RoleBadge role={child.role} />
                    {child.is_flagged && (
                      <span className="text-[10px] px-2 py-0.5 border rounded bg-red-100 text-red-700 border-red-200">
                        🚩 flagged
                      </span>
                    )}
                  </div>
                  <p className="text-gray-800 text-sm mt-2 whitespace-pre-line leading-relaxed">
                    {child.is_removed ? (
                      <span className="italic text-gray-400">[removed]</span>
                    ) : (
                      child.content
                    )}
                  </p>
                  <div className="flex items-center gap-3 mt-3 text-[11px] text-gray-500">
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
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // UI render
  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold mb-6">Reviews & Discussion</h1>

      {/* Tab Switcher */}
      <div className="flex gap-4 border-b mb-8 text-sm">
        <button
          className={`pb-2 ${
            activeTab === "reviews"
              ? "text-blue-600 border-b-2 border-blue-600 font-medium"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("reviews")}
        >
          ⭐ Reviews
        </button>
        <button
          className={`pb-2 ${
            activeTab === "discussion"
              ? "text-blue-600 border-b-2 border-blue-600 font-medium"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("discussion")}
        >
          💬 Discussion
        </button>
      </div>

      {/* REVIEWS TAB */}
      {activeTab === "reviews" && (
        <>
          {/* Form: create new review */}
          <div className="mb-10 border rounded-lg p-4 bg-white">
            <h2 className="font-medium text-gray-800 mb-3">
              Post a new parent review
            </h2>

            <div className="flex items-center gap-2 mb-3 text-sm">
              <label className="text-gray-600">Your rating:</label>
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
              placeholder="Describe coaching, communication, cost/value, playing time, development..."
              className="w-full border rounded p-2 h-28 text-sm mb-3"
            />

            <button
              onClick={submitReview}
              className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              Post review
            </button>
          </div>

          {/* List of reviews */}
          {reviewParents.length === 0 ? (
            <p className="text-gray-500 text-sm">
              No reviews yet. Be the first.
            </p>
          ) : (
            <div className="space-y-6">
              {reviewParents.map((rev) => (
                <ReviewItem key={rev.id} review={rev} />
              ))}
            </div>
          )}
        </>
      )}

      {/* DISCUSSION TAB */}
      {activeTab === "discussion" && (
        <>
          {/* Form: start new thread */}
          <div className="mb-10 border rounded-lg p-4 bg-white">
            <h2 className="font-medium text-gray-800 mb-3">
              Start a new Q&A thread
            </h2>

            <textarea
              value={newThreadText}
              onChange={(e) => setNewThreadText(e.target.value)}
              placeholder="Ask about tryouts, team culture, schedule, travel, etc…"
              className="w-full border rounded p-2 h-24 text-sm mb-3"
            />

            <button
              onClick={submitThread}
              className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              Post question
            </button>
          </div>

          {/* Thread list */}
          {discussionParents.length === 0 ? (
            <p className="text-gray-500 text-sm">
              No questions yet. Start the first one.
            </p>
          ) : (
            <div className="space-y-6">
              {discussionParents.map((post) => (
                <DiscussionItem key={post.id} post={post} />
              ))}
            </div>
          )}
        </>
      )}

      {/* GLOBAL REPLY BOX (pops up under anything you clicked Reply on) */}
      {replyTarget && (
        <div className="fixed bottom-4 right-4 max-w-md w-[90%] sm:w-[24rem] bg-white border border-gray-300 rounded-lg shadow-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="text-sm font-medium text-gray-800">
              Replying to {replyTarget.type === "review" ? "a review" : "a post"}
            </div>
            <button
              className="text-gray-400 hover:text-gray-600 text-sm"
              onClick={() => {
                setReplyTarget(null);
                setReplyText("");
              }}
            >
              ✕
            </button>
          </div>

          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="w-full border rounded p-2 h-24 text-sm mb-3"
            placeholder="Write your reply…"
          />

          <div className="flex justify-end gap-2">
            <button
              className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700"
              onClick={() => {
                setReplyTarget(null);
                setReplyText("");
              }}
            >
              Cancel
            </button>
            <button
              className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              onClick={submitReply}
            >
              Reply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
