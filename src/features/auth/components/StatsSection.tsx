import type { StatItem } from "@/features/auth/services/LandingPageService";
import { SectionHeading } from "@/features/auth/components/SectionHeading";
import { StaggerReveal, StaggerItem } from "@/components/ui/motion/StaggerReveal";
import { NumberTicker } from "@/components/ui/motion/NumberTicker";

type StatsSectionProps = {
  stats: StatItem[];
};

export function StatsSection({ stats }: StatsSectionProps) {
  return (
    <section
      id="resources"
      className="relative overflow-hidden bg-transparent px-6 py-20 lg:px-8"
    >
      <div className="pointer-events-none absolute inset-x-0 top-8 h-40 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_68%)] blur-[100px]" />
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          centered
          title="Our Learning Universe in Numbers"
          description="A platform designed for high-volume practice, guided revision, and measurable growth."
        />

        <StaggerReveal className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat, index) => {
            const numericMatch = stat.value.match(/\d+/);
            const suffixMatch = stat.value.match(/[^\d]+/);
            const num = numericMatch ? parseInt(numericMatch[0]) : 0;
            const suffix = suffixMatch ? suffixMatch[0] : "";

            return (
              <StaggerItem key={stat.label}>
                <div className="premium-card group relative overflow-hidden px-8 py-7">
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent_40%,rgba(139,92,246,0.05)_52%,transparent_64%)] opacity-90" />
                  <div className="pointer-events-none absolute -right-8 top-1 h-20 w-20 rounded-full bg-violet-500/10 blur-2xl transition duration-500 group-hover:scale-125" />
                  <div className="pointer-events-none absolute -bottom-6 left-8 h-16 w-24 rounded-full bg-violet-500/10 blur-2xl transition duration-500 group-hover:scale-125" />
                  <div className="relative">
                    <p className="font-heading text-4xl font-semibold md:text-5xl text-white">
                      {num > 0 ? <NumberTicker value={num} suffix={suffix} /> : stat.value}
                    </p>
                    <p className="mt-2 text-sm uppercase tracking-[0.2em] text-zinc-400">
                      {stat.label}
                    </p>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerReveal>
      </div>
    </section>
  );
}


