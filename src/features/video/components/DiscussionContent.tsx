"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from '@/lib/supabase/client';
import { CornerDownRight, ChevronDown, ChevronUp, Loader2, Send, MessageSquare } from "lucide-react";

interface DiscussionContentProps {
  questionId: string | null;
  videoId?: string | null;
  subjectId?: string | null;
  currentUser?: { id: string; name: string };
}

interface Discussion {
  id: string;
  user_id: string;
  question_id: string;
  video_id?: string | null;
  content: string;
  parent_id: string | null;
  created_at: string;
  username?: string;
  replies?: Discussion[];
}

function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} days ago`;
}

export default function DiscussionContent({
  questionId,
  videoId = null,
  subjectId = null,
  currentUser = { id: "", name: "Guest" },
}: DiscussionContentProps) {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [replyingToUsername, setReplyingToUsername] = useState<string | null>(null);
  const [postingReply, setPostingReply] = useState<string | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!questionId) return;

    let mounted = true;
    const discussionContextKey = videoId ?? questionId;
    const cacheKey = `roteen_discussion_${subjectId ?? "unknown"}_${discussionContextKey}`;

    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      try {
        setDiscussions(JSON.parse(cachedData));
        setLoading(false);
      } catch (e) {
        setLoading(true);
      }
    } else {
      setLoading(true);
    }

    const fetchDiscussions = async () => {
      try {
        let query = supabase
          .from("discussion")
          .select("id, user_id, question_id, video_id, content, parent_id, created_at, subject_id")
          .order("created_at", { ascending: true });

        if (videoId) {
          query = query.eq("video_id", videoId);
        } else if (questionId) {
          query = query.eq("question_id", questionId);
        }

        if (subjectId) {
          query = query.eq("subject_id", subjectId);
        }

        let { data, error } = await query;

        if (error && (error.code === "42703" || error.code === "PGRST204")) {
          const fallbackResult = await supabase
            .from("discussion")
            .select("id, user_id, question_id, video_id, content, parent_id, created_at, subject_id")
            .eq("question_id", questionId)
            .order("created_at", { ascending: true });
          data = fallbackResult.data;
          error = fallbackResult.error;
        }

        if (error) {
          console.warn("Could not fetch discussions:", error);
          if (mounted) setDiscussions([]);
          return;
        }

        if (mounted && data) {
          const allComments = data as Discussion[];
          allComments.forEach(c => {
            if (c.user_id === currentUser.id) c.username = currentUser.name;
            else c.username = `Student ${c.user_id.substring(0, 4).toUpperCase()}`;
          });

          const parentComments = allComments.filter((c) => !c.parent_id);
          const replies = allComments.filter((c) => c.parent_id);

          const tree = parentComments.map((parent) => ({
            ...parent,
            replies: replies.filter((r) => r.parent_id === parent.id),
          }));

          setDiscussions(tree);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchDiscussions();

    return () => {
      mounted = false;
    };
  }, [questionId, videoId, subjectId, currentUser.id, currentUser.name]);

  useEffect(() => {
    if (questionId && !loading) {
      const discussionContextKey = videoId ?? questionId;
      localStorage.setItem(`roteen_discussion_${subjectId ?? "unknown"}_${discussionContextKey}`, JSON.stringify(discussions));
    }
  }, [discussions, questionId, videoId, subjectId, loading]);

  const handlePostComment = async () => {
    if (!newComment.trim() || !questionId || !currentUser.id) return;
    setPosting(true);

    const tempId = `temp-${Date.now()}`;
    const newDiscussion: Discussion = {
      id: tempId,
      user_id: currentUser.id,
      question_id: questionId,
      video_id: videoId ?? null,
      content: newComment.trim(),
      parent_id: null,
      created_at: new Date().toISOString(),
      username: currentUser.name,
      replies: [],
    };

    setDiscussions((prev) => [...prev, newDiscussion]);
    setNewComment("");

    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 100);

    try {
      let { data, error } = await supabase
        .from("discussion")
        .insert({
          user_id: newDiscussion.user_id,
          question_id: newDiscussion.question_id,
          video_id: newDiscussion.video_id,
          subject_id: subjectId,
          content: newDiscussion.content,
          parent_id: newDiscussion.parent_id,
        })
        .select()
        .single();

      if (error && (error.code === "42703" || error.code === "PGRST204")) {
        const fallbackResult = await supabase
          .from("discussion")
          .insert({
            user_id: newDiscussion.user_id,
            question_id: newDiscussion.question_id,
            content: newDiscussion.content,
            parent_id: newDiscussion.parent_id,
          })
          .select()
          .single();
        data = fallbackResult.data;
        error = fallbackResult.error;
      }

      if (error) throw error;

      if (data) {
        setDiscussions((prev) =>
          prev.map((c) => (c.id === tempId ? { ...c, id: data.id } : c))
        );
      }
    } catch (err) {
      console.warn("Failed to post comment:", err);
      setDiscussions((prev) => prev.filter((c) => c.id !== tempId));
      setNewComment(newDiscussion.content);
    } finally {
      setPosting(false);
    }
  };

  const handlePostReply = async (parentId: string) => {
    if (!replyContent.trim() || !questionId || !currentUser.id) return;
    setPostingReply(parentId);

    const tempId = `temp-${Date.now()}`;
    const newReply: Discussion = {
      id: tempId,
      user_id: currentUser.id,
      question_id: questionId,
      video_id: videoId ?? null,
      content: replyContent.trim(),
      parent_id: parentId,
      created_at: new Date().toISOString(),
      username: currentUser.name,
    };

    setDiscussions((prev) =>
      prev.map((c) => {
        if (c.id === parentId) {
          return { ...c, replies: [...(c.replies || []), newReply] };
        }
        return c;
      })
    );
    setReplyContent("");
    setReplyingTo(null);
    setReplyingToUsername(null);
    setExpandedReplies((prev) => {
      const next = new Set(prev);
      next.add(parentId);
      return next;
    });

    try {
      let { data, error } = await supabase
        .from("discussion")
        .insert({
          user_id: newReply.user_id,
          question_id: newReply.question_id,
          video_id: newReply.video_id,
          subject_id: subjectId,
          content: newReply.content,
          parent_id: newReply.parent_id,
        })
        .select()
        .single();

      if (error && (error.code === "42703" || error.code === "PGRST204")) {
        const fallbackResult = await supabase
          .from("discussion")
          .insert({
            user_id: newReply.user_id,
            question_id: newReply.question_id,
            content: newReply.content,
            parent_id: newReply.parent_id,
          })
          .select()
          .single();
        data = fallbackResult.data;
        error = fallbackResult.error;
      }

      if (error) throw error;

      if (data) {
        setDiscussions((prev) =>
          prev.map((c) => {
            if (c.id === parentId) {
              return {
                ...c,
                replies: (c.replies || []).map((r) =>
                  r.id === tempId ? { ...r, id: data.id } : r
                ),
              };
            }
            return c;
          })
        );
      }
    } catch (err) {
      console.warn("Failed to post reply:", err);
      setDiscussions((prev) =>
        prev.map((c) => {
          if (c.id === parentId) {
            return {
              ...c,
              replies: (c.replies || []).filter((r) => r.id !== tempId),
            };
          }
          return c;
        })
      );
    } finally {
      setPostingReply(null);
    }
  };

  const toggleReplies = (id: string) => {
    setExpandedReplies((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (!questionId) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-zinc-500">
        Select a question to view discussions.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col font-sans">
      {/* Input Box */}
      <div className="shrink-0 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4 shadow-sm mb-6">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#7c3aed] to-[#a855f7] text-sm font-bold text-white shadow-sm">
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value.slice(0, 300))}
              placeholder="Add a public comment..."
              className="w-full resize-none rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50 min-h-[80px] custom-scrollbar"
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-zinc-500">
                {newComment.length}/300
              </span>
              <button
                onClick={handlePostComment}
                disabled={!currentUser.id || !newComment.trim() || posting}
                className="flex items-center gap-2 rounded-full bg-purple-600 px-5 py-2 text-sm font-medium text-white transition-all hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {posting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Post
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
          </div>
        ) : discussions.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-zinc-500">
            <MessageSquare className="mb-3 h-8 w-8 opacity-20" />
            <p className="text-sm font-medium">No discussions yet</p>
            <p className="mt-1 text-xs opacity-70">Be the first to start a conversation!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6 pb-8">
            {discussions.map((comment) => (
              <div key={comment.id} className="group animate-fade-in-up">
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-sm font-bold text-zinc-300">
                    {comment.username?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-zinc-200">
                        {comment.username}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {timeAgo(comment.created_at)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-zinc-300 whitespace-pre-wrap">
                      {comment.content}
                    </p>

                    <div className="mt-2 flex items-center gap-4">
                      <button
                        onClick={() => {
                          if (replyingTo === comment.id) {
                            setReplyingTo(null);
                            setReplyingToUsername(null);
                          } else {
                            setReplyingTo(comment.id);
                            setReplyingToUsername(comment.username || "User");
                          }
                        }}
                        className="text-xs font-medium text-zinc-400 transition hover:text-purple-400"
                      >
                        Reply
                      </button>

                      {comment.replies && comment.replies.length > 0 && (
                        <button
                          onClick={() => toggleReplies(comment.id)}
                          className="flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-purple-400/80 transition hover:bg-purple-500/10 hover:text-purple-400"
                        >
                          {expandedReplies.has(comment.id) ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : (
                            <ChevronDown className="h-3 w-3" />
                          )}
                          {comment.replies.length} {comment.replies.length === 1 ? "reply" : "replies"}
                        </button>
                      )}
                    </div>

                    {/* Reply Input */}
                    {replyingTo === comment.id && (
                      <div className="mt-4 flex gap-3 animate-fade-in">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#7c3aed] to-[#a855f7] text-xs font-bold text-white shadow-sm">
                          {currentUser.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          {replyingToUsername && (
                            <div className="mb-2 flex items-center gap-2">
                              <span className="rounded bg-purple-500/20 px-2 py-0.5 text-[11px] font-medium text-purple-400">
                                Replying to @{replyingToUsername}
                              </span>
                            </div>
                          )}
                          <textarea
                            autoFocus
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value.slice(0, 300))}
                            placeholder="Write a reply..."
                            className="w-full resize-none rounded-xl border border-zinc-800 bg-black/40 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50 min-h-[60px] custom-scrollbar"
                          />
                          <div className="mt-2 flex justify-end gap-2">
                            <button
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyingToUsername(null);
                              }}
                              className="rounded-full px-4 py-1.5 text-xs font-medium text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-200"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handlePostReply(comment.id)}
                              disabled={!currentUser.id || !replyContent.trim() || postingReply === comment.id}
                              className="flex items-center gap-1.5 rounded-full bg-purple-600 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {postingReply === comment.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                "Reply"
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Nested Replies */}
                    {expandedReplies.has(comment.id) && comment.replies && comment.replies.length > 0 && (
                      <div className="mt-4 flex flex-col gap-4 border-l-2 border-zinc-800 pl-4 animate-fade-in">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-zinc-300">
                              {reply.username?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 pt-0.5">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-zinc-200">
                                  {reply.username}
                                </span>
                                <span className="text-[11px] text-zinc-500">
                                  {timeAgo(reply.created_at)}
                                </span>
                              </div>
                              <p className="mt-0.5 text-sm leading-relaxed text-zinc-300 whitespace-pre-wrap">
                                {reply.content}
                              </p>
                              <div className="mt-1">
                                <button
                                  onClick={() => {
                                    setReplyingTo(comment.id);
                                    setReplyingToUsername(reply.username || "User");
                                  }}
                                  className="text-[11px] font-medium text-zinc-500 transition hover:text-purple-400"
                                >
                                  Reply
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
