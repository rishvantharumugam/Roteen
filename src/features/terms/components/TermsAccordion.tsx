"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import type { TermsListGroup } from "@/features/terms/services/termsService";
import { TermsList } from "@/features/terms/components/TermsList";

export interface TermsAccordionProps {
  groups: TermsListGroup[];
}

export function TermsAccordion({ groups }: TermsAccordionProps) {
  const [openGroupId, setOpenGroupId] = useState(groups[0]?.id ?? "");

  return (
    <div className="grid gap-2">
      {groups.map((group) => {
        const isOpen = openGroupId === group.id;

        return (
          <div
            key={group.id}
            className="overflow-hidden rounded-2xl border border-zinc-800 bg-white/[0.035]"
          >
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left text-sm font-semibold text-white transition hover:bg-[#121212]"
              onClick={() => setOpenGroupId(isOpen ? "" : group.id)}
              aria-expanded={isOpen}
            >
              {group.title}
              <ChevronDown
                className={`h-4 w-4 text-slate-400 transition ${isOpen ? "rotate-180" : ""}`}
              />
            </button>

            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4">
                    <TermsList items={group.items} />
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

