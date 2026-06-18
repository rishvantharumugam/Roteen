"use client";

import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  CheckCircle2,
  ClipboardList,
  List,
  Loader2,
  Sparkles,
} from "lucide-react";
import type { ChapterQuizRecord, QuizQuestionRecord, QuizProgressRecord } from "@/features/video/services/videoQuizService";

export type ChapterQuizPhase = "landing" | "questions" | "result";

interface ChapterQuizPanelProps {
  phase: ChapterQuizPhase;
  quiz: ChapterQuizRecord | null;
  chapterTitle?: string;
  loading: boolean;
  notFound: boolean;
  errorMessage: string | null;
  questions: QuizQuestionRecord[];
  questionsLoading: boolean;
  currentQuestionIndex: number;
  selectedAnswers: Record<string, string>;
  score: { correct: number; total: number };
  quizProgress?: QuizProgressRecord | null;
  onStartQuiz: () => void;
  onSelectAnswer: (questionId: string, optionId: string) => void;
  onPreviousQuestion: () => void;
  onNextQuestion: () => void;
  onGlobalPrevious?: () => void;
  onGlobalNext?: () => void;
  onJumpToQuestion?: (index: number) => void;
  onSubmitQuiz: () => void;
  onContinueAfterResult: () => void;
  onRetryQuiz: () => void;
}

