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
    <div className="mx-auto mb-3 flex h-24 w-24 items-center justify-center rounded-full bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.35),_rgba(79,70,229,0.12)_58%,_transparent_70%)]">
      <div className="flex h-16 w-16 items-center justify-center rounded-[1.4rem] border border-indigo-100 bg-white shadow-[0_18px_35px_rgba(79,70,229,0.18)]">
        <svg aria-hidden="true" viewBox="0 0 48 48" className="h-9 w-9">
          <rect x="8" y="12" width="32" height="24" rx="6" fill="#EEF2FF" />
          <path d="M12 18l12 9 12-9" fill="none" stroke="#4F46E5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="35" cy="15" r="7" fill="#4F46E5" />
          <path d="M35 11v8M31 15h8" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
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
    "mt-1.5 w-full rounded-2xl border border-slate-200/80 bg-white/88 px-4 py-3 text-sm text-slate-800 shadow-[inset_0_1px_1px_rgba(255,255,255,0.65)] outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/20";
  const otpInputClassName =
    "mt-1.5 w-full rounded-2xl border border-slate-200/80 bg-white/88 px-4 py-3 text-center text-sm tracking-[0.35em] text-slate-800 shadow-[inset_0_1px_1px_rgba(255,255,255,0.65)] outline-none transition placeholder:tracking-normal focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/20";
  const selectClassName =
    "mt-1.5 w-full rounded-2xl border border-slate-200/80 bg-white/88 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/20";
  const primaryButtonClassName =
    "mt-1 w-full rounded-2xl bg-[linear-gradient(135deg,#2956ff_0%,#4f46e5_45%,#7c3aed_100%)] px-5 py-3 text-base font-semibold text-white shadow-[0_18px_38px_rgba(79,70,229,0.38)] transition hover:-translate-y-0.5 hover:brightness-105";
  const secondaryButtonClassName =
    "w-full rounded-2xl border border-slate-200 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50";

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
      const redirectTo = `${getSiteUrl()}${appRoutes.dashboard}`;
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
    onClose();
    router.push(data?.route ?? appRoutes.dashboard);
    router.refresh();
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
        onClose();
        router.push(data.route);
        router.refresh();
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
    onClose();
    router.push(data?.route ?? appRoutes.dashboard);
    router.refresh();
  }

  async function handleGoogleSignIn() {
    setIsGoogleSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    const redirectTo = `${getSiteUrl()}${appRoutes.authCallback}`;
    const { error } = await signInWithGoogle(redirectTo);

    if (error) {
      setErrorMessage(error.message);
      setIsGoogleSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden px-2 py-3 sm:px-4 sm:py-6">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_12%_20%,rgba(56,189,248,0.18),transparent_38%),radial-gradient(circle_at_86%_78%,rgba(124,58,237,0.16),transparent_36%),rgba(2,6,23,0.62)] backdrop-blur-md"
      />
      <div aria-hidden="true" className="pointer-events-none absolute -left-28 top-20 h-72 w-72 rounded-full bg-violet-600/20 blur-[110px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 bottom-8 h-80 w-80 rounded-full bg-violet-300/25 blur-[120px]" />

      <div className="auth-modal-shell relative z-10 w-full max-w-[28rem] rounded-[30px] p-[1.5px] shadow-[0_28px_90px_rgba(15,23,42,0.38)] sm:max-w-[30rem]">
        <div className="flex max-h-[94dvh] flex-col overflow-hidden rounded-[28px] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,250,255,0.96))]">
        <button
          type="button"
          aria-label="Close"
          className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/35 bg-white/20 text-lg font-semibold text-white shadow-[0_10px_24px_rgba(15,23,42,0.25),inset_0_1px_0_rgba(255,255,255,0.5)] transition hover:scale-105 hover:bg-white/30"
          onClick={onClose}
        >
          x
        </button>

        <div className="relative overflow-hidden bg-[radial-gradient(circle_at_18%_0%,rgba(255,255,255,0.38),transparent_36%),linear-gradient(135deg,#1e40af_0%,#4f46e5_48%,#6d28d9_100%)] px-6 pb-5 pt-10 text-center text-white">
          <div className="pointer-events-none absolute -bottom-16 right-[-56px] h-44 w-44 rounded-full border border-white/30 bg-white/10 blur-[1px]" />
          <h2 className="font-heading text-[2.65rem] font-semibold tracking-tight sm:text-[3.2rem]">
            {isSignIn
              ? "Sign In"
              : signUpStep === 1
                ? "Get Started"
                : signUpStep === 2
                  ? "Verify Email"
                  : "Student Details"}
          </h2>
          <p className="mt-1.5 text-[0.97rem] text-indigo-100">
            {isSignIn
              ? ""
              : signUpStep === 1
                ? ""
              : signUpStep === 2
                ? "Enter the OTP from your email to verify your account."
              : "Fill your profile details to complete registration."}
          </p>
          {((isSignIn && signInStep === 2) || (!isSignIn && signUpStep > 1)) && flowExpiresAt ? (
            <p className="mt-2 text-sm font-semibold text-violet-300">
              Session expires in {formatAuthFlowCountdown(remainingMs)}
            </p>
          ) : null}
        </div>

        {isSignIn ? (
          <form className="space-y-4 px-5 py-5" onSubmit={handleSignIn}>
            {signInStep === 1 ? (
              <label className="block text-sm font-medium text-slate-600">
                Email
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={signInEmail}
                  onChange={(event) => setSignInEmail(event.target.value)}
                  required
                  className={inputClassName}
                />
              </label>
            ) : (
              <>
                <div className="rounded-3xl border border-slate-200 bg-[linear-gradient(180deg,rgba(250,250,250,0.95)_0%,rgba(255,255,255,0.98)_100%)] px-4 py-4 text-center">
                  <MailVerifyArtwork />
                  <p className="text-base font-semibold text-slate-800">
                    Check your email
                  </p>
                  <p className="mt-1.5 text-sm text-slate-500">
                    We sent a 6-digit OTP to{" "}
                    <span className="font-semibold text-slate-700">
                      {signInEmail.trim().toLowerCase()}
                    </span>
                  </p>
                </div>

                <label className="block text-sm font-medium text-slate-600">
                  Verification Code
                  <input
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
                </label>
              </>
            )}

            {errorMessage ? (
              <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {errorMessage}
              </p>
            ) : null}

            <button
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
                  type="button"
                  onClick={async () => {
                    setErrorMessage("");
                    setSuccessMessage("");
                    setIsSubmitting(true);
                    const redirectTo = `${getSiteUrl()}${appRoutes.dashboard}`;
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
                  className="w-full rounded-2xl border border-violet-200 bg-violet-50/70 px-5 py-3 text-sm font-semibold text-violet-700 transition hover:bg-violet-50"
                >
                  Resend OTP
                </button>
              </>
            ) : null}
          </form>
        ) : (
          <form className="no-scrollbar min-h-0 overflow-y-auto space-y-3 px-4 py-3.5 sm:px-4.5" onSubmit={handleSignUp}>
            {signUpStep === 1 ? (
              <>
                <label className="block text-sm font-medium text-slate-600">
                  Email
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={signUpEmail}
                    onChange={(event) => setSignUpEmail(event.target.value)}
                    required
                  className={inputClassName}
                />
                </label>
              </>
            ) : signUpStep === 2 ? (
              <>
                <div className="rounded-3xl border border-slate-200 bg-[linear-gradient(180deg,rgba(250,250,250,0.95)_0%,rgba(255,255,255,0.98)_100%)] px-4 py-4 text-center">
                  <MailVerifyArtwork />
                  <p className="text-base font-semibold text-slate-800">
                    Check your email
                  </p>
                  <p className="mt-1.5 text-sm text-slate-500">
                    We sent a 6-digit OTP to{" "}
                    <span className="font-semibold text-slate-700">
                      {signUpEmail.trim().toLowerCase()}
                    </span>
                  </p>
                </div>

                <label className="block text-sm font-medium text-slate-600">
                  Verification Code
                  <input
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
                </label>
              </>
            ) : (
              <>
                <label className="block text-sm font-medium text-slate-600">
                  Phone Number
                  <div className="mt-1.5 flex rounded-2xl border border-slate-200/80 bg-white/88 transition focus-within:border-violet-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-violet-500/20">
                    <span className="flex items-center border-r border-slate-200 px-3 text-sm text-slate-500">
                      IN
                    </span>
                    <input
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
                      className="w-full rounded-r-2xl bg-transparent px-3 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                    />
                  </div>
                </label>

                <label className="block text-sm font-medium text-slate-600">
                  Std
                  <select
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
                </label>

                <label className="block text-sm font-medium text-slate-600">
                  School Type
                  <select
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
                </label>

                <label className="block text-sm font-medium text-slate-600">
                  School Name
                  <input
                    type="text"
                    placeholder="Enter school name"
                    value={signUpSchoolName}
                    onChange={(event) => setSignUpSchoolName(event.target.value)}
                    required
                    className={inputClassName}
                  />
                </label>

                <label className="block text-sm font-medium text-slate-600">
                  DOB
                  <input
                    type="date"
                    value={signUpDob}
                    onChange={(event) => setSignUpDob(event.target.value)}
                    required
                    className={inputClassName}
                  />
                </label>

                <label className="block text-sm font-medium text-slate-600">
                  District
                  <select
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
                </label>

                <label className="block text-sm font-medium text-slate-600">
                  Gender
                  <select
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
                </label>

                <label className="block text-sm font-medium text-slate-600">
                  Medium
                  <select
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
                </label>

                <label className="block text-sm font-medium text-slate-600">
                  User Type
                  <select
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
                </label>

              </>
            )}

            {errorMessage ? (
              <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {errorMessage}
              </p>
            ) : null}

            {successMessage ? (
              <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {successMessage}
              </p>
            ) : null}

            <button
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
                className="w-full rounded-2xl border border-violet-200 bg-violet-50/70 px-5 py-2.5 text-sm font-semibold text-violet-700 transition hover:bg-violet-50"
              >
                Resend OTP
              </button>
            ) : null}

            {signUpStep === 1 ? (
              <>
                <div className="flex items-center gap-3 py-0.5 text-xs text-slate-400">
                  <span className="h-px flex-1 bg-slate-200" />
                  Or
                  <span className="h-px flex-1 bg-slate-200" />
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isSubmitting || isGoogleSubmitting}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-[0_8px_20px_rgba(15,23,42,0.06)] transition hover:border-violet-200 hover:bg-violet-50/45 disabled:cursor-not-allowed disabled:text-slate-400"
                >
                  <GoogleIcon />
                  {isGoogleSubmitting ? "Redirecting to Google..." : "Continue with Google"}
                </button>

              </>
            ) : (
              null
            )}
          </form>
        )}
        </div>
      </div>
    </div>
  );
}

