import Link from "next/link";
import { appRoutes } from "@/constants/AppRoutes";
import { ScrollReveal } from "@/components/ui/motion/ScrollReveal";

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
    <section id="get-started" className="relative overflow-hidden bg-transparent px-6 py-8 pb-20 lg:px-8 lg:pb-24">
      <div className="pointer-events-none absolute inset-x-0 top-8 h-56 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_68%)] blur-[100px]" />
      <div className="mx-auto max-w-7xl">
        <ScrollReveal className="cta-panel relative overflow-hidden rounded-[2.6rem] border border-white/10 px-8 py-16 text-center text-white shadow-2xl lg:px-16 lg:py-20">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(139,92,246,0.3)_0%,rgba(17,24,39,0.95)_42%,rgba(0,0,0,1)_100%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_28%,rgba(255,255,255,0.03),transparent_20%),radial-gradient(circle_at_82%_24%,rgba(139,92,246,0.08),transparent_22%),radial-gradient(circle_at_50%_110%,rgba(139,92,246,0.15),transparent_34%)]" />
          <div className="pointer-events-none absolute -left-10 top-10 h-32 w-32 rounded-full border border-violet-500/20 bg-violet-500/10 blur-[2px] animate-float" />
          <div className="pointer-events-none absolute right-10 top-12 h-20 w-20 rounded-full border border-violet-500/20 bg-violet-500/10 animate-float" style={{ animationDelay: "1s" }} />
          <div className="pointer-events-none absolute bottom-0 left-1/2 h-40 w-72 -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.2),transparent_70%)] blur-[60px]" />
          <div className="pointer-events-none absolute inset-x-[12%] top-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

          <div className="relative mx-auto max-w-4xl">
            <h2 className="font-heading text-4xl premium-heading sm:text-5xl lg:text-6xl text-white">
              Stop Watching. Start Solving.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg">
              Join thousands of students who have escaped the cycle of passive learning.
              Launch your academic career into the stratosphere today.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                disabled
                aria-disabled="true"
                className="rounded-full bg-zinc-800 px-8 py-3.5 text-sm font-semibold text-zinc-400 opacity-90 cursor-not-allowed"
              >
                {primaryAction}
              </button>
              <Link
                href={appRoutes.pricing}
                className="rounded-full border border-violet-500 bg-violet-600 hover:bg-violet-500 px-8 py-3.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] premium-button-hover"
              >
                {secondaryAction}
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

