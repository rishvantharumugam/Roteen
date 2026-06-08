"use client";

import type {
  FeedbackCategory,
  FeedbackFormInput,
} from "@/features/feedback/services/feedbackService";
import { FeedbackInput } from "@/features/feedback/components/FeedbackInput";
import { FeedbackTextarea } from "@/features/feedback/components/FeedbackTextarea";
import { RatingStars } from "@/features/feedback/components/RatingStars";
import { SubmitButton } from "@/features/feedback/components/SubmitButton";

export interface FeedbackFormProps {
  value: FeedbackFormInput;
  categories: FeedbackCategory[];
  fieldErrors?: Partial<Record<keyof FeedbackFormInput, string>>;
  isSubmitting: boolean;
  onChange: (value: FeedbackFormInput) => void;
  onSubmit: () => void;
}

export function FeedbackForm({
  value,
  categories,
  fieldErrors,
  isSubmitting,
  onChange,
  onSubmit,
}: FeedbackFormProps) {
  function updateField<Key extends keyof FeedbackFormInput>(
    field: Key,
    nextValue: FeedbackFormInput[Key],
  ) {
    onChange({
      ...value,
      [field]: nextValue,
    });
  }

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <FeedbackInput
          label="Name"
          name="name"
          value={value.name}
          placeholder="Roteen Kumar"
          error={fieldErrors?.name}
          onChange={(event) => updateField("name", event.target.value)}
        />
        <FeedbackInput
          label="Email"
          name="email"
          value={value.email}
          type="email"
          placeholder="you@example.com"
          error={fieldErrors?.email}
          onChange={(event) => updateField("email", event.target.value)}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_13rem]">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-200">Category</span>
          <select
            className="h-11 rounded-xl border border-white/10 bg-black/35 px-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/15"
            value={value.category}
            onChange={(event) =>
              updateField("category", event.target.value as FeedbackCategory)
            }
          >
            {categories.map((category) => (
              <option key={category} value={category} className="bg-[#121212] text-white">
                {category}
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-200">Rating</span>
          <div className="flex h-11 items-center rounded-xl border border-white/10 bg-black/35 px-3">
            <RatingStars
              value={value.rating}
              onChange={(rating) => updateField("rating", rating)}
            />
          </div>
          {fieldErrors?.rating ? (
            <span className="text-xs text-rose-300">
              {fieldErrors.rating}
            </span>
          ) : null}
        </div>
      </div>

      <FeedbackTextarea
        label="Comment"
        name="comment"
        value={value.comment}
        maxLength={600}
        placeholder="What should we keep, improve, or rethink?"
        error={fieldErrors?.comment}
        onChange={(event) => updateField("comment", event.target.value)}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500">{value.comment.length}/600</p>
        <SubmitButton isSubmitting={isSubmitting} />
      </div>
    </form>
  );
}
