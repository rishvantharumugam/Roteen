"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useStudyTimerStore } from "@/features/dashboard/store/studyTimerStore";
import { PartyPopper, Target, X } from "lucide-react";
import confetti from "canvas-confetti";

export function GoalAchievedModal() {
  const [mounted, setMounted] = useState(false);
  const timeSpentSeconds = useStudyTimerStore((state) => state.timeSpentSeconds);
  const dailyGoalSeconds = useStudyTimerStore((state) => state.dailyGoalSeconds);
  const hasShownGoalModal = useStudyTimerStore((state) => state.hasShownGoalModal);
  const setHasShownGoalModal = useStudyTimerStore((state) => state.setHasShownGoalModal);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isGoalAchieved = timeSpentSeconds > 0 && timeSpentSeconds >= dailyGoalSeconds;
  const shouldShow = mounted && isGoalAchieved && !hasShownGoalModal;

  useEffect(() => {
    if (shouldShow) {
      // Trigger a confetti celebration
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti(
          Object.assign({}, defaults, {
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          })
        );
        confetti(
          Object.assign({}, defaults, {
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          })
        );
      }, 250);

      return () => clearInterval(interval);
    }
  }, [shouldShow]);

  const handleClose = () => {
    setHasShownGoalModal(true);
  };

  return (
    <AnimatePresence>
      {shouldShow && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative z-10 w-full max-w-sm rounded-[24px] bg-[#121212] border border-emerald-500/30 p-8 shadow-[0_0_80px_rgba(16,185,129,0.15)] flex flex-col items-center text-center overflow-hidden"
          >
            {/* Success ambient glow inside modal */}
            <div className="pointer-events-none absolute inset-0 rounded-[24px] bg-gradient-to-br from-emerald-500/10 via-transparent to-purple-500/5" />

            <button
              type="button"
              onClick={handleClose}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors p-1"
            >
              <X size={20} />
            </button>

            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 mb-6 border border-emerald-500/20">
              <PartyPopper size={36} className="text-emerald-400" />
            </div>

            <h3 className="text-[24px] font-bold text-white tracking-tight mb-2">
              Daily Goal Achieved!
            </h3>
            
            <p className="text-[14px] text-zinc-400 leading-relaxed mb-8 px-2">
              Amazing work! You've successfully completed your daily learning target. Consistency is the key to mastery.
            </p>

            <button
              type="button"
              onClick={handleClose}
              className="w-full py-3.5 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-[14px] tracking-wide transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] active:scale-[0.98]"
            >
              Continue Learning
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
