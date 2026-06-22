"use client";

import { memo } from "react";
import { motion } from "framer-motion";

interface SubjectQuestionRowProps {
  topicId: string;
  title: string;
  active: boolean;
  completed: boolean;
  onClick: (questionId: string) => void;
}

const SubjectQuestionRow = memo(function SubjectQuestionRow({
  topicId,
  title,
  active,
  completed,
  onClick,
}: SubjectQuestionRowProps) {
  return (
    <motion.button
      type="button"
      onClick={() => onClick(topicId)}
      whileHover={{ x: 5 }}
      whileTap={{ scale: 0.98 }}
      className={`group relative flex w-full items-center justify-between overflow-hidden rounded-lg pl-2 pr-1 py-1.5 text-left transition-all duration-300`}
    >
      {/* Active line indicator removed per request */}

      <span className={`relative z-10 pr-2 text-xs font-medium flex-1 min-w-0 transition-colors duration-300 ${
        active
          ? "text-white font-bold drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]"
          : "text-zinc-400 group-hover:text-zinc-200"
      }`}>
        {title}
      </span>

      {completed ? (
        <div className="relative z-10 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-purple-500 text-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.4)] bg-purple-500/10 mr-1 transition-all duration-300">
          <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      ) : (
        <span className="h-4 w-4 shrink-0 mr-1" />
      )}
    </motion.button>
  );
});

export default SubjectQuestionRow;
