"use client";

/* eslint-disable react-hooks/set-state-in-effect */

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
import { supabase, getSiteUrl } from '@/lib/supabase/client';
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
import { fetchSchools, getSchoolsSync } from '@/lib/mock-schools';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

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

const slideVariants = {
  initial: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0
  }),
  animate: {
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0
  })
};

const slideTransition = {
  type: "spring",
  stiffness: 120,
  damping: 20
} as const;

const inputClassName =
  "w-full rounded-md border border-[#1f1f1f] bg-[#111111] px-4 py-2.5 text-[14px] text-zinc-200 outline-none transition placeholder:text-[#666] focus:border-[#333] focus:bg-[#151515]";
const otpInputClassName =
  "w-full rounded-md border border-[#1f1f1f] bg-[#111111] px-4 py-2.5 text-center text-[14px] tracking-[0.35em] text-zinc-200 outline-none transition placeholder:tracking-normal focus:border-[#333] focus:bg-[#151515]";
const primaryButtonClassName =
  "w-full rounded-md bg-violet-600 px-5 py-2.5 text-[14px] font-medium text-white transition hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed";
const secondaryButtonClassName =
  "w-full rounded-md border border-[#1f1f1f] bg-transparent px-5 py-2.5 text-[14px] font-medium text-zinc-400 transition hover:bg-[#111111]";

interface OnboardingContainerProps {
  children: React.ReactNode;
  custom?: number;
}

function OnboardingContainer({ children, custom }: OnboardingContainerProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black">
      <AnimatePresence mode="wait" custom={custom}>
        {children}
      </AnimatePresence>
    </div>
  );
}

interface GoogleStepProps {
  activeMode: AuthMode;
  signInStep: 1 | 2;
  setSignInStep: (step: 1 | 2) => void;
  signUpStep: 1 | 2 | 3;
  setSignUpStep: (step: 1 | 2 | 3) => void;
  signInEmail: string;
  setSignInEmail: (email: string) => void;
  signInOtp: string;
  setSignInOtp: (otp: string) => void;
  signUpEmail: string;
  setSignUpEmail: (email: string) => void;
  signUpOtp: string;
  setSignUpOtp: (otp: string) => void;
  flowExpiresAt: number | null;
  setFlowExpiresAt: (val: number | null) => void;
  remainingMs: number;
  errorMessage: string;
  setErrorMessage: (msg: string) => void;
  successMessage: string;
  setSuccessMessage: (msg: string) => void;
  isSubmitting: boolean;
  setIsSubmitting: (val: boolean) => void;
  isGoogleSubmitting: boolean;
  handleSignIn: (event: FormEvent<HTMLFormElement>) => void;
  handleSignUp: (event: FormEvent<HTMLFormElement>) => void;
  handleGoogleSignIn: () => void;
  handleClose: () => void;
  custom?: number;
}

