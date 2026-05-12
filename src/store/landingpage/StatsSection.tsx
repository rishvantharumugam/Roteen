import type { StatItem } from "@/service/LandingPageService";
import { SectionHeading } from "@/store/landingpage/SectionHeading";

type StatsSectionProps = {
  stats: StatItem[];
};

export function StatsSection({ stats }: StatsSectionProps) {
  return (
    <section
      id="resources"
      className="relative overflow-hidden !bg-[linear-gradient(180deg,#f5f2ff_0%,#ffffff_48%,#f5f2ff_100%)] px-6 py-20 lg:px-8"
    >
      <div className="pointer-events-none absolute inset-x-0 top-8 h-40 bg-[radial-gradient(circle_at_50%_50%,rgba(184,169,255,0.3),transparent_68%)] blur-3xl" />
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          centered
          title="Our Learning Universe in Numbers"
          description="A platform designed for high-volume practice, guided revision, and measurable growth."
        />

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`stats-float-card group relative overflow-hidden rounded-[2rem] border px-8 py-7 transition duration-500 hover:-translate-y-1.5 hover:shadow-[0_30px_60px_rgba(59,130,246,0.18)] ${
                index % 2 === 0
                  ? "!border-[#b8a9ff] !bg-[linear-gradient(135deg,#c8bfff_0%,#a797ff_55%,#8776f2_100%)] !text-white shadow-[0_24px_50px_rgba(127,114,184,0.24)]"
                  : "!border-white !bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,244,255,0.98))] !text-[#7c6cf2] shadow-[0_22px_45px_rgba(148,163,184,0.16)]"
              }`}
            >
              <div
                className={`pointer-events-none absolute inset-0 ${
                  index % 2 === 0
                    ? "bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.26),transparent_34%),linear-gradient(120deg,transparent_40%,rgba(255,255,255,0.12)_52%,transparent_64%)] opacity-90"
                    : "bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_38%),linear-gradient(120deg,transparent_40%,rgba(255,255,255,0.8)_52%,transparent_64%)] opacity-90"
                }`}
              />
              <div className="pointer-events-none absolute -right-8 top-1 h-20 w-20 rounded-full bg-white/20 blur-2xl transition duration-500 group-hover:scale-125" />
              <div className="pointer-events-none absolute -bottom-6 left-8 h-16 w-24 rounded-full bg-blue-300/20 blur-2xl transition duration-500 group-hover:scale-125" />
              <div className="relative">
                <p className="font-heading text-4xl font-semibold md:text-5xl">{stat.value}</p>
                <p
                  className={`mt-2 text-sm uppercase tracking-[0.2em] ${
                    index % 2 === 0 ? "!text-white/80" : "!text-slate-500"
                  }`}
                >
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


