"use client";

import { CheckCircle2 } from "lucide-react";
import { TermsButton } from "@/features/terms/components/TermsButton";

export interface AcceptButtonProps {
  disabled?: boolean;
  accepted?: boolean;
  isSubmitting?: boolean;
  onAccept: () => void;
}

export function AcceptButton({
  disabled = false,
  accepted = false,
  isSubmitting = false,
  onAccept,
}: AcceptButtonProps) {
  return (
    <TermsButton
      variant="primary"
      icon={<CheckCircle2 className="h-4 w-4" />}
      disabled={disabled || accepted || isSubmitting}
      onClick={onAccept}
    >
      {accepted ? "Accepted" : isSubmitting ? "Saving..." : "Accept Terms"}
    </TermsButton>
  );
}

