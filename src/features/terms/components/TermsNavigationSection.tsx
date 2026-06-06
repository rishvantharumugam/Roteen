"use client";

import { FileText, Landmark, Scale } from "lucide-react";
import { motion } from "framer-motion";
import { TermsButton } from "@/features/terms/components/TermsButton";

export interface TermsNavigationSectionProps {
  onTermsClick: () => void;
  onLegalClick: () => void;
  onPolicyClick: () => void;
}

export function TermsNavigationSection({
  onTermsClick,
  onLegalClick,
  onPolicyClick,
}: TermsNavigationSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className={`$"rounded-2xl border border-zinc-800 bg-[#121212] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl" flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-400/25 bg-violet-500/10 text-violet-200">
          <Landmark className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white">Legal center</p>
          <p className="truncate text-xs text-slate-500">
            Terms, policy, and compliance routing
          </p>
        </div>
      </div>

      <div className="grid gap-2 sm:flex sm:items-center">
        <TermsButton icon={<Scale className="h-4 w-4" />} onClick={onTermsClick}>
          Terms & Conditions
        </TermsButton>
        <TermsButton icon={<Landmark className="h-4 w-4" />} onClick={onLegalClick}>
          Legal
        </TermsButton>
        <TermsButton
          variant="ghost"
          icon={<FileText className="h-4 w-4" />}
          onClick={onPolicyClick}
        >
          Policy
        </TermsButton>
      </div>
    </motion.section>
  );
}

