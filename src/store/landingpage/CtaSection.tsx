import Link from "next/link";
import { appRoutes } from "@/navigation/AppRoutes";

type CtaSectionProps = {
  primaryAction: string;
  secondaryAction: string;
  onPrimaryActionClick?: () => void;
};

export function CtaSection({
  primaryAction,
  secondaryAction,
}: CtaSectionProps) {
  return (
    <section id="get-started" className="relative overflow-hidden !bg-[linear-gradient(180deg,#f5f2ff_0%,#ffffff_100%)] px-6 py-8 pb-20 lg:px-8 lg:pb-24">
      <div className="pointer-events-none absolute inset-x-0 top-8 h-56 bg-[radial-gradient(circle_at_50%_50%,rgba(184,169,255,0.32),transparent_68%)] blur-3xl" />
      <div className="mx-auto max-w-7xl">
        <div className="cta-panel relative overflow-hidden rounded-[2.6rem] border !border-white/70 px-8 py-16 text-center !text-white shadow-[0_38px_90px_rgba(127,114,184,0.26)] lg:px-16 lg:py-20">
          <div className="pointer-events-none absolute inset-0 !bg-[linear-gradient(135deg,#c8bfff_0%,#a797ff_42%,#7c6cf2_100%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_28%,rgba(255,255,255,0.34),transparent_20%),radial-gradient(circle_at_82%_24%,rgba(255,255,255,0.22),transparent_22%),radial-gradient(circle_at_50%_110%,rgba(255,255,255,0.18),transparent_34%)]" />
          <div className="pointer-events-none absolute -left-10 top-10 h-32 w-32 rounded-full border border-white/18 bg-white/8 blur-[2px]" />
          <div className="pointer-events-none absolute right-10 top-12 h-20 w-20 rounded-full border border-white/18 bg-white/10" />
          <div className="pointer-events-none absolute bottom-0 left-1/2 h-40 w-72 -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.36),transparent_70%)] blur-3xl" />
          <div className="pointer-events-none absolute inset-x-[12%] top-0 h-px bg-white/35" />

          <div className="relative mx-auto max-w-4xl animate-[fadeLift_1s_ease-out]">
        <h2 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
          Stop Watching. Start Solving.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-blue-100 sm:text-lg">
          Join thousands of students who have escaped the cycle of passive learning.
          Launch your academic career into the stratosphere today.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            disabled
            aria-disabled="true"
            className="rounded-full !bg-slate-950 px-8 py-3.5 text-sm font-semibold !text-white shadow-[0_18px_40px_rgba(15,23,42,0.22)] transition duration-300 disabled:cursor-not-allowed disabled:opacity-90"
          >
            {primaryAction}
          </button>
          <Link
            href={appRoutes.pricing}
            className="rounded-full border !border-white/60 !bg-white/96 px-8 py-3.5 text-sm font-semibold !text-[#6d5df0] shadow-[0_12px_30px_rgba(255,255,255,0.18)] transition duration-300 hover:-translate-y-0.5 hover:!bg-white"
          >
            {secondaryAction}
          </Link>
        </div>
          </div>
        </div>
      </div>
    </section>
  );
}

