"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { appRoutes } from "@/constants/AppRoutes";
import {
  AUTH_FLOW_TTL_MS,
  clearAuthFlowDraft,
  formatAuthFlowCountdown,
  getAuthFlowExpiryTimestamp,
  getAuthFlowRemainingMs,
  type AuthFlowDraft,
  writeAuthFlowDraft,
} from "@/lib/auth-flow-storage";
import { getSiteUrl } from '@/lib/supabase/client';
import {
  saveVerifiedStudentProfile,
  sendEmailVerificationOtp,
  sendExistingUserLoginOtp,
  signInWithGoogle,
  verifyEmailOtp,
} from "@/features/auth/services/AuthService";
import {
  districtOptions,
  genderOptions,
  mediumOptions,
  schoolTypeOptions,
  standardOptions,
  userTypeOptions,
} from "@/lib/sign-up-options";

export type AuthMode = "signIn" | "signUp";

type AuthModalProps = {
  initialDraft?: AuthFlowDraft | null;
  initialSignUpStep?: 1 | 2 | 3;
  initialSuccessMessage?: string;
  mode: AuthMode;
  onClose: () => void;
  isGoogleSuccess?: boolean;
  nextRoute?: string | null;
};

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
      <path
        d="M21.805 12.23c0-.79-.069-1.546-.198-2.273H12v4.31h5.498a4.7 4.7 0 0 1-2.038 3.083v2.56h3.303c1.934-1.781 3.042-4.409 3.042-7.68Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.754 0 5.063-.912 6.75-2.47l-3.303-2.56c-.912.611-2.08.972-3.447.972-2.651 0-4.896-1.79-5.698-4.197H2.889v2.641A9.998 9.998 0 0 0 12 22Z"
        fill="#34A853"
      />
      <path
        d="M6.302 13.745A5.98 5.98 0 0 1 5.983 12c0-.606.109-1.195.319-1.745V7.614H2.889A9.998 9.998 0 0 0 2 12c0 1.611.387 3.136 1.078 4.386l3.224-2.641Z"
        fill="#FBBC04"
      />
      <path
        d="M12 6.058c1.497 0 2.841.515 3.9 1.525l2.925-2.925C17.058 2.993 14.749 2 12 2A9.998 9.998 0 0 0 3.08 7.614l3.222 2.64C7.104 7.848 9.349 6.058 12 6.058Z"
        fill="#EA4335"
      />
    </svg>
  );
}

