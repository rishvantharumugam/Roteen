"use client";

import type { RefObject } from "react";
import type { TermsPageData } from "@/features/terms/services/termsService";
import { ScrollIndicator } from "@/features/terms/components/ScrollIndicator";
import { TermsHeaderStore } from "@/features/terms/components/TermsHeaderStore";
import { TermsAgreementSection } from "@/features/terms/components/TermsAgreementSection";
import { TermsContentSection } from "@/features/terms/components/TermsContentSection";
import { TermsFooterSection } from "@/features/terms/components/TermsFooterSection";
import { TermsHeroSection } from "@/features/terms/components/TermsHeroSection";
import { TermsNavigationSection } from "@/features/terms/components/TermsNavigationSection";
import { TermsSidebarSection } from "@/features/terms/components/TermsSidebarSection";

export interface TermsPageProps {
  pageData: TermsPageData;
  mainRef: RefObject<HTMLElement | null>;
  activeSectionId: string;
  scrollProgress: number;
  checked: boolean;
  accepted: boolean;
  isSubmitting: boolean;
  statusMessage?: string;
  errorMessage?: string;
  onTermsClick: () => void;
  onLegalClick: () => void;
  onPolicyClick: () => void;
  onSectionSelect: (sectionId: string) => void;
  onCheckedChange: (checked: boolean) => void;
  onAccept: () => void;
}

export function TermsPage({
  pageData,
  mainRef,
  activeSectionId,
  scrollProgress,
  checked,
  accepted,
  isSubmitting,
  statusMessage,
  errorMessage,
  onTermsClick,
  onLegalClick,
  onPolicyClick,
  onSectionSelect,
  onCheckedChange,
  onAccept,
}: TermsPageProps) {
  return (
    <div className={`bg-black text-zinc-200 min-h-screen relative flex h-screen flex-col overflow-hidden   text-slate-100`}>
      <div className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,0.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.7)_1px,transparent_1px)] [background-size:4px_4px]" />
      <TermsHeaderStore />
      <ScrollIndicator progress={scrollProgress} />
      <main ref={mainRef} className="relative min-h-0 flex-1 min-w-0 overflow-y-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-[1540px] flex-col gap-4 pb-6">
          <TermsHeroSection pageData={pageData} onPolicyClick={onPolicyClick} />
          <TermsNavigationSection
            onTermsClick={onTermsClick}
            onLegalClick={onLegalClick}
            onPolicyClick={onPolicyClick}
          />

          <div className="grid gap-4 lg:grid-cols-[19rem_minmax(0,1fr)]">
            <TermsSidebarSection
              sections={pageData.sections}
              activeSectionId={activeSectionId}
              onSectionSelect={onSectionSelect}
            />
            <div className="grid min-w-0 gap-4">
              <TermsContentSection sections={pageData.sections} />
              <TermsAgreementSection
                agreement={pageData.agreement}
                checked={checked}
                accepted={accepted}
                isSubmitting={isSubmitting}
                statusMessage={statusMessage}
                errorMessage={errorMessage}
                onCheckedChange={onCheckedChange}
                onAccept={onAccept}
              />
            </div>
          </div>

          <TermsFooterSection
            contactEmail={pageData.contactEmail}
            version={pageData.version}
            owner={pageData.owner}
            onFooterTermsClick={onTermsClick}
          />
        </div>
      </main>
    </div>
  );
}

