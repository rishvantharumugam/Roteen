"use client";

import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { FeedbackButton } from "@/features/feedback/components/FeedbackButton";

export interface SuccessModalProps {
  title: string;
  message: string;
  onClose: () => void;
}

export function SuccessModal({ title, message, onClose }: SuccessModalProps) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 14, scale: 0.98 }}
        transition={{ duration: 0.22 }}
        className={`rounded-2xl border border-zinc-800 bg-[#121212]  backdrop-blur-xl w-full max-w-md p-6 text-center`}
      >
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-300" />
        <h2 className="mt-4 text-lg font-semibold text-white">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">{message}</p>
        <FeedbackButton variant="primary" className="mt-5" onClick={onClose}>
          Done
        </FeedbackButton>
      </motion.div>
    </div>
  );
}
