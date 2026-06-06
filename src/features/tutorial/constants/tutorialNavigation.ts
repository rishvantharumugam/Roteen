import {
  tutorialLessonQueryParam,
  tutorialRoutePath,
} from "@/features/tutorial/types/tutorial";

const profileRoutePath = "/profile";

export interface TutorialRouter {
  push: (href: string) => void;
  replace?: (href: string) => void;
}

export interface TutorialNavigationTarget {
  lessonId?: string | number | null;
  replace?: boolean;
}

export function createTutorialHref(target: TutorialNavigationTarget = {}) {
  if (!target.lessonId) {
    return tutorialRoutePath;
  }

  const params = new URLSearchParams({
    [tutorialLessonQueryParam]: String(target.lessonId),
  });

  return `${tutorialRoutePath}?${params.toString()}`;
}

export function navigateToTutorial(
  router: TutorialRouter,
  target: TutorialNavigationTarget = {},
) {
  const href = createTutorialHref(target);

  if (target.replace && router.replace) {
    router.replace(href);
    return;
  }

  router.push(href);
}

export function navigateToTutorialLesson(
  router: TutorialRouter,
  lessonId: string | number,
) {
  navigateToTutorial(router, { lessonId });
}

export function navigateToProfile(router: TutorialRouter) {
  router.push(profileRoutePath);
}

export function createProfileHref() {
  return profileRoutePath;
}

export function resolveTutorialLessonId(
  searchParams: URLSearchParams,
  fallbackLessonId?: string,
) {
  return searchParams.get(tutorialLessonQueryParam) || fallbackLessonId || "";
}
