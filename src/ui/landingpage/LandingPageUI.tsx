"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLandingPageController } from "@/controller/LandingPageController";
import { landingPageStyles } from "@/styles/LandingPageStyles";
import { appRoutes } from "@/navigation/AppRoutes";
import { AuthModal } from "@/store/landingpage/AuthModal";
import { CtaSection } from "@/store/landingpage/CtaSection";
import { HeroSection } from "@/store/landingpage/HeroSection";
import { LandingHeader } from "@/store/landingpage/LandingHeader";
import { SiteFooter } from "@/store/landingpage/SiteFooter";
import { StatsSection } from "@/store/landingpage/StatsSection";

export default function LandingPageUI() {
  const router = useRouter();
  const {
    authMode,
    closeModal,
    content,
    heroMetrics,
    modalStep,
    modalSuccessMessage,
    navigation,
    openSignUp,
    storedDraft,
  } = useLandingPageController();

  useEffect(() => {
    router.prefetch(appRoutes.dashboard);
  }, [router]);

  return (
    <main className={landingPageStyles.page}>
      <div className={landingPageStyles.content(Boolean(authMode))}>
        <LandingHeader navigation={navigation} onAuthActionClick={openSignUp} />

        <HeroSection
          badge={content.badge}
          title={content.title}
          description={content.description}
          primaryAction={content.primaryAction}
          secondaryAction={content.secondaryAction}
          heroCardTitle={content.heroCardTitle}
          heroCardItems={content.heroCardItems}
          featureHighlights={content.features.slice(0, 6)}
          heroMetrics={heroMetrics}
          onPrimaryActionClick={openSignUp}
        />

        <StatsSection stats={content.stats} />
        <CtaSection
          primaryAction={content.primaryAction}
          secondaryAction={content.secondaryAction}
          onPrimaryActionClick={openSignUp}
        />
        <SiteFooter links={content.footerLinks} />
      </div>

      {authMode ? (
        <AuthModal
          initialDraft={storedDraft}
          initialSignUpStep={modalStep}
          initialSuccessMessage={modalSuccessMessage}
          mode={authMode}
          onClose={closeModal}
        />
      ) : null}
    </main>
  );
}
