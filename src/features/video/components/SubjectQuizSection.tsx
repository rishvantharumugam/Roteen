"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Target } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { fetchChapterQuizzes, type ChapterQuizRecord } from "@/features/video/services/videoQuizService";
import SubjectQuestionRow from "@/features/video/components/SubjectQuestionRow";

interface SubjectQuizSectionProps {
  subjectId: string;
  chapterId: string;
  activeQuizId: string | null;
  mode?: string;
  onQuizSelect: (quizId: string) => void;
}

export default function SubjectQuizSection({
  subjectId,
  chapterId,
  activeQuizId,
  mode,
  onQuizSelect,
}: SubjectQuizSectionProps) {
  const [quizzes, setQuizzes] = useState<ChapterQuizRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    const loadQuizzes = async () => {
      try {
        const fetchedQuizzes = await fetchChapterQuizzes(subjectId, chapterId);
        if (mounted) {
          // Filter by mode if provided: quiz mode must match (case-insensitive), or quiz has no mode
          const filtered = mode
            ? fetchedQuizzes.filter((q) => {
                if (!q.mode) return true;
                return q.mode.toLowerCase() === mode.toLowerCase();
              })
            : fetchedQuizzes;
          setQuizzes(filtered);
        }
      } catch (error) {
        console.error("Failed to fetch quizzes for chapter", chapterId, error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void loadQuizzes();

    return () => {
      mounted = false;
    };
  }, [subjectId, chapterId, mode]);

  if (loading) {
    return (
      <div className="mt-4 flex flex-col gap-2 pl-4 pr-1 pb-3">
        <Skeleton className="mb-1 h-4 w-20 rounded bg-[#1D1D1D]" />
        <Skeleton className="h-8 w-full rounded-md bg-[#1D1D1D]" />
        <Skeleton className="h-8 w-full rounded-md bg-[#1D1D1D]" />
      </div>
    );
  }

  if (quizzes.length === 0) {
    return null;
  }

  return (
    <div className="mt-1 flex flex-col gap-1 pb-3 pr-1">
      {quizzes.map((quiz) => {
        const isActive = activeQuizId === quiz.id;
        return (
          <motion.div key={quiz.id} className="group/item relative pl-4">
            <span
              aria-hidden="true"
              className={`pointer-events-none absolute left-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-bl-md border-b border-l transition-colors duration-200 ease-in-out ${
                isActive
                  ? "border-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.4)]"
                  : "border-zinc-700"
              }`}
            />
            <SubjectQuestionRow
              topicId={quiz.id}
              title="Quiz"
              active={isActive}
              completed={false}
              onClick={onQuizSelect}
            />
          </motion.div>
        );
      })}
    </div>
  );
}
