"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { CornerDownRight, ChevronDown, ChevronUp, Loader2, Send, MessageSquare } from "lucide-react";
import { videoStyles } from "@/styles/video";

interface DiscussionContentProps {
  questionId: string | null;
  currentUser?: { id: string; name: string };
}

interface Discussion {
  id: string;
  user_id: string;
  question_id: string;
  content: string;
  parent_id: string | null;
  created_at: string;
  // We attach a mock username since there's no profiles table mentioned
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
  currentUser = { id: "46898cdf-5efd-41dd-b04b-0de8f268090f", name: "Sarath T S" },
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
    const cacheKey = `roteen_discussion_${questionId}`;

    // INSTANT LOAD from localStorage
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      try {
        setDiscussions(JSON.parse(cachedData));
        setLoading(false);
      } catch (e) {
        // ignore invalid cache
        setLoading(true);
      }
    } else {
      setLoading(true);
    }

    const fetchDiscussions = async () => {
      try {
        const { data, error } = await supabase
          .from("discussion")
          .select("*")
          .eq("question_id", questionId)
          .order("created_at", { ascending: true });

        if (error) {
          // If the table doesn't exist or there's an RLS error, we just ignore it and show an empty list
          // console.warn("Could not fetch discussions. Table might not exist yet:", error);
          if (mounted) setDiscussions([]);
          return;
        }

        if (mounted && data) {
          // Transform flat list to nested tree
          const allComments = data as Discussion[];
          // Assign mock usernames based on user_id for display
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
  }, [questionId, currentUser.id, currentUser.name]);

  // Keep localStorage perfectly synced with the state
  useEffect(() => {
    if (questionId && !loading) {
      localStorage.setItem(`roteen_discussion_${questionId}`, JSON.stringify(discussions));
    }
  }, [discussions, questionId, loading]);

  const handlePostComment = async () => {
    if (!newComment.trim() || !questionId) return;
    setPosting(true);

    const tempId = `temp-${Date.now()}`;
    const newDiscussion: Discussion = {
      id: tempId,
      user_id: currentUser.id,
      question_id: questionId,
      content: newComment.trim(),
      parent_id: null,
      created_at: new Date().toISOString(),
      username: currentUser.name,
      replies: [],
    };

    // Optimistic UI
    setDiscussions((prev) => [...prev, newDiscussion]);
    setNewComment("");

    // Auto scroll to bottom
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 100);

    try {
      const { data, error } = await supabase
        .from("discussion")
        .insert({
          user_id: newDiscussion.user_id,
          question_id: newDiscussion.question_id,
          content: newDiscussion.content,
          parent_id: newDiscussion.parent_id,
        })
        .select()
        .single();

      if (error) throw error;

      // Update temp id with real id
      if (data) {
        setDiscussions((prev) =>
          prev.map((c) => (c.id === tempId ? { ...c, id: data.id } : c))
        );
      }
    } catch (err) {
      console.warn("Failed to post comment:", err);
      // Revert optimistic update on failure
      setDiscussions((prev) => prev.filter((c) => c.id !== tempId));
      setNewComment(newDiscussion.content); // restore text
    } finally {
      setPosting(false);
    }
  };

  const handlePostReply = async (parentId: string) => {
    if (!replyContent.trim() || !questionId) return;
    setPostingReply(parentId);

    const tempId = `temp-${Date.now()}`;
    const newReply: Discussion = {
      id: tempId,
      user_id: currentUser.id,
      question_id: questionId,
      content: replyContent.trim(),
      parent_id: parentId,
      created_at: new Date().toISOString(),
      username: currentUser.name,
    };

    // Optimistic UI
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
    // Expand the replies automatically
    setExpandedReplies((prev) => {
      const next = new Set(prev);
      next.add(parentId);
      return next;
    });

    try {
      const { data, error } = await supabase
        .from("discussion")
        .insert({
          user_id: newReply.user_id,
          question_id: newReply.question_id,
          content: newReply.content,
          parent_id: newReply.parent_id,
        })
        .select()
        .single();

      if (error) throw error;

      // Update temp id with real id
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
      // Revert optimistic
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
      <div className={videoStyles.style_ec24cbcd3ec1b}>
        Select a question to view discussions.
      </div>
    );
  }

  return (
    <div className={videoStyles.style_76a60dc3b3481}>
      {/* Input Box */}
      <div className={videoStyles.style_1fe1e027536b37}>
        <div className={videoStyles.style_a8d2f52b7abd8}>
          <div className={videoStyles.style_8ee40a719b85c}>
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          <div className={videoStyles.style_20914293d3160}>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value.slice(0, 300))}
              placeholder="Add a public comment..."
              className={videoStyles.style_15da6c15b405db}
            />
            <div className={videoStyles.style_c29ff58872fed}>
              <span className={videoStyles.style_1266d476879826}>
                {newComment.length}/300
              </span>
              <button
                onClick={handlePostComment}
                disabled={!newComment.trim() || posting}
                className={videoStyles.style_263124afdc91c}
              >
                {posting ? (
                  <Loader2 className={videoStyles.style_18fd9653ee8e18} />
                ) : (
                  <Send className={videoStyles.style_a80622bed5fb7} />
                )}
                Post
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div ref={scrollRef} className={videoStyles.style_36ccba9c40fdc}>
        {loading ? (
          <div className={videoStyles.style_1d7ee603f0a12f}>
            <Loader2 className={videoStyles.style_1aa290a50557fc} />
          </div>
        ) : discussions.length === 0 ? (
          <div className={videoStyles.style_ac0b7d8c5421c}>
            <MessageSquare className={videoStyles.style_48ddacad6effd} />
            <p className={videoStyles.style_19808e2d8b6019}>No discussions yet</p>
            <p className={videoStyles.style_706d56c4e91bf}>Be the first to start a conversation!</p>
          </div>
        ) : (
          <div className={videoStyles.style_2419bb8d96bcc}>
            {discussions.map((comment) => (
              <div key={comment.id} className={videoStyles.style_97cfe15279482}>
                <div className={videoStyles.style_a8d2f52b7abd8}>
                  <div className={videoStyles.style_a1d0dce45d0b9}>
                    {comment.username?.charAt(0).toUpperCase()}
                  </div>
                  <div className={videoStyles.style_14daf0e93b4a0d}>
                    <div className={videoStyles.style_5765788870d02}>
                      <span className={videoStyles.style_197c378dff0258}>
                        {comment.username}
                      </span>
                      <span className={videoStyles.style_1266d476879826}>
                        {timeAgo(comment.created_at)}
                      </span>
                    </div>
                    <p className={videoStyles.style_19dbebcea72bbe}>
                      {comment.content}
                    </p>

                    <div className={videoStyles.style_37645ad0fd17e}>
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
                        className={videoStyles.style_432c95a6ebe50}
                      >
                        Reply
                      </button>

                      {comment.replies && comment.replies.length > 0 && (
                        <button
                          onClick={() => toggleReplies(comment.id)}
                          className={videoStyles.style_9071679a038ab}
                        >
                          {expandedReplies.has(comment.id) ? (
                            <ChevronUp className={videoStyles.style_bbab011b8deb8} />
                          ) : (
                            <ChevronDown className={videoStyles.style_bbab011b8deb8} />
                          )}
                          {comment.replies.length} {comment.replies.length === 1 ? "reply" : "replies"}
                        </button>
                      )}
                    </div>

                    {/* Reply Input */}
                    {replyingTo === comment.id && (
                      <div className={videoStyles.style_18319b41ad0dfc}>
                        <div className={videoStyles.style_1766b9ccb6a20e}>
                          {currentUser.name.charAt(0).toUpperCase()}
                        </div>
                        <div className={videoStyles.style_20914293d3160}>
                          {replyingToUsername && (
                            <div className={videoStyles.style_9758779a1388b}>
                              <span className={videoStyles.style_a25b358d604c}>
                                Replying to @{replyingToUsername}
                              </span>
                            </div>
                          )}
                          <textarea
                            autoFocus
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value.slice(0, 300))}
                            placeholder="Write a reply..."
                            className={videoStyles.style_440e399b2e427}
                          />
                          <div className={videoStyles.style_1d87097bce928b}>
                            <button
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyingToUsername(null);
                              }}
                              className={videoStyles.style_1e4e7068632189}
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handlePostReply(comment.id)}
                              disabled={!replyContent.trim() || postingReply === comment.id}
                              className={videoStyles.style_13568374bf03f0}
                            >
                              {postingReply === comment.id ? (
                                <Loader2 className={videoStyles.style_1e3dd92228b4fb} />
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
                      <div className={videoStyles.style_3a94a3ec5c12d}>
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className={videoStyles.style_a8d2f52b7abd8}>
                            <div className={videoStyles.style_9eaa96c94965}>
                              {reply.username?.charAt(0).toUpperCase()}
                            </div>
                            <div className={videoStyles.style_1f471f257fce5e}>
                              <div className={videoStyles.style_5765788870d02}>
                                <span className={videoStyles.style_12975fd6c9cd13}>
                                  {reply.username}
                                </span>
                                <span className={videoStyles.style_139e1460a3eaa9}>
                                  {timeAgo(reply.created_at)}
                                </span>
                              </div>
                              <p className={videoStyles.style_b0d3d5300b35f}>
                                {reply.content}
                              </p>
                              <div className={videoStyles.style_b6693d9469ea7}>
                                <button
                                  onClick={() => {
                                    setReplyingTo(comment.id);
                                    setReplyingToUsername(reply.username || "User");
                                  }}
                                  className={videoStyles.style_1155780cfdea94}
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