export default function ChapterQuizPanel({
  phase,
  quiz,
  chapterTitle,
  loading,
  notFound,
  errorMessage,
  questions,
  questionsLoading,
  currentQuestionIndex,
  selectedAnswers,
  score,
  quizProgress,
  onStartQuiz,
  onSelectAnswer,
  onPreviousQuestion,
  onNextQuestion,
  onGlobalPrevious,
  onGlobalNext,
  onJumpToQuestion,
  onSubmitQuiz,
  onContinueAfterResult,
  onRetryQuiz,
}: ChapterQuizPanelProps) {
  const [visitedQuestions, setVisitedQuestions] = useState<Set<number>>(new Set([0]));
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    setVisitedQuestions((prev) => {
      const newSet = new Set(prev);
      newSet.add(currentQuestionIndex);
      return newSet;
    });
  }, [currentQuestionIndex]);
  if (loading) {
    return (
      <div className="flex h-full w-full flex-col lg:flex-row min-h-[420px] rounded-2xl border border-zinc-800 bg-[#121212] overflow-hidden">
        {/* Left Side: Question Card & Options */}
        <div className="flex-1 p-6 flex flex-col border-b lg:border-b-0 lg:border-r border-zinc-800">
           {/* Quiz Header & Progress */}
           <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-6 w-32 bg-[#1D1D1D]" />
              <Skeleton className="h-4 w-16 bg-[#1D1D1D]" />
           </div>
           <Skeleton className="h-2 w-full rounded-full bg-[#1D1D1D] mb-8" />
           
           {/* Question */}
           <SkeletonText lines={3} className="mb-8" />
           
           {/* Options */}
           <div className="flex flex-col gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                 <Skeleton key={i} className="h-14 w-full rounded-xl bg-[#1D1D1D]" />
              ))}
           </div>
           
           {/* Action Buttons */}
           <div className="flex justify-between items-center mt-auto pt-6">
              <Skeleton className="h-10 w-24 rounded-lg bg-[#1D1D1D]" />
              <Skeleton className="h-10 w-24 rounded-lg bg-[#1D1D1D]" />
           </div>
        </div>

        {/* Right Side: Question Palette */}
        <div className="w-full lg:w-[280px] p-6 flex flex-col shrink-0">
           <Skeleton className="h-6 w-32 bg-[#1D1D1D] mb-4" />
           <div className="grid grid-cols-5 gap-2 mb-8">
              {Array.from({ length: 15 }).map((_, i) => (
                 <Skeleton key={i} className="h-10 w-full rounded-lg bg-[#1D1D1D]" />
              ))}
           </div>
           <Skeleton className="h-12 w-full mt-auto rounded-xl bg-[#1D1D1D]" />
        </div>
      </div>
    );
  }

  if (notFound || !quiz) {
    return (
      <div className="flex h-full w-full min-h-[420px] flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-[#121212] px-6 text-center">
        <ClipboardList className="mb-4 h-10 w-10 text-zinc-500" />
        <p className="text-base font-medium text-zinc-300">No quiz available for this chapter.</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="flex h-full w-full min-h-[420px] flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-[#121212] px-6 text-center">
        <p className="text-sm text-red-400">{errorMessage}</p>
      </div>
    );
  }

  if (phase === "landing") {
    const totalQuestions = quiz.totalQuestions > 0 ? quiz.totalQuestions : questions.length;

    return (
      <div className="flex h-full w-full min-h-[420px] flex-col rounded-2xl border border-zinc-800/80 bg-[#121212] p-6 md:p-8">
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="mb-6 relative flex flex-col items-center justify-center">
            <div className="relative">
              <ClipboardList className="h-24 w-24 text-[#f97316]" strokeWidth={1.5} />
              <div className="absolute inset-0 flex flex-col items-center justify-start pt-[22px]">
                <span className="text-[10px] font-bold text-[#f97316] tracking-widest bg-[#161616] px-1 z-10">QUIZ</span>
              </div>
              <div className="absolute inset-x-0 bottom-[22px] flex flex-col items-center justify-center gap-[5px] pl-1 pr-1 opacity-90">
                <div className="flex w-[32px] items-center justify-between">
                  <div className="flex h-2.5 w-2.5 items-center justify-center rounded-[2px] border border-[#f97316]">
                    <CheckCircle2 className="h-2 w-2 text-[#f97316]" strokeWidth={3} />
                  </div>
                  <div className="h-0.5 w-[14px] rounded-full bg-[#f97316]"></div>
                </div>
                <div className="flex w-[32px] items-center justify-between">
                  <div className="flex h-2.5 w-2.5 items-center justify-center rounded-[2px] border border-[#f97316]">
                    <CheckCircle2 className="h-2 w-2 text-[#f97316]" strokeWidth={3} />
                  </div>
                  <div className="h-0.5 w-[14px] rounded-full bg-[#f97316]"></div>
                </div>
                <div className="flex w-[32px] items-center justify-between">
                  <div className="flex h-2.5 w-2.5 items-center justify-center rounded-[2px] border border-[#f97316]">
                    <CheckCircle2 className="h-2 w-2 text-[#f97316]" strokeWidth={3} />
                  </div>
                  <div className="h-0.5 w-[14px] rounded-full bg-[#f97316]"></div>
                </div>
              </div>
            </div>
          </div>
          
          <h2 className="mt-2 text-xl font-semibold text-white md:text-2xl">Ready For Quiz On {chapterTitle || quiz.title}?</h2>
          <p className="mt-2 text-sm text-zinc-400">Let's get started and see how much you've learned</p>
          
          <div className="mt-8 mb-8 w-full max-w-2xl rounded-xl border border-zinc-800/60 bg-[#1c1c1c] p-6 text-left shadow-sm">
            <h3 className="mb-4 text-sm font-medium text-white md:text-base">Instructions</h3>
            <ul className="space-y-3 text-xs text-zinc-400 list-disc pl-5 marker:text-zinc-600 md:text-sm">
              <li className="pl-1">This quiz consists of {totalQuestions} questions</li>
              <li className="pl-1">Each question has multiple options, but only one correct answer</li>
              <li className="pl-1">There is no negative marking for incorrect answers or unanswered questions</li>
            </ul>
          </div>

          <button
            type="button"
            onClick={onStartQuiz}
            disabled={questionsLoading}
            className="w-full max-w-[140px] rounded-lg bg-[#3a1d0f] py-2.5 text-sm font-medium text-[#f97316] transition-colors duration-200 hover:bg-[#4a2412] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {questionsLoading ? "Loading..." : "Start Now"}
          </button>
        </div>
      </div>
    );
  }

  if (phase === "result") {
    const totalQ = questions.length;
    const attemptedCount = Object.keys(selectedAnswers).length;
    const correctCount = score.correct;
    const incorrectCount = attemptedCount - correctCount;
    const unattemptedCount = totalQ - attemptedCount;

    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) {
      return (
        <div className="flex h-full w-full min-h-[420px] items-center justify-center rounded-2xl border border-zinc-800 bg-[#121212]">
          <p className="text-sm text-zinc-400">No quiz questions available.</p>
        </div>
      );
    }

    const selectedOptionId = selectedAnswers[currentQuestion.id] ?? "";
    const isLastQuestion = currentQuestionIndex === questions.length - 1;

    return (
      <div className="flex h-full w-full min-h-[420px] flex-col rounded-2xl border border-zinc-800 bg-[#121212] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 bg-transparent px-6 py-4">
          <p className="text-sm font-semibold text-white">Quiz {chapterTitle || quiz.title}</p>
          <button
            onClick={onRetryQuiz}
            className="flex items-center gap-2 rounded-lg bg-[#3a1d0f]/50 px-3 py-1.5 text-xs font-semibold text-[#f97316] transition-colors hover:bg-[#3a1d0f]"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            Reset Quiz
          </button>
        </div>

        <div className="flex flex-1 min-h-0 flex-col overflow-y-auto p-4">
          {/* Overview Section */}
          <div className="mb-4">
            <h3 className="mb-2 text-sm font-bold text-white">Overview</h3>
            <div className="flex flex-wrap gap-2">
              <div className="flex h-10 flex-1 min-w-[120px] items-center justify-between rounded-lg border border-[#f97316]/20 bg-[#3a1d0f]/30 px-3">
                <div className="flex items-center gap-2 text-[#f97316]">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-xs font-semibold">Total Score</span>
                </div>
                <span className="text-lg font-bold text-[#f97316]">{score.correct}</span>
              </div>
              <div className="flex h-10 flex-1 min-w-[120px] items-center justify-between rounded-lg border border-green-500/20 bg-[#1a3a2a]/30 px-3">
                <div className="flex items-center gap-2 text-green-500">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-xs font-semibold">Correct</span>
                </div>
                <span className="text-lg font-bold text-green-500">{correctCount}</span>
              </div>
              <div className="flex h-10 flex-1 min-w-[120px] items-center justify-between rounded-lg border border-red-500/20 bg-[#3a1a1a]/30 px-3">
                <div className="flex items-center gap-2 text-red-500">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span className="text-xs font-semibold">Incorrect</span>
                </div>
                <span className="text-lg font-bold text-red-500">{incorrectCount}</span>
              </div>
              <div className="flex h-10 flex-1 min-w-[120px] items-center justify-between rounded-lg border border-zinc-700 bg-zinc-800/50 px-3">
                <span className="text-xs font-medium text-zinc-400">Unattempted</span>
                <span className="text-lg font-bold text-zinc-400">{unattemptedCount}</span>
              </div>
            </div>
          </div>

          {/* Summary Section */}
          <div className="flex flex-1 flex-col min-h-0">
            <h3 className="mb-2 text-sm font-bold text-white">Summary</h3>
            <div className="flex flex-1 min-h-0 flex-col md:flex-row gap-4">
              
              {/* Left Column (Question Area) */}
              <div className="flex flex-1 flex-col rounded-xl border border-zinc-800 bg-transparent p-4">
                <h4 className="mb-3 text-sm font-bold text-white">Question {currentQuestionIndex + 1}</h4>
                
                <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                  <p className="text-base font-semibold leading-relaxed text-white">
                    {currentQuestion.questionText}
                  </p>

                  <div className="mt-6 space-y-3">
                    {currentQuestion.options.map((option) => {
                      const isCorrectOption = option.id === currentQuestion.correctOptionId;
                      const isSelectedOption = selectedOptionId === option.id;
                      const isIncorrectSelected = isSelectedOption && !isCorrectOption;

                      let containerClass = "border-zinc-700 bg-transparent";
                      let iconArea = <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border border-zinc-500" />;
                      
                      if (isCorrectOption) {
                        containerClass = "border-green-600 bg-green-900/20";
                        iconArea = (
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-600 text-white">
                            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                          </span>
                        );
                      } else if (isIncorrectSelected) {
                        containerClass = "border-red-600 bg-red-900/20";
                        iconArea = (
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-600 text-white">
                            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                          </span>
                        );
                      }

                      return (
                        <div
                          key={option.id}
                          className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3.5 text-left transition-colors duration-200 ${containerClass}`}
                        >
                          {iconArea}
                          <span className="text-sm font-medium text-zinc-300">{option.text}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      if (!isLastQuestion) {
                        onNextQuestion();
                      }
                    }}
                    disabled={isLastQuestion}
                    className="flex items-center gap-2 rounded-full border border-zinc-700 px-5 py-2 text-xs font-medium text-zinc-400 transition-colors duration-200 hover:bg-zinc-800 hover:text-zinc-200 disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    Next question <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              </div>

              {/* Right Column (Question Palette) */}
              <div className="flex w-full flex-col rounded-xl border border-zinc-800 bg-transparent p-4 md:w-52 shrink-0">
                <p className="mb-4 text-xs font-medium text-zinc-400">Question palette</p>
                <div className="grid grid-cols-4 gap-2">
                  {questions.map((q, idx) => {
                    const isCurrent = currentQuestionIndex === idx;
                    const bgClass = "bg-zinc-800 text-zinc-300";
                    const borderClass = isCurrent ? "border border-[#f97316]" : "border border-transparent";

                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => onJumpToQuestion?.(idx)}
                        className={`flex h-9 w-9 items-center justify-center rounded-md text-xs font-medium transition-colors ${bgClass} ${borderClass} hover:opacity-80`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex shrink-0 items-center justify-end border-t border-zinc-800 bg-transparent px-3 py-1.5">
          <div className="flex items-center gap-3">
            <button
              onClick={onGlobalPrevious}
              className="rounded p-1.5 transition hover:bg-zinc-800"
            >
              <svg className="h-4 w-4 text-zinc-400 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="h-3 border-l border-zinc-700" />
            <button
              onClick={onGlobalNext}
              className="rounded p-1.5 transition hover:bg-zinc-800"
            >
              <svg className="h-4 w-4 text-zinc-400 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  if (!currentQuestion) {
    return (
      <div className="flex h-full w-full min-h-[420px] items-center justify-center rounded-2xl border border-zinc-800 bg-[#121212]">
        <p className="text-sm text-zinc-400">No quiz questions available.</p>
      </div>
    );
  }

  const selectedOptionId = selectedAnswers[currentQuestion.id] ?? "";
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const totalQ = questions.length;
  const attemptedCount = Object.keys(selectedAnswers).length;
  const visitedCount = visitedQuestions.size;
  const unattemptedCount = visitedCount - attemptedCount;
  const unvisitedCount = totalQ - visitedCount;

  return (
    <>
      <div className="flex h-full w-full min-h-[420px] flex-col rounded-2xl border border-zinc-800 bg-[#121212] overflow-hidden">
        <div className="flex items-center justify-between border-b border-zinc-800 bg-transparent px-6 py-4">
          <p className="text-sm font-semibold text-white">Quiz {chapterTitle || quiz.title}</p>
        </div>

        <div className="flex flex-1 min-h-0 flex-col md:flex-row gap-6 p-6">
          <div className="flex flex-1 flex-col rounded-xl border border-zinc-800 bg-transparent p-6">
            <h3 className="mb-6 text-sm font-bold text-white">
              Question {currentQuestionIndex + 1}
            </h3>
            
            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
              <p className="text-base font-semibold leading-relaxed text-white">
                {currentQuestion.questionText}
              </p>

              <div className="mt-6 space-y-3">
                {currentQuestion.options.map((option) => {
                  const isSelected = selectedOptionId === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => onSelectAnswer(currentQuestion.id, option.id)}
                      className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3.5 text-left transition-colors duration-200 ${
                        isSelected
                          ? "border-[#f97316] bg-transparent"
                          : "border-zinc-700 bg-transparent hover:border-zinc-500"
                      }`}
                    >
                      <span
                        className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border ${
                          isSelected
                            ? "border-[#f97316]"
                            : "border-zinc-500"
                        }`}
                      >
                        {isSelected && <span className="h-2.5 w-2.5 rounded-full bg-[#f97316]" />}
                      </span>
                      <span className="text-sm font-medium text-zinc-300">{option.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  if (isLastQuestion) {
                    setShowConfirmModal(true);
                  } else {
                    onNextQuestion();
                  }
                }}
                disabled={!selectedOptionId && !isLastQuestion}
                className="rounded-lg bg-[#1a3a2a] px-5 py-2.5 text-sm font-medium text-green-500 transition-colors duration-200 hover:bg-[#1a4a2a] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Save and Next
              </button>
            </div>
          </div>

          <div className="flex w-full flex-col rounded-xl border border-zinc-800 bg-transparent p-5 md:w-80 shrink-0">
            <h3 className="mb-4 text-xs font-bold text-white">Overview</h3>
            <p className="mb-3 text-xs text-zinc-500">Answer Summary</p>
            
            <div className="mb-6 grid grid-cols-3 gap-2 text-center">
              <div className="flex flex-col items-center gap-1">
                <span className="flex h-7 w-12 items-center justify-center rounded bg-green-500/10 text-xs font-semibold text-green-500">{attemptedCount}</span>
                <span className="text-[10px] text-zinc-500">Attempted</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="flex h-7 w-12 items-center justify-center rounded bg-red-500/10 text-xs font-semibold text-red-500">{unattemptedCount}</span>
                <span className="text-[10px] text-zinc-500">Unattempted</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="flex h-7 w-12 items-center justify-center rounded bg-zinc-800 text-xs font-semibold text-zinc-300">{unvisitedCount}</span>
                <span className="text-[10px] text-zinc-500">Unvisited</span>
              </div>
            </div>

            <p className="mb-3 text-xs text-zinc-500">Question Palette</p>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const isCurrent = currentQuestionIndex === idx;
                const isAttempted = !!selectedAnswers[q.id];
                const isVisited = visitedQuestions.has(idx);

                let bgClass = "bg-zinc-800 text-zinc-400";
                if (isAttempted) bgClass = "bg-green-500/10 text-green-500";
                else if (isVisited) bgClass = "bg-red-500/10 text-red-500";

                const borderClass = isCurrent ? "border border-[#f97316]" : "border border-transparent";

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => onJumpToQuestion?.(idx)}
                    className={`flex h-8 w-8 items-center justify-center rounded-md text-xs font-medium transition-colors ${bgClass} ${borderClass} hover:opacity-80`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="mt-auto pt-6">
              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                className="w-full rounded-lg bg-[#3a1d0f] py-2.5 text-xs font-semibold text-[#f97316] transition-colors hover:bg-[#4a2412]"
              >
                Submit Test
              </button>
            </div>
          </div>
        </div>
      </div>

      {showConfirmModal && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-[400px] rounded-xl border border-zinc-800 bg-[#121212] shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-5">
              <h3 className="text-base font-bold text-white">Confirm submission?</h3>
              <button onClick={() => setShowConfirmModal(false)} className="text-zinc-400 hover:text-white transition-colors">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="px-6 py-8 text-center">
              <p className="text-sm text-zinc-400">
                {attemptedCount} Attempted <span className="mx-2 text-zinc-700">|</span> {unattemptedCount} Unattempted <span className="mx-2 text-zinc-700">|</span> {unvisitedCount} Unvisited
              </p>
              <div className="mt-10 flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="rounded-lg border border-zinc-700 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
                >
                  Nah! Not now
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowConfirmModal(false);
                    onSubmitQuiz();
                  }}
                  className="rounded-lg bg-[#4a2412] px-6 py-2.5 text-sm font-semibold text-[#f97316] transition-colors hover:bg-[#5a2c16]"
                >
                  Yes, Submit
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
