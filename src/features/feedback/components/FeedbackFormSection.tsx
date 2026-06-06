"use client";

import type {
  FeedbackCategory,
  FeedbackFormInput,
} from "@/features/feedback/services/feedbackService";
import { FeedbackForm } from "@/features/feedback/components/FeedbackForm";

export interface FeedbackFormSectionProps {
  input: FeedbackFormInput;
  categories: FeedbackCategory[];
  fieldErrors?: Partial<Record<keyof FeedbackFormInput, string>>;
  isSubmitting: boolean;
  onInputChange: (input: FeedbackFormInput) => void;
  onSubmit: () => void;
}

export function FeedbackFormSection({
  input,
  categories,
  fieldErrors,
  isSubmitting,
  onInputChange,
  onSubmit,
}: FeedbackFormSectionProps) {
  return (
    <section className={`$"rounded-2xl border border-zinc-800 bg-[#121212]  backdrop-blur-xl" p-5`}>
      <div className="mb-5">
        <h2 className="text-base font-semibold text-white">Submit feedback</h2>
        <p className="mt-1 text-sm leading-6 text-slate-400">
          Your notes go directly into the feedback table and refresh the review feed.
        </p>
      </div>
      <FeedbackForm
        value={input}
        categories={categories}
        fieldErrors={fieldErrors}
        isSubmitting={isSubmitting}
        onChange={onInputChange}
        onSubmit={onSubmit}
      />
    </section>
  );
}
