import {
  feedbackReviewQueryParam,
  feedbackRoutePath,
} from "@/features/feedback/types/feedback";

export interface FeedbackRouter {
  push: (href: string) => void;
  replace?: (href: string) => void;
}

export interface FeedbackNavigationTarget {
  reviewId?: string | number | null;
  replace?: boolean;
}

export function createFeedbackHref(target: FeedbackNavigationTarget = {}) {
  if (!target.reviewId) {
    return feedbackRoutePath;
  }

  const params = new URLSearchParams({
    [feedbackReviewQueryParam]: String(target.reviewId),
  });

  return `${feedbackRoutePath}?${params.toString()}`;
}

export function navigateToFeedback(
  router: FeedbackRouter,
  target: FeedbackNavigationTarget = {},
) {
  const href = createFeedbackHref(target);

  if (target.replace && router.replace) {
    router.replace(href);
    return;
  }

  router.push(href);
}

export function navigateToFeedbackReview(
  router: FeedbackRouter,
  reviewId: string | number,
) {
  navigateToFeedback(router, { reviewId });
}

export function resolveFeedbackReviewId(searchParams: URLSearchParams) {
  return searchParams.get(feedbackReviewQueryParam) || "";
}
