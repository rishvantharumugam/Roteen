"use client";

import React, { useState, useEffect } from "react";
import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
import { useAuth } from "@/providers/AuthProvider";
import Link from "next/link";
import { appRoutes } from "@/constants/AppRoutes";
import { ClipboardCheck, HelpCircle, BarChart3, Calendar, Lock } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export function ProgressPageUI() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [hoveredSubject, setHoveredSubject] = useState<string | null>(null);
  const [hoveredQuestionSubject, setHoveredQuestionSubject] = useState<string | null>(null);
  const [subjectsList, setSubjectsList] = useState<string[]>([]);

  useEffect(() => {
    async function loadSubjects() {
      try {
        const { data, error } = await supabase
          .from("subjects")
          .select("subject_name")
          .order("subject_name", { ascending: true });

        if (error) {
          console.error("Error fetching subjects from Supabase:", error.message);
          return;
        }

        if (data) {
          const uniqueSubjects = new Map<string, string>();
          data.forEach((row) => {
            const rawName = row.subject_name;
            if (rawName) {
              const trimmed = rawName.trim();
              if (trimmed) {
                // Title Case Normalization
                const normalized = trimmed
                  .split(/\s+/)
                  .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                  .join(" ");
                // Group 'Math' and 'Mathematics' together
                const key = normalized.toLowerCase() === "math" ? "mathematics" : normalized.toLowerCase();
                const resolvedName = normalized.toLowerCase() === "math" ? "Mathematics" : normalized;
                uniqueSubjects.set(key, resolvedName);
              }
            }
          });
          setSubjectsList(Array.from(uniqueSubjects.values()));
        }
      } catch (err) {
        console.error("Failed to load subjects:", err);
      }
    }
    loadSubjects();
  }, []);

  // Mock statistics matching the user screenshot
  const totalQuestions = 480;
  const averageScore = 68;
  const longestStreak = 7;

  const mockSubjectStats: Record<string, { quizzes: number; total: number; color: string }> = {
    "mathematics": { quizzes: 8, total: 15, color: "#8B5CF6" },
    "physics": { quizzes: 6, total: 12, color: "#3B82F6" },
    "chemistry": { quizzes: 5, total: 10, color: "#10B981" },
    "biology": { quizzes: 3, total: 8, color: "#F59E0B" },
    "english": { quizzes: 1, total: 5, color: "#06B6D4" },
    "social": { quizzes: 2, total: 6, color: "#F43F5E" },
    "social science": { quizzes: 2, total: 6, color: "#F43F5E" },
    "science": { quizzes: 4, total: 10, color: "#10B981" },
    "quantam": { quizzes: 1, total: 5, color: "#EC4899" },
    "rain": { quizzes: 1, total: 4, color: "#EC4899" },
  };

  const PRESET_COLORS = ["#8B5CF6", "#3B82F6", "#10B981", "#F59E0B", "#06B6D4", "#EC4899", "#F43F5E", "#14B8A6", "#6366F1", "#10B981"];

  // Default fallback list if supabase fetch is loading or empty
  const activeSubjects = subjectsList.length > 0 
    ? subjectsList 
    : ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Other"];

  // Map subjects to statistics dynamically
  const subjectProgressMapped = activeSubjects.map((name, index) => {
    const key = name.toLowerCase();
    const stats = mockSubjectStats[key] || {
      quizzes: 1 + (index % 3),
      total: 5 + (index % 4),
      color: PRESET_COLORS[index % PRESET_COLORS.length]
    };
    return {
      name,
      quizzes: stats.quizzes,
      total: stats.total,
      color: stats.color,
      trackBg: `${stats.color}10`
    };
  });

  // Calculate dynamic totals
  const totalQuizzes = subjectProgressMapped.reduce((sum, s) => sum + s.quizzes, 0);
  const totalQuizzesAvailable = subjectProgressMapped.reduce((sum, s) => sum + s.total, 0);

  // Add percentage to each subject dynamically based on relative contribution
  const subjectProgress = subjectProgressMapped.map((subject) => {
    const percentage = totalQuizzes > 0 ? Math.round((subject.quizzes / totalQuizzes) * 100) : 0;
    return {
      ...subject,
      percentage
    };
  });

  // SVG Donut calculation constants
  const radius = 45;
  const circumference = 2 * Math.PI * radius; // ~282.74

  // Accumulate offsets for SVG donut segments
  let accumulatedPercent = 0;
  const donutSegments = subjectProgress.map((subject) => {
    const segmentLength = (subject.quizzes / totalQuizzes) * circumference;
    const gap = 2; // tiny spacing gap between segments
    const strokeDash = `${Math.max(0, segmentLength - gap)} ${circumference}`;
    const strokeOffset = -((accumulatedPercent / 100) * circumference) - (gap / 2);
    accumulatedPercent += (subject.quizzes / totalQuizzes) * 100;

    return {
      ...subject,
      strokeDash,
      strokeOffset,
    };
  });

  // Map subjects to question statistics dynamically
  const questionProgress = subjectProgress.map((subject) => {
    const questionsAnswered = subject.quizzes * 20;
    const questionsTotal = subject.total * 20;
    return {
      ...subject,
      questionsAnswered,
      questionsTotal,
    };
  });

  const totalQuestionsAnswered = questionProgress.reduce((sum, s) => sum + s.questionsAnswered, 0);
  const totalQuestionsAvailable = questionProgress.reduce((sum, s) => sum + s.questionsTotal, 0);

  let accumulatedQuestionPercent = 0;
  const questionDonutSegments = questionProgress.map((subject) => {
    const segmentLength = (subject.questionsAnswered / totalQuestionsAnswered) * circumference;
    const gap = 2;
    const strokeDash = `${Math.max(0, segmentLength - gap)} ${circumference}`;
    const strokeOffset = -((accumulatedQuestionPercent / 100) * circumference) - (gap / 2);
    accumulatedQuestionPercent += (subject.questionsAnswered / totalQuestionsAnswered) * 100;

    return {
      ...subject,
      strokeDash,
      strokeOffset,
    };
  });

  return (
    <div className="dark flex min-h-screen w-full flex-col bg-[#030303] text-slate-300 font-sans transition-colors duration-300">
      <DashboardHeader activeLabel="Progress" />
      <div className="bg-black flex flex-col flex-1 w-full overflow-x-hidden transition-colors duration-300">
        <main className="no-scrollbar flex-1 min-w-0 overflow-y-auto bg-[#030303] px-4 py-8 sm:px-8 lg:px-12 transition-colors duration-300">
          {!isAuthLoading && !user ? (
            <div className="flex flex-1 items-center justify-center px-8 py-12 min-h-[70vh]">
              <div className="w-full max-w-md rounded-[18px] border border-white/10 bg-[linear-gradient(145deg,rgba(24,24,27,0.92),rgba(11,11,13,0.96))] p-6 text-center shadow-[0_30px_100px_rgba(0,0,0,0.45)]">
                <h2 className="text-lg font-semibold text-white">Sign in required</h2>
                <p className="mt-2 text-sm text-slate-400">
                  Please sign in to view your learning progress.
                </p>
                <Link
                  href={appRoutes.signIn}
                  className="mt-4 inline-block rounded-xl border border-violet-400/35 bg-violet-500/10 px-4 py-2 text-sm font-semibold text-violet-100 shadow-[0_0_24px_rgba(124,58,237,0.16)] transition hover:bg-violet-500/20"
                >
                  Go to sign in
                </Link>
              </div>
            </div>
          ) : (
            <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6">
              
              {/* Header Title section */}
              <div className="mb-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Quiz Progress Overview</h1>
                <p className="mt-1 text-sm text-zinc-400 font-medium">Track your quiz attempts and performance across all subjects.</p>
              </div>

              {/* Grid 4 Overview Cards */}
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                {/* Total Quiz Card */}
                <div className="rounded-2xl border border-zinc-800/80 bg-[#0c0c0e] p-5 sm:p-6 flex flex-col gap-4 shadow-lg hover:border-zinc-700/80 transition duration-300">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold tracking-wider text-zinc-400 uppercase">Total Quiz</span>
                    <div className="h-10 w-10 shrink-0 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                      <HelpCircle size={18} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 mt-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{totalQuizzesAvailable}</span>
                    <p className="text-xs text-zinc-500 font-semibold flex items-center gap-1.5">
                      <span className="text-emerald-400 font-bold">↗ 15%</span> from last 30 days
                    </p>
                  </div>
                </div>

                {/* Total Quiz taken Card */}
                <div className="rounded-2xl border border-zinc-800/80 bg-[#0c0c0e] p-5 sm:p-6 flex flex-col gap-4 shadow-lg hover:border-zinc-700/80 transition duration-300">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold tracking-wider text-zinc-400 uppercase">Total Quiz taken</span>
                    <div className="h-10 w-10 shrink-0 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shadow-[0_0_15px_rgba(124,58,237,0.16)]">
                      <ClipboardCheck size={18} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 mt-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{totalQuizzes}</span>
                    <p className="text-xs text-zinc-500 font-semibold flex items-center gap-1.5">
                      <span className="text-emerald-400 font-bold">↗ 12%</span> from last 30 days
                    </p>
                  </div>
                </div>

                {/* Average Score Card */}
                <div className="rounded-2xl border border-zinc-800/80 bg-[#0c0c0e] p-5 sm:p-6 flex flex-col gap-4 shadow-lg hover:border-zinc-700/80 transition duration-300">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold tracking-wider text-zinc-400 uppercase">Average learning</span>
                    <div className="h-10 w-10 shrink-0 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                      <BarChart3 size={18} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 mt-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{averageScore}%</span>
                    <p className="text-xs text-zinc-500 font-semibold flex items-center gap-1.5">
                      <span className="text-emerald-400 font-bold">↗ 8%</span> from last 30 days
                    </p>
                  </div>
                </div>

                {/* Highest streak Card */}
                <div className="rounded-2xl border border-zinc-800/80 bg-[#0c0c0e] p-5 sm:p-6 flex flex-col gap-4 shadow-lg hover:border-zinc-700/80 transition duration-300">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold tracking-wider text-zinc-400 uppercase">Highest streak</span>
                    <div className="h-10 w-10 shrink-0 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                      <Calendar size={18} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 mt-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{longestStreak}</span>
                    <p className="text-xs text-zinc-500 font-semibold">
                      <span className="text-amber-500/90 font-bold">days in a row</span>
                    </p>
                  </div>
                </div>
              </section>

              {/* Subject Wise Progress section */}
              <section className="relative overflow-hidden rounded-2xl border border-zinc-800/60 bg-gradient-to-b from-[#0c0c0e] to-[#08080a] p-5 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.5)] mt-2 group">
                {/* Background glow effects */}
                <div className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-violet-600/10 blur-[80px] pointer-events-none transition-all duration-700 group-hover:bg-violet-600/15" />
                <div className="absolute -left-24 -bottom-24 h-48 w-48 rounded-full bg-blue-600/10 blur-[80px] pointer-events-none transition-all duration-700 group-hover:bg-blue-600/15" />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-zinc-800/60 relative z-10">
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
                      Subject Wise Quiz Progress
                    </h2>
                    <p className="mt-1 text-xs text-zinc-400 font-medium">Quiz attempts and performance breakdown by subject</p>
                  </div>
                  
                  {/* Summary Metric Badges */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900/50 border border-zinc-800/80 backdrop-blur-sm">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Total Quizzes</span>
                      <span className="text-sm font-extrabold text-white">{totalQuizzes}</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900/50 border border-zinc-800/80 backdrop-blur-sm">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Subjects</span>
                      <span className="text-sm font-extrabold text-violet-400">{subjectProgress.length}</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900/50 border border-zinc-800/80 backdrop-blur-sm">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Highest %</span>
                      <span className="text-sm font-extrabold text-emerald-400">33%</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-8 lg:gap-12 items-center relative z-10">
                  
                  {/* Left Side: SVG Radial Donut Chart */}
                  <div className="flex flex-col items-center justify-center py-4 relative">
                    <div 
                      className="relative w-64 h-64 flex items-center justify-center"
                      onClick={() => setHoveredSubject(null)}
                    >
                      <svg
                        className="w-full h-full transform -rotate-90 transition-transform duration-500"
                        viewBox="0 0 120 120"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        {/* Shadow track */}
                        <circle
                          cx="60"
                          cy="60"
                          r={radius}
                          stroke="rgba(255,255,255,0.02)"
                          strokeWidth="8.5"
                        />
                        {/* Donut segments */}
                        {donutSegments.map((segment) => {
                          const isHovered = hoveredSubject === segment.name;
                          const isAnyHovered = hoveredSubject !== null;
                          return (
                            <circle
                              key={segment.name}
                              cx="60"
                              cy="60"
                              r={radius}
                              stroke={segment.color}
                              strokeWidth={isHovered ? 10.5 : 8.5}
                              strokeDasharray={segment.strokeDash}
                              strokeDashoffset={segment.strokeOffset}
                              strokeLinecap="round"
                              className="transition-all duration-300 ease-out cursor-pointer"
                              style={{
                                opacity: !isAnyHovered || isHovered ? 1 : 0.35,
                                filter: isHovered ? `drop-shadow(0 0 6px ${segment.color})` : 'none',
                              }}
                              onMouseEnter={() => setHoveredSubject(segment.name)}
                              onMouseLeave={() => setHoveredSubject(null)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          );
                        })}
                      </svg>
                      
                      {/* Center label */}
                      <div className="absolute flex flex-col items-center justify-center text-center p-6 select-none transition-all duration-300 pointer-events-none">
                        {hoveredSubject ? (
                          <>
                            <span 
                              className="text-[12px] font-extrabold uppercase tracking-wider mb-1 animate-pulse"
                              style={{ color: subjectProgress.find(s => s.name === hoveredSubject)?.color }}
                            >
                              {hoveredSubject}
                            </span>
                            <div className="flex items-baseline gap-1">
                              <span className="text-3xl font-black text-white leading-none tracking-tight">
                                {subjectProgress.find(s => s.name === hoveredSubject)?.quizzes}
                              </span>
                              <span className="text-xs font-semibold text-zinc-400">quizzes</span>
                            </div>
                            <span className="text-xs font-bold text-zinc-400 mt-1.5 bg-zinc-900 border border-zinc-800/50 px-2 py-0.5 rounded-full">
                              {subjectProgress.find(s => s.name === hoveredSubject)?.percentage}% of total
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-[44px] font-black text-white leading-none tracking-tight">{totalQuizzes}</span>
                            <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-zinc-500 mt-2.5">Total Quizzes</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Subjects Detail Progress Bars & Columns */}
                  <div className="flex flex-col gap-5 min-w-0 w-full">
                    {/* Header Columns */}
                    <div className="grid grid-cols-[1.5fr_70px_70px_80px] sm:grid-cols-[1.2fr_1.6fr_80px_80px_100px] gap-4 text-[11px] font-bold text-zinc-500 uppercase tracking-wider border-b border-zinc-800/60 pb-3.5 px-[13px]">
                      <span>Subject</span>
                      <span className="hidden sm:inline">Progress</span>
                      <span className="text-center">Taken</span>
                      <span className="text-center">Total</span>
                      <span className="text-center">Percentage</span>
                    </div>

                    {/* Subject Rows */}
                    <div className="flex flex-col gap-3">
                      {subjectProgress.map((subject) => {
                        const isHovered = hoveredSubject === subject.name;
                        const isAnyHovered = hoveredSubject !== null;
                        return (
                          <div
                            key={subject.name}
                            className={`grid grid-cols-[1.5fr_70px_70px_80px] sm:grid-cols-[1.2fr_1.6fr_80px_80px_100px] gap-4 items-center px-3 py-2.5 rounded-xl transition-all duration-300 border border-transparent select-none cursor-pointer ${
                              isHovered 
                                ? "bg-white/[0.03] border-zinc-800/60 shadow-[0_4px_20px_rgba(0,0,0,0.2)] scale-[1.01]" 
                                : isAnyHovered 
                                ? "opacity-45 hover:opacity-100" 
                                : "hover:bg-white/[0.015]"
                            }`}
                            onMouseEnter={() => setHoveredSubject(subject.name)}
                            onMouseLeave={() => setHoveredSubject(null)}
                          >
                            {/* Subject Name with Dot indicator */}
                            <div className="flex items-center gap-3 min-w-0">
                              <span
                                className={`h-2.5 w-2.5 shrink-0 rounded-full transition-transform duration-300 ${
                                  isHovered ? "scale-125 animate-pulse" : ""
                                }`}
                                style={{
                                  backgroundColor: subject.color,
                                  boxShadow: `0 0 10px ${subject.color}80`
                                }}
                              />
                              <span className="text-zinc-200 font-bold truncate text-[13.5px] sm:text-[14.5px]">{subject.name}</span>
                            </div>

                            {/* Progress bar */}
                            <div className="hidden sm:block h-2 w-full rounded-full bg-zinc-900/80 overflow-hidden relative border border-zinc-800/30">
                              <div
                                className="h-full rounded-full transition-all duration-1000 ease-out"
                                style={{
                                  width: `${subject.percentage}%`,
                                  backgroundImage: `linear-gradient(90deg, ${subject.color}, ${subject.color}cc)`,
                                  boxShadow: isHovered ? `0 0 12px ${subject.color}a0` : `0 0 8px ${subject.color}40`
                                }}
                              />
                            </div>

                            {/* Quizzes Taken Badge */}
                            <div className="text-center">
                              <span className={`text-sm sm:text-base font-extrabold transition-all duration-300 ${
                                isHovered ? "text-white scale-105" : "text-zinc-200"
                              } inline-block`}>
                                {subject.quizzes}
                              </span>
                            </div>

                            {/* Total Quizzes Badge */}
                            <div className="text-center">
                              <span className={`text-sm sm:text-base font-bold transition-all duration-300 ${
                                isHovered ? "text-zinc-300" : "text-zinc-500"
                              } inline-block`}>
                                {subject.total}
                              </span>
                            </div>

                            {/* Percentage Badge */}
                            <div className="text-center">
                              <span 
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black transition-all duration-300"
                                style={{
                                  backgroundColor: isHovered ? `${subject.color}25` : `${subject.color}10`,
                                  border: isHovered ? `1px solid ${subject.color}60` : `1px solid ${subject.color}20`,
                                  color: subject.color,
                                  textShadow: isHovered ? `0 0 8px ${subject.color}50` : 'none'
                                }}
                              >
                                {subject.percentage}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </section>

              {/* Question Progress Overview Title & Cards */}
              <div className="mb-2 mt-8">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Question Progress Overview</h1>
                <p className="mt-1 text-sm text-zinc-400 font-medium">Track your question attempts and performance across all subjects.</p>
              </div>

              {/* Grid 4 Overview Cards for Questions */}
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                {/* Total Questions Card */}
                <div className="rounded-2xl border border-zinc-800/80 bg-[#0c0c0e] p-5 sm:p-6 flex flex-col gap-4 shadow-lg hover:border-zinc-700/80 transition duration-300">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold tracking-wider text-zinc-400 uppercase">Total Questions</span>
                    <div className="h-10 w-10 shrink-0 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                      <HelpCircle size={18} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 mt-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{totalQuestionsAvailable}</span>
                    <p className="text-xs text-zinc-500 font-semibold flex items-center gap-1.5">
                      <span className="text-emerald-400 font-bold">↗ 15%</span> from last 30 days
                    </p>
                  </div>
                </div>

                {/* Total Questions Learned Card */}
                <div className="rounded-2xl border border-zinc-800/80 bg-[#0c0c0e] p-5 sm:p-6 flex flex-col gap-4 shadow-lg hover:border-zinc-700/80 transition duration-300">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold tracking-wider text-zinc-400 uppercase">Total questions learned</span>
                    <div className="h-10 w-10 shrink-0 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                      <ClipboardCheck size={18} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 mt-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{totalQuestionsAnswered}</span>
                    <p className="text-xs text-zinc-500 font-semibold flex items-center gap-1.5">
                      <span className="text-emerald-400 font-bold">↗ 12%</span> from last 30 days
                    </p>
                  </div>
                </div>

                {/* Average Score Card */}
                <div className="rounded-2xl border border-zinc-800/80 bg-[#0c0c0e] p-5 sm:p-6 flex flex-col gap-4 shadow-lg hover:border-zinc-700/80 transition duration-300">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold tracking-wider text-zinc-400 uppercase">Average learning</span>
                    <div className="h-10 w-10 shrink-0 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                      <BarChart3 size={18} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 mt-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{averageScore}%</span>
                    <p className="text-xs text-zinc-500 font-semibold flex items-center gap-1.5">
                      <span className="text-emerald-400 font-bold">↗ 8%</span> from last 30 days
                    </p>
                  </div>
                </div>

                {/* Highest streak Card */}
                <div className="rounded-2xl border border-zinc-800/80 bg-[#0c0c0e] p-5 sm:p-6 flex flex-col gap-4 shadow-lg hover:border-zinc-700/80 transition duration-300">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold tracking-wider text-zinc-400 uppercase">Highest streak</span>
                    <div className="h-10 w-10 shrink-0 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                      <Calendar size={18} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 mt-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{longestStreak}</span>
                    <p className="text-xs text-zinc-500 font-semibold">
                      <span className="text-amber-500/90 font-bold">days in a row</span>
                    </p>
                  </div>
                </div>
              </section>

              {/* Question Progress Overview section */}
              <section className="relative overflow-hidden rounded-2xl border border-zinc-800/60 bg-gradient-to-b from-[#0c0c0e] to-[#08080a] p-5 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.5)] mt-4 group">
                {/* Background glow effects */}
                <div className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-emerald-600/10 blur-[80px] pointer-events-none transition-all duration-700 group-hover:bg-emerald-600/15" />
                <div className="absolute -left-24 -bottom-24 h-48 w-48 rounded-full bg-cyan-600/10 blur-[80px] pointer-events-none transition-all duration-700 group-hover:bg-cyan-600/15" />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-zinc-800/60 relative z-10">
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
                      Subject Wise Question Progress
                    </h2>
                    <p className="mt-1 text-xs text-zinc-400 font-medium">Question attempts and breakdown by subject</p>
                  </div>
                  
                  {/* Summary Metric Badges */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900/50 border border-zinc-800/80 backdrop-blur-sm">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Total Questions</span>
                      <span className="text-sm font-extrabold text-white">{totalQuestionsAvailable}</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900/50 border border-zinc-800/80 backdrop-blur-sm">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Answered</span>
                      <span className="text-sm font-extrabold text-emerald-400">{totalQuestionsAnswered}</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900/50 border border-zinc-800/80 backdrop-blur-sm">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Subjects</span>
                      <span className="text-sm font-extrabold text-violet-400">{questionProgress.length}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-8 lg:gap-12 items-center relative z-10">
                  
                  {/* Left Side: SVG Radial Donut Chart */}
                  <div className="flex flex-col items-center justify-center py-4 relative">
                    <div 
                      className="relative w-64 h-64 flex items-center justify-center"
                      onClick={() => setHoveredQuestionSubject(null)}
                    >
                      <svg
                        className="w-full h-full transform -rotate-90 transition-transform duration-500"
                        viewBox="0 0 120 120"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        {/* Shadow track */}
                        <circle
                          cx="60"
                          cy="60"
                          r={radius}
                          stroke="rgba(255,255,255,0.02)"
                          strokeWidth="8.5"
                        />
                        {/* Donut segments */}
                        {questionDonutSegments.map((segment) => {
                          const isHovered = hoveredQuestionSubject === segment.name;
                          const isAnyHovered = hoveredQuestionSubject !== null;
                          return (
                            <circle
                              key={segment.name}
                              cx="60"
                              cy="60"
                              r={radius}
                              stroke={segment.color}
                              strokeWidth={isHovered ? 10.5 : 8.5}
                              strokeDasharray={segment.strokeDash}
                              strokeDashoffset={segment.strokeOffset}
                              strokeLinecap="round"
                              className="transition-all duration-300 ease-out cursor-pointer"
                              style={{
                                opacity: !isAnyHovered || isHovered ? 1 : 0.35,
                                filter: isHovered ? `drop-shadow(0 0 6px ${segment.color})` : 'none',
                              }}
                              onMouseEnter={() => setHoveredQuestionSubject(segment.name)}
                              onMouseLeave={() => setHoveredQuestionSubject(null)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          );
                        })}
                      </svg>
                      
                      {/* Center label */}
                      <div className="absolute flex flex-col items-center justify-center text-center p-6 select-none transition-all duration-300 pointer-events-none">
                        {hoveredQuestionSubject ? (
                          <>
                            <span 
                              className="text-[12px] font-extrabold uppercase tracking-wider mb-1 animate-pulse"
                              style={{ color: questionProgress.find(s => s.name === hoveredQuestionSubject)?.color }}
                            >
                              {hoveredQuestionSubject}
                            </span>
                            <div className="flex items-baseline gap-1">
                              <span className="text-3xl font-black text-white leading-none tracking-tight">
                                {questionProgress.find(s => s.name === hoveredQuestionSubject)?.questionsAnswered}
                              </span>
                              <span className="text-xs font-semibold text-zinc-400">questions</span>
                            </div>
                            <span className="text-xs font-bold text-zinc-400 mt-1.5 bg-zinc-900 border border-zinc-800/50 px-2 py-0.5 rounded-full">
                              {questionProgress.find(s => s.name === hoveredQuestionSubject)?.percentage}% of total
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-[44px] font-black text-white leading-none tracking-tight">{totalQuestionsAnswered}</span>
                            <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-zinc-500 mt-2.5">Total Answered</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Subjects Detail Progress Bars & Columns */}
                  <div className="flex flex-col gap-5 min-w-0 w-full">
                    {/* Header Columns */}
                    <div className="grid grid-cols-[1.5fr_70px_70px_60px] sm:grid-cols-[1.2fr_1.6fr_80px_80px_100px] gap-4 text-[11px] font-bold text-zinc-500 uppercase tracking-wider border-b border-zinc-800/60 pb-3.5 px-[13px]">
                      <span>Subject</span>
                      <span className="hidden sm:inline">Progress</span>
                      <span className="text-center">Answered</span>
                      <span className="text-center">Total</span>
                      <span className="text-center">Percentage</span>
                    </div>

                    {/* Subject Rows */}
                    <div className="flex flex-col gap-3">
                      {questionProgress.map((subject) => {
                        const isHovered = hoveredQuestionSubject === subject.name;
                        const isAnyHovered = hoveredQuestionSubject !== null;
                        return (
                          <div
                            key={subject.name}
                            className={`grid grid-cols-[1.5fr_70px_70px_80px] sm:grid-cols-[1.2fr_1.6fr_80px_80px_100px] gap-4 items-center px-3 py-2.5 rounded-xl transition-all duration-300 border border-transparent select-none cursor-pointer ${
                              isHovered 
                                ? "bg-white/[0.03] border-zinc-800/60 shadow-[0_4px_20px_rgba(0,0,0,0.2)] scale-[1.01]" 
                                : isAnyHovered 
                                ? "opacity-45 hover:opacity-100" 
                                : "hover:bg-white/[0.015]"
                            }`}
                            onMouseEnter={() => setHoveredQuestionSubject(subject.name)}
                            onMouseLeave={() => setHoveredQuestionSubject(null)}
                          >
                            {/* Subject Name with Dot indicator */}
                            <div className="flex items-center gap-3 min-w-0">
                              <span
                                className={`h-2.5 w-2.5 shrink-0 rounded-full transition-transform duration-300 ${
                                  isHovered ? "scale-125 animate-pulse" : ""
                                }`}
                                style={{
                                  backgroundColor: subject.color,
                                  boxShadow: `0 0 10px ${subject.color}80`
                                }}
                              />
                              <span className="text-zinc-200 font-bold truncate text-[13.5px] sm:text-[14.5px]">{subject.name}</span>
                            </div>

                            {/* Progress bar */}
                            <div className="hidden sm:block h-2 w-full rounded-full bg-zinc-900/80 overflow-hidden relative border border-zinc-800/30">
                              <div
                                className="h-full rounded-full transition-all duration-1000 ease-out"
                                style={{
                                  width: `${subject.percentage}%`,
                                  backgroundImage: `linear-gradient(90deg, ${subject.color}, ${subject.color}cc)`,
                                  boxShadow: isHovered ? `0 0 12px ${subject.color}a0` : `0 0 8px ${subject.color}40`
                                }}
                              />
                            </div>

                            {/* Questions Answered Badge */}
                            <div className="text-center">
                              <span className={`text-sm sm:text-base font-extrabold transition-all duration-300 ${
                                isHovered ? "text-white scale-105" : "text-zinc-200"
                              } inline-block`}>
                                {subject.questionsAnswered}
                              </span>
                            </div>

                            {/* Total Questions Badge */}
                            <div className="text-center">
                              <span className={`text-sm sm:text-base font-bold transition-all duration-300 ${
                                isHovered ? "text-zinc-300" : "text-zinc-500"
                              } inline-block`}>
                                {subject.questionsTotal}
                              </span>
                            </div>

                            {/* Percentage Badge */}
                            <div className="text-center">
                              <span 
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black transition-all duration-300"
                                style={{
                                  backgroundColor: isHovered ? `${subject.color}25` : `${subject.color}10`,
                                  border: isHovered ? `1px solid ${subject.color}60` : `1px solid ${subject.color}20`,
                                  color: subject.color,
                                  textShadow: isHovered ? `0 0 8px ${subject.color}50` : 'none'
                                }}
                              >
                                {subject.percentage}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </section>

            </div>
          )}
        </main>
      </div>
    </div>
  );
}
