"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  requestTermsAcceptance,
} from "@/features/terms/actions/termsController";
import {
  createTermsHref,
  navigateToTerms,
  resolveTermsSectionId,
} from "@/features/terms/constants/termsNavigation";
import {
  readTermsAcceptance,
  termsService,
  type TermsPageData,
} from "@/features/terms/services/termsService";
import { EmptyState } from "@/features/terms/components/EmptyState";
import { PageLoader } from "@/features/terms/components/PageLoader";
import { TermsPage } from "@/features/terms/components/TermsPage";

export function TermsStore() {
  const router = useRouter();
  const mainRef = useRef<HTMLElement | null>(null);

  // Terms data is fully static — load it synchronously from the in-memory service
  const [pageData, setPageData] = useState<TermsPageData | null>(null);
  const [activeSectionId, setActiveSectionId] = useState("");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [checked, setChecked] = useState(() => readTermsAcceptance());
  const [accepted, setAccepted] = useState(() => readTermsAcceptance());
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [acceptError, setAcceptError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  // Terms data is 100% static — initialize synchronously on first render
  useEffect(() => {
    // termsService.fetchTermsPage returns a resolved promise (no network)
    // We still use useEffect to avoid SSR/CSR mismatch for localStorage-based accepted state
    void termsService.fetchTermsPage().then((result) => {
      const initialSectionId =
        typeof window === "undefined"
          ? ""
          : resolveTermsSectionId(window.location.hash);
      const fallbackSectionId = result.data.sections[0]?.id ?? "";
      const hasInitialSection = result.data.sections.some(
        (section) => section.id === initialSectionId,
      );
      const hasAccepted = readTermsAcceptance();

      setPageData(result.data);
      setActiveSectionId(hasInitialSection ? initialSectionId : fallbackSectionId);
      setAccepted(hasAccepted);
      setChecked(hasAccepted);
      setStatusMessage(hasAccepted ? result.data.agreement.acceptedLabel : "");
    });
  }, []);

  useEffect(() => {
    const element = mainRef.current;

    if (!element || !pageData) {
      return;
    }

    const scrollElement = element;
    const currentPageData = pageData;

    function handleScroll() {
      const maxScroll = scrollElement.scrollHeight - scrollElement.clientHeight;
      const nextProgress =
        maxScroll > 0 ? (scrollElement.scrollTop / maxScroll) * 100 : 100;
      const sectionOffsets = currentPageData.sections.map((section) => {
        const sectionElement = document.getElementById(section.id);

        return {
          id: section.id,
          offset: sectionElement
            ? Math.abs(sectionElement.offsetTop - scrollElement.scrollTop - 96)
            : Number.MAX_SAFE_INTEGER,
        };
      });
      const nearestSection = sectionOffsets.sort(
        (first, second) => first.offset - second.offset,
      )[0];

      setScrollProgress(nextProgress);

      if (nearestSection) {
        setActiveSectionId(nearestSection.id);
      }
    }

    handleScroll();
    scrollElement.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      scrollElement.removeEventListener("scroll", handleScroll);
    };
  }, [pageData]);

  function handleRetry() {
    navigateToTerms(router, { replace: true });
    window.location.reload();
  }

  function handleTermsClick() {
    navigateToTerms(router);
    mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleLegalClick() {
    navigateToTerms(router, { sectionId: pageData?.sections[0]?.id });
    handleSectionSelect(pageData?.sections[0]?.id ?? "");
  }

  function handlePolicyClick() {
    const targetSectionId = pageData?.sections.find(
      (section) => section.id === "privacy-security",
    )?.id;

    navigateToTerms(router, { sectionId: targetSectionId });
    handleSectionSelect(targetSectionId ?? "");
  }

  function handleSectionSelect(sectionId: string) {
    if (!sectionId) {
      return;
    }

    setActiveSectionId(sectionId);
    window.history.replaceState(null, "", createTermsHref({ sectionId }));
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  async function handleAccept() {
    setIsSubmitting(true);
    setAcceptError("");
    setStatusMessage("");

    const response = await requestTermsAcceptance(checked);

    if (!response.ok) {
      setAcceptError(response.message);
      setIsSubmitting(false);
      return;
    }

    setAccepted(response.data.accepted);
    setChecked(true);
    setStatusMessage(response.message);
    setIsSubmitting(false);
  }

  if (isLoading) {
    return <PageLoader />;
  }

  if (error) {
    return (
      <EmptyState
        title="Error loading terms"
        message={error}
        actionLabel="Retry"
        onAction={handleRetry}
      />
    );
  }

  if (!pageData) {
    return (
      <EmptyState
        title="No terms available"
        message="Terms content is not available for this workspace."
      />
    );
  }

  return (
    <TermsPage
      pageData={pageData}
      mainRef={mainRef}
      activeSectionId={activeSectionId}
      scrollProgress={scrollProgress}
      checked={checked}
      accepted={accepted}
      isSubmitting={isSubmitting}
      statusMessage={statusMessage}
      errorMessage={acceptError}
      onTermsClick={handleTermsClick}
      onLegalClick={handleLegalClick}
      onPolicyClick={handlePolicyClick}
      onSectionSelect={handleSectionSelect}
      onCheckedChange={setChecked}
      onAccept={() => {
        void handleAccept();
      }}
    />
  );
}
