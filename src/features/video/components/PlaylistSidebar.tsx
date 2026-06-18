"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  FileText,
  ChevronLeft,
} from "lucide-react";
import { supabase } from '@/lib/supabase/client';

interface PlaylistSidebarProps {
  playlistId: string;
  playlistTitle?: string;
  playlistQuestionIds?: string[] | null;
  selectedQuestionId: string | null;
  completedQuestions: string[];
  onQuestionSelect: (questionId: string) => void;
  onQuestionsLoaded?: (questions: { chapterId: string; questionId: string; questionTitle: string }[]) => void;
  onCollapse?: () => void;
}

export default function PlaylistSidebar({
  playlistId,
  playlistTitle = "Playlist",
  playlistQuestionIds = null,
  selectedQuestionId,
  completedQuestions,
  onQuestionSelect,
  onQuestionsLoaded,
  onCollapse,
}: PlaylistSidebarProps) {
  const [questions, setQuestions] = useState<
    { id: string; title: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const onQuestionsLoadedRef = useRef(onQuestionsLoaded);
  const playlistQuestionIdsKey = useMemo(
    () => (playlistQuestionIds ?? []).join("|"),
    [playlistQuestionIds],
  );

  useEffect(() => {
    onQuestionsLoadedRef.current = onQuestionsLoaded;
  }, [onQuestionsLoaded]);

  useEffect(() => {
    let cancelled = false;

    const loadQuestions = async () => {
      await Promise.resolve();
      const normalizedPlaylistQuestionIds = playlistQuestionIdsKey
        ? playlistQuestionIdsKey.split("|")
        : [];

      if (normalizedPlaylistQuestionIds.length === 0) {
        if (!cancelled) {
          setQuestions([]);
          setLoading(false);
        }
        return;
      }

      if (!cancelled) {
        setLoading(true);
      }

      const fallbackQuestions = normalizedPlaylistQuestionIds.map((qId, index) => ({
        id: qId,
        title: `Question ${index + 1}`,
      }));

      try {
        const { data, error } = await supabase
          .from("questions")
          .select("*")
          .in("id", normalizedPlaylistQuestionIds);

        if (error) {
          throw error;
        }

        const titleByQuestionId = new Map<string, string>();
        (data ?? []).forEach((row: any) => {
          const questionId = String(row.id ?? "").trim();
          const questionTitle = String(
            row.question_name || row.title || row.question || row.question_text || row.name || row.text || ""
          ).trim();
          if (questionId && questionTitle) {
            titleByQuestionId.set(questionId, questionTitle);
          }
        });

        const questionsList = normalizedPlaylistQuestionIds.map((qId, index) => ({
          id: qId,
          title: titleByQuestionId.get(qId) ?? `Question ${index + 1}`,
        }));

        if (cancelled) return;

        setQuestions(questionsList);

        if (onQuestionsLoadedRef.current) {
          onQuestionsLoadedRef.current(
            questionsList.map((q) => ({
              chapterId: playlistId,
              questionId: q.id,
              questionTitle: q.title,
            }))
          );
        }
      } catch {
        if (cancelled) return;

        setQuestions(fallbackQuestions);

        if (onQuestionsLoadedRef.current) {
          onQuestionsLoadedRef.current(
            fallbackQuestions.map((q) => ({
              chapterId: playlistId,
              questionId: q.id,
              questionTitle: q.title,
            }))
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadQuestions();

    return () => {
      cancelled = true;
    };
  }, [playlistId, playlistQuestionIdsKey]);

  const visibleQuestions = useMemo(
    () =>
      questions.map((question) => ({
        ...question,
        completed: completedQuestions.includes(question.id),
      })),
    [completedQuestions, questions],
  );

  const completedCount = useMemo(
    () => visibleQuestions.filter((q) => q.completed).length,
    [visibleQuestions]
  );

  const progressPercentage = useMemo(() => {
    if (visibleQuestions.length === 0) return 0;
    return Math.round((completedCount / visibleQuestions.length) * 100);
  }, [visibleQuestions.length, completedCount]);

  if (loading) {
    return (
      <div className={`w-full h-full min-w-[200px] rounded-2xl border border-zinc-800 bg-[#121212] p-2.5 shadow-[0_18px_36px_rgba(0,0,0,0.42)]`}>
        <div className="flex h-full items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <aside className={`w-full h-full min-w-[200px] rounded-2xl border border-zinc-800 bg-[#121212] p-2.5 shadow-[0_18px_36px_rgba(0,0,0,0.42)]`}>
      <div className="flex h-full flex-col gap-2.5 overflow-hidden">
        <div className="rounded-xl border border-zinc-700/60 bg-zinc-950/35 px-3 py-2.5">
          <div className="min-w-0 flex items-center justify-between">
            <h2 className="truncate text-lg font-semibold tracking-tight text-white">{playlistTitle}</h2>
            {onCollapse && (
              <button
                type="button"
                onClick={onCollapse}
                className="hidden lg:flex items-center justify-center p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                title="Minimize Playlist Panel"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between text-zinc-300">
            <span className="text-sm font-medium">
              {completedCount} / {visibleQuestions.length} Completed
            </span>
            <span className="text-sm font-semibold text-zinc-200">{progressPercentage}%</span>
          </div>

          <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-indigo-500"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between border-b border-zinc-700/70 pb-1">
          <h3 className="text-sm font-medium text-zinc-100">Questions</h3>
          <span className="text-xs font-medium text-zinc-400">
            {completedCount}/{visibleQuestions.length}
          </span>
        </div>

        <div className="custom-scrollbar min-h-0 flex-1 space-y-0.5 overflow-y-auto pr-0.5">
          <AnimatePresence>
            {visibleQuestions.length === 0 ? (
              <div className="flex h-full items-center justify-center px-4 py-8">
                <p className="text-center text-xs text-zinc-500">No questions in this playlist</p>
              </div>
            ) : (
              <div className="space-y-0.5">
                {visibleQuestions.map((question, index) => {
                  const isSelected = selectedQuestionId === question.id;
                  const isCompleted = question.completed;

                  return (
                    <motion.button
                      key={question.id}
                      onClick={() => onQuestionSelect(question.id)}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ delay: index * 0.015 }}
                      className={`group relative w-full rounded-md border px-1.5 py-1.5 text-left transition-all duration-200 ${isSelected
                        ? "border-purple-500/60 bg-gradient-to-r from-purple-500/20 to-indigo-500/15 shadow-[0_0_18px_rgba(168,85,247,0.2)]"
                        : "border-zinc-800/60 bg-zinc-900/35 hover:border-zinc-700/80 hover:bg-zinc-900/50"
                        }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-zinc-700 bg-zinc-900/70 text-purple-300">
                          <FileText className="h-2.5 w-2.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-sm font-medium text-zinc-100 transition-colors group-hover:text-white">
                            {question.title}
                          </p>
                          <p className="mt-0.5 text-[10px] text-zinc-500">
                            Q{index + 1}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center justify-center">
                          {isCompleted ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <Circle className="h-3.5 w-3.5 text-zinc-600" />
                          )}
                        </div>
                      </div>

                      {isSelected && (
                        <motion.div
                          layoutId="playlistQuestionIndicator"
                          className="absolute left-0 top-0 h-full w-1 rounded-l-xl bg-gradient-to-b from-purple-500 to-indigo-500"
                          initial={false}
                          transition={{ type: "spring", stiffness: 330, damping: 28 }}
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </aside>
  );
}
