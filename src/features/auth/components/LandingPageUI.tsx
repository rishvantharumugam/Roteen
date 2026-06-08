"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLandingPageController } from "@/features/auth/actions/LandingPageController";

import { appRoutes } from "@/constants/AppRoutes";
import { AuthModal } from "@/features/auth/components/AuthModal";
import { CtaSection } from "@/features/auth/components/CtaSection";
import { HeroSection } from "@/features/auth/components/HeroSection";
import { LandingHeader } from "@/features/auth/components/LandingHeader";
import { SiteFooter } from "@/features/auth/components/SiteFooter";
import { StatsSection } from "@/features/auth/components/StatsSection";
import { ScrollProgress } from "@/components/ui/motion/ScrollProgress";

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
    isGoogleSuccess,
    nextRoute,
  } = useLandingPageController();

  useEffect(() => {
    router.prefetch(appRoutes.dashboard);
  }, [router]);

  return (
    <main className="bg-black academy-landing-page min-h-screen text-zinc-200 selection:bg-violet-500/30">
      <ScrollProgress />
      <div className={`transition-all duration-300 ${authMode ? "blur-sm pointer-events-none opacity-80" : "blur-none opacity-100"}`}>
        <LandingHeader navigation={navigation} onAuthActionClick={openSignUp} />

        <div className="bg-[#000000]">
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
        </div>

        <div className="bg-[#090909]">
          <StatsSection stats={content.stats} />
        </div>

        <div className="bg-[#0D0D0D]">
          <CtaSection
            primaryAction={content.primaryAction}
            secondaryAction={content.secondaryAction}
            onPrimaryActionClick={openSignUp}
          />
        </div>

        <div className="bg-[#000000]">
          <SiteFooter links={content.footerLinks} />
        </div>
      </div>

      {authMode ? (
        <AuthModal
          initialDraft={storedDraft}
          initialSignUpStep={modalStep}
          initialSuccessMessage={modalSuccessMessage}
          mode={authMode}
          onClose={closeModal}
          isGoogleSuccess={isGoogleSuccess}
          nextRoute={nextRoute}
        />
      ) : null}
    </main>
  );
}
