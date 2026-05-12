import Link from "next/link";
import Image from "next/image";
import { appRoutes } from "@/navigation/AppRoutes";
import type { FeatureItem } from "@/service/LandingPageService";

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
    <section className="relative overflow-hidden !bg-white">
      <div className="relative mx-auto grid max-w-7xl gap-10 px-6 pb-8 pt-8 lg:min-h-[calc(100vh-7rem)] lg:grid-cols-[0.72fr_1fr] lg:items-center lg:gap-4 lg:px-8 lg:pb-10 lg:pt-6">
        <div className="max-w-xl !text-slate-950 lg:pl-8">
          <span className="inline-flex rounded-full border !border-white !bg-white/70 px-3.5 py-1 text-[11px] font-semibold tracking-tight !text-slate-700 shadow-[0_10px_24px_rgba(181,165,255,0.14)] backdrop-blur">
            <span className="mr-2 rounded-full !bg-[#b8a9ff] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] !text-white">
              New
            </span>
            {badge}
          </span>

          <h1 className="mt-6 max-w-2xl font-heading text-[3.6rem] font-semibold tracking-tight !text-slate-950 sm:text-[4.1rem] sm:leading-[0.96] lg:text-[4.5rem] lg:leading-[0.92]">
            {title}
          </h1>
          <p className="mt-4 max-w-lg text-base leading-8 !text-slate-600 lg:text-[1.05rem]">
            {description}
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="rounded-2xl !bg-slate-950 px-6 py-3 text-sm font-semibold !text-white shadow-[0_16px_40px_rgba(15,23,42,0.16)] transition disabled:cursor-not-allowed disabled:opacity-90"
            >
              {primaryAction}
            </button>
            <Link
              href={appRoutes.curriculum}
              className="rounded-2xl border !border-[#e3dafd] !bg-white px-6 py-3 text-sm font-semibold !text-slate-900 shadow-[0_14px_34px_rgba(198,187,245,0.16)] transition hover:!bg-[#faf8ff]"
            >
              {secondaryAction}
            </Link>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {heroMetrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-[1.45rem] border !border-white/80 !bg-white/70 px-4 py-3 shadow-[0_18px_44px_rgba(186,175,234,0.16)] backdrop-blur"
              >
                <p className="font-heading text-[2rem] font-semibold leading-none !text-slate-950">
                  {metric.value}
                </p>
                <p className="mt-1 text-[0.95rem] !text-slate-500">{metric.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mx-auto flex w-full max-w-[30rem] justify-center lg:mr-4 lg:max-w-[35rem] lg:justify-self-end">
          <Image
            src="/images/hand-phone-hero.webp"
            alt="Hand holding a mobile app preview"
            width={700}
            height={790}
            priority
            sizes="(min-width: 1280px) 560px, (min-width: 1024px) 46vw, 88vw"
            className="h-auto max-h-[calc(100vh-9rem)] w-full object-contain"
          />
        </div>

      </div>

      <div id="curriculum" className="relative mx-auto max-w-7xl px-6 pb-16 lg:px-8">
        <div className="relative px-0 py-8 sm:px-4 lg:py-10">
          <div className="relative grid gap-10 lg:grid-cols-[0.78fr_0.52fr] lg:items-start">
            <div className="scroll-reveal-left">
              <span className="inline-flex items-center rounded-full border !border-[#ddd3ff] !bg-white/82 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] !text-[#7c6cf2] shadow-[0_12px_28px_rgba(127,114,184,0.12)]">
                Curriculum Flow
              </span>
              <h2 className="mt-5 max-w-xl font-heading text-4xl font-semibold leading-tight tracking-tight !text-slate-950 sm:text-5xl">
                Practice, understand, revise, repeat.
              </h2>
              <p className="mt-4 max-w-lg text-base leading-7 !text-slate-600">
                {primaryFeature?.description ??
                  "Retain more information by solving targeted questions designed for neural recall."}
              </p>
              <div className="mt-8 max-w-lg">
                <h3 className="text-2xl font-semibold !text-slate-950">Video Solutions</h3>
                <p className="mt-3 text-base leading-7 !text-slate-600">
                  Do not just see the answer. Understand the why with HD conceptual walkthroughs for every step.
                </p>
              </div>

            </div>

            <div className="scroll-reveal-right relative mx-auto w-full max-w-[20rem] overflow-hidden rounded-[2.35rem] bg-white shadow-[0_24px_58px_rgba(15,23,42,0.16)] lg:mx-0 lg:justify-self-end">
              <Image
                src="/images/vfam-video-clean.jpg"
                alt="Educational teaching video lesson preview"
                width={623}
                height={1328}
                sizes="(min-width: 1024px) 320px, 82vw"
                className="h-auto w-full"
              />
            </div>

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
                          <div className="relative h-full overflow-hidden rounded-[2.25rem] bg-white">
                            <div className="flex h-full flex-col bg-white">
                              <div className="flex h-16 shrink-0 items-center justify-between px-4 pt-4 text-3xl leading-none !text-slate-950">
                                <span aria-hidden="true">‹</span>
                                <span aria-hidden="true" className="text-2xl">≡‹</span>
                              </div>

                              <div className="relative mx-2 h-36 shrink-0 overflow-hidden rounded-xl bg-slate-100">
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

                              <div className="flex shrink-0 items-center justify-between px-4 py-3 text-[11px] !text-slate-400">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg !text-[#705cff]">▰</span>
                                  <span className="text-lg">▱</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span>Theory View</span>
                                  <span className="h-5 w-10 rounded-full bg-slate-200 p-0.5">
                                    <span className="block h-4 w-4 rounded-full bg-white shadow" />
                                  </span>
                                </div>
                              </div>

                              <div className="flex shrink-0 items-center justify-between px-7 pb-4 text-[10px] !text-slate-500">
                                <span className="inline-flex items-center gap-2">
                                  <span className="h-3 w-3 rounded-[3px] border border-slate-300" />
                                  Mark as completed
                                </span>
                                <span className="text-lg !text-slate-300">⌑</span>
                              </div>

                              <div className="grid shrink-0 grid-cols-4 border-y border-slate-100 py-3 text-center text-[12px] !text-slate-400">
                                <span>▣ About</span>
                                <span className="font-semibold !text-[#705cff] underline underline-offset-8">Notes</span>
                                <span>✦ AI</span>
                                <span>● Comments</span>
                              </div>

                              <div className="flex shrink-0 items-center justify-between px-5 py-3">
                                <div className="flex gap-3 text-xl font-semibold italic !text-slate-300">
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
                                  className="rounded-lg border border-[#ded8ff] bg-white px-3 py-2 text-[12px] font-semibold !text-[#705cff] shadow-[0_8px_18px_rgba(112,92,255,0.12)]"
                                >
                                  Add to Notes
                                </button>
                              </div>

                              <div className="mx-6 mb-6 min-h-0 flex-1 rounded-sm border border-slate-200 p-4 text-[11px] italic leading-5 !text-slate-300">
                                Write your notes here... everything you type will be saved automatically...
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="hidden">
                          <div className="absolute inset-x-8 bottom-2 h-8 rounded-[50%] bg-[#f5cfe0] blur-xl" />
                          <div className="relative mx-auto max-w-[25rem] -rotate-2 rounded-[1.35rem] border-[8px] border-slate-950 bg-slate-950 shadow-[0_22px_46px_rgba(15,23,42,0.2)]">
                            <div className="relative aspect-[4/2.45] overflow-hidden rounded-[0.85rem] bg-white">
                              <div className="absolute inset-0 bg-[linear-gradient(165deg,#ffffff_0%,#ffffff_66%,#ffe5f1_66%,#ffe5f1_100%)]" />
                              <div className="absolute left-6 top-5 text-[7px] font-medium !text-slate-500">
                                Good Education Building a Better Future
                              </div>
                              <div className="absolute -left-3 bottom-0 h-[72%] w-[33%] bg-[linear-gradient(135deg,#f02a91_0%,#f02a91_70%,transparent_70%)]" />
                              <div className="absolute left-[38%] top-8 h-8 w-[46%] -skew-x-12 bg-[#ec268e]" />
                              <div className="absolute left-[42%] top-[38%]">
                                <p className="text-[10px] italic !text-slate-300">
                                  Education Presentation Template
                                </p>
                                <p className="mt-1 max-w-[11rem] font-heading text-[2rem] font-light italic leading-[1.12] !text-slate-800">
                                  Good Education Building a Better Future
                                </p>
                              </div>
                              <div className="absolute left-7 top-[26%] h-16 w-12 rounded-t-full bg-[#f6d0ba]" />
                              <div className="absolute left-5 top-[49%] h-20 w-20 rounded-t-[2rem] bg-[#ef2f37]" />
                              <div className="absolute right-3 bottom-2 text-[8px] !text-slate-400">1</div>
                            </div>
                          </div>
                          <button
                            type="button"
                            aria-label="Next presentation"
                            className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-2xl leading-none !text-slate-950 shadow-[0_10px_26px_rgba(15,23,42,0.12)]"
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
        <div className="grid items-center gap-10 rounded-[2.5rem] border border-[#e5dcff] bg-white/72 px-6 py-10 shadow-[0_24px_70px_rgba(127,114,184,0.14)] backdrop-blur lg:grid-cols-[0.78fr_1fr] lg:px-12 lg:py-14">
          <div className="scroll-reveal-left">
            <span className="inline-flex items-center rounded-full border !border-[#ddd3ff] !bg-white/82 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] !text-[#7c6cf2] shadow-[0_12px_28px_rgba(127,114,184,0.12)]">
              Smart Notes
            </span>
            <h2 className="mt-5 max-w-xl font-heading text-4xl font-semibold leading-tight tracking-tight !text-slate-950 sm:text-5xl">
              Turn every lesson into exam-ready notes.
            </h2>
            <p className="mt-4 max-w-lg text-base leading-7 !text-slate-600">
              Capture key points while watching explanations, organize them by chapter, and revise faster before tests.
            </p>
            <div className="mt-7 grid max-w-lg gap-3 sm:grid-cols-2">
              {["Auto-saved lesson notes", "Highlights for quick revision"].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-[#e5dcff] bg-white/80 px-4 py-3 text-sm font-semibold !text-slate-700 shadow-[0_14px_32px_rgba(127,114,184,0.1)]"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="scroll-reveal-right relative mx-auto w-full max-w-[38rem] lg:justify-self-end">
            <Image
              src="/images/notes-section.png"
              alt="Video lesson with smart notes preview"
              width={1536}
              height={1024}
              sizes="(min-width: 1024px) 560px, 92vw"
              className="h-auto w-full rounded-[2rem]"
            />
          </div>
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl overflow-hidden px-6 pb-24 pt-6 lg:px-8">
        <div className="pointer-events-none absolute left-[42%] top-10 h-[34rem] w-[34rem] rounded-full bg-[#e9fbff] blur-3xl" />
        <div className="pointer-events-none absolute right-4 top-24 h-[24rem] w-[24rem] rounded-full bg-[#f0eaff] blur-3xl" />
        <div className="relative grid items-center gap-10 lg:grid-cols-[0.76fr_1fr]">
          <div className="scroll-reveal-left max-w-xl lg:pl-8">
            <span className="inline-flex items-center rounded-full border !border-[#c7efff] !bg-white/82 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] !text-[#0891b2] shadow-[0_12px_28px_rgba(14,165,233,0.1)]">
              Ask AI
            </span>
            <h2 className="mt-5 max-w-xl font-heading text-4xl font-semibold leading-tight tracking-tight !text-slate-950 sm:text-5xl">
              Clear every doubt with instant AI help.
            </h2>
            <p className="mt-4 max-w-lg text-base leading-7 !text-slate-600">
              Ask a question from any chapter and get a simple explanation, key formula, and step-by-step reasoning in seconds.
            </p>
            <div className="mt-7 grid max-w-lg gap-3 sm:grid-cols-2">
              {["Chapter-aware answers", "Step-by-step explanations"].map((item) => (
                <div
                  key={item}
                  className="rounded-full border border-[#d8f3ff] bg-white/70 px-5 py-3 text-sm font-semibold !text-slate-700 shadow-[0_14px_32px_rgba(14,165,233,0.09)]"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="scroll-reveal-right relative mx-auto w-full max-w-[43rem] lg:justify-self-end">
            <Image
              src="/images/ai-doubt-solver.png"
              alt="AI doubt solver interface preview"
              width={1536}
              height={1024}
              sizes="(min-width: 1024px) 560px, 92vw"
              className="h-auto w-full rounded-[2rem]"
            />
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden px-6 pb-24 lg:px-8">
        <div className="pointer-events-none absolute inset-x-0 top-20 h-64 bg-[linear-gradient(90deg,transparent,rgba(124,58,237,0.08),rgba(14,165,233,0.08),transparent)] blur-3xl" />
        <div className="relative mx-auto max-w-7xl">
          <div className="scroll-reveal-left max-w-3xl">
            <span className="inline-flex items-center rounded-full border !border-[#ddd3ff] !bg-white/82 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] !text-[#7c3aed] shadow-[0_12px_28px_rgba(127,114,184,0.12)]">
              Chapter-wise
            </span>
            <h2 className="mt-5 max-w-2xl font-heading text-4xl font-semibold leading-tight tracking-tight !text-slate-950 sm:text-5xl">
              One place for every chapter video and note.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 !text-slate-600">
              Move chapter by chapter, watch focused lessons, and open matching notes without losing your revision flow.
            </p>
          </div>

          <div className="scroll-reveal-right relative mx-auto mt-10 w-full max-w-5xl">
            <div className="absolute -left-8 -top-8 h-28 w-28 rounded-full border border-[#ddd3ff] bg-white/60 shadow-[0_18px_50px_rgba(124,58,237,0.12)]" />
            <div className="absolute -bottom-8 right-10 h-24 w-40 rounded-full bg-[#dff8ff] blur-2xl" />
            <Image
              src="/images/chapter-wise-section.png"
              alt="Chapter-wise videos and notes preview"
              width={1536}
              height={1024}
              sizes="(min-width: 1280px) 960px, (min-width: 1024px) 78vw, 92vw"
              className="relative h-auto w-full rounded-[2.25rem] border border-[#e5dcff] shadow-[0_28px_82px_rgba(127,114,184,0.16)]"
            />
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden px-6 pb-24 lg:px-8">
        <div className="pointer-events-none absolute left-0 top-8 h-72 w-72 rounded-full bg-[#eefcff] blur-3xl" />
        <div className="pointer-events-none absolute right-0 bottom-8 h-80 w-80 rounded-full bg-[#f3edff] blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.48fr_0.82fr] lg:items-center">
          <div className="scroll-reveal-left max-w-xl">
            <span className="inline-flex items-center rounded-full border !border-[#ddd3ff] !bg-white/82 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] !text-[#7c3aed] shadow-[0_12px_28px_rgba(127,114,184,0.12)]">
              Lesson Comments
            </span>
            <h2 className="mt-5 max-w-xl font-heading text-4xl font-semibold leading-tight tracking-tight !text-slate-950 sm:text-5xl">
              Discuss every chapter right where you learn.
            </h2>
            <p className="mt-4 max-w-lg text-base leading-7 !text-slate-600">
              Students can ask doubts, teachers can reply in context, and useful answers stay attached to the exact lesson.
            </p>

            <div className="mt-8 grid max-w-lg gap-3 sm:grid-cols-2">
              {["Chapter-linked threads", "Teacher replies", "Peer answers", "Saved doubt history"].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-[#e5dcff] bg-white/82 px-4 py-3 text-sm font-semibold !text-slate-700 shadow-[0_14px_32px_rgba(127,114,184,0.1)]"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="scroll-reveal-right relative">
            <div className="absolute -right-3 -top-5 hidden rounded-2xl border border-[#e5dcff] bg-white px-5 py-3 text-sm font-semibold !text-slate-700 shadow-[0_18px_42px_rgba(127,114,184,0.15)] sm:block">
              24 active comments
            </div>
            <div className="relative rounded-[2.25rem] border border-[#e5dcff] bg-white/86 p-4 shadow-[0_28px_82px_rgba(127,114,184,0.16)] backdrop-blur sm:p-6">
              <div className="flex flex-col gap-4 border-b border-[#ece6ff] pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#e5dcff] bg-[linear-gradient(135deg,#ffffff,#eee7ff)] text-sm font-black !text-[#6d4cff] shadow-[0_14px_28px_rgba(109,76,255,0.14)]">
                    Chat
                  </div>
                  <div>
                    <h3 className="font-heading text-2xl font-semibold !text-slate-950">
                      Comments (24)
                    </h3>
                    <p className="mt-1 text-sm !text-slate-500">
                      Share thoughts and learn together.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="w-fit rounded-2xl border border-[#e5dcff] bg-white px-4 py-3 text-sm font-semibold !text-slate-800 shadow-[0_12px_24px_rgba(127,114,184,0.1)]"
                >
                  Newest First
                </button>
              </div>

              <div className="mt-5 space-y-5">
                {discussionThreads.map((thread) => (
                  <article
                    key={thread.name}
                    className="rounded-[1.75rem] border border-[#ece6ff] bg-white px-4 py-5 shadow-[0_16px_38px_rgba(127,114,184,0.08)] sm:px-5"
                  >
                    <div className="flex gap-4">
                      <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${thread.accent} text-base font-black !text-[#3d2dc7]`}>
                        {thread.initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h4 className="font-semibold !text-slate-950">{thread.name}</h4>
                          <span className="text-sm !text-slate-500">{thread.time}</span>
                        </div>
                        <p className="mt-2 text-sm leading-6 !text-slate-700 sm:text-base">
                          {thread.message}
                        </p>
                        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm font-semibold !text-[#5b3cff]">
                          <span>{thread.likes} likes</span>
                          <span className="h-4 w-px bg-[#d8d0f5]" />
                          <button type="button">Reply</button>
                          <span className="h-4 w-px bg-[#d8d0f5]" />
                          <button type="button">More</button>
                        </div>
                      </div>
                    </div>

                    <div className="ml-0 mt-5 rounded-[1.35rem] border border-[#e8e0ff] bg-[#fbf9ff] px-4 py-4 sm:ml-[4.5rem]">
                      <div className="flex gap-4">
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${thread.reply.accent} text-sm font-black !text-[#5a3180]`}>
                          {thread.reply.initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-3">
                            <h5 className="font-semibold !text-slate-950">{thread.reply.name}</h5>
                            <span className="rounded-full bg-[#eee8ff] px-2.5 py-1 text-xs font-bold !text-[#5b3cff]">
                              {thread.reply.badge}
                            </span>
                            <span className="text-sm !text-slate-500">{thread.reply.time}</span>
                          </div>
                          <p className="mt-2 text-sm leading-6 !text-slate-700 sm:text-base">
                            {thread.reply.message}
                          </p>
                          <div className="mt-4 flex items-center gap-4 text-sm font-semibold !text-[#5b3cff]">
                            <span>{thread.reply.likes} likes</span>
                            <span className="h-4 w-px bg-[#d8d0f5]" />
                            <button type="button">Reply</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-5 flex gap-4 border-t border-[#ece6ff] pt-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#ded4ff] to-[#b8a8ff] text-sm font-black !text-[#5b3cff]">
                  You
                </div>
                <div className="min-w-0 flex-1 rounded-[1.35rem] border border-[#e5dcff] bg-white px-4 py-3">
                  <p className="text-sm !text-slate-500">Write a comment...</p>
                  <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex gap-2 text-sm font-semibold !text-slate-400">
                      <span>Emoji</span>
                      <span>Image</span>
                    </div>
                    <button
                      type="button"
                      className="w-fit rounded-xl bg-[#7c5cff] px-4 py-2.5 text-sm font-semibold !text-white shadow-[0_12px_26px_rgba(124,92,255,0.22)]"
                    >
                      Post Comment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-2 lg:px-8">
        <div className="pointer-events-none absolute -left-16 top-20 h-64 w-64 rounded-full bg-[#e6fbff] blur-3xl" />
        <div className="pointer-events-none absolute right-8 bottom-16 h-72 w-72 rounded-full bg-[#fff1d8] blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[0.34fr_0.66fr] lg:items-center">
          <div className="scroll-reveal-left max-w-xl lg:pl-8">
            <span className="inline-flex items-center rounded-full border !border-[#d8ecff] !bg-white/82 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] !text-[#0f8fb8] shadow-[0_12px_28px_rgba(14,165,233,0.1)]">
              Live Sessions
            </span>
            <h2 className="mt-5 max-w-md font-heading text-4xl font-semibold leading-tight tracking-tight !text-slate-950 sm:text-5xl">
              Join class, track progress, keep every resource close.
            </h2>
            <p className="mt-4 max-w-md text-base leading-7 !text-slate-600">
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
                  className="rounded-2xl border border-[#e5dcff] bg-white/84 px-4 py-3 shadow-[0_14px_34px_rgba(127,114,184,0.1)] backdrop-blur"
                >
                  <p className="font-heading text-2xl font-semibold leading-none !text-slate-950">
                    {value}
                  </p>
                  <p className="mt-1 text-sm !text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="scroll-reveal-right relative mx-auto w-full max-w-[62rem] lg:justify-self-end">
            <div className="absolute -left-4 -top-4 hidden rounded-2xl border border-[#e5dcff] bg-white px-4 py-3 text-sm font-semibold !text-slate-700 shadow-[0_18px_42px_rgba(127,114,184,0.14)] sm:block">
              Live now
            </div>
            <div className="relative overflow-hidden rounded-[2rem] border border-[#ded6ff] bg-white shadow-[0_28px_82px_rgba(127,114,184,0.16)]">
              <Image
                src="/images/session.png"
                alt="Sessions dashboard with live class progress and resources"
                width={1600}
                height={1049}
                sizes="(min-width: 1280px) 880px, (min-width: 1024px) 64vw, 94vw"
                className="h-auto w-full"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden px-6 pb-20 lg:px-8">
        <div className="pointer-events-none absolute inset-x-0 top-14 h-72 bg-[linear-gradient(90deg,transparent,rgba(14,165,233,0.08),rgba(245,158,11,0.08),transparent)] blur-3xl" />
        <div className="relative mx-auto max-w-6xl">
          <div className="grid gap-6 lg:grid-cols-[0.62fr_0.38fr] lg:items-end">
            <div className="scroll-reveal-left">
              <span className="inline-flex items-center rounded-full border !border-[#d8f0ff] !bg-white/82 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] !text-[#0e8eb8] shadow-[0_12px_28px_rgba(14,165,233,0.1)]">
                Progress Tracker
              </span>
              <h2 className="mt-5 max-w-xl font-heading text-4xl font-semibold leading-tight tracking-tight !text-slate-950 sm:text-5xl">
                See every subject, score, and weak spot at a glance.
              </h2>
            </div>

            <div className="scroll-reveal-right grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {[
                ["72%", "Overall score"],
                ["352", "Questions solved"],
                ["32h", "Study time"],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-[#e5dcff] bg-white/82 px-4 py-3 shadow-[0_16px_38px_rgba(127,114,184,0.1)] backdrop-blur"
                >
                  <p className="font-heading text-2xl font-semibold leading-none !text-slate-950">
                    {value}
                  </p>
                  <p className="mt-1 text-sm !text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="scroll-reveal-right relative mx-auto mt-7 w-full max-w-[58rem]">
            <div className="absolute -right-4 -top-5 hidden rounded-2xl border border-[#e5dcff] bg-white px-5 py-3 text-sm font-semibold !text-slate-700 shadow-[0_18px_42px_rgba(127,114,184,0.14)] sm:block">
              Monthly view
            </div>
            <div className="relative overflow-hidden rounded-[1.75rem] border border-[#ded6ff] bg-white shadow-[0_22px_62px_rgba(127,114,184,0.14)]">
              <Image
                src="/images/progress.png"
                alt="Progress dashboard with subject scores and study performance"
                width={1600}
                height={1049}
                sizes="(min-width: 1280px) 928px, (min-width: 1024px) 74vw, 92vw"
                className="h-auto w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


