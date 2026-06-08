"use client";

import { AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { FeedbackButton } from "@/features/feedback/components/FeedbackButton";

export interface ErrorModalProps {
  title: string;
  message: string;
  onClose: () => void;
}

export function ErrorModal({ title, message, onClose }: ErrorModalProps) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 14, scale: 0.98 }}
        transition={{ duration: 0.22 }}
        className={`rounded-2xl border border-zinc-800 bg-[#121212]  backdrop-blur-xl w-full max-w-md p-6 text-center`}
      >
        <AlertCircle className="mx-auto h-12 w-12 text-rose-300" />
        <h2 className="mt-4 text-lg font-semibold text-white">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">{message}</p>
        <FeedbackButton className="mt-5" onClick={onClose}>
          Close
        </FeedbackButton>
      </motion.div>
    </div>
  );
}
