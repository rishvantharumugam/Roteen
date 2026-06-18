"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { type Chapter, type QuestionMode } from "@/features/video/services/video";
import {
  fetchSubjectPanelData,
  getSubjectPanelCacheKey,
  readSubjectPanelCache,
  type VideoSubjectFilter,
} from "@/features/video/services/videoSubjectService";
import SubjectModeToggle from "@/features/video/components/SubjectModeToggle";
import SubjectChapterRow from "@/features/video/components/SubjectChapterRow";
import SubjectQuestionRow from "@/features/video/components/SubjectQuestionRow";
import MarkFilterDropdown from "@/features/video/components/MarkFilterDropdown";
import { Skeleton } from "@/components/ui/Skeleton";
import SubjectQuizSection from "@/features/video/components/SubjectQuizSection";

interface SubjectBarProps {
  subjectFilter?: VideoSubjectFilter;
  playlistQuestionIds?: string[] | null;
  isSubjectFiltered?: boolean;
  isPlaylistMode?: boolean;
  activeChapterId: string;
  selectedQuestionId: string | null;
  selectedQuizId: string | null;
  completedQuestions: string[];
  onChapterSelect: (chapterId: string) => void;
  onQuestionSelect: (questionId: string) => void;
  onQuizSelect: (quizId: string) => void;
  onQuestionsLoaded?: (questions: { chapterId: string; questionId: string; questionTitle: string }[]) => void;
  onSubjectResolved?: (subject: { id: string; name: string; standard: string | null }) => void;
  mode: QuestionMode;
  onModeChange: (mode: QuestionMode) => void;
  onCollapse?: () => void;
}

