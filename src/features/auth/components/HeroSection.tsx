import Link from "next/link";
import Image from "next/image";
import { appRoutes } from "@/constants/AppRoutes";
import type { FeatureItem } from "@/features/auth/services/LandingPageService";
import { ScrollReveal } from "@/components/ui/motion/ScrollReveal";
import { NumberTicker } from "@/components/ui/motion/NumberTicker";

type HeroMetric = {
  label: string;
  value: string;
};

type HeroSectionProps = {
  badge: string;
  title: string;
  description: string;
  primaryAction: string;
  secondaryAction: string;
  heroCardTitle: string;
  heroCardItems: string[];
  featureHighlights: FeatureItem[];
  heroMetrics: HeroMetric[];
  onPrimaryActionClick?: () => void;
};

export function HeroSection({
  badge,
  title,
  description,
  primaryAction,
  secondaryAction,
  featureHighlights,
  heroMetrics,
}: HeroSectionProps) {
  const primaryFeature = featureHighlights[0];
  const supportingFeatures = featureHighlights.slice(1, 2);
  const discussionThreads = [
    {
      initials: "AR",
      name: "Aarav Raj",
      time: "2 hours ago",
      message:
        "Great explanation. The examples made the concept much easier to understand.",
      likes: "12",
      accent: "from-[#ddd3ff] to-[#b7a7ff]",
      reply: {
        initials: "TS",
        name: "Teacher Support",
        badge: "Teacher",
        time: "1 hour ago",
        message:
          "Glad it helped. Keep the next doubt in the same chapter thread so the context stays clear.",
        likes: "4",
        accent: "from-[#fff3bf] to-[#ffe08a]",
      },
    },
    {
      initials: "PI",
      name: "Priya Iyer",
      time: "5 hours ago",
      message:
        "Can you explain the last step again? I did not quite get that part.",
      likes: "8",
      accent: "from-[#cbf7f4] to-[#a5ecf1]",
      reply: {
        initials: "RK",
        name: "Rohan Kumar",
        badge: "Student",
        time: "3 hours ago",
        message:
          "He used the distributive property there. Watch the 04:20 timestamp once more.",
        likes: "3",
        accent: "from-[#ffd4ef] to-[#f8b9df]",
      },
    },
  ];

  return (
    <section className="relative overflow-hidden bg-transparent">
      {/* Premium Glow and Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-violet-600 rounded-full blur-[200px] opacity-[0.08] animate-float pointer-events-none" />
      
      <div className="relative mx-auto grid max-w-7xl gap-10 px-6 pb-8 pt-8 lg:min-h-[calc(100vh-7rem)] lg:grid-cols-[0.72fr_1fr] lg:items-center lg:gap-4 lg:px-8 lg:pb-10 lg:pt-6">
        <ScrollReveal direction="up" className="max-w-xl text-zinc-200 lg:pl-8">
          <span className="inline-flex rounded-full border border-violet-500/30 bg-violet-500/10 px-3.5 py-1 text-[11px] font-semibold tracking-tight text-violet-300 shadow-[0_0_24px_rgba(139,92,246,0.15)] backdrop-blur">
            <span className="mr-2 rounded-full bg-violet-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white">
              New
            </span>
            {badge}
          </span>

          <h1 className="mt-6 max-w-2xl font-heading text-[3.6rem] premium-heading text-white sm:text-[4.1rem] sm:leading-[0.96] lg:text-[4.5rem] lg:leading-[0.92]">
            {title}
          </h1>
          <p className="mt-4 max-w-lg text-base leading-8 text-zinc-400 lg:text-[1.05rem]">
            {description}
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="rounded-2xl bg-zinc-800 px-6 py-3 text-sm font-semibold text-zinc-400 cursor-not-allowed opacity-90"
            >
              {primaryAction}
            </button>
            <Link
              href={appRoutes.curriculum}
              className="rounded-2xl border border-zinc-700 bg-zinc-900 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-zinc-800 premium-button-hover"
            >
              {secondaryAction}
            </Link>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {heroMetrics.map((metric) => {
              const numericMatch = metric.value.match(/\d+/);
              const suffixMatch = metric.value.match(/[^\d]+/);
              const num = numericMatch ? parseInt(numericMatch[0]) : 0;
              const suffix = suffixMatch ? suffixMatch[0] : "";
              
              return (
              <div
                key={metric.label}
                className="premium-card px-4 py-3"
              >
                <p className="font-heading text-[2rem] font-semibold leading-none text-white">
                  {num > 0 ? <NumberTicker value={num} suffix={suffix} /> : metric.value}
                </p>
                <p className="mt-1 text-[0.95rem] text-zinc-500">{metric.label}</p>
              </div>
            )})}
          </div>
        </ScrollReveal>

        <ScrollReveal direction="left" delay={0.2} className="relative mx-auto flex w-full max-w-[30rem] justify-center lg:mr-4 lg:max-w-[35rem] lg:justify-self-end">
          <Image
            src="/images/hand-phone-hero.webp"
            alt="Hand holding a mobile app preview"
            width={700}
            height={790}
            priority
            sizes="(min-width: 1280px) 560px, (min-width: 1024px) 46vw, 88vw"
            className="h-auto max-h-[calc(100vh-9rem)] w-full object-contain premium-image-panel"
          />
        </ScrollReveal>

      </div>

      <div id="curriculum" className="relative mx-auto max-w-7xl px-6 pb-16 lg:px-8">
        <div className="relative px-0 py-8 sm:px-4 lg:py-10">
          <div className="relative grid gap-10 lg:grid-cols-[0.78fr_0.52fr] lg:items-start">
            <ScrollReveal direction="up">
              <span className="inline-flex items-center rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
                Curriculum Flow
              </span>
              <h2 className="mt-5 max-w-xl font-heading text-4xl premium-heading text-white sm:text-5xl">
                Practice, understand, revise, repeat.
              </h2>
              <p className="mt-4 max-w-lg text-base leading-7 text-zinc-400">
                {primaryFeature?.description ??
                  "Retain more information by solving targeted questions designed for neural recall."}
              </p>
              <div className="mt-8 max-w-lg">
                <h3 className="text-2xl font-semibold text-white">Video Solutions</h3>
                <p className="mt-3 text-base leading-7 text-zinc-400">
                  Do not just see the answer. Understand the why with HD conceptual walkthroughs for every step.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="left" delay={0.2} className="premium-image-panel relative mx-auto w-full max-w-[20rem] overflow-hidden rounded-[2.35rem] shadow-[0_24px_58px_rgba(0,0,0,0.5)] border border-white/5 lg:mx-0 lg:justify-self-end">
              <Image
                src="/images/vfam-video-clean.jpg"
                alt="Educational teaching video lesson preview"
                width={623}
                height={1328}
                sizes="(min-width: 1024px) 320px, 82vw"
                className="h-auto w-full grayscale opacity-80 transition-all duration-500 hover:grayscale-0 hover:opacity-100"
              />
            </ScrollReveal>

            <div className="hidden gap-3 sm:grid-cols-2">
              {supportingFeatures.map((feature, index) => (
                <article
                  key={feature.title}
                  className={
                    index === 0
                      ? "academy-path-step-flat group relative min-h-[13.5rem] overflow-visible border border-transparent p-5 sm:col-span-2"
                      : "academy-path-step group relative min-h-[13.5rem] overflow-hidden border p-5"
                  }
                >
                  <span className="academy-path-step-glow pointer-events-none absolute inset-0" />
                  <span className="academy-path-step-sheen pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12" />
                  <div className={index === 0 ? "relative grid gap-6 md:grid-cols-[0.78fr_1fr] md:items-center" : "relative"}>
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <span className="academy-path-step-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xs font-black">
                          {feature.icon}
                        </span>
                        <span className="academy-path-step-number font-heading text-5xl font-semibold leading-none">
                          0{index + 1}
                        </span>
                      </div>
                      <h3 className="academy-path-step-title mt-5 text-[1.35rem] font-semibold leading-snug !text-slate-950">
                        {feature.title}
                      </h3>
                      <p className="academy-path-step-copy mt-3 line-clamp-3 text-[1rem] leading-7 !text-slate-600">
                        {feature.description}
                      </p>
                    </div>

                    {index === 0 ? (
                      <div className="relative">
                        <div className="academy-phone-preview relative mx-auto min-h-[40rem] w-full max-w-[21rem] overflow-hidden rounded-[3.1rem] border-[7px] border-slate-950 bg-slate-950 p-2 sm:min-h-[43rem] sm:max-w-[22rem] md:min-h-[36rem] md:max-w-[19rem] lg:min-h-[40rem] lg:max-w-[21rem]">
                          <div className="absolute left-1/2 top-2 z-20 h-6 w-28 -translate-x-1/2 rounded-b-[1.2rem] bg-slate-950" />
                          <div className="relative h-full overflow-hidden rounded-[2.25rem] bg-zinc-900">
                            <div className="flex h-full flex-col bg-zinc-900">
                              <div className="flex h-16 shrink-0 items-center justify-between px-4 pt-4 text-3xl leading-none !text-zinc-100">
                                <span aria-hidden="true">‹</span>
                                <span aria-hidden="true" className="text-2xl">≡‹</span>
                              </div>

                              <div className="relative mx-2 h-36 shrink-0 overflow-hidden rounded-xl bg-zinc-800">
                                <Image
                                  src="/images/design-video.avif"
                                  alt="Newton's second law video lesson"
                                  fill
                                  sizes="(min-width: 1024px) 300px, (min-width: 768px) 272px, 82vw"
                                  className="object-cover object-top"
                                />
                                <div className="absolute inset-0 bg-black/20" />
                                <div className="absolute left-1/2 top-1/2 h-0 w-0 -translate-x-1/2 -translate-y-1/2 border-y-[20px] border-l-[30px] border-y-transparent border-l-white/90" />
                                <div className="absolute bottom-5 left-1/2 w-full -translate-x-1/2 text-center text-[12px] font-semibold !text-white">
                                  <p>Chapter 19</p>
                                  <p className="text-[13px]">Newton&apos;s Second Law of Motion</p>
                                </div>
                              </div>

                              <div className="flex shrink-0 items-center justify-between px-4 py-3 text-[11px] !text-zinc-400">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg !text-[#705cff]">▰</span>
                                  <span className="text-lg">▱</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span>Theory View</span>
                                  <span className="h-5 w-10 rounded-full bg-zinc-800 p-0.5 border border-zinc-700">
                                    <span className="block h-4 w-4 rounded-full bg-zinc-500 shadow" />
                                  </span>
                                </div>
                              </div>

                              <div className="flex shrink-0 items-center justify-between px-7 pb-4 text-[10px] !text-zinc-500">
                                <span className="inline-flex items-center gap-2">
                                  <span className="h-3 w-3 rounded-[3px] border border-zinc-600" />
                                  Mark as completed
                                </span>
                                <span className="text-lg !text-zinc-700">⌑</span>
                              </div>

                              <div className="grid shrink-0 grid-cols-4 border-y border-zinc-800/50 py-3 text-center text-[12px] !text-zinc-400">
                                <span>▣ About</span>
                                <span className="font-semibold !text-[#705cff] underline underline-offset-8">Notes</span>
                                <span>✦ AI</span>
                                <span>● Comments</span>
                              </div>

                              <div className="flex shrink-0 items-center justify-between px-5 py-3">
                                <div className="flex gap-3 text-xl font-semibold italic !text-zinc-600">
                                  <span>B</span>
                                  <span>I</span>
                                  <span className="underline">U</span>
                                </div>
                                <div className="flex gap-1">
                                  {["#d8d2ff", "#ffd6e8", "#ffe7a8", "#bef3cd"].map((color) => (
                                    <span key={color} className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                                  ))}
                                </div>
                                <button
                                  type="button"
                                  className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-[12px] font-semibold !text-[#705cff] shadow-sm"
                                >
                                  Add to Notes
                                </button>
                              </div>

                              <div className="mx-6 mb-6 min-h-0 flex-1 rounded-sm border border-zinc-800 bg-zinc-800/50 p-4 text-[11px] italic leading-5 !text-zinc-500">
                                Write your notes here... everything you type will be saved automatically...
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="hidden">
                          <div className="absolute inset-x-8 bottom-2 h-8 rounded-[50%] bg-[#f5cfe0] blur-xl" />
                          <div className="relative mx-auto max-w-[25rem] -rotate-2 rounded-[1.35rem] border-[8px] border-slate-950 bg-slate-950 shadow-[0_22px_46px_rgba(15,23,42,0.2)]">
                            <div className="relative aspect-[4/2.45] overflow-hidden rounded-[0.85rem] bg-zinc-900">
                              <div className="absolute inset-0 bg-[linear-gradient(165deg,#18181b_0%,#18181b_66%,#27272a_66%,#27272a_100%)]" />
                              <div className="absolute left-6 top-5 text-[7px] font-medium !text-zinc-500">
                                Good Education Building a Better Future
                              </div>
                              <div className="absolute -left-3 bottom-0 h-[72%] w-[33%] bg-[linear-gradient(135deg,#f02a91_0%,#f02a91_70%,transparent_70%)]" />
                              <div className="absolute left-[38%] top-8 h-8 w-[46%] -skew-x-12 bg-[#ec268e]" />
                              <div className="absolute left-[42%] top-[38%]">
                                <p className="text-[10px] italic !text-zinc-400">
                                  Education Presentation Template
                                </p>
                                <p className="mt-1 max-w-[11rem] font-heading text-[2rem] font-light italic leading-[1.12] !text-zinc-100">
                                  Good Education Building a Better Future
                                </p>
                              </div>
                              <div className="absolute left-7 top-[26%] h-16 w-12 rounded-t-full bg-[#f6d0ba]" />
                              <div className="absolute left-5 top-[49%] h-20 w-20 rounded-t-[2rem] bg-[#ef2f37]" />
                              <div className="absolute right-3 bottom-2 text-[8px] !text-zinc-500">1</div>
                            </div>
                          </div>
                          <button
                            type="button"
                            aria-label="Next presentation"
                            className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-2xl leading-none !text-zinc-100 shadow-md"
                          >
                            ›
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-6 pb-20 lg:px-8">
        <div className="grid items-center gap-10 rounded-[2.5rem] premium-card px-6 py-10 lg:grid-cols-[0.78fr_1fr] lg:px-12 lg:py-14">
          <ScrollReveal direction="up">
            <span className="inline-flex items-center rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
              Smart Notes
            </span>
            <h2 className="mt-5 max-w-xl font-heading text-4xl premium-heading text-white sm:text-5xl">
              Turn every lesson into exam-ready notes.
            </h2>
            <p className="mt-4 max-w-lg text-base leading-7 text-zinc-400">
              Capture key points while watching explanations, organize them by chapter, and revise faster before tests.
            </p>
            <div className="mt-7 grid max-w-lg gap-3 sm:grid-cols-2">
              {["Auto-saved lesson notes", "Highlights for quick revision"].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-sm font-semibold text-zinc-300"
                >
                  {item}
                </div>
              ))}
            </div>
          </ScrollReveal>

          <ScrollReveal direction="left" delay={0.2} className="relative mx-auto w-full max-w-[38rem] premium-image-panel lg:justify-self-end">
            <Image
              src="/images/notes-section.png"
              alt="Video lesson with smart notes preview"
              width={1536}
              height={1024}
              sizes="(min-width: 1024px) 560px, 92vw"
              className="h-auto w-full rounded-[2rem] border border-white/5 grayscale opacity-80 transition-all duration-500 hover:grayscale-0 hover:opacity-100"
            />
          </ScrollReveal>
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl overflow-hidden px-6 pb-24 pt-6 lg:px-8">
        <div className="pointer-events-none absolute left-[42%] top-10 h-[34rem] w-[34rem] rounded-full bg-violet-900/10 blur-[120px] animate-float" />
        <div className="pointer-events-none absolute right-4 top-24 h-[24rem] w-[24rem] rounded-full bg-violet-900/20 blur-[100px] animate-float" />
        <div className="relative grid items-center gap-10 lg:grid-cols-[0.76fr_1fr]">
          <ScrollReveal direction="up" className="max-w-xl lg:pl-8">
            <span className="inline-flex items-center rounded-full border border-zinc-500/20 bg-zinc-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
              Ask AI
            </span>
            <h2 className="mt-5 max-w-xl font-heading text-4xl premium-heading text-white sm:text-5xl">
              Clear every doubt with instant AI help.
            </h2>
            <p className="mt-4 max-w-lg text-base leading-7 text-zinc-400">
              Ask a question from any chapter and get a simple explanation, key formula, and step-by-step reasoning in seconds.
            </p>
            <div className="mt-7 grid max-w-lg gap-3 sm:grid-cols-2">
              {["Chapter-aware answers", "Step-by-step explanations"].map((item) => (
                <div
                  key={item}
                  className="rounded-full border border-zinc-700 bg-zinc-800/50 px-5 py-3 text-sm font-semibold text-zinc-300"
                >
                  {item}
                </div>
              ))}
            </div>
          </ScrollReveal>

          <ScrollReveal direction="left" delay={0.2} className="relative mx-auto w-full max-w-[43rem] premium-image-panel lg:justify-self-end">
            <Image
              src="/images/ai-doubt-solver.png"
              alt="AI doubt solver interface preview"
              width={1536}
              height={1024}
              sizes="(min-width: 1024px) 560px, 92vw"
              className="h-auto w-full rounded-[2rem] border border-white/5 shadow-2xl grayscale opacity-80 transition-all duration-500 hover:grayscale-0 hover:opacity-100"
            />
          </ScrollReveal>
        </div>
      </div>

      <div className="relative overflow-hidden px-6 pb-24 lg:px-8">
        <div className="pointer-events-none absolute inset-x-0 top-20 h-64 bg-[linear-gradient(90deg,transparent,rgba(124,58,237,0.15),rgba(139,92,246,0.15),transparent)] blur-[100px]" />
        <div className="relative mx-auto max-w-7xl">
          <ScrollReveal direction="up" className="max-w-3xl">
            <span className="inline-flex items-center rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
              Chapter-wise
            </span>
            <h2 className="mt-5 max-w-2xl font-heading text-4xl premium-heading text-white sm:text-5xl">
              One place for every chapter video and note.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">
              Move chapter by chapter, watch focused lessons, and open matching notes without losing your revision flow.
            </p>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.2} className="relative mx-auto mt-10 w-full max-w-5xl premium-image-panel">
            <div className="absolute -left-8 -top-8 h-28 w-28 rounded-full border border-violet-500/20 bg-zinc-900 shadow-[0_0_50px_rgba(124,58,237,0.2)] animate-float" />
            <div className="absolute -bottom-8 right-10 h-24 w-40 rounded-full bg-violet-900/20 blur-[60px] animate-float" />
            <Image
              src="/images/chapter-wise-section.png"
              alt="Chapter-wise videos and notes preview"
              width={1536}
              height={1024}
              sizes="(min-width: 1280px) 960px, (min-width: 1024px) 78vw, 92vw"
              className="relative h-auto w-full rounded-[2.25rem] border border-white/10 shadow-[0_28px_82px_rgba(0,0,0,0.6)] grayscale opacity-80 transition-all duration-500 hover:grayscale-0 hover:opacity-100"
            />
          </ScrollReveal>
        </div>
      </div>

      <div className="relative overflow-hidden px-6 pb-24 lg:px-8">
        <div className="pointer-events-none absolute left-0 top-8 h-72 w-72 rounded-full bg-violet-900/20 blur-[100px] animate-float" />
        <div className="pointer-events-none absolute right-0 bottom-8 h-80 w-80 rounded-full bg-violet-900/10 blur-[100px] animate-float" />
        <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.48fr_0.82fr] lg:items-center">
          <ScrollReveal direction="up" className="max-w-xl">
            <span className="inline-flex items-center rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
              Lesson Comments
            </span>
            <h2 className="mt-5 max-w-xl font-heading text-4xl premium-heading text-white sm:text-5xl">
              Discuss every chapter right where you learn.
            </h2>
            <p className="mt-4 max-w-lg text-base leading-7 text-zinc-400">
              Students can ask doubts, teachers can reply in context, and useful answers stay attached to the exact lesson.
            </p>

            <div className="mt-8 grid max-w-lg gap-3 sm:grid-cols-2">
              {["Chapter-linked threads", "Teacher replies", "Peer answers", "Saved doubt history"].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-sm font-semibold text-zinc-300"
                >
                  {item}
                </div>
              ))}
            </div>
          </ScrollReveal>

          <ScrollReveal direction="left" delay={0.2} className="relative premium-image-panel">
            <div className="absolute -right-3 -top-5 hidden rounded-2xl border border-white/10 bg-zinc-900 px-5 py-3 text-sm font-semibold text-zinc-200 shadow-xl sm:block z-10 animate-float">
              24 active comments
            </div>
            <div className="relative rounded-[2.25rem] border border-white/10 bg-zinc-900/90 p-4 shadow-2xl backdrop-blur sm:p-6">
              <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-violet-500/30 bg-violet-500/10 text-sm font-black text-violet-400">
                    Chat
                  </div>
                  <div>
                    <h3 className="font-heading text-2xl font-semibold text-white">
                      Comments (24)
                    </h3>
                    <p className="mt-1 text-sm text-zinc-400">
                      Share thoughts and learn together.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="w-fit rounded-2xl border border-white/10 bg-zinc-800 px-4 py-3 text-sm font-semibold text-white shadow-lg premium-button-hover"
                >
                  Newest First
                </button>
              </div>

              <div className="mt-5 space-y-5">
                {discussionThreads.map((thread) => (
                  <article
                    key={thread.name}
                    className="rounded-[1.75rem] border border-white/5 bg-zinc-800/40 px-4 py-5 shadow-xl sm:px-5"
                  >
                    <div className="flex gap-4">
                      <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${thread.accent} text-base font-black text-slate-900`}>
                        {thread.initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h4 className="font-semibold text-white">{thread.name}</h4>
                          <span className="text-sm text-zinc-500">{thread.time}</span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-zinc-300 sm:text-base">
                          {thread.message}
                        </p>
                        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm font-semibold text-violet-400">
                          <span>{thread.likes} likes</span>
                          <span className="h-4 w-px bg-zinc-700" />
                          <button type="button">Reply</button>
                          <span className="h-4 w-px bg-zinc-700" />
                          <button type="button">More</button>
                        </div>
                      </div>
                    </div>

                    <div className="ml-0 mt-5 rounded-[1.35rem] border border-white/5 bg-zinc-900/50 px-4 py-4 sm:ml-[4.5rem]">
                      <div className="flex gap-4">
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${thread.reply.accent} text-sm font-black text-slate-900`}>
                          {thread.reply.initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-3">
                            <h5 className="font-semibold text-white">{thread.reply.name}</h5>
                            <span className="rounded-full bg-violet-500/20 px-2.5 py-1 text-xs font-bold text-violet-300 border border-violet-500/20">
                              {thread.reply.badge}
                            </span>
                            <span className="text-sm text-zinc-500">{thread.reply.time}</span>
                          </div>
                          <p className="mt-2 text-sm leading-6 text-zinc-300 sm:text-base">
                            {thread.reply.message}
                          </p>
                          <div className="mt-4 flex items-center gap-4 text-sm font-semibold text-violet-400">
                            <span>{thread.reply.likes} likes</span>
                            <span className="h-4 w-px bg-zinc-700" />
                            <button type="button">Reply</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-5 flex gap-4 border-t border-white/10 pt-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#ded4ff] to-[#b8a8ff] text-sm font-black text-slate-900">
                  You
                </div>
                <div className="min-w-0 flex-1 rounded-[1.35rem] border border-white/10 bg-zinc-800/30 px-4 py-3">
                  <p className="text-sm text-zinc-500">Write a comment...</p>
                  <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex gap-2 text-sm font-semibold text-zinc-400">
                      <span>Emoji</span>
                      <span>Image</span>
                    </div>
                    <button
                      type="button"
                      className="w-fit rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg premium-button-hover"
                    >
                      Post Comment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-2 lg:px-8">
        <div className="pointer-events-none absolute -left-16 top-20 h-64 w-64 rounded-full bg-violet-900/10 blur-[100px] animate-float" />
        <div className="pointer-events-none absolute right-8 bottom-16 h-72 w-72 rounded-full bg-violet-900/10 blur-[100px] animate-float" />
        <div className="relative grid gap-8 lg:grid-cols-[0.34fr_0.66fr] lg:items-center">
          <ScrollReveal direction="up" className="max-w-xl lg:pl-8">
            <span className="inline-flex items-center rounded-full border border-zinc-500/20 bg-zinc-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
              Live Sessions
            </span>
            <h2 className="mt-5 max-w-md font-heading text-4xl premium-heading text-white sm:text-5xl">
              Join class, track progress, keep every resource close.
            </h2>
            <p className="mt-4 max-w-md text-base leading-7 text-zinc-400">
              A complete session workspace keeps live classes, notes, questions, resources, and participants in one focused view.
            </p>
            <div className="mt-7 grid max-w-md grid-cols-2 gap-3">
              {[
                ["45 min", "Time spent"],
                ["24", "Participants"],
                ["18", "Questions solved"],
                ["85%", "Understanding"],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/5 bg-zinc-800/40 px-4 py-3 shadow-lg backdrop-blur"
                >
                  <p className="font-heading text-2xl font-semibold leading-none text-white">
                    {value}
                  </p>
                  <p className="mt-1 text-sm text-zinc-400">{label}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>

          <ScrollReveal direction="left" delay={0.2} className="relative mx-auto w-full max-w-[62rem] premium-image-panel lg:justify-self-end">
            <div className="absolute -left-4 -top-4 hidden rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm font-semibold text-zinc-200 shadow-xl sm:block z-10 animate-float">
              Live now
            </div>
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-900 shadow-[0_28px_82px_rgba(0,0,0,0.6)]">
              <Image
                src="/images/session.png"
                alt="Sessions dashboard with live class progress and resources"
                width={1600}
                height={1049}
                sizes="(min-width: 1280px) 880px, (min-width: 1024px) 64vw, 94vw"
                className="h-auto w-full grayscale opacity-80 transition-all duration-500 hover:grayscale-0 hover:opacity-100"
              />
            </div>
          </ScrollReveal>
        </div>
      </div>

      <div className="relative overflow-hidden px-6 pb-20 lg:px-8">
        <div className="pointer-events-none absolute inset-x-0 top-14 h-72 bg-[linear-gradient(90deg,transparent,rgba(139,92,246,0.15),rgba(124,58,237,0.15),transparent)] blur-[100px]" />
        <div className="relative mx-auto max-w-6xl">
          <div className="grid gap-6 lg:grid-cols-[0.62fr_0.38fr] lg:items-end">
            <ScrollReveal direction="up">
              <span className="inline-flex items-center rounded-full border border-zinc-500/20 bg-zinc-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
                Progress Tracker
              </span>
              <h2 className="mt-5 max-w-xl font-heading text-4xl premium-heading text-white sm:text-5xl">
                See every subject, score, and weak spot at a glance.
              </h2>
            </ScrollReveal>

            <ScrollReveal direction="left" delay={0.1} className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {[
                ["72%", "Overall score"],
                ["352", "Questions solved"],
                ["32h", "Study time"],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/5 bg-zinc-800/40 px-4 py-3 shadow-lg backdrop-blur"
                >
                  <p className="font-heading text-2xl font-semibold leading-none text-white">
                    {value}
                  </p>
                  <p className="mt-1 text-sm text-zinc-400">{label}</p>
                </div>
              ))}
            </ScrollReveal>
          </div>

          <ScrollReveal direction="up" delay={0.2} className="relative mx-auto mt-7 w-full max-w-[58rem] premium-image-panel">
            <div className="absolute -right-4 -top-5 hidden rounded-2xl border border-white/10 bg-zinc-900 px-5 py-3 text-sm font-semibold text-zinc-200 shadow-xl sm:block z-10 animate-float">
              Monthly view
            </div>
            <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-zinc-900 shadow-[0_22px_62px_rgba(0,0,0,0.6)]">
              <Image
                src="/images/progress.png"
                alt="Progress dashboard with subject scores and study performance"
                width={1600}
                height={1049}
                sizes="(min-width: 1280px) 928px, (min-width: 1024px) 74vw, 92vw"
                className="h-auto w-full grayscale opacity-80 transition-all duration-500 hover:grayscale-0 hover:opacity-100"
              />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}


