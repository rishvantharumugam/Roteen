"use client";

import { motion } from "framer-motion";
import type { TermsSection as TermsSectionData } from "@/features/terms/services/termsService";
import { TermsAccordion } from "@/features/terms/components/TermsAccordion";
import { TermsList } from "@/features/terms/components/TermsList";

export interface TermsSectionProps {
  section: TermsSectionData;
}

export function TermsSection({ section }: TermsSectionProps) {
  return (
    <motion.article
      id={section.id}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.32 }}
      className={`$"rounded-2xl border border-zinc-800 bg-[#121212]  backdrop-blur-xl" scroll-mt-24 p-5`}
    >
      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[10rem_minmax(0,1fr)]">
        <div>
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/25 bg-violet-500/10 text-sm font-bold text-violet-200">
            {section.eyebrow}
          </span>
        </div>

        <div className="min-w-0">
          <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
            {section.title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            {section.description}
          </p>

          <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <TermsList items={section.highlights} />
            <TermsAccordion groups={section.lists} />
          </div>
        </div>
      </div>
    </motion.article>
  );
}

