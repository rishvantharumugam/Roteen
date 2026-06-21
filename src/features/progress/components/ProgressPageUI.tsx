"use client";

import React, { useState, useEffect } from "react";
import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
import { useAuth } from "@/providers/AuthProvider";
import Link from "next/link";
import { appRoutes } from "@/constants/AppRoutes";
import { ClipboardCheck, HelpCircle, BarChart3, Calendar, Lock } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { ProfileService } from "@/features/profile/services/profile.service";

export function ProgressPageUI() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [hoveredSubject, setHoveredSubject] = useState<string | null>(null);
  const [hoveredQuestionSubject, setHoveredQuestionSubject] = useState<string | null>(null);
  const [subjectsList, setSubjectsList] = useState<{ id: string; name: string }[]>([]);
  const [dbQuizCount, setDbQuizCount] = useState<number | null>(null);
  const [dbTakenCount, setDbTakenCount] = useState<number | null>(null);
  const [dbSubjectStats, setDbSubjectStats] = useState<Record<string, { quizzes: number; total: number; questionsAnswered: number; questionsTotal: number }>>({});
  const [profileStandard, setProfileStandard] = useState<string>("10");
  const [loading, setLoading] = useState<boolean>(true);
  const [averageLearning, setAverageLearning] = useState<number>(0);
  const [longestStreak, setLongestStreak] = useState<number>(0);


  useEffect(() => {
    async function loadData() {
      if (!user?.id) return;

      try {
        setLoading(true);
        // 1. Fetch user profile standard (best-effort)
        let cleanStd = "10";
        try {
          const profile = await ProfileService.getProfile(user.id, user);
          if (profile?.standard) {
            setProfileStandard(profile.standard);
            cleanStd = profile.standard.replace(/\D/g, "") || "10";
          }
        } catch (profileErr) {
          console.warn("Failed to fetch profile standard, defaulting standard to 10:", profileErr);
        }

        // 2. Fetch all quizzes matching the standard (with fallback join)
        let quizzesData: any[] = [];
        const { data: qData, error: quizError } = await supabase
          .from("quizzes")
          .select("id, subject_id, title, total_questions, subjects!quizzes_subject_id_fkey!inner(subject_name)")
          .eq("subjects.standard", cleanStd);

        if (quizError) {
          console.warn("Trying fallback relationship in loadData due to error:", quizError.message);
          const { data: fbData, error: fbError } = await supabase
            .from("quizzes")
            .select("id, subject_id, title, total_questions, subjects!quizzes_subject_id_fkey1!inner(subject_name)")
            .eq("subjects.standard", cleanStd);

          if (!fbError && fbData) {
            quizzesData = fbData;
          }
        } else if (qData) {
          quizzesData = qData;
        }
        setDbQuizCount(quizzesData.length);

        // 3. Fetch user's resolved quiz attempts
        const { data: attemptsData, error: attemptError } = await supabase
          .from("user_quiz_progress")
          .select("quizzes_id, score, completed_at, quizzes(total_questions)")
          .eq("users_id", user.id)
          .eq("iscompleted", "Resolved");

        let uniqueResolvedIds = new Set<string>();
        const firstQuizCompletions: Record<string, number> = {};
        let totalPercentage = 0;
        let validPercentageCount = 0;

        if (attemptsData) {
          attemptsData.forEach((row) => {
            if (row.quizzes_id) {
              uniqueResolvedIds.add(String(row.quizzes_id));
            }

            if (row.quizzes_id && row.completed_at) {
              const compTime = new Date(row.completed_at).getTime();
              if (!isNaN(compTime)) {
                if (firstQuizCompletions[row.quizzes_id] === undefined || compTime < firstQuizCompletions[row.quizzes_id]) {
                  firstQuizCompletions[row.quizzes_id] = compTime;
                }
              }
            }

            const quizTotal = row.quizzes ? (row.quizzes as any).total_questions : 0;
            if (typeof row.score === "number" && quizTotal > 0) {
              const scorePercent = (row.score / quizTotal) * 100;
              totalPercentage += scorePercent;
              validPercentageCount++;
            }
          });
        }
        setDbTakenCount(uniqueResolvedIds.size);

        // Calculate highest streak using first completed_at of each quiz
        const uniqueDates = new Set<string>();
        Object.values(firstQuizCompletions).forEach((timestamp) => {
          const date = new Date(timestamp);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          uniqueDates.add(`${year}-${month}-${day}`);
        });

        const sortedDates = Array.from(uniqueDates).sort();
        let maxStreak = 0;
        let currentStreak = 0;
        let lastTime: number | null = null;

        sortedDates.forEach((dateStr) => {
          const parts = dateStr.split("-").map(Number);
          const time = Date.UTC(parts[0], parts[1] - 1, parts[2]);
          if (lastTime === null) {
            currentStreak = 1;
          } else {
            const diffDays = Math.round((time - lastTime) / (1000 * 60 * 60 * 24));
            if (diffDays === 1) {
              currentStreak++;
            } else if (diffDays > 1) {
              currentStreak = 1;
            }
          }
          maxStreak = Math.max(maxStreak, currentStreak);
          lastTime = time;
        });

        setLongestStreak(maxStreak);

        // Calculate average learning
        if (validPercentageCount > 0) {
          setAverageLearning(Math.round(totalPercentage / validPercentageCount));
        } else {
          setAverageLearning(0);
        }

        // 4. Fetch subjects matching the user's standard
        const { data: subData, error: subError } = await supabase
          .from("subjects")
          .select("id, subject_name")
          .eq("standard", cleanStd)
          .order("subject_name", { ascending: true });

        if (subError) {
          console.error("Error fetching subjects from Supabase:", subError.message);
          return;
        }

        // Fetch all questions matching the user's standard
        const { data: dbQuestions } = await supabase
          .from("questions")
          .select("id, subject_id")
          .eq("standard", cleanStd);

        // Fetch resolved questions for this user
        const { data: dbQuestionProgress } = await supabase
          .from("user_questions_progress")
          .select("Questions_ID, status, questions!inner(subject_id)")
          .eq("Users_ID", user.id)
          .eq("status", "Resolved");

        // 5. Map metrics subject-wise
        const statsMap: Record<string, { quizzes: number; total: number; questionsAnswered: number; questionsTotal: number }> = {};
        if (subData) {
          // Initialize statsMap for all standard subjects (keyed by subject ID)
          subData.forEach((row) => {
            if (row.subject_name && row.id) {
              statsMap[String(row.id)] = { quizzes: 0, total: 0, questionsAnswered: 0, questionsTotal: 0 };
            }
          });

          // Accumulate totals and questions total per subject from the quizzes table
          quizzesData.forEach((quiz) => {
            const subjectIdKey = String(quiz.subject_id);
            if (statsMap[subjectIdKey] !== undefined) {
              statsMap[subjectIdKey].total += 1;
            }
          });

          // Accumulate resolved counts per subject from attempts
          uniqueResolvedIds.forEach((quizId) => {
            const quiz = quizzesData.find((q) => String(q.id) === String(quizId));
            if (quiz) {
              const subjectIdKey = String(quiz.subject_id);
              if (statsMap[subjectIdKey] !== undefined) {
                statsMap[subjectIdKey].quizzes += 1;
              }
            }
          });

          // Accumulate total questions per subject from questions table
          if (dbQuestions) {
            dbQuestions.forEach((q: any) => {
              const subjectIdKey = q.subject_id ? String(q.subject_id) : null;
              if (subjectIdKey && statsMap[subjectIdKey] !== undefined) {
                statsMap[subjectIdKey].questionsTotal += 1;
              }
            });
          }

          // Accumulate resolved questions per subject from user_questions_progress
          const resolvedQuestionIds = new Set<string>();
          if (dbQuestionProgress) {
            dbQuestionProgress.forEach((row: any) => {
              const qid = String(row.Questions_ID);
              if (!resolvedQuestionIds.has(qid)) {
                resolvedQuestionIds.add(qid);
                const subjectIdKey = row.questions?.subject_id ? String(row.questions.subject_id) : null;
                if (subjectIdKey && statsMap[subjectIdKey] !== undefined) {
                  statsMap[subjectIdKey].questionsAnswered += 1;
                }
              }
            });
          }

          setDbSubjectStats(statsMap);

          const uniqueSubjectsArr: { id: string; name: string }[] = [];
          const seenIds = new Set<string>();
          subData.forEach((row) => {
            const rawName = row.subject_name;
            if (rawName && row.id && !seenIds.has(String(row.id))) {
              seenIds.add(String(row.id));
              const trimmed = rawName.trim();
              if (trimmed) {
                const normalized = trimmed
                  .split(/\s+/)
                  .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                  .join(" ");
                uniqueSubjectsArr.push({ id: String(row.id), name: normalized });
              }
            }
          });
          setSubjectsList(uniqueSubjectsArr);

        }
      } catch (err) {
        console.error("Failed to load progress page data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user?.id]);

  const PRESET_COLORS = [
    "#8B5CF6", // Violet
    "#3B82F6", // Blue
    "#10B981", // Emerald
    "#F59E0B", // Amber
    "#06B6D4", // Cyan
    "#EC4899", // Pink
    "#F43F5E", // Rose
    "#14B8A6", // Teal
    "#6366F1", // Indigo
    "#F97316", // Orange
    "#84CC16", // Lime
    "#22C55E", // Green
    "#A855F7", // Purple
    "#D946EF", // Fuchsia
    "#60A5FA", // Light Blue
    "#FB7185"  // Soft Rose
  ];

  // Mock statistics removed to use dynamic stats
  const activeSubjects = subjectsList;

  // Map subjects to statistics dynamically
  const subjectProgressMapped = activeSubjects.map((subject, index) => {
    // Look up stats by subject ID (the new key strategy)
    const stats = dbSubjectStats[subject.id] || {
      quizzes: 0,
      total: 0,
      questionsAnswered: 0,
      questionsTotal: 0
    };

    const color = PRESET_COLORS[index % PRESET_COLORS.length];

    return {
      name: subject.name,
      ...stats,
      color,
      progress: stats.total > 0 ? (stats.quizzes / stats.total) * 100 : 0
    };
  });

  // Calculate dynamic totals
  const totalQuizzes = subjectProgressMapped.reduce((sum, s) => sum + s.quizzes, 0);
  const totalQuizzesAvailable = subjectProgressMapped.reduce((sum, s) => sum + s.total, 0);

  // Add percentage to each subject dynamically based on completion and sort by highest percentage descending
  const subjectProgress = subjectProgressMapped
    .map((subject) => {
      const percentage = subject.total > 0 ? Math.round((subject.quizzes / subject.total) * 100) : 0;
      return {
        ...subject,
        percentage,
        trackBg: `${subject.color}10`
      };
    })
    .sort((a, b) => b.percentage - a.percentage);

  const highestPercent = subjectProgress.length > 0 ? subjectProgress[0].percentage : 0;

  // SVG Donut calculation constants
  const radius = 45;
  const circumference = 2 * Math.PI * radius; // ~282.74

  let accumulatedPercent = 0;
  const donutSegments = subjectProgress.map((subject) => {
    const segmentLength = totalQuizzes > 0 ? (subject.quizzes / totalQuizzes) * circumference : 0;
    const gap = 2; // tiny spacing gap between segments
    const strokeDash = `${Math.max(0, segmentLength - gap)} ${circumference}`;
    const strokeOffset = totalQuizzes > 0 ? -((accumulatedPercent / 100) * circumference) - (gap / 2) : 0;
    accumulatedPercent += totalQuizzes > 0 ? (subject.quizzes / totalQuizzes) * 100 : 0;

    return {
      ...subject,
      strokeDash,
      strokeOffset,
    };
  });

  // Map subjects to question statistics dynamically from database
  const questionProgress = subjectProgress.map((subject) => {
    const percentage = subject.questionsTotal > 0 ? Math.round((subject.questionsAnswered / subject.questionsTotal) * 100) : 0;
    return {
      ...subject,
      questionsAnswered: subject.questionsAnswered,
      questionsTotal: subject.questionsTotal,
      percentage,
      trackBg: `${subject.color}10`
    };
  })
  .sort((a, b) => b.percentage - a.percentage);

  const totalQuestionsAnswered = questionProgress.reduce((sum, s) => sum + s.questionsAnswered, 0);
  const totalQuestionsAvailable = questionProgress.reduce((sum, s) => sum + s.questionsTotal, 0);

  const takenQuizzesCount = dbTakenCount ?? 0;
  const totalQuizzesCount = dbQuizCount ?? 0;
  const quizTakenPercentage = totalQuizzesCount > 0 ? Math.round((takenQuizzesCount / totalQuizzesCount) * 100) : 0;
  const questionLearnedPercentage = totalQuestionsAvailable > 0 ? Math.round((totalQuestionsAnswered / totalQuestionsAvailable) * 100) : 0;
  const highestQuestionPercent = questionProgress.length > 0 ? questionProgress[0].percentage : 0;

  let accumulatedQuestionPercent = 0;
  const questionDonutSegments = questionProgress.map((subject) => {
    const segmentLength = totalQuestionsAnswered > 0 ? (subject.questionsAnswered / totalQuestionsAnswered) * circumference : 0;
    const gap = 2;
    const strokeDash = `${Math.max(0, segmentLength - gap)} ${circumference}`;
    const strokeOffset = totalQuestionsAnswered > 0 ? -((accumulatedQuestionPercent / 100) * circumference) - (gap / 2) : 0;
    accumulatedQuestionPercent += totalQuestionsAnswered > 0 ? (subject.questionsAnswered / totalQuestionsAnswered) * 100 : 0;

    return {
      ...subject,
      strokeDash,
      strokeOffset,
    };
  });

  if (isAuthLoading || loading) {
    return (
      <div className="dark flex min-h-screen w-full flex-col bg-[#030303] text-slate-300 font-sans">
        <DashboardHeader activeLabel="Progress" />
        <div className="bg-black flex flex-col flex-1 w-full overflow-x-hidden">
          <main className="no-scrollbar flex-1 min-w-0 overflow-y-auto bg-[#030303] px-4 py-8 sm:px-8 lg:px-12 animate-pulse">
            <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6">

              {/* Header Title section */}
              <div className="mb-2 space-y-2.5">
                <div className="h-9 w-64 rounded-xl bg-zinc-800" />
                <div className="h-4 w-96 rounded-lg bg-zinc-800/80" />
              </div>

              {/* Grid 4 Overview Cards */}
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-2xl border border-zinc-800/80 bg-[#0c0c0e] p-5 sm:p-6 flex flex-col gap-4 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="h-4.5 w-24 rounded-lg bg-zinc-800" />
                      <div className="h-10 w-10 rounded-xl bg-zinc-800/50" />
                    </div>
                    <div className="mt-2 space-y-2">
                      <div className="h-8 w-16 rounded-xl bg-zinc-800" />
                      <div className="h-3 w-28 rounded-lg bg-zinc-800/60" />
                    </div>
                  </div>
                ))}
              </section>

              {/* Subject Wise Progress section */}
              <section className="rounded-2xl border border-zinc-800/60 bg-[#0c0c0e] p-5 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.5)] mt-2">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-zinc-800/60">
                  <div className="space-y-2">
                    <div className="h-6 w-48 rounded-lg bg-zinc-800" />
                    <div className="h-3 w-64 rounded-lg bg-zinc-800/60" />
                  </div>
                  <div className="flex gap-3">
                    <div className="h-8 w-24 rounded-xl bg-zinc-800/80" />
                    <div className="h-8 w-24 rounded-xl bg-zinc-800/80" />
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-8 lg:gap-12 items-center">
                  <div className="flex justify-center py-4">
                    <div className="h-48 w-48 rounded-full border-[12px] border-zinc-800/60 flex items-center justify-center" />
                  </div>
                  <div className="flex flex-col gap-4.5 w-full">
                    <div className="h-4.5 w-full rounded-lg bg-zinc-800/40" />
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-9 w-full rounded-xl bg-zinc-800/20" />
                    ))}
                  </div>
                </div>
              </section>

            </div>
          </main>
        </div>
      </div>
    );
  }

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
                  href={`${appRoutes.signIn}?next=${encodeURIComponent(appRoutes.progress)}`}
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
                    <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                      {dbQuizCount ?? 0}
                    </span>
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
                    <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                      {dbTakenCount ?? 0}
                    </span>
                    <p className="text-xs text-zinc-500 font-semibold">
                      <span className="text-emerald-400 font-bold">{quizTakenPercentage}%</span> of total learned
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
                    <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{averageLearning}%</span>
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
                      <span className="text-sm font-extrabold text-white">
                        {dbTakenCount ?? 0}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900/50 border border-zinc-800/80 backdrop-blur-sm">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Subjects</span>
                      <span className="text-sm font-extrabold text-violet-400">{subjectProgress.length}</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900/50 border border-zinc-800/80 backdrop-blur-sm">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Highest %</span>
                      <span className="text-sm font-extrabold text-emerald-400">{highestPercent}%</span>
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
                            <span className="text-[44px] font-black text-white leading-none tracking-tight">
                              {dbTakenCount ?? 0}
                            </span>
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
                            className={`grid grid-cols-[1.5fr_70px_70px_80px] sm:grid-cols-[1.2fr_1.6fr_80px_80px_100px] gap-4 items-center px-3 py-2.5 rounded-xl transition-all duration-300 border border-transparent select-none cursor-pointer ${isHovered
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
                                className={`h-2.5 w-2.5 shrink-0 rounded-full transition-transform duration-300 ${isHovered ? "scale-125 animate-pulse" : ""
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
                              <span className={`text-sm sm:text-base font-extrabold transition-all duration-300 ${isHovered ? "text-white scale-105" : "text-zinc-200"
                                } inline-block`}>
                                {subject.quizzes}
                              </span>
                            </div>

                            {/* Total Quizzes Badge */}
                            <div className="text-center">
                              <span className={`text-sm sm:text-base font-bold transition-all duration-300 ${isHovered ? "text-zinc-300" : "text-zinc-500"
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
                    <p className="text-xs text-zinc-500 font-semibold">
                      <span className="text-emerald-400 font-bold">{questionLearnedPercentage}%</span> of total learned
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
                    <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{questionLearnedPercentage}%</span>
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
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Subjects</span>
                      <span className="text-sm font-extrabold text-violet-400">{questionProgress.length}</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900/50 border border-zinc-800/80 backdrop-blur-sm">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Highest %</span>
                      <span className="text-sm font-extrabold text-emerald-400">{highestQuestionPercent}%</span>
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
                            <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-zinc-500 mt-2.5">Total Questions</span>
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
                      <span className="text-center">Learned</span>
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
                            className={`grid grid-cols-[1.5fr_70px_70px_80px] sm:grid-cols-[1.2fr_1.6fr_80px_80px_100px] gap-4 items-center px-3 py-2.5 rounded-xl transition-all duration-300 border border-transparent select-none cursor-pointer ${isHovered
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
                                className={`h-2.5 w-2.5 shrink-0 rounded-full transition-transform duration-300 ${isHovered ? "scale-125 animate-pulse" : ""
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
                              <span className={`text-sm sm:text-base font-extrabold transition-all duration-300 ${isHovered ? "text-white scale-105" : "text-zinc-200"
                                } inline-block`}>
                                {subject.questionsAnswered}
                              </span>
                            </div>

                            {/* Total Questions Badge */}
                            <div className="text-center">
                              <span className={`text-sm sm:text-base font-bold transition-all duration-300 ${isHovered ? "text-zinc-300" : "text-zinc-500"
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
