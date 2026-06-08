"use client";

import { AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  requestFeedbackPage,
  requestFeedbackSubmission,
} from "@/features/feedback/actions/feedbackController";
import {
  navigateToFeedback,
  navigateToFeedbackReview,
  resolveFeedbackReviewId,
} from "@/features/feedback/constants/feedbackNavigation";
import {
  feedbackCategories,
  type FeedbackFormInput,
  type FeedbackItem,
  type FeedbackPageData,
} from "@/features/feedback/services/feedbackService";
import { EmptyState } from "@/features/feedback/components/EmptyState";
import { ErrorModal } from "@/features/feedback/components/ErrorModal";
import { LoadingSkeleton } from "@/features/feedback/components/LoadingSkeleton";
import { SuccessModal } from "@/features/feedback/components/SuccessModal";
import { FeedbackPage } from "@/features/feedback/components/FeedbackPage";

const defaultFeedbackInput: FeedbackFormInput = {
  name: "",
  email: "",
  rating: 5,
  category: "Product Experience",
  comment: "",
};

function createEmptyPageData(): FeedbackPageData {
  return {
    feedback: [],
    stats: {
      totalReviews: 0,
      averageRating: 0,
      satisfactionPercent: 0,
      latestReviewLabel: "No reviews yet",
      ratingDistribution: [5, 4, 3, 2, 1].map((rating) => ({
        rating,
        count: 0,
        percent: 0,
      })),
    },
    categories: [...feedbackCategories],
  };
}

import { useAuth } from "@/providers/AuthProvider";

export function FeedbackStore() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [pageData, setPageData] = useState<FeedbackPageData | null>(null);
  const [input, setInput] = useState<FeedbackFormInput>(defaultFeedbackInput);

  useEffect(() => {
    if (user) {
      setInput((prev) => ({
        ...prev,
        name: prev.name || user.user_metadata?.full_name || user.user_metadata?.name || "",
        email: prev.email || user.email || "",
      }));
    }
  }, [user]);

  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof FeedbackFormInput, string>> | undefined
  >();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [modal, setModal] = useState<"success" | "error" | null>(null);
  const [modalMessage, setModalMessage] = useState("");

  useEffect(() => {
    let isSubscribed = true;

    async function loadFeedback() {
      setIsLoading(true);
      setLoadError(null);

      const response = await requestFeedbackPage();

      if (!isSubscribed) {
        return;
      }

      if (!response.ok) {
        setLoadError(response.message);
        setIsLoading(false);
        return;
      }

      setPageData(response.data);
      setIsLoading(false);
    }

    void loadFeedback();

    return () => {
      isSubscribed = false;
    };
  }, []);

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setSuccessMessage("");
    }, 20_000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [successMessage]);

  const highlightedFeedbackId = useMemo(
    () => resolveFeedbackReviewId(searchParams),
    [searchParams],
  );

  function handleRetry() {
    navigateToFeedback(router, { replace: true });
    window.location.reload();
  }

  function handleGiveFeedbackClick() {
    navigateToFeedback(router);
  }

  function handleReviewClick(feedback: FeedbackItem) {
    navigateToFeedbackReview(router, feedback.id);
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    setFieldErrors(undefined);
    setSuccessMessage("");

    const response = await requestFeedbackSubmission({
      ...input,
      userId: user?.id || null,
    });

    if (!response.ok) {
      setFieldErrors(response.fieldErrors);
      setModalMessage(response.message);
      setModal("error");
      setIsSubmitting(false);
      return;
    }

    setPageData(response.data.pageData);
    setInput(defaultFeedbackInput);
    setSuccessMessage(response.message);
    setModalMessage("Thanks for helping improve the Roteen experience.");
    setModal("success");
    setIsSubmitting(false);
    navigateToFeedbackReview(router, response.data.feedback.id);
  }

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (loadError) {
    return (
      <EmptyState
        title="Error loading feedback"
        message={loadError}
        actionLabel="Retry"
        onAction={handleRetry}
      />
    );
  }

  return (
    <FeedbackPage
      pageData={pageData ?? createEmptyPageData()}
      input={input}
      fieldErrors={fieldErrors}
      highlightedFeedbackId={highlightedFeedbackId}
      isSubmitting={isSubmitting}
      successMessage={successMessage}
      onInputChange={setInput}
      onSubmit={() => {
        void handleSubmit();
      }}
      onGiveFeedbackClick={handleGiveFeedbackClick}
      onReviewClick={handleReviewClick}
      modal={
        <AnimatePresence>
          {modal === "success" ? (
            <SuccessModal
              title="Feedback submitted"
              message={modalMessage}
              onClose={() => setModal(null)}
            />
          ) : null}
          {modal === "error" ? (
            <ErrorModal
              title="Feedback not submitted"
              message={modalMessage}
              onClose={() => setModal(null)}
            />
          ) : null}
        </AnimatePresence>
      }
    />
  );
}
