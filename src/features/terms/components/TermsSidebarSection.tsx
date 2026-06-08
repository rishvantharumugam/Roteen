"use client";

import { motion } from "framer-motion";
import type { TermsSection as TermsSectionData } from "@/features/terms/services/termsService";

export interface TermsSidebarSectionProps {
  sections: TermsSectionData[];
  activeSectionId: string;
  onSectionSelect: (sectionId: string) => void;
}

export function TermsSidebarSection({
  sections,
  activeSectionId,
  onSectionSelect,
}: TermsSidebarSectionProps) {
  return (
    <motion.aside
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.32 }}
      className={`rounded-2xl border border-zinc-800 bg-[#121212]  backdrop-blur-xl h-max p-4 lg:sticky lg:top-20`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        Sections
      </p>
      <div className="mt-4 grid gap-2">
        {sections.map((section) => {
          const isActive = activeSectionId === section.id;

          return (
            <button
              key={section.id}
              type="button"
              className={[
                "flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition",
                isActive
                  ? "border border-violet-400/25 bg-violet-500/12 text-white shadow-[0_14px_30px_-22px_rgba(139,92,246,0.9)]"
                  : "border border-transparent text-slate-400 hover:border-zinc-800 hover:bg-[#121212] hover:text-white",
              ].join(" ")}
              onClick={() => onSectionSelect(section.id)}
            >
              <span className="text-xs font-bold text-violet-300">
                {section.eyebrow}
              </span>
              <span className="min-w-0 truncate">{section.title}</span>
            </button>
          );
        })}
      </div>
    </motion.aside>
  );
}

