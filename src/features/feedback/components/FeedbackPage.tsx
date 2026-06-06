"use client";

import type {
  FeedbackFormInput,
  FeedbackItem,
  FeedbackPageData,
} from "@/features/feedback/services/feedbackService";
import type { ReactNode } from "react";
import { FeedbackHeaderStore } from "@/features/feedback/components/FeedbackHeaderStore";
import { FeedbackFormSection } from "@/features/feedback/components/FeedbackFormSection";
import { FeedbackHeroSection } from "@/features/feedback/components/FeedbackHeroSection";
import { FeedbackListSection } from "@/features/feedback/components/FeedbackListSection";
import { FeedbackStatsSection } from "@/features/feedback/components/FeedbackStatsSection";
import { RatingSection } from "@/features/feedback/components/RatingSection";
import { SuccessSection } from "@/features/feedback/components/SuccessSection";
import { UserReviewSection } from "@/features/feedback/components/UserReviewSection";

export interface FeedbackPageProps {
  pageData: FeedbackPageData;
  input: FeedbackFormInput;
  fieldErrors?: Partial<Record<keyof FeedbackFormInput, string>>;
  highlightedFeedbackId?: string;
  isSubmitting: boolean;
  successMessage?: string;
  modal: ReactNode;
  onInputChange: (input: FeedbackFormInput) => void;
  onSubmit: () => void;
  onGiveFeedbackClick: () => void;
  onReviewClick: (feedback: FeedbackItem) => void;
}

export function FeedbackPage({
  pageData,
  input,
  fieldErrors,
  highlightedFeedbackId,
  isSubmitting,
  successMessage,
  modal,
  onInputChange,
  onSubmit,
  onGiveFeedbackClick,
  onReviewClick,
}: FeedbackPageProps) {
  return (
    <div className={`bg-black text-zinc-200 min-h-screen relative flex h-screen flex-col overflow-hidden   text-slate-100`}>
      <div className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,0.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.7)_1px,transparent_1px)] [background-size:4px_4px]" />
      <FeedbackHeaderStore />
      <main className="relative min-h-0 flex-1 min-w-0 overflow-y-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-[1540px] flex-col gap-4 pb-6">
          <FeedbackHeroSection
            stats={pageData.stats}
            onGiveFeedbackClick={onGiveFeedbackClick}
          />
          <FeedbackStatsSection stats={pageData.stats} />
          <SuccessSection message={successMessage} />

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_26rem]">
            <div className="grid gap-4">
              <FeedbackFormSection
                input={input}
                categories={pageData.categories}
                fieldErrors={fieldErrors}
                isSubmitting={isSubmitting}
                onInputChange={onInputChange}
                onSubmit={onSubmit}
              />
              <FeedbackListSection
                feedback={pageData.feedback}
                highlightedFeedbackId={highlightedFeedbackId}
                onReviewClick={onReviewClick}
              />
            </div>

            <aside className="grid content-start gap-4">
              <RatingSection stats={pageData.stats} />
              <UserReviewSection
                feedback={pageData.feedback[0]}
                onReviewClick={onReviewClick}
              />
            </aside>
          </div>
        </div>
      </main>
      {modal}
    </div>
  );
}