function formatSubjectName(value: string) {
  if (!value) return "";
  return value
    .replace(/[_-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export default function SubjectBar(props: SubjectBarProps) {
  const {
    subjectFilter,
    playlistQuestionIds = null,
    isPlaylistMode = false,
    activeChapterId,
    selectedQuestionId,
    selectedQuizId,
    completedQuestions,
    onChapterSelect,
    onQuestionSelect,
    onQuizSelect,
    onQuestionsLoaded,
    onSubjectResolved,
    mode,
    onModeChange,
    onCollapse,
  } = props;

  const markOptions = ["All", "2M", "3M", "5M", "7M", "10M"];
  const cacheKey = getSubjectPanelCacheKey(subjectFilter ?? {});
  const persistKey = `roteen_subjectbar_state_${cacheKey}`;

  const [rawData, setRawData] = useState<ReturnType<typeof readSubjectPanelCache>>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openChapterId, setOpenChapterId] = useState<string | null>(activeChapterId);

  const [selectedMark, setSelectedMark] = useState<string>("All");
  const [selectedLevel, setSelectedLevel] = useState<string>("All");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(persistKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.selectedMark === "string") setSelectedMark(parsed.selectedMark);
        if (typeof parsed.selectedLevel === "string") setSelectedLevel(parsed.selectedLevel);
      }
    } catch { }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persistKey]);

  const normalizeMode = (value: unknown): string => {
    const normalized = String(value ?? "").trim().toLowerCase();
    if (!normalized) return "";
    if (normalized.includes("interior")) return "interior";
    if (normalized.includes("bookback")) return "bookback";
    return normalized;
  };

  const normalizeStandard = (value: unknown): string => {
    const normalized = String(value ?? "").trim().toLowerCase();
    if (!normalized) return "";

    const numericMatch = normalized.match(/\d+/);
    if (numericMatch) {
      return numericMatch[0];
    }

    return normalized;
  };

  useEffect(() => {
    const cached = readSubjectPanelCache(cacheKey);
    if (cached) {
      setRawData(cached);
      setLoading(false);
      onSubjectResolved?.({ id: cached.subjectId, name: cached.subject, standard: cached.standard });
    } else {
      setRawData(null);
      setLoading(true);
    }
  }, [cacheKey, onSubjectResolved]);

  // Persist mode + mark + level whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(persistKey, JSON.stringify({ selectedMark, selectedLevel }));
    } catch { }
  }, [selectedMark, selectedLevel, persistKey]);

  useEffect(() => {
    let mounted = true;

    const loadSubjectData = async () => {
      const cached = readSubjectPanelCache(cacheKey);
      if (cached) {
        setRawData(cached);
        setLoading(false);
        onSubjectResolved?.({ id: cached.subjectId, name: cached.subject, standard: cached.standard });
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const data = await fetchSubjectPanelData(subjectFilter ?? {}, { forceRefresh: !cached });
        if (!mounted) {
          return;
        }

        setRawData(data);
        onSubjectResolved?.({ id: data.subjectId, name: data.subject, standard: data.standard });
      } catch (err: unknown) {
        if (!mounted) {
          return;
        }

        if (!readSubjectPanelCache(cacheKey)) {
          let errorMsg = "Unable to load data.";
          if (err instanceof Error) {
            errorMsg = err.message;
          } else if (err && typeof err === "object" && "message" in err) {
            errorMsg = (err as any).message;
          } else {
            errorMsg = JSON.stringify(err);
          }
          setError(errorMsg);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void loadSubjectData();

    return () => {
      mounted = false;
    };
  }, [cacheKey, subjectFilter, onSubjectResolved]);

  useEffect(() => {
    setOpenChapterId(null);
  }, [cacheKey]);

  const panelData = useMemo(() => {
    if (!rawData) {
      return { subjectId: "", subject: "Math", totalQuestions: 0, chapters: [] as Chapter[] };
    }

    const chaptersMap = new Map<string, Chapter>();

    rawData.chapters.forEach((row, index) => {
      const chapterNo = row.chapter_no || index + 1;
      chaptersMap.set(String(row.id), {
        id: String(row.id),
        label: `CHAPTER ${chapterNo}`,
        title: String(row.name || ""),
        completion: 0,
        topics: [],
      });
    });

    const requestedMode = mode.toLowerCase();
    const requestedMark = selectedMark.toLowerCase();
    const subjectStandard = normalizeStandard(rawData.standard ?? subjectFilter?.standard ?? "10");

    const standardAlias = new Set([subjectStandard]);
    if (subjectStandard === "10") {
      standardAlias.add("10th");
    } else if (subjectStandard === "10th") {
      standardAlias.add("10");
    }

    const questions = rawData.questions.filter((row) => {
      if (playlistQuestionIds && playlistQuestionIds.length > 0) {
        const rowId = String(row.id ?? "").trim();
        if (!playlistQuestionIds.includes(rowId)) {
          return false;
        }
      }

      const rowStandardRaw = String(row.standard ?? "").trim().toLowerCase();
      const rowStandard = normalizeStandard(row.standard);
      if (rowStandard && !standardAlias.has(rowStandard)) {
        if (!(subjectStandard === "10" && rowStandardRaw.includes("10th"))) {
          return false;
        }
      }

      // In playlist mode, we show all playlist questions regardless of mode/mark toggles.
      if (!playlistQuestionIds || playlistQuestionIds.length === 0) {
        const rowMode = normalizeMode(row.mode);
        // If mode is missing in DB row, keep it visible instead of dropping it.
        if (rowMode && rowMode !== requestedMode) {
          return false;
        }

        if (selectedMark !== "All") {
          const rawMark = (row as any).question_marks ?? (row as any).questions_marks ?? (row as any).mark ?? (row as any).marks ?? (row as any).questions_sections ?? "";
          let rowMark = String(rawMark).trim().toLowerCase();
          rowMark = rowMark.replace(/\s+/g, "");
          if (/^\d+$/.test(rowMark)) {
            rowMark += "m";
          }
          if (rowMark !== requestedMark) {
            return false;
          }
        }

        if (selectedLevel !== "All") {
          const rowLevel = String((row as any).level ?? "").trim();
          if (rowLevel !== selectedLevel) {
            return false;
          }
        }
      }

      return true;
    });

    let syntheticChapterCount = chaptersMap.size;

    questions.forEach((row) => {
      const rawChapterId = row.chapter_id;
      const chapterId = String(rawChapterId ?? "").trim();
      let chapter = chapterId ? chaptersMap.get(chapterId) : undefined;

      // If chapter rows are missing or mismatched, synthesize a fallback chapter
      // so valid questions are still visible/selectable in the UI.
      if (!chapter) {
        const fallbackId = chapterId || `unassigned-${String(row.id)}`;
        chapter = chaptersMap.get(fallbackId);

        if (!chapter) {
          syntheticChapterCount += 1;
          chapter = {
            id: fallbackId,
            label: `CHAPTER ${syntheticChapterCount}`,
            title: "Unassigned Chapter",
            completion: 0,
            topics: [],
          };
          chaptersMap.set(fallbackId, chapter);
        }
      }

      chapter.topics.push({
        id: String(row.id),
        title: String(row.question_name),
        mark: String((row as any).question_marks ?? (row as any).questions_marks ?? (row as any).mark ?? (row as any).marks ?? (row as any).questions_sections ?? ""),
      });
    });

    const chaptersWithQuestions = Array.from(chaptersMap.values()).filter(
      (chapter) => chapter.topics.length > 0,
    );

    return {
      subjectId: rawData.subjectId,
      subject: rawData.subject,
      totalQuestions: questions.length,
      chapters: chaptersWithQuestions,
    };
  }, [playlistQuestionIds, rawData, mode, selectedMark, selectedLevel, subjectFilter?.standard]);

  useEffect(() => {
    if (panelData.chapters.length > 0) {
      setOpenChapterId((previous) => {
        if (!previous) {
          return null;
        }
        return panelData.chapters.some((chapter) => chapter.id === previous) ? previous : null;
      });
      return;
    }
    setOpenChapterId(null);
  }, [panelData.chapters]);

  const completedSet = useMemo(() => new Set(completedQuestions), [completedQuestions]);

  const questionOrderMap = useMemo(() => {
    let sequence = 1;
    const map = new Map<string, number>();
    panelData.chapters.forEach((chapter) => {
      chapter.topics.forEach((topic) => {
        map.set(topic.id, sequence);
        sequence += 1;
      });
    });
    return map;
  }, [panelData.chapters]);

  useEffect(() => {
    if (onQuestionsLoaded) {
      const flatQuestions = panelData.chapters.flatMap((chapter) =>
        chapter.topics.map((topic) => ({
          chapterId: chapter.id,
          questionId: topic.id,
          questionTitle: topic.title,
        })),
      );
      onQuestionsLoaded(flatQuestions);
    }
  }, [panelData.chapters, onQuestionsLoaded]);

  useEffect(() => {
    if (activeChapterId) {
      setOpenChapterId(activeChapterId);
    }
  }, [activeChapterId]);

  const chapterCounter = useMemo(() => {
    const total = panelData.totalQuestions;
    if (total === 0) {
      return "0/0";
    }

    if (selectedQuestionId !== null) {
      const activePosition = questionOrderMap.get(selectedQuestionId);
      if (activePosition) {
        return `${activePosition}/${total}`;
      }
    }

    return `${Math.min(completedSet.size, total)}/${total}`;
  }, [completedSet.size, panelData.totalQuestions, questionOrderMap, selectedQuestionId]);

  const handleChapterPress = useCallback((chapterId: string) => {
    const nextOpenChapterId = openChapterId === chapterId ? null : chapterId;
    setOpenChapterId(nextOpenChapterId);
    if (nextOpenChapterId) {
      onChapterSelect(nextOpenChapterId);
    }
  }, [openChapterId, onChapterSelect]);

  const handleQuestionPress = useCallback((questionId: string) => {
    onQuestionSelect(questionId);
  }, [onQuestionSelect]);

  const isLongSubject = useMemo(() => {
    return formatSubjectName(panelData.subject).length > 10;
  }, [panelData.subject]);

  return (
    <aside className={`animate-fade-in-left flex h-full w-full min-w-0 shrink flex-col rounded-2xl border border-zinc-800/80 bg-[#121212] ${isLongSubject ? "p-4 lg:px-3 lg:py-4" : "p-4"} shadow-[0_0_20px_rgba(0,0,0,0.5)]`}>
      {!isPlaylistMode && <SubjectModeToggle mode={mode} onChange={onModeChange} />}

      <motion.div className={`flex flex-nowrap items-center justify-between border-b border-zinc-800 pb-3 ${isLongSubject ? "gap-2" : "gap-3"}`}>
        {!isPlaylistMode && (
          <>
            <h2 className={`font-semibold text-white flex items-center gap-1.5 shrink-0 whitespace-nowrap ${isLongSubject ? "text-sm" : "text-base"}`}>
              <span title={formatSubjectName(panelData.subject)}>
                {formatSubjectName(panelData.subject)}
              </span>
              <span className="text-xs font-normal text-zinc-400 shrink-0">{chapterCounter}</span>
            </h2>
            <div className={`flex items-center shrink-0 ml-auto flex-nowrap ${isLongSubject ? "gap-1.5" : "gap-2"}`}>
              <MarkFilterDropdown
                options={markOptions}
                selected={selectedMark}
                onChange={setSelectedMark}
                placeholder="Marks"
              />
              <MarkFilterDropdown
                options={["All", "1", "2", "3", "4", "5"]}
                selected={selectedLevel}
                onChange={setSelectedLevel}
                placeholder="Level"
              />
              {onCollapse && (
                <button
                  type="button"
                  onClick={onCollapse}
                  className="hidden lg:flex items-center justify-center p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                  title="Minimize Subject Panel"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              )}
            </div>
          </>
        )}
      </motion.div>

      <motion.div className="mt-3 max-h-full lg:max-h-[calc(100vh-150px)] min-h-0 flex-1 overflow-y-auto overflow-x-hidden pr-1 custom-scrollbar">
        {loading ? (
          <div className="flex flex-col gap-3 overflow-hidden px-2 pt-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : error ? (
          <p className="text-sm text-zinc-500">{error}</p>
        ) : panelData.chapters.length === 0 ? (
          <p className="text-sm text-zinc-500">No chapters available</p>
        ) : (
          panelData.chapters.map((chapter) => {
            const isOpen = chapter.id === openChapterId;
            const isChapterCompleted =
              chapter.topics.length > 0 &&
              chapter.topics.every((topic) => completedSet.has(topic.id));
            return (
              <motion.div key={chapter.id}>
                <SubjectChapterRow
                  chapter={chapter}
                  active={activeChapterId === chapter.id}
                  isOpen={isOpen}
                  onClick={handleChapterPress}
                  completed={isChapterCompleted}
                />
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <motion.div className="mt-2 ml-8 flex flex-col gap-2 pb-3 pr-1">
                        {chapter.topics.length === 0 ? (
                          <p className="text-xs text-zinc-500">No questions available</p>
                        ) : (
                          chapter.topics.map((topic) => {
                            const isActiveQuestion = selectedQuestionId === topic.id;
                            return (
                              <motion.div key={topic.id} className="group/question relative pl-4">
                                <span
                                  aria-hidden="true"
                                  className={`pointer-events-none absolute left-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-bl-md border-b border-l transition-colors duration-200 ease-in-out ${isActiveQuestion
                                    ? "border-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.4)]"
                                    : "border-zinc-700"
                                    }`}
                                />
                                <SubjectQuestionRow
                                  topicId={topic.id}
                                  title={topic.title}
                                  active={isActiveQuestion}
                                  completed={completedSet.has(topic.id)}
                                  onClick={handleQuestionPress}
                                />
                              </motion.div>
                            );
                          })
                        )}
                        {panelData.subjectId && chapter.id && (
                          <SubjectQuizSection
                            subjectId={panelData.subjectId}
                            chapterId={chapter.id}
                            activeQuizId={selectedQuizId}
                            mode={mode}
                            onQuizSelect={onQuizSelect}
                          />
                        )}
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </motion.div>
    </aside>
  );
}