function GoogleStep({
  activeMode,
  signInStep,
  setSignInStep,
  signUpStep,
  setSignUpStep,
  signInEmail,
  setSignInEmail,
  signInOtp,
  setSignInOtp,
  signUpEmail,
  setSignUpEmail,
  signUpOtp,
  setSignUpOtp,
  flowExpiresAt,
  setFlowExpiresAt,
  remainingMs,
  errorMessage,
  setErrorMessage,
  successMessage,
  setSuccessMessage,
  isSubmitting,
  setIsSubmitting,
  isGoogleSubmitting,
  handleSignIn,
  handleSignUp,
  handleGoogleSignIn,
  handleClose,
  custom,
}: GoogleStepProps) {
  return (
    <motion.div
      variants={slideVariants}
      custom={custom}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={slideTransition}
      className="relative z-10 w-[95%] max-w-[25rem] max-h-[calc(100vh-2rem)] flex flex-col rounded-xl border border-[#161616] bg-[#0a0a0a] shadow-2xl overflow-hidden"
    >
      <div className="relative flex flex-col overflow-y-auto overflow-x-hidden no-scrollbar flex-1 px-7 py-9">
        {/* Floating decorative background blobs */}
        <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-violet-600/10 blur-3xl animate-float" />
        <div className="pointer-events-none absolute -right-16 -bottom-16 h-48 w-48 rounded-full bg-fuchsia-600/10 blur-3xl animate-float" style={{ animationDelay: "2s" }} />

        {activeMode === "signIn" && signInStep === 1 ? (
          <div className="flex flex-1 flex-col w-full relative z-10">
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
                Welcome 👋 Let&apos;s sign in!
              </h2>
            </div>

            <form className="space-y-4" onSubmit={handleSignIn}>
              <div className="relative">
                <input
                  id="signInEmail"
                  suppressHydrationWarning
                  type="email"
                  placeholder=" "
                  value={signInEmail}
                  onChange={(event) => setSignInEmail(event.target.value)}
                  required
                  className="peer w-full rounded-md border border-[#2a2a2a] bg-[#1a1a1a] px-4 pt-5 pb-2 text-[14px] text-zinc-200 outline-none transition focus:border-[#4a4a4a] focus:bg-[#202020]"
                />
                <label
                  htmlFor="signInEmail"
                  className="absolute left-4 top-3.5 z-10 origin-left -translate-y-2.5 scale-75 transform text-[12px] text-zinc-500 duration-150 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-[14px] peer-focus:-translate-y-2.5 peer-focus:scale-75 peer-focus:text-violet-400 pointer-events-none"
                >
                  Email Address
                </label>
              </div>

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
                {isSubmitting ? "Sending OTP..." : "Continue with Email"}
              </button>

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
            </form>

            <div className="mt-5 text-center pb-2">
              <button suppressHydrationWarning type="button" onClick={handleClose} className="text-[14.5px] font-medium text-[#aaa] hover:text-[#ccc] transition-colors">
                Skip &amp; continue to <span className="text-violet-400 hover:text-violet-300 transition-colors">Home</span>
              </button>
            </div>
          </div>
        ) : activeMode === "signIn" && signInStep === 2 ? (
          <div className="flex flex-1 flex-col w-full relative z-10">
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
                Verify your email
              </h2>
              {flowExpiresAt ? (
                <p className="mt-2 text-[13px] font-medium text-violet-400">
                  Session expires in {formatAuthFlowCountdown(remainingMs)}
                </p>
              ) : null}
            </div>

            <form className="space-y-4" onSubmit={handleSignIn}>
              <div className="rounded-xl border border-[#2a2a2a] bg-[#141414] px-4 py-6 text-center">
                <MailVerifyArtwork />
                <p className="text-[13px] text-zinc-400">
                  Enter the OTP sent to
                  <br />
                  <span className="font-semibold text-zinc-300">
                    {signInEmail.trim().toLowerCase()}
                  </span>
                </p>
              </div>

              <div className="relative">
                <input
                  id="signInOtp"
                  suppressHydrationWarning
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder=" "
                  value={signInOtp}
                  onChange={(event) =>
                    setSignInOtp(
                      event.target.value.replace(/\D/g, "").slice(0, 6),
                    )
                  }
                  required
                  className="peer w-full rounded-md border border-[#2a2a2a] bg-[#1a1a1a] px-4 pt-5 pb-2 text-center text-[14px] tracking-[0.35em] text-zinc-200 outline-none transition focus:border-[#4a4a4a] focus:bg-[#202020] placeholder:tracking-normal"
                />
                <label
                  htmlFor="signInOtp"
                  className="absolute left-1/2 -translate-x-1/2 top-3.5 z-10 origin-center -translate-y-2.5 scale-75 transform text-[12px] text-zinc-500 duration-150 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-[14px] peer-focus:-translate-y-2.5 peer-focus:scale-75 peer-focus:text-violet-400 pointer-events-none"
                >
                  6-digit OTP
                </label>
              </div>

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
                {isSubmitting ? "Verifying..." : "Secure Login"}
              </button>

              <button
                suppressHydrationWarning
                type="button"
                onClick={() => {
                  setErrorMessage("");
                  setSuccessMessage("");
                  setSignInStep(1);
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
                  const { error } = await sendExistingUserLoginOtp(signInEmail);
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
                className="w-full rounded-lg border border-[#2a2a2a] bg-transparent px-5 py-3 text-[14px] font-medium text-violet-400 transition hover:bg-violet-950/30 hover:border-violet-800/60 hover:text-violet-300"
              >
                Resend OTP
              </button>
            </form>

            <div className="mt-5 text-center pb-2">
              <button suppressHydrationWarning type="button" onClick={handleClose} className="text-[14.5px] font-medium text-[#aaa] hover:text-[#ccc] transition-colors">
                Skip &amp; continue to <span className="text-violet-400 hover:text-violet-300 transition-colors">Home</span>
              </button>
            </div>
          </div>
        ) : activeMode === "signUp" && signUpStep === 1 ? (
          <div className="flex flex-1 flex-col w-full relative z-10">
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
                Welcome 👋 Fuel your Future
              </h2>
            </div>

            <form className="space-y-4" onSubmit={handleSignUp}>
              <div className="relative">
                <input
                  id="signUpEmail"
                  suppressHydrationWarning
                  type="email"
                  placeholder=" "
                  value={signUpEmail}
                  onChange={(event) => setSignUpEmail(event.target.value)}
                  required
                  className="peer w-full rounded-md border border-[#2a2a2a] bg-[#1a1a1a] px-4 pt-5 pb-2 text-[14px] text-zinc-200 outline-none transition focus:border-[#4a4a4a] focus:bg-[#202020]"
                />
                <label
                  htmlFor="signUpEmail"
                  className="absolute left-4 top-3.5 z-10 origin-left -translate-y-2.5 scale-75 transform text-[12px] text-zinc-500 duration-150 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-[14px] peer-focus:-translate-y-2.5 peer-focus:scale-75 peer-focus:text-violet-400 pointer-events-none"
                >
                  Email Address
                </label>
              </div>

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
                {isSubmitting ? "Sending OTP..." : "Continue"}
              </button>

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
            </form>

            <div className="mt-5 text-center pb-2">
              <button suppressHydrationWarning type="button" onClick={handleClose} className="text-[14.5px] font-medium text-[#aaa] hover:text-[#ccc] transition-colors">
                Skip &amp; continue to <span className="text-violet-400 hover:text-violet-300 transition-colors">Home</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col w-full relative z-10">
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
                Verify your email
              </h2>
              {flowExpiresAt ? (
                <p className="mt-2 text-[13px] font-medium text-violet-400">
                  Session expires in {formatAuthFlowCountdown(remainingMs)}
                </p>
              ) : null}
            </div>

            <form className="space-y-4" onSubmit={handleSignUp}>
              <div className="rounded-xl border border-[#2a2a2a] bg-[#141414] px-4 py-6 text-center">
                <MailVerifyArtwork />
                <p className="text-[13px] text-zinc-400">
                  Enter the OTP sent to
                  <br />
                  <span className="font-semibold text-zinc-300">
                    {signUpEmail.trim().toLowerCase()}
                  </span>
                </p>
              </div>

              <div className="relative">
                <input
                  id="signUpOtp"
                  suppressHydrationWarning
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder=" "
                  value={signUpOtp}
                  onChange={(event) =>
                    setSignUpOtp(
                      event.target.value.replace(/\D/g, "").slice(0, 6),
                    )
                  }
                  required
                  className="peer w-full rounded-md border border-[#2a2a2a] bg-[#1a1a1a] px-4 pt-5 pb-2 text-center text-[14px] tracking-[0.35em] text-zinc-200 outline-none transition focus:border-[#4a4a4a] focus:bg-[#202020] placeholder:tracking-normal"
                />
                <label
                  htmlFor="signUpOtp"
                  className="absolute left-1/2 -translate-x-1/2 top-3.5 z-10 origin-center -translate-y-2.5 scale-75 transform text-[12px] text-zinc-500 duration-150 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-[14px] peer-focus:-translate-y-2.5 peer-focus:scale-75 peer-focus:text-violet-400 pointer-events-none"
                >
                  6-digit OTP
                </label>
              </div>

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
                {isSubmitting ? "Verifying..." : "Verify Email"}
              </button>

              <button
                suppressHydrationWarning
                type="button"
                onClick={() => {
                  setErrorMessage("");
                  setSuccessMessage("");
                  setSignUpStep(1);
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
                className="w-full rounded-lg border border-[#2a2a2a] bg-transparent px-5 py-3 text-[14px] font-medium text-violet-400 transition hover:bg-violet-950/30 hover:border-violet-800/60 hover:text-violet-300"
              >
                Resend OTP
              </button>
            </form>

            <div className="mt-5 text-center pb-2">
              <button suppressHydrationWarning type="button" onClick={handleClose} className="text-[14.5px] font-medium text-[#aaa] hover:text-[#ccc] transition-colors">
                Skip &amp; continue to <span className="text-violet-400 hover:text-violet-300 transition-colors">Home</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

interface SignupStepProps {
  signUpFullName: string;
  setSignUpFullName: (val: string) => void;
  signUpPhone: string;
  setSignUpPhone: (val: string) => void;
  signUpDistrict: string;
  setSignUpDistrict: (val: string) => void;
  signUpStandard: string;
  setSignUpStandard: (val: string) => void;
  signUpSchoolType: string;
  setSignUpSchoolType: (val: string) => void;
  signUpSchoolName: string;
  setSignUpSchoolName: (val: string) => void;
  signUpDob: string;
  setSignUpDob: (val: string) => void;
  signUpGender: string;
  setSignUpGender: (val: string) => void;
  signUpMedium: string;
  setSignUpMedium: (val: string) => void;
  signUpUserType: string;
  setSignUpUserType: (val: string) => void;
  signUpReferralCode: string;
  setSignUpReferralCode: (val: string) => void;
  flowExpiresAt: number | null;
  remainingMs: number;
  otherSchoolText: string;
  setOtherSchoolText: (val: string) => void;
  schools: { label: string; value: string }[];
  isLoadingSchools: boolean;
  errorMessage: string;
  successMessage: string;
  isSubmitting: boolean;
  isGoogleSubmitting: boolean;
  loginMethod: "otp" | "google";
  setSignUpStep: (step: 1 | 2 | 3) => void;
  setErrorMessage: (msg: string) => void;
  setSuccessMessage: (msg: string) => void;
  handleSignUp: (event: FormEvent<HTMLFormElement>) => void;
  handleClose: () => void;
  custom?: number;
}

function SignupStep({
  signUpFullName,
  setSignUpFullName,
  signUpPhone,
  setSignUpPhone,
  signUpDistrict,
  setSignUpDistrict,
  signUpStandard,
  setSignUpStandard,
  signUpSchoolType,
  setSignUpSchoolType,
  signUpSchoolName,
  setSignUpSchoolName,
  signUpDob,
  setSignUpDob,
  signUpGender,
  setSignUpGender,
  signUpMedium,
  setSignUpMedium,
  signUpUserType,
  setSignUpUserType,
  signUpReferralCode,
  setSignUpReferralCode,
  flowExpiresAt,
  remainingMs,
  otherSchoolText,
  setOtherSchoolText,
  schools,
  isLoadingSchools,
  errorMessage,
  successMessage,
  isSubmitting,
  isGoogleSubmitting,
  loginMethod,
  setSignUpStep,
  setErrorMessage,
  setSuccessMessage,
  handleSignUp,
  handleClose,
  custom,
}: SignupStepProps) {
  return (
    <motion.div
      variants={slideVariants}
      custom={custom}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={slideTransition}
      className="relative z-10 w-[95%] max-w-[25rem] max-h-[calc(100vh-2rem)] flex flex-col rounded-xl border border-[#161616] bg-[#0a0a0a] shadow-2xl overflow-hidden"
    >
      <div className="flex flex-col overflow-y-auto no-scrollbar">
        <div className="flex flex-1 flex-col rounded-xl px-7 py-9">
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
              Complete your profile
            </h2>
            {flowExpiresAt ? (
              <p className="mt-2 text-[13px] font-medium text-violet-400">
                Session expires in {formatAuthFlowCountdown(remainingMs)}
              </p>
            ) : null}
          </div>

          <form className="space-y-4" onSubmit={handleSignUp}>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 flex rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] transition focus-within:border-[#4a4a4a] focus-within:bg-[#202020]">
                <input
                  suppressHydrationWarning
                  type="text"
                  placeholder="Full Name"
                  value={signUpFullName}
                  onChange={(event) => setSignUpFullName(event.target.value)}
                  required
                  className="w-full bg-transparent px-4 py-3.5 text-[14px] text-zinc-200 outline-none placeholder:text-zinc-500"
                />
              </div>

              <div className="col-span-2 flex rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] transition focus-within:border-[#4a4a4a] focus-within:bg-[#202020]">
                <span className="flex items-center border-r border-[#2a2a2a] px-4 text-[14px] text-zinc-500">
                  IN
                </span>
                <input
                  suppressHydrationWarning
                  type="tel"
                  placeholder="Mobile Number"
                  value={signUpPhone}
                  onChange={(event) =>
                    setSignUpPhone(
                      event.target.value.replace(/\D/g, "").slice(0, 10),
                    )
                  }
                  inputMode="numeric"
                  minLength={10}
                  maxLength={10}
                  required
                  className="w-full rounded-r-lg bg-transparent px-4 py-3.5 text-[14px] text-zinc-200 outline-none placeholder:text-zinc-500"
                />
              </div>

              <SearchableSelect
                name="signUpDistrict"
                value={signUpDistrict}
                options={districtOptions.map(o => ({ label: o, value: o }))}
                onChange={(e) => {
                  setSignUpDistrict(e.target.value);
                  setSignUpSchoolName("");
                  setOtherSchoolText("");
                }}
                placeholder="Select district"
                searchable={true}
              />

              <SearchableSelect
                name="signUpStandard"
                value={signUpStandard}
                options={standardOptions.map(o => ({ label: o, value: o }))}
                onChange={(e) => setSignUpStandard(e.target.value)}
                placeholder="Select Std"
                searchable={false}
              />

              <SearchableSelect
                name="signUpSchoolType"
                value={signUpSchoolType}
                options={schoolTypeOptions.map(o => ({ label: o, value: o }))}
                onChange={(e) => {
                  setSignUpSchoolType(e.target.value);
                  setSignUpSchoolName("");
                  setOtherSchoolText("");
                }}
                placeholder="Select School Type"
                searchable={false}
              />

              <SearchableSelect
                name="signUpMedium"
                value={signUpMedium}
                options={mediumOptions.map(o => ({ label: o, value: o }))}
                onChange={(e) => setSignUpMedium(e.target.value)}
                placeholder="Select Medium"
                searchable={false}
              />

              <div className="col-span-2 flex flex-col gap-2">
                <SearchableSelect
                  name="signUpSchoolName"
                  value={signUpSchoolName}
                  options={schools}
                  onChange={(e) => setSignUpSchoolName(e.target.value)}
                  placeholder={
                    !signUpDistrict || !signUpSchoolType
                      ? "Select district and type first"
                      : "Search for your school"
                  }
                  disabled={!signUpDistrict || !signUpSchoolType}
                  loading={isLoadingSchools}
                  dropUp={false}
                />
                {signUpSchoolName === "OTHER" && (
                  <input
                    suppressHydrationWarning
                    type="text"
                    placeholder="Enter your custom school name"
                    value={otherSchoolText}
                    onChange={(event) => setOtherSchoolText(event.target.value)}
                    className={inputClassName}
                  />
                )}
              </div>

              <div className="relative">
                <input
                  id="signUpDob"
                  suppressHydrationWarning
                  type="date"
                  value={signUpDob}
                  onChange={(event) => setSignUpDob(event.target.value)}
                  required
                  className="w-full rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-4 pt-5 pb-1.5 text-[14px] text-zinc-200 outline-none transition focus:border-[#4a4a4a] focus:bg-[#202020]"
                  style={{ colorScheme: "dark" }}
                />
                <label
                  htmlFor="signUpDob"
                  className="absolute left-4 top-1.5 z-10 origin-left scale-75 transform text-[11px] text-zinc-500 pointer-events-none"
                >
                  Date of Birth
                </label>
              </div>

              <SearchableSelect
                name="signUpGender"
                value={signUpGender}
                options={genderOptions.map(o => ({ label: o, value: o }))}
                onChange={(e) => setSignUpGender(e.target.value)}
                placeholder="Select Gender"
                searchable={false}
                dropUp={false}
              />

              <div className="col-span-2">
                <SearchableSelect
                  name="signUpUserType"
                  value={signUpUserType}
                  options={userTypeOptions.map(o => ({ label: o, value: o }))}
                  onChange={(e) => setSignUpUserType(e.target.value)}
                  placeholder="Select User Type"
                  searchable={false}
                  dropUp={false}
                />
              </div>

              {/* Referral Code — optional */}
              <div className="col-span-2">
                <div className="flex items-center gap-2 rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] transition focus-within:border-violet-700/60 focus-within:bg-[#1c1527]">
                  <span className="pl-4 text-[13px] font-semibold tracking-widest text-violet-400">RTN-</span>
                  <input
                    suppressHydrationWarning
                    type="text"
                    placeholder="Referral code (optional)"
                    value={signUpReferralCode}
                    onChange={(e) =>
                      setSignUpReferralCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12))
                    }
                    className="w-full bg-transparent py-3.5 pr-4 text-[14px] font-mono uppercase tracking-wider text-zinc-200 outline-none placeholder:text-zinc-600 placeholder:normal-case placeholder:tracking-normal"
                  />
                </div>
              </div>
            </div>

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
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating your account...
                </span>
              ) : (
                "Complete Your Sign Up"
              )}
            </button>

            {loginMethod === "otp" && (
              <button
                suppressHydrationWarning
                type="button"
                onClick={() => {
                  setErrorMessage("");
                  setSuccessMessage("");
                  setSignUpStep(2);
                }}
                className={secondaryButtonClassName}
              >
                Back
              </button>
            )}
          </form>

          <div className="mt-5 text-center pb-2">
            <button suppressHydrationWarning type="button" onClick={handleClose} className="text-[14.5px] font-medium text-[#aaa] hover:text-[#ccc] transition-colors">
              Skip &amp; continue to <span className="text-violet-400 hover:text-violet-300 transition-colors">Home</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface SuccessStepProps {
  wasSignInSuccess: boolean;
  redirectCountdown: number;
  custom?: number;
}

function SuccessStep({ wasSignInSuccess, redirectCountdown, custom }: SuccessStepProps) {
  return (
    <motion.div
      variants={slideVariants}
      custom={custom}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={slideTransition}
      className="relative z-20 w-[95%] max-w-[25rem] flex flex-col rounded-xl border border-[#161616] bg-[#0a0a0a]/80 backdrop-blur-xl shadow-2xl overflow-hidden p-10 items-center justify-center text-center min-h-[400px]"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4, type: "spring", bounce: 0.4 }}
        className="mb-5 flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[#00e571]"
      >
        <svg viewBox="0 0 24 24" className="h-8 w-8 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="3" />
        </svg>
      </motion.div>

      <h2 className="mb-4 text-[24px] font-bold text-white tracking-tight">Success!</h2>

      <div className="flex items-center justify-center gap-2 mb-8">
        <span className="text-[14px] text-zinc-400">
          {wasSignInSuccess ? "Successfully logged into" : "Account created for"}
        </span>
        <span className="inline-flex items-baseline font-heading text-[16px] font-black italic tracking-normal">
          <span className="text-white">Rot</span>
          <span className="text-violet-400">een</span>
        </span>
      </div>

      <p className="text-[13px] text-[#555]">
        Redirecting in {redirectCountdown}s...
      </p>
    </motion.div>
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
  const [activeMode, setActiveMode] = useState<AuthMode>(mode);

  useEffect(() => {
    setActiveMode(mode);
  }, [mode]);

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
  const [signUpFullName, setSignUpFullName] = useState(
    initialDraft?.mode === "signUp" ? initialDraft.signUpFullName ?? "" : "",
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
  const [signUpReferralCode, setSignUpReferralCode] = useState("");
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
  const [redirectCountdown, setRedirectCountdown] = useState(2);
  const [pendingRoute, setPendingRoute] = useState<string | null>(null);
  const [loginMethod, setLoginMethod] = useState<"otp" | "google">("otp");
  const [wasSignInSuccess, setWasSignInSuccess] = useState(false);

  const [schools, setSchools] = useState<{ label: string, value: string }[]>([]);
  const [isLoadingSchools, setIsLoadingSchools] = useState(false);
  const [otherSchoolText, setOtherSchoolText] = useState("");
  const [slideDirection, setSlideDirection] = useState<number>(1);

  const handleSetSignInStep = (step: 1 | 2) => {
    setSlideDirection(step === 2 ? 1 : -1);
    setSignInStep(step);
  };

  const handleSetSignUpStep = (step: 1 | 2 | 3) => {
    if (step === 2) {
      setSlideDirection(signUpStep === 1 ? 1 : -1);
    } else if (step === 1) {
      setSlideDirection(-1);
    } else {
      setSlideDirection(1);
    }
    setSignUpStep(step);
  };

  useEffect(() => {
    if (signUpDistrict && signUpSchoolType) {
      const data = getSchoolsSync(signUpDistrict, signUpSchoolType);
      const fetchedOptions = data.map(s => ({ label: s.name, value: s.name }));
      fetchedOptions.push({ label: "Other School (Not Listed)", value: "OTHER" });
      setSchools(fetchedOptions);

      if (signUpSchoolName && signUpSchoolName !== "OTHER" && !fetchedOptions.find(o => o.value === signUpSchoolName)) {
        setOtherSchoolText(signUpSchoolName);
        setSignUpSchoolName("OTHER");
      }
    } else {
      setSchools([]);
    }
  }, [signUpDistrict, signUpSchoolType]);

  useEffect(() => {
    if (signUpStep === 3) {
      const fetchUserData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setSignUpEmail(prev => prev || user.email || "");
          const metadata = user.user_metadata;
          const googleName = metadata?.full_name || metadata?.name || "";
          setSignUpFullName(prev => prev || googleName || "");

          const { data: profile } = await supabase
            .from("users")
            .select("name, phone_number, district, standard, school_type, school_name, dob, gender, medium_of_education, user_type")
            .eq("id", user.id)
            .maybeSingle();

          if (profile) {
            if (profile.name) setSignUpFullName(prev => prev || profile.name || "");
            if (profile.phone_number) setSignUpPhone(prev => prev || profile.phone_number || "");
            if (profile.district) setSignUpDistrict(prev => prev || profile.district || "");
            if (profile.standard) setSignUpStandard(prev => prev || profile.standard || "");
            if (profile.school_type) setSignUpSchoolType(prev => prev || profile.school_type || "");
            if (profile.school_name) setSignUpSchoolName(prev => prev || profile.school_name || "");
            if (profile.dob) setSignUpDob(prev => prev || profile.dob || "");
            if (profile.gender) setSignUpGender(prev => prev || profile.gender || "");
            if (profile.medium_of_education) setSignUpMedium(prev => prev || profile.medium_of_education || "");
            if (profile.user_type) setSignUpUserType(prev => prev || profile.user_type || "");
          }
        }
      };
      fetchUserData();
    }
  }, [signUpStep]);

  function triggerSuccess() {
    setShowSuccess(true);
  }

  useEffect(() => {
    if (isGoogleSuccess && !showSuccess) {
      setPendingRoute(nextRoute ?? appRoutes.home);
      setWasSignInSuccess(true);
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
        const authParam = parsedUrl.searchParams.get("auth");
        const stepParam = parsedUrl.searchParams.get("step");

        // Synchronously transition to the success page or the profile completion page
        // immediately to prevent the login modal/form from showing again.
        if (successParam) {
          setPendingRoute(nextRouteParam ?? appRoutes.home);
          setWasSignInSuccess(true);
          setShowSuccess(true);
        } else if (authParam === "signUp" && stepParam === "3") {
          setIsGoogleSubmitting(false);
          setLoginMethod("google");
          setActiveMode("signUp");
          setSignUpStep(3);
          setFlowExpiresAt(getAuthFlowExpiryTimestamp());
          setSuccessMessage("Google account verified successfully. Please complete your student details.");
        }

        void (async () => {
          if (event.data.session) {
            await supabase.auth.setSession(event.data.session);
          } else {
            await supabase.auth.getSession();
          }

          if (!successParam && !(authParam === "signUp" && stepParam === "3")) {
            setIsGoogleSubmitting(false);
            clearAuthFlowDraft();
            onClose();
            router.push(event.data.url);
            router.refresh();
          }
        })();
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
        void (async () => {
          if (!showSuccess && activeMode === "signUp" && signUpStep === 3) {
            await supabase.auth.signOut();
          }
          onClose();
          router.push(appRoutes.home);
          router.refresh();
        })();
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
    if (activeMode === "signIn" && signInStep === 2) {
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

    if (activeMode === "signUp" && signUpStep > 1) {
      writeAuthFlowDraft({
        mode: "signUp",
        expiresAt: flowExpiresAt ?? getAuthFlowExpiryTimestamp(),
        signUpStep,
        signUpEmail,
        signUpOtp,
        signUpFullName,
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
    activeMode,
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
    signUpFullName,
    signUpPhone,
    signUpSchoolName,
    signUpSchoolType,
    signUpStandard,
    signUpStep,
    signUpUserType,
    successMessage,
  ]);

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
      handleSetSignInStep(2);
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
    setWasSignInSuccess(true);
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
      handleSetSignUpStep(2);
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
        setWasSignInSuccess(true);
        setPendingRoute(data.route);
        triggerSuccess();
        return;
      }

      handleSetSignUpStep(3);
      setSignUpOtp("");
      setIsSubmitting(false);
      setSuccessMessage(
        "Email verified successfully. Please complete your student details.",
      );
      return;
    }

    setIsSubmitting(true);

    if (!signUpFullName || !signUpDistrict || !signUpStandard || !signUpSchoolType || !signUpSchoolName || !signUpDob || !signUpGender || !signUpMedium || !signUpUserType || !signUpPhone) {
      setErrorMessage("Please fill out all the fields before completing your profile.");
      setIsSubmitting(false);
      return;
    }

    if (signUpSchoolName === "OTHER") {
      if (otherSchoolText.trim().length < 3 || otherSchoolText.trim().length > 120) {
        setErrorMessage("Custom school name must be between 3 and 120 characters.");
        setIsSubmitting(false);
        return;
      }
    }

    const finalSchoolName = signUpSchoolName === "OTHER" ? otherSchoolText.trim() : signUpSchoolName;

    try {
      const { data, error } = await saveVerifiedStudentProfile({
        fullName: signUpFullName,
        phone: signUpPhone,
        standard: signUpStandard,
        schoolType: signUpSchoolType,
        schoolName: finalSchoolName,
        dob: signUpDob,
        district: signUpDistrict,
        gender: signUpGender,
        medium: signUpMedium,
        userType: signUpUserType,
        referredByCode: signUpReferralCode.trim()
          ? (signUpReferralCode.trim().toUpperCase().startsWith("RTN-")
            ? signUpReferralCode.trim().toUpperCase()
            : `RTN-${signUpReferralCode.trim().toUpperCase()}`)
          : undefined,
      });

      if (error) {
        setErrorMessage(error.message);
        setIsSubmitting(false);
        return;
      }

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("roteen-profile-updated"));
      }

      setIsSubmitting(false);
      setFlowExpiresAt(null);
      clearAuthFlowDraft();
      setLoginMethod("otp");
      setWasSignInSuccess(false);
      setPendingRoute(data?.route ?? appRoutes.home);
      triggerSuccess();
    } catch (err: unknown) {
      console.error("Error during profile completion:", err);
      const msg = err instanceof Error ? err.message : "An unexpected error occurred. Please try again.";
      setErrorMessage(msg);
      setIsSubmitting(false);
    }
  }

  async function handleGoogleSignIn() {
    setIsGoogleSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    const redirectTo = `${getSiteUrl()}${appRoutes.authCallback}`;
    const { error, popupWindow, redirected } = await signInWithGoogle(redirectTo);

    if (error) {
      setErrorMessage(error.message);
      setIsGoogleSubmitting(false);
    } else if (redirected) {
      // Direct redirect is in progress, keep the loading spinner active and do nothing else
      return;
    } else if (popupWindow) {
      const startTime = Date.now();
      const checkClosed = window.setInterval(async () => {
        if (popupWindow.closed) {
          window.clearInterval(checkClosed);
          setIsGoogleSubmitting(false);

          // If the window is closed in under 350ms, it's almost certainly blocked by a popup blocker
          const elapsed = Date.now() - startTime;
          if (elapsed < 350) {
            console.warn("OAuth popup closed instantly (likely blocked). Redirecting directly...");
            setIsGoogleSubmitting(true);
            const { error: redirectError } = await supabase.auth.signInWithOAuth({
              provider: "google",
              options: {
                redirectTo,
                queryParams: {
                  access_type: "offline",
                  prompt: "select_account",
                },
              },
            });
            if (redirectError) {
              setErrorMessage(redirectError.message);
              setIsGoogleSubmitting(false);
            }
          }
        }
      }, 100);
    } else {
      setErrorMessage("Please allow popups to sign in with Google.");
      setIsGoogleSubmitting(false);
    }
  }

  const handleClose = async () => {
    if (!showSuccess && activeMode === "signUp" && signUpStep === 3) {
      await supabase.auth.signOut();
    }
    onClose();
  };

  let currentStep: "google" | "signup" | "success" = "google";
  if (showSuccess) {
    currentStep = "success";
  } else if (activeMode === "signUp" && signUpStep === 3) {
    currentStep = "signup";
  } else {
    currentStep = "google";
  }

  return (
    <OnboardingContainer custom={slideDirection}>
      {currentStep === "google" && (
        <GoogleStep
          key={`${activeMode}-${activeMode === "signIn" ? signInStep : signUpStep}`}
          activeMode={activeMode}
          signInStep={signInStep}
          setSignInStep={handleSetSignInStep}
          signUpStep={signUpStep}
          setSignUpStep={handleSetSignUpStep}
          signInEmail={signInEmail}
          setSignInEmail={setSignInEmail}
          signInOtp={signInOtp}
          setSignInOtp={setSignInOtp}
          signUpEmail={signUpEmail}
          setSignUpEmail={setSignUpEmail}
          signUpOtp={signUpOtp}
          setSignUpOtp={setSignUpOtp}
          flowExpiresAt={flowExpiresAt}
          setFlowExpiresAt={setFlowExpiresAt}
          remainingMs={remainingMs}
          errorMessage={errorMessage}
          setErrorMessage={setErrorMessage}
          successMessage={successMessage}
          setSuccessMessage={setSuccessMessage}
          isSubmitting={isSubmitting}
          setIsSubmitting={setIsSubmitting}
          isGoogleSubmitting={isGoogleSubmitting}
          handleSignIn={handleSignIn}
          handleSignUp={handleSignUp}
          handleGoogleSignIn={handleGoogleSignIn}
          handleClose={handleClose}
          custom={slideDirection}
        />
      )}
      {currentStep === "signup" && (
        <SignupStep
          key="signup"
          signUpFullName={signUpFullName}
          setSignUpFullName={setSignUpFullName}
          signUpPhone={signUpPhone}
          setSignUpPhone={setSignUpPhone}
          signUpDistrict={signUpDistrict}
          setSignUpDistrict={setSignUpDistrict}
          signUpStandard={signUpStandard}
          setSignUpStandard={setSignUpStandard}
          signUpSchoolType={signUpSchoolType}
          setSignUpSchoolType={setSignUpSchoolType}
          signUpSchoolName={signUpSchoolName}
          setSignUpSchoolName={setSignUpSchoolName}
          signUpDob={signUpDob}
          setSignUpDob={setSignUpDob}
          signUpGender={signUpGender}
          setSignUpGender={setSignUpGender}
          signUpMedium={signUpMedium}
          setSignUpMedium={setSignUpMedium}
          signUpUserType={signUpUserType}
          setSignUpUserType={setSignUpUserType}
          signUpReferralCode={signUpReferralCode}
          setSignUpReferralCode={setSignUpReferralCode}
          flowExpiresAt={flowExpiresAt}
          remainingMs={remainingMs}
          otherSchoolText={otherSchoolText}
          setOtherSchoolText={setOtherSchoolText}
          schools={schools}
          isLoadingSchools={isLoadingSchools}
          errorMessage={errorMessage}
          successMessage={successMessage}
          isSubmitting={isSubmitting}
          isGoogleSubmitting={isGoogleSubmitting}
          loginMethod={loginMethod}
          setSignUpStep={handleSetSignUpStep}
          setErrorMessage={setErrorMessage}
          setSuccessMessage={setSuccessMessage}
          handleSignUp={handleSignUp}
          handleClose={handleClose}
          custom={slideDirection}
        />
      )}
      {currentStep === "success" && (
        <SuccessStep
          key="success"
          wasSignInSuccess={wasSignInSuccess}
          redirectCountdown={redirectCountdown}
          custom={slideDirection}
        />
      )}
    </OnboardingContainer>
  );
}
