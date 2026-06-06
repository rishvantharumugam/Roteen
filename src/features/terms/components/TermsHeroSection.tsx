"use client";

import { FileText, Scale, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import type { TermsPageData } from "@/features/terms/services/termsService";
import { TermsButton } from "@/features/terms/components/TermsButton";
import { TermsCard } from "@/features/terms/components/TermsCard";

export interface TermsHeroSectionProps {
  pageData: TermsPageData;
  onPolicyClick: () => void;
}

export function TermsHeroSection({
  pageData,
  onPolicyClick,
}: TermsHeroSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`$"rounded-2xl border border-zinc-800 bg-[#121212]  backdrop-blur-xl" overflow-hidden p-5`}
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-violet-200">
            <Scale className="h-3.5 w-3.5" />
            Legal workspace
          </span>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {pageData.title}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            {pageData.subtitle}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className={`$"rounded-2xl border border-zinc-800 bg-[#121212] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl" px-4 py-3`}>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
              Effective
            </p>
            <p className="mt-1 text-lg font-semibold text-white">
              {pageData.effectiveDate}
            </p>
          </div>
          <TermsButton
            variant="primary"
            icon={<FileText className="h-4 w-4" />}
            onClick={onPolicyClick}
          >
            Policy
          </TermsButton>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {pageData.metrics.map((metric, index) => (
          <TermsCard key={metric.id} className="p-4" delay={index * 0.04}>
            <ShieldCheck className="h-4 w-4 text-violet-300" />
            <p className="mt-3 text-xl font-semibold text-white">{metric.value}</p>
            <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
              {metric.label}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              {metric.description}
            </p>
          </TermsCard>
        ))}
      </div>
    </motion.section>
  );
}

