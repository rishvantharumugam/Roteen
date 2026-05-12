"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  clearAuthFlowDraft,
  readAuthFlowDraft,
  subscribeToAuthFlowDraft,
  type AuthFlowDraft,
} from "@/lib/auth-flow-storage";
import { clearLandingAuthQuery } from "@/navigation/LandingPageNavigation";
import {
  createLandingPageState,
  getLandingAuthRedirectFlags,
} from "@/service/LandingPageService";
import type { AuthMode } from "@/store/landingpage/AuthModal";

const googleStudentDetailsMessage =
  "Google account verified successfully. Please complete your student details.";

export function useLandingPageController() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const state = createLandingPageState();
  const { content, navigation, heroMetrics } = state;

  const redirectFlags = getLandingAuthRedirectFlags({
    authMode: searchParams.get("auth"),
    step: searchParams.get("step"),
    source: searchParams.get("source"),
  });

  const storedDraft = useSyncExternalStore<AuthFlowDraft | null>(
    subscribeToAuthFlowDraft,
    readAuthFlowDraft,
    () => null,
  );

  const restoredAuthMode: AuthMode | null = redirectFlags.shouldOpenStudentDetails
    ? "signUp"
    : redirectFlags.shouldOpenSignUp
      ? "signUp"
      : redirectFlags.shouldOpenSignIn
        ? "signIn"
        : storedDraft?.mode ?? null;

  const restoredModalStep: 1 | 2 | 3 = redirectFlags.shouldOpenStudentDetails
    ? 3
    : storedDraft?.signUpStep ?? 1;

  const restoredSuccessMessage = redirectFlags.shouldShowGoogleMessage
    ? googleStudentDetailsMessage
    : storedDraft?.successMessage ?? "";

  const [authModeOverride, setAuthModeOverride] = useState<AuthMode | null>(
    redirectFlags.shouldOpenStudentDetails
      ? "signUp"
      : redirectFlags.shouldOpenSignUp
        ? "signUp"
        : redirectFlags.shouldOpenSignIn
          ? "signIn"
          : null,
  );

  const [modalStepOverride, setModalStepOverride] = useState<1 | 2 | 3>(
    redirectFlags.shouldOpenStudentDetails ? 3 : 1,
  );

  const [modalSuccessMessageOverride, setModalSuccessMessageOverride] = useState(
    redirectFlags.shouldShowGoogleMessage ? googleStudentDetailsMessage : "",
  );

  const authMode = authModeOverride ?? restoredAuthMode;
  const modalStep = authModeOverride ? modalStepOverride : restoredModalStep;
  const modalSuccessMessage = authModeOverride
    ? modalSuccessMessageOverride
    : restoredSuccessMessage;

  useEffect(() => {
    if (
      !redirectFlags.shouldOpenStudentDetails &&
      !redirectFlags.shouldOpenSignIn &&
      !redirectFlags.shouldOpenSignUp
    ) {
      return;
    }

    clearLandingAuthQuery(router);
  }, [
    redirectFlags.shouldOpenSignIn,
    redirectFlags.shouldOpenSignUp,
    redirectFlags.shouldOpenStudentDetails,
    router,
  ]);

  const openSignUp = () => {
    clearAuthFlowDraft();
    setModalStepOverride(1);
    setModalSuccessMessageOverride("");
    setAuthModeOverride("signUp");
  };

  const closeModal = () => {
    clearAuthFlowDraft();
    setModalStepOverride(1);
    setModalSuccessMessageOverride("");
    setAuthModeOverride(null);
  };

  return {
    authMode,
    closeModal,
    content,
    heroMetrics,
    modalStep,
    modalSuccessMessage,
    navigation,
    openSignUp,
    storedDraft,
  };
}
