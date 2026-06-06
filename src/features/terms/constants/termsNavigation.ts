import { termsRoutePath } from "@/features/terms/types/terms";

export interface TermsRouter {
  push: (href: string) => void;
  replace?: (href: string) => void;
}

export interface TermsNavigationTarget {
  sectionId?: string | null;
  replace?: boolean;
}

export function createTermsHref(target: TermsNavigationTarget = {}) {
  if (!target.sectionId) {
    return termsRoutePath;
  }

  return `${termsRoutePath}#${encodeURIComponent(target.sectionId)}`;
}

export function navigateToTerms(
  router: TermsRouter,
  target: TermsNavigationTarget = {},
) {
  const href = createTermsHref(target);

  if (target.replace && router.replace) {
    router.replace(href);
    return;
  }

  router.push(href);
}

export function resolveTermsSectionId(hash: string) {
  return hash.replace(/^#/, "");
}

