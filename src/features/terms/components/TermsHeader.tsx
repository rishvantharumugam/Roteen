"use client";

import type { ReactNode } from "react";

export interface TermsHeaderProps {
  eyebrow?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function TermsHeader({
  eyebrow,
  title,
  description,
  action,
}: TermsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-violet-200">{eyebrow}</div> : null}
        <h2 className="mt-3 text-xl font-semibold tracking-tight text-white sm:text-2xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

