"use client";

import type { TermsSection as TermsSectionData } from "@/features/terms/services/termsService";
import { TermsSection } from "@/features/terms/components/TermsSection";

export interface TermsContentSectionProps {
  sections: TermsSectionData[];
}

export function TermsContentSection({ sections }: TermsContentSectionProps) {
  return (
    <section className="grid gap-4">
      {sections.map((section) => (
        <TermsSection key={section.id} section={section} />
      ))}
    </section>
  );
}