function MailVerifyArtwork() {
  return (
    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-900">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-800 bg-[#141414] shadow-lg">
        <svg aria-hidden="true" viewBox="0 0 48 48" className="h-6 w-6">
          <rect x="8" y="12" width="32" height="24" rx="6" fill="#1c1c1c" />
          <path d="M12 18l12 9 12-9" fill="none" stroke="#eb7b34" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

export function AuthModal({
  initialDraft = null,
  initialSignUpStep = 1,
  initialSuccessMessage = "",
  mode,
  onClose,
  isGoogleSuccess = false,
  nextRoute = null,
}: AuthModalProps) {
  const router = useRouter();
  const [signInEmail, setSignInEmail] = useState(
    initialDraft?.mode === "signIn" ? initialDraft.signInEmail ?? "" : "",
  );
  const [signInOtp, setSignInOtp] = useState(
    initialDraft?.mode === "signIn" ? initialDraft.signInOtp ?? "" : "",
  );
  const [signInStep, setSignInStep] = useState<1 | 2>(
    initialDraft?.mode === "signIn" ? initialDraft.signInStep ?? 1 : 1,
  );
  const [signUpEmail, setSignUpEmail] = useState(
    initialDraft?.mode === "signUp" ? initialDraft.signUpEmail ?? "" : "",
  );
  const [signUpOtp, setSignUpOtp] = useState(
    initialDraft?.mode === "signUp" ? initialDraft.signUpOtp ?? "" : "",
  );
  const [signUpStep, setSignUpStep] = useState<1 | 2 | 3>(
    initialDraft?.mode === "signUp"
      ? initialDraft.signUpStep ?? initialSignUpStep
      : initialSignUpStep,
  );
  const [signUpPhone, setSignUpPhone] = useState(
    initialDraft?.mode === "signUp" ? initialDraft.signUpPhone ?? "" : "",
  );
  const [signUpStandard, setSignUpStandard] = useState(
    initialDraft?.mode === "signUp" ? initialDraft.signUpStandard ?? "" : "",
  );
  const [signUpSchoolType, setSignUpSchoolType] = useState(
    initialDraft?.mode === "signUp" ? initialDraft.signUpSchoolType ?? "" : "",
  );
  const [signUpSchoolName, setSignUpSchoolName] = useState(
    initialDraft?.mode === "signUp" ? initialDraft.signUpSchoolName ?? "" : "",
  );
  const [signUpDob, setSignUpDob] = useState(
    initialDraft?.mode === "signUp" ? initialDraft.signUpDob ?? "" : "",
  );
  const [signUpDistrict, setSignUpDistrict] = useState(
    initialDraft?.mode === "signUp" ? initialDraft.signUpDistrict ?? "" : "",
  );
  const [signUpGender, setSignUpGender] = useState(
    initialDraft?.mode === "signUp" ? initialDraft.signUpGender ?? "" : "",
  );
  const [signUpMedium, setSignUpMedium] = useState(
    initialDraft?.mode === "signUp" ? initialDraft.signUpMedium ?? "" : "",
  );
  const [signUpUserType, setSignUpUserType] = useState(
    initialDraft?.mode === "signUp" ? initialDraft.signUpUserType ?? "" : "",
  );
  const [flowExpiresAt, setFlowExpiresAt] = useState<number | null>(() => {
    if (initialDraft?.expiresAt) {
      return initialDraft.expiresAt;
    }

    if (initialSignUpStep > 1) {
      return getAuthFlowExpiryTimestamp();
    }

    return null;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState(initialSuccessMessage);
  const [countdownTick, setCountdownTick] = useState(() => Date.now());
  const [showSuccess, setShowSuccess] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(3);
  const [pendingRoute, setPendingRoute] = useState<string | null>(null);
  const [loginMethod, setLoginMethod] = useState<"otp" | "google">("otp");

  function triggerSuccess() {
    setShowSuccess(true);
  }

  useEffect(() => {
    if (isGoogleSuccess && !showSuccess) {
      setPendingRoute(nextRoute ?? appRoutes.home);
      triggerSuccess();
    }
  }, [isGoogleSuccess, nextRoute, showSuccess]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (typeof event.data !== 'object' || event.data === null) return;
      
      if (event.data.type === 'GOOGLE_SIGN_IN_SUCCESS') {
        const parsedUrl = new URL(event.data.url, window.location.origin);
        const successParam = parsedUrl.searchParams.get("google_success") === "1";
        const nextRouteParam = parsedUrl.searchParams.get("next");
        
        if (successParam) {
          setPendingRoute(nextRouteParam ?? appRoutes.home);
          triggerSuccess();
        } else {
          setIsGoogleSubmitting(false);
          clearAuthFlowDraft();
          onClose();
          router.push(event.data.url);
          router.refresh();
        }
      } else if (event.data.type === 'GOOGLE_SIGN_IN_ERROR') {
        setErrorMessage(event.data.error || "An error occurred during Google sign-in.");
        setIsGoogleSubmitting(false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onClose, router]);

  const remainingMs = flowExpiresAt
    ? Math.max(0, flowExpiresAt - countdownTick)
    : AUTH_FLOW_TTL_MS;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    if (!flowExpiresAt) {
      return;
    }

    const intervalId = window.setInterval(() => {
      const nextRemainingMs = getAuthFlowRemainingMs(flowExpiresAt);
      setCountdownTick(Date.now());

      if (nextRemainingMs === 0) {
        clearAuthFlowDraft();
        onClose();
        router.push(appRoutes.home);
        router.refresh();
      }
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [flowExpiresAt, onClose, router]);

  useEffect(() => {
    if (!showSuccess || pendingRoute === null) return;
    if (redirectCountdown <= 0) {
      clearAuthFlowDraft();
      onClose();
      router.push(pendingRoute);
      router.refresh();
      return;
    }
    const timer = window.setTimeout(() => setRedirectCountdown((c) => c - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [showSuccess, redirectCountdown, pendingRoute, onClose, router]);

  useEffect(() => {
    if (mode === "signIn" && signInStep === 2) {
      writeAuthFlowDraft({
        mode: "signIn",
        expiresAt: flowExpiresAt ?? getAuthFlowExpiryTimestamp(),
        signInStep,
        signInEmail,
        signInOtp,
        successMessage,
      });
      return;
    }

    if (mode === "signUp" && signUpStep > 1) {
      writeAuthFlowDraft({
        mode: "signUp",
        expiresAt: flowExpiresAt ?? getAuthFlowExpiryTimestamp(),
        signUpStep,
        signUpEmail,
        signUpOtp,
        signUpPhone,
        signUpStandard,
        signUpSchoolType,
        signUpSchoolName,
        signUpDob,
        signUpDistrict,
        signUpGender,
        signUpMedium,
        signUpUserType,
        successMessage,
      });
      return;
    }

    clearAuthFlowDraft();
  }, [
    mode,
    flowExpiresAt,
    signInEmail,
    signInOtp,
    signInStep,
    signUpDistrict,
    signUpDob,
    signUpEmail,
    signUpGender,
    signUpMedium,
    signUpOtp,
    signUpPhone,
    signUpSchoolName,
    signUpSchoolType,
    signUpStandard,
    signUpStep,
    signUpUserType,
    successMessage,
  ]);

  const isSignIn = mode === "signIn";
  const inputClassName =
    "w-full rounded-md border border-[#1f1f1f] bg-[#111111] px-4 py-2.5 text-[14px] text-zinc-200 outline-none transition placeholder:text-[#666] focus:border-[#333] focus:bg-[#151515]";
  const otpInputClassName =
    "w-full rounded-md border border-[#1f1f1f] bg-[#111111] px-4 py-2.5 text-center text-[14px] tracking-[0.35em] text-zinc-200 outline-none transition placeholder:tracking-normal focus:border-[#333] focus:bg-[#151515]";
  const selectClassName =
    "w-full rounded-md border border-[#1f1f1f] bg-[#111111] px-4 py-2.5 text-[14px] text-zinc-200 outline-none transition focus:border-[#333] focus:bg-[#151515]";
  const primaryButtonClassName =
    "w-full rounded-md bg-violet-600 px-5 py-2.5 text-[14px] font-medium text-white transition hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed";
  const secondaryButtonClassName =
    "w-full rounded-md border border-[#1f1f1f] bg-transparent px-5 py-2.5 text-[14px] font-medium text-zinc-400 transition hover:bg-[#111111]";

  async function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (signInStep === 1) {
      if (!signInEmail.trim()) {
        setErrorMessage("Please enter your email address.");
        return;
      }

      setIsSubmitting(true);
      const redirectTo = `${getSiteUrl()}${appRoutes.home}`;
      const { error } = await sendExistingUserLoginOtp(signInEmail, redirectTo);

      if (error) {
        setErrorMessage(error.message);
        setIsSubmitting(false);
        return;
      }

      setFlowExpiresAt(getAuthFlowExpiryTimestamp());
      setSignInStep(2);
      setIsSubmitting(false);
      setSuccessMessage(
        `We sent a verification code to ${signInEmail.trim().toLowerCase()}.`,
      );
      return;
    }

    setIsSubmitting(true);
    const { data, error } = await verifyEmailOtp(signInEmail, signInOtp);

    if (error) {
      setErrorMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    setFlowExpiresAt(null);
    clearAuthFlowDraft();
    setPendingRoute(data?.route ?? appRoutes.home);
    triggerSuccess();
  }

  async function handleSignUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (signUpStep === 1) {
      if (!signUpEmail.trim()) {
        setErrorMessage("Please enter your email address.");
        return;
      }

      setIsSubmitting(true);

      const redirectTo = `${getSiteUrl()}${appRoutes.authCallback}`;
      const { error } = await sendEmailVerificationOtp(signUpEmail, redirectTo);

      if (error) {
        setErrorMessage(error.message);
        setIsSubmitting(false);
        return;
      }

      setFlowExpiresAt(getAuthFlowExpiryTimestamp());
      setSignUpStep(2);
      setIsSubmitting(false);
      setSuccessMessage(`We sent a verification code to ${signUpEmail.trim().toLowerCase()}.`);
      return;
    }

    if (signUpStep === 2) {
      setIsSubmitting(true);

      const { data, error } = await verifyEmailOtp(signUpEmail, signUpOtp);

      if (error) {
        setErrorMessage(error.message);
        setIsSubmitting(false);
        return;
      }

      if (
        data?.profile.phone_number &&
        data.profile.standard &&
        data.profile.school_name &&
        data.profile.school_type &&
        data.profile.dob &&
        data.profile.district &&
        data.profile.gender &&
        data.profile.medium_of_education &&
        data.profile.user_type
      ) {
        setIsSubmitting(false);
        setFlowExpiresAt(null);
        clearAuthFlowDraft();
        setLoginMethod("otp");
        setPendingRoute(data.route);
        triggerSuccess();
        return;
      }

      setSignUpStep(3);
      setSignUpOtp("");
      setIsSubmitting(false);
      setSuccessMessage(
        "Email verified successfully. Please complete your student details.",
      );
      return;
    }

    setIsSubmitting(true);

    const { data, error } = await saveVerifiedStudentProfile({
      phone: signUpPhone,
      standard: signUpStandard,
      schoolType: signUpSchoolType,
      schoolName: signUpSchoolName,
      dob: signUpDob,
      district: signUpDistrict,
      gender: signUpGender,
      medium: signUpMedium,
      userType: signUpUserType,
    });

    if (error) {
      setErrorMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    setFlowExpiresAt(null);
    clearAuthFlowDraft();
    setLoginMethod("otp");
    setPendingRoute(data?.route ?? appRoutes.home);
    triggerSuccess();
  }

  async function handleGoogleSignIn() {
    setIsGoogleSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    const redirectTo = `${getSiteUrl()}${appRoutes.authCallback}`;
    const { error, popupWindow } = await signInWithGoogle(redirectTo);

    if (error) {
      setErrorMessage(error.message);
      setIsGoogleSubmitting(false);
    } else if (popupWindow) {
      const checkClosed = window.setInterval(() => {
        if (popupWindow.closed) {
          window.clearInterval(checkClosed);
          setIsGoogleSubmitting(false);
        }
      }, 500);
    } else {
      setErrorMessage("Please allow popups to sign in with Google.");
      setIsGoogleSubmitting(false);
    }
  }

  const slideStyle = (direction: 'left' | 'right', active: boolean): React.CSSProperties => ({
    transform: active ? `translateX(${direction === 'left' ? '-112%' : '112%'})` : 'translateX(0%)',
    transition: 'transform 380ms cubic-bezier(0.4, 0, 0.2, 1)',
    willChange: 'transform',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden px-4 py-6">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-black/80 backdrop-blur-[2px] transition-[backdrop-filter] duration-300"
        onClick={onClose}
      />

      {/* Shared modal card — both panels live inside, overflow hidden clips the slide */}
      <div className="relative z-10 w-[95%] max-w-[25rem] rounded-xl border border-[#161616] bg-[#0a0a0a] shadow-2xl overflow-hidden">

        <div
          style={slideStyle('left', showSuccess)}
          className="flex flex-col"
        >
          <div className="flex flex-1 flex-col no-scrollbar rounded-xl px-7 py-9">

            <div className="flex flex-col items-center mb-6">
              <div className="mb-7 flex items-center justify-center mt-2">
                <span className="relative inline-flex items-end font-heading text-[30px] font-black italic leading-none tracking-normal sm:text-[34px]">
                  <span className="text-white">Rot</span>
                  <span className="relative text-violet-400">
                    <span className="absolute -top-4 left-1/2 hidden h-5 w-11 -translate-x-1/2 sm:block">
                      <span className="absolute left-1 top-2 h-3 w-5 -rotate-12 rounded-t-full border-t-[3px] border-white" />
                      <span className="absolute right-1 top-2 h-3 w-5 rotate-12 rounded-t-full border-t-[3px] border-white" />
                    </span>
                    een
                  </span>
                </span>
              </div>
              <h2 className="text-[22px] font-bold text-white tracking-tight">
                {isSignIn
                  ? "Welcome 👋 Let's sign in!"
                  : signUpStep === 1
                    ? "Welcome 👋 Fuel your Future"
                    : signUpStep === 2
                      ? "Verify your email"
                      : "Complete your profile"}
              </h2>
              {((isSignIn && signInStep === 2) || (!isSignIn && signUpStep > 1)) && flowExpiresAt ? (
                <p className="mt-2 text-[13px] font-medium text-violet-400">
                  Session expires in {formatAuthFlowCountdown(remainingMs)}
                </p>
              ) : null}
            </div>

            {isSignIn ? (
              <form className="space-y-4" onSubmit={handleSignIn}>
                {signInStep === 1 ? (
                  <input
                    suppressHydrationWarning
                    type="email"
                    placeholder="example@gmail.com"
                    value={signInEmail}
                    onChange={(event) => setSignInEmail(event.target.value)}
                    required
                    className={inputClassName}
                  />
                ) : (
                  <>
                    <div className="rounded-xl border border-[#2a2a2a] bg-[#141414] px-4 py-6 text-center">
                      <MailVerifyArtwork />
                      <p className="text-[15px] font-semibold text-zinc-200">
                        Check your email
                      </p>
                      <p className="mt-2 text-[13px] text-zinc-400">
                        We sent a 6-digit OTP to{" "}
                        <span className="font-semibold text-zinc-300">
                          {signInEmail.trim().toLowerCase()}
                        </span>
                      </p>
                    </div>

                    <input
                      suppressHydrationWarning
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      placeholder="Enter 6-digit OTP"
                      value={signInOtp}
                      onChange={(event) =>
                        setSignInOtp(
                          event.target.value.replace(/\D/g, "").slice(0, 6),
                        )
                      }
                      required
                      className={otpInputClassName}
                    />
                  </>
                )}

                {errorMessage ? (
                  <p className="rounded-lg bg-red-950/30 px-4 py-3 text-[13px] text-red-500 border border-red-900/50">
                    {errorMessage}
                  </p>
                ) : null}

                <button
                  suppressHydrationWarning
                  type="submit"
                  disabled={isSubmitting || isGoogleSubmitting}
                  className={primaryButtonClassName}
                >
                  {signInStep === 1
                    ? isSubmitting
                      ? "Sending OTP..."
                      : "Continue"
                    : isSubmitting
                      ? "Verifying..."
                      : "Verify Email"}
                </button>

                {signInStep === 2 ? (
                  <>
                    <button
                      suppressHydrationWarning
                      type="button"
                      onClick={() => {
                        setErrorMessage("");
                        setSuccessMessage("");
                        setSignInStep(1);
                        setSignInOtp("");
                      }}
                      className={secondaryButtonClassName}
                    >
                      Change Email
                    </button>

                    <button
                      suppressHydrationWarning
                      type="button"
                      onClick={async () => {
                        setErrorMessage("");
                        setSuccessMessage("");
                        setIsSubmitting(true);
                        const redirectTo = `${getSiteUrl()}${appRoutes.home}`;
                        const { error } = await sendExistingUserLoginOtp(
                          signInEmail,
                          redirectTo,
                        );
                        setIsSubmitting(false);

                        if (error) {
                          setErrorMessage(error.message);
                          return;
                        }

                        setFlowExpiresAt(getAuthFlowExpiryTimestamp());
                        setSuccessMessage(
                          `A fresh OTP has been sent to ${signInEmail.trim().toLowerCase()}.`,
                        );
                      }}
                      className="w-full rounded-lg border border-[#2a2a2a] bg-transparent px-5 py-3 text-[14px] font-medium text-[#d97736] transition hover:bg-[#1a1a1a]"
                    >
                      Resend OTP
                    </button>
                  </>
                ) : null}

                {signInStep === 1 ? (
                  <>
                    <div className="flex items-center gap-4 py-1.5 text-[12px] text-[#444]">
                      <span className="h-[1px] flex-1 bg-[#222]" />
                      or
                      <span className="h-[1px] flex-1 bg-[#222]" />
                    </div>

                    <button
                      suppressHydrationWarning
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={isSubmitting || isGoogleSubmitting}
                      className="flex w-full items-center justify-center gap-3 rounded-md border border-[#1f1f1f] bg-[#111111] px-5 py-2.5 text-[14px] font-medium text-white transition hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:text-zinc-500"
                    >
                      <GoogleIcon />
                      {isGoogleSubmitting ? "Redirecting to Google..." : "Continue with Google"}
                    </button>
                  </>
                ) : null}
              </form>
            ) : (
              <form className="space-y-4" onSubmit={handleSignUp}>
                {signUpStep === 1 ? (
                  <input
                    suppressHydrationWarning
                    type="email"
                    placeholder="example@gmail.com"
                    value={signUpEmail}
                    onChange={(event) => setSignUpEmail(event.target.value)}
                    required
                    className={inputClassName}
                  />
                ) : signUpStep === 2 ? (
                  <>
                    <div className="rounded-xl border border-[#2a2a2a] bg-[#141414] px-4 py-6 text-center">
                      <MailVerifyArtwork />
                      <p className="text-[15px] font-semibold text-zinc-200">
                        Check your email
                      </p>
                      <p className="mt-2 text-[13px] text-zinc-400">
                        We sent a 6-digit OTP to{" "}
                        <span className="font-semibold text-zinc-300">
                          {signUpEmail.trim().toLowerCase()}
                        </span>
                      </p>
                    </div>

                    <input
                      suppressHydrationWarning
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      placeholder="Enter 6-digit OTP"
                      value={signUpOtp}
                      onChange={(event) =>
                        setSignUpOtp(
                          event.target.value.replace(/\D/g, "").slice(0, 6),
                        )
                      }
                      required
                      className={otpInputClassName}
                    />
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="flex rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] transition focus-within:border-[#4a4a4a] focus-within:bg-[#202020]">
                      <span className="flex items-center border-r border-[#2a2a2a] px-4 text-[14px] text-zinc-500">
                        IN
                      </span>
                      <input
                        suppressHydrationWarning
                        type="tel"
                        placeholder="9876543210"
                        value={signUpPhone}
                        onChange={(event) =>
                          setSignUpPhone(
                            event.target.value.replace(/\D/g, "").slice(0, 10),
                          )
                        }
                        inputMode="numeric"
                        required
                        minLength={10}
                        maxLength={10}
                        className="w-full rounded-r-lg bg-transparent px-4 py-3.5 text-[14px] text-zinc-200 outline-none placeholder:text-zinc-500"
                      />
                    </div>

                    <select
                      suppressHydrationWarning
                      value={signUpDistrict}
                      onChange={(event) => setSignUpDistrict(event.target.value)}
                      required
                      className={selectClassName}
                    >
                      <option value="">Select district</option>
                      {districtOptions.map((option: string) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>

                    <select
                      suppressHydrationWarning
                      value={signUpStandard}
                      onChange={(event) => setSignUpStandard(event.target.value)}
                      required
                      className={selectClassName}
                    >
                      <option value="">Select Std</option>
                      {standardOptions.map((option: string) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>

                    <select
                      suppressHydrationWarning
                      value={signUpSchoolType}
                      onChange={(event) => setSignUpSchoolType(event.target.value)}
                      required
                      className={selectClassName}
                    >
                      <option value="">Select School Type</option>
                      {schoolTypeOptions.map((option: string) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>

                    <input
                      suppressHydrationWarning
                      type="text"
                      placeholder="Enter school name"
                      value={signUpSchoolName}
                      onChange={(event) => setSignUpSchoolName(event.target.value)}
                      required
                      className={inputClassName}
                    />

                    <input
                      suppressHydrationWarning
                      type="date"
                      value={signUpDob}
                      onChange={(event) => setSignUpDob(event.target.value)}
                      required
                      className={inputClassName}
                    />

                    <select
                      suppressHydrationWarning
                      value={signUpGender}
                      onChange={(event) => setSignUpGender(event.target.value)}
                      required
                      className={selectClassName}
                    >
                      <option value="">Select Gender</option>
                      {genderOptions.map((option: string) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>

                    <select
                      suppressHydrationWarning
                      value={signUpMedium}
                      onChange={(event) => setSignUpMedium(event.target.value)}
                      required
                      className={selectClassName}
                    >
                      <option value="">Select Medium</option>
                      {mediumOptions.map((option: string) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>

                    <select
                      suppressHydrationWarning
                      value={signUpUserType}
                      onChange={(event) => setSignUpUserType(event.target.value)}
                      required
                      className={selectClassName}
                    >
                      <option value="">Select User Type</option>
                      {userTypeOptions.map((option: string) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {errorMessage ? (
                  <p className="rounded-lg bg-red-950/30 px-4 py-3 text-[13px] text-red-500 border border-red-900/50">
                    {errorMessage}
                  </p>
                ) : null}

                {successMessage ? (
                  <p className="rounded-lg bg-emerald-950/30 px-4 py-3 text-[13px] text-emerald-500 border border-emerald-900/50">
                    {successMessage}
                  </p>
                ) : null}

                <button
                  suppressHydrationWarning
                  type="submit"
                  disabled={isSubmitting || isGoogleSubmitting}
                  className={primaryButtonClassName}
                >
                  {signUpStep === 1
                    ? isSubmitting
                      ? "Sending OTP..."
                      : "Continue"
                    : signUpStep === 2
                      ? isSubmitting
                        ? "Verifying..."
                        : "Verify Email"
                      : isSubmitting
                        ? "Completing Sign Up..."
                        : "Complete Sign Up"}
                </button>

                {signUpStep === 2 || signUpStep === 3 ? (
                  <button
                    suppressHydrationWarning
                    type="button"
                    onClick={() => {
                      setErrorMessage("");
                      setSuccessMessage("");
                      setSignUpStep(signUpStep === 3 ? 2 : 1);
                    }}
                    className={secondaryButtonClassName}
                  >
                    {signUpStep === 2 ? "Change Email" : "Back"}
                  </button>
                ) : null}

                {signUpStep === 2 ? (
                  <button
                    suppressHydrationWarning
                    type="button"
                    onClick={async () => {
                      setErrorMessage("");
                      setSuccessMessage("");
                      setIsSubmitting(true);
                      const redirectTo = `${getSiteUrl()}${appRoutes.authCallback}`;
                      const { error } = await sendEmailVerificationOtp(signUpEmail, redirectTo);
                      setIsSubmitting(false);

                      if (error) {
                        setErrorMessage(error.message);
                        return;
                      }

                      setFlowExpiresAt(getAuthFlowExpiryTimestamp());
                      setSuccessMessage(
                        `A fresh OTP has been sent to ${signUpEmail.trim().toLowerCase()}.`,
                      );
                    }}
                    className="w-full rounded-lg border border-[#2a2a2a] bg-transparent px-5 py-3 text-[14px] font-medium text-[#d97736] transition hover:bg-[#1a1a1a]"
                  >
                    Resend OTP
                  </button>
                ) : null}

                {signUpStep === 1 ? (
                  <>
                    <div className="flex items-center gap-4 py-1.5 text-[12px] text-[#444]">
                      <span className="h-[1px] flex-1 bg-[#222]" />
                      or
                      <span className="h-[1px] flex-1 bg-[#222]" />
                    </div>

                    <button
                      suppressHydrationWarning
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={isSubmitting || isGoogleSubmitting}
                      className="flex w-full items-center justify-center gap-3 rounded-md border border-[#1f1f1f] bg-[#111111] px-5 py-2.5 text-[14px] font-medium text-white transition hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:text-zinc-500"
                    >
                      <GoogleIcon />
                      {isGoogleSubmitting ? "Redirecting to Google..." : "Continue with Google"}
                    </button>
                  </>
                ) : null}
              </form>
            )}

            <div className="mt-5 text-center pb-2">
              <button suppressHydrationWarning type="button" onClick={onClose} className="text-[14.5px] font-medium text-[#aaa] hover:text-[#ccc] transition-colors">
                Skip &amp; continue to <span className="text-violet-400 hover:text-violet-300 transition-colors">Home</span>
              </button>
            </div>

          </div>{/* end inner padding */}
        </div>{/* end form panel */}

        {/* ── Success panel ── */}
        <div
          style={{
            ...slideStyle('right', !showSuccess),
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '3.5rem 2rem',
            textAlign: 'center',
          }}
        >
          {/* Green checkmark */}
          <div className="mb-7 flex h-[68px] w-[68px] items-center justify-center rounded-full bg-[#22C55E] shadow-[0_0_32px_rgba(34,197,94,0.35)]">
            <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.8" />
            </svg>
          </div>
          <h2 className="mb-3 text-[22px] font-bold text-white">Success!</h2>
          <p className="mb-1 text-[13.5px] text-[#888]">
            {isSignIn ? "Successfully logged into" : "Account created successfully for"}
            {" "}
            <span className="relative inline-flex items-end font-black italic leading-none">
              <span className="text-white text-[15px]">Rot</span>
              <span className="text-violet-400 text-[15px]">een</span>
            </span>
          </p>
          <p className="mt-6 text-[13px] text-[#555]">
            Redirecting in {redirectCountdown}s...
          </p>
        </div>{/* end success panel */}

      </div>{/* end shared card */}
    </div>
  );
}
