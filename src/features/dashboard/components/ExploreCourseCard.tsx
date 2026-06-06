"use client";

import { memo } from "react";
import { useRouter } from "next/navigation";
import type { ExploreSubjectCard } from "@/features/dashboard/services/DashboardPageService";
import {
  navigateToVideoSubject,
  prefetchVideoSubjectRoute,
} from "@/features/video/constants/videoSubjectNavigation";
import { Leaf, Atom, Pi, FlaskConical, Code2 } from "lucide-react";

export const ExploreCourseCard = memo(function ExploreCourseCard({
  card,
  animationDelayMs = 0,
}: {
  card: ExploreSubjectCard;
  animationDelayMs?: number;
}) {
  const router = useRouter();

  let SubjectIcon = Leaf;
  let bgGradient = "linear-gradient(135deg, rgba(20,40,30,0.9) 0%, rgba(5,20,15,0.95) 100%)";
  let iconColor = "#4ADE80";

  const titleLower = card.title.toLowerCase();
  if (titleLower.includes("physics")) {
    SubjectIcon = Atom;
    bgGradient = "linear-gradient(135deg, rgba(20,30,50,0.9) 0%, rgba(10,15,30,0.95) 100%)";
    iconColor = "#38BDF8";
  } else if (titleLower.includes("math")) {
    SubjectIcon = Pi;
    bgGradient = "linear-gradient(135deg, rgba(20,40,30,0.9) 0%, rgba(10,30,20,0.95) 100%)";
    iconColor = "#4ADE80";
  } else if (titleLower.includes("chemistry")) {
    SubjectIcon = FlaskConical;
    bgGradient = "linear-gradient(135deg, rgba(40,40,20,0.9) 0%, rgba(20,20,10,0.95) 100%)";
    iconColor = "#FACC15";
  } else if (titleLower.includes("computer")) {
    SubjectIcon = Code2;
    bgGradient = "linear-gradient(135deg, rgba(40,20,50,0.9) 0%, rgba(20,10,30,0.95) 100%)";
    iconColor = "#C084FC";
  }

  const handleOpenSubject = () => {
    navigateToVideoSubject(router, {
      subjectId: card.id,
      subjectTitle: card.title,
      subjectStandard: card.standard,
    });
  };

  const handlePrefetch = () => {
    prefetchVideoSubjectRoute(router, {
      subjectId: card.id,
      subjectTitle: card.title,
      subjectStandard: card.standard,
    });
  };

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={handleOpenSubject}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleOpenSubject();
        }
      }}
      onMouseEnter={handlePrefetch}
      onFocus={handlePrefetch}
      className="group relative flex aspect-[4/3] flex-shrink-0 cursor-pointer snap-start flex-col overflow-hidden rounded-2xl border border-white/5 bg-slate-950 p-6 shadow-xl transition-transform hover:-translate-y-1 hover:z-20 hover:border-purple-500/30 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/60"
      style={{
        background: bgGradient,
        animation: `fadeLift 560ms cubic-bezier(0.16, 1, 0.3, 1) ${animationDelayMs}ms both`,
      }}
    >
      <div
        className="absolute -right-8 -bottom-8 h-48 w-48 rounded-full opacity-[0.15] blur-2xl"
        style={{ backgroundColor: iconColor }}
      />

      <div
        className="absolute right-4 bottom-4 opacity-80 transition-transform duration-500 group-hover:scale-110"
        style={{ color: iconColor }}
      >
        <SubjectIcon size={80} strokeWidth={1.5} />
      </div>

      <div className="relative z-10">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#F59E0B]">
          {card.badge}
        </p>
        <h3 className="mt-2 line-clamp-2 font-heading text-[24px] font-semibold tracking-tight text-white">
          {card.title}
        </h3>
      </div>
    </article>
  );
});
