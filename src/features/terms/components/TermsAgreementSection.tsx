"use client";

import { CheckCircle2, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import type { TermsAgreement } from "@/features/terms/services/termsService";
import { AcceptButton } from "@/features/terms/components/AcceptButton";

export interface TermsAgreementSectionProps {
  agreement: TermsAgreement;
  checked: boolean;
  accepted: boolean;
  isSubmitting: boolean;
  statusMessage?: string;
  errorMessage?: string;
  onCheckedChange: (checked: boolean) => void;
  onAccept: () => void;
}

export function TermsAgreementSection({
  agreement,
  checked,
  accepted,
  isSubmitting,
  statusMessage,
  errorMessage,
  onCheckedChange,
  onAccept,
}: TermsAgreementSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.32 }}
      className={`$"rounded-2xl border border-zinc-800 bg-[#121212]  backdrop-blur-xl" p-5`}
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-violet-200">
            <ShieldCheck className="h-3.5 w-3.5" />
            Agreement
          </span>
          <h2 className="mt-3 text-xl font-semibold tracking-tight text-white sm:text-2xl">
            {agreement.title}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            {agreement.summary}
          </p>

          <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border border-zinc-800 bg-black/20 p-4 text-sm leading-6 text-slate-300">
            <input
              type="checkbox"
              checked={checked}
              disabled={accepted}
              onChange={(event) => onCheckedChange(event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-white/20 bg-black text-violet-500"
            />
            <span>{accepted ? agreement.acceptedLabel : agreement.confirmLabel}</span>
          </label>

          {statusMessage ? (
            <p className="mt-3 inline-flex items-center gap-2 text-sm text-emerald-300">
              <CheckCircle2 className="h-4 w-4" />
              {statusMessage}
            </p>
          ) : null}

          {errorMessage ? (
            <p className="mt-3 text-sm text-rose-300">{errorMessage}</p>
          ) : null}
        </div>

        <AcceptButton
          disabled={!checked}
          accepted={accepted}
          isSubmitting={isSubmitting}
          onAccept={onAccept}
        />
      </div>
    </motion.section>
  );
}

