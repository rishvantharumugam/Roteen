"use client";

import { memo } from "react";
import type { Chapter } from "@/features/video/services/video";
import { BookOpen, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

interface SubjectChapterRowProps {
  chapter: Chapter;
  active: boolean;
  isOpen: boolean;
  onClick: (chapterId: string) => void;
  completed?: boolean;
}

const SubjectChapterRow = memo(function SubjectChapterRow({
  chapter,
  active,
  isOpen,
  onClick,
  completed,
}: SubjectChapterRowProps) {
  return (
    <motion.button
      type="button"
      onClick={() => onClick(chapter.id)}
      layout="position"
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className={`group relative flex w-full items-center justify-between rounded-xl border p-3 text-left transition-all duration-300 ${
        active || isOpen
          ? "border-purple-500/30 bg-transparent shadow-[0_4px_20px_rgba(124,58,237,0.1)]"
          : "border-transparent hover:border-zinc-800/80 bg-transparent"
      }`}
    >
      {/* Glowing side indicator */}
      {(active || isOpen) && (
        <motion.div
          layoutId="chapterActiveIndicator"
          className="absolute -left-px bottom-1/4 top-1/4 w-1 rounded-r-full bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.8)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}

      <div className="relative z-10 flex items-start gap-3">
        <div className={`mt-0.5 transition-colors duration-300 ${active || isOpen ? "text-purple-400" : "text-zinc-500 group-hover:text-purple-400/70"}`}>
          <BookOpen className="h-5 w-5" />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-500/80">
            {chapter.label}
          </span>
          <span className={`text-sm font-semibold transition-colors duration-300 ${active || isOpen ? "text-white drop-shadow-md" : "text-zinc-300 group-hover:text-zinc-100"}`}>
            {chapter.title}
          </span>
        </div>
      </div>
      <div className="relative z-10 flex items-center gap-3">
        {completed && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-purple-500 bg-purple-500/10 text-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.3)]"
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </motion.div>
        )}
        <motion.div
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className={`transition-colors ${isOpen ? "text-purple-400" : "text-zinc-600 group-hover:text-zinc-400"}`}
        >
          <ChevronRight className="h-4 w-4" />
        </motion.div>
      </div>

    </motion.button>
  );
});

export default SubjectChapterRow;
