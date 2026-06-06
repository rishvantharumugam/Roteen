"use client";

import { Loader2, Send } from "lucide-react";
import { FeedbackButton } from "@/features/feedback/components/FeedbackButton";

export interface SubmitButtonProps {
  isSubmitting: boolean;
}

export function SubmitButton({ isSubmitting }: SubmitButtonProps) {
  return (
    <FeedbackButton
      type="submit"
      variant="primary"
      disabled={isSubmitting}
      icon={
        isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )
      }
    >
      {isSubmitting ? "Submitting" : "Submit feedback"}
    </FeedbackButton>
  );
}
