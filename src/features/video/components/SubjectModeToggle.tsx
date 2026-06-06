"use client";

import { motion } from "framer-motion";
import type { QuestionMode } from "@/features/video/services/video";

interface SubjectModeToggleProps {
  mode: QuestionMode;
  onChange: (mode: QuestionMode) => void;
}

export default function SubjectModeToggle({ mode, onChange }: SubjectModeToggleProps) {
  const options: QuestionMode[] = ["Bookback", "Interior"];

  return (
    <div className="relative mb-5 flex w-full max-w-sm rounded-full border border-zinc-700/50 bg-[#060810]/80 p-1.5 shadow-[inset_0_2px_15px_rgba(0,0,0,0.6)] backdrop-blur-md">
      {options.map((option) => {
        const isActive = mode === option;

        return (
          <motion.button
            key={option}
            type="button"
            tabIndex={0}
            onClick={() => onChange(option)}
            className={`relative flex flex-1 items-center justify-center rounded-full px-4 py-2.5 text-[13px] font-semibold transition-colors duration-300 ${
              isActive ? "text-white" : "text-zinc-500 hover:text-zinc-300"
            }`}
            whileHover={!isActive ? { scale: 1.02, backgroundColor: "rgba(255,255,255,0.03)" } : {}}
            whileTap={{ scale: 0.97 }}
          >
            {isActive && (
              <motion.div
                layoutId="activeTabBackground"
                className="absolute inset-0 z-0 overflow-hidden rounded-full bg-gradient-to-r from-purple-600 via-indigo-500 to-purple-500 shadow-[0_0_24px_rgba(124,58,237,0.45),inset_0_1px_1px_rgba(255,255,255,0.3)]"
                initial={false}
                transition={{
                  type: "spring",
                  stiffness: 450,
                  damping: 30,
                  mass: 0.8,
                }}
              >
                {/* Moving gradient inside active tab for a glowing light effect */}
                <motion.div
                  className="absolute bottom-0 left-0 top-0 w-[150%] -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{
                    x: ["-100%", "150%"],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2.5,
                    ease: "linear",
                  }}
                />
              </motion.div>
            )}

            <motion.span
              className="relative z-10 tracking-wide"
              animate={{
                scale: isActive ? 1.05 : 1,
                textShadow: isActive ? "0px 0px 8px rgba(255,255,255,0.6)" : "0px 0px 0px rgba(255,255,255,0)",
              }}
              transition={{ duration: 0.3 }}
            >
              {option}
            </motion.span>
          </motion.button>
        );
      })}
    </div>
  );
}
