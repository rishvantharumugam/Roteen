"use client";

import { Mail, Scale } from "lucide-react";
import { motion } from "framer-motion";
import { TermsButton } from "@/features/terms/components/TermsButton";

export interface TermsFooterSectionProps {
  contactEmail: string;
  version: string;
  owner: string;
  onFooterTermsClick: () => void;
}

export function TermsFooterSection({
  contactEmail,
  version,
  owner,
  onFooterTermsClick,
}: TermsFooterSectionProps) {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      className={`$"rounded-2xl border border-zinc-800 bg-[#121212] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl" flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between`}
    >
      <div className="min-w-0">
        <p className="text-sm font-semibold text-white">{owner}</p>
        <p className="mt-1 text-xs text-slate-500">
          {version} · Questions route through official support channels.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <a
          href={`mailto:${contactEmail}`}
          className={`$"inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-violet-400/30 bg-violet-500/10 px-4 text-sm font-semibold text-violet-100 transition duration-300 hover:-translate-y-0.5 hover:bg-violet-500/20 hover:shadow-[0_0_24px_rgba(139,92,246,0.18)] disabled:cursor-not-allowed disabled:opacity-60" $"focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-500/25"`}
        >
          <Mail className="h-4 w-4" />
          Contact Legal
        </a>
        <TermsButton
          variant="ghost"
          icon={<Scale className="h-4 w-4" />}
          onClick={onFooterTermsClick}
        >
          Footer terms link
        </TermsButton>
      </div>
    </motion.footer>
  );
}

