"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type Chapter, type Topic, type QuestionMode } from "@/features/video/services/video";
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
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/lib/supabase/client";

export interface GroupedCategory {
  name: string;
  topics: Topic[];
}

export interface GroupedChapter extends Chapter {
  categories: GroupedCategory[];
}

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

interface ExtendedTopic extends Topic {
  dbCategory?: string;
}

function parseMathExercise(title: string, dbCategory: string) {
  if (title.includes("_")) {
    const parts = title.split("_");
    const beforeStr = parts[0].trim(); // e.g. "Exercise-1.1"
    const afterStr = parts[1].trim();  // e.g. "Q1"
    
    const exMatch = beforeStr.match(/(\d+(?:\.\d+)?)/);
    const exerciseNumber = exMatch ? exMatch[1] : "1.1";
    
    const qMatch = afterStr.match(/(\d+)/);
    const questionNumber = qMatch ? parseInt(qMatch[1], 10) : 0;
    
    return {
      exerciseNumber,
      questionNumber,
      displayName: afterStr.startsWith("Q") ? afterStr : `Q${afterStr}`,
    };
  }

  const pattern = /^(?:Exercise|Example)[- ]?(\d+(?:\.\d+)?)(?:_Q(\d+))?$/i;
  let match = title.match(pattern);
  if (!match && dbCategory) {
    match = dbCategory.match(pattern);
  }
  
  if (match) {
    return {
      exerciseNumber: match[1],
      questionNumber: match[2] ? parseInt(match[2], 10) : 0,
      displayName: match[2] ? `Q${match[2]}` : title,
    };
  }

  const qMatch = title.match(/Q?(\d+)$/i);
  const exMatch = title.match(/(?:Exercise|Example)[- ]?(\d+(?:\.\d+)?)/i) || dbCategory.match(/(?:Exercise|Example)[- ]?(\d+(?:\.\d+)?)/i);
  
  if (exMatch) {
    return {
      exerciseNumber: exMatch[1],
      questionNumber: qMatch ? parseInt(qMatch[1], 10) : 0,
      displayName: qMatch ? `Q${qMatch[1]}` : title,
    };
  }

  return null;
}

function compareExerciseNumbers(aStr: string, bStr: string): number {
  const aParts = aStr.split(".").map((num) => parseInt(num, 10) || 0);
  const bParts = bStr.split(".").map((num) => parseInt(num, 10) || 0);

  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    const aPart = aParts[i] ?? 0;
    const bPart = bParts[i] ?? 0;
    if (aPart !== bPart) {
      return aPart - bPart;
    }
  }
  return 0;
}

function sortMathExerciseTopics(topics: ExtendedTopic[]) {
  return [...topics].sort((a, b) => {
    const aParsed = parseMathExercise(a.title, a.dbCategory || "");
    const bParsed = parseMathExercise(b.title, b.dbCategory || "");

    if (aParsed && bParsed) {
      const exComp = compareExerciseNumbers(aParsed.exerciseNumber, bParsed.exerciseNumber);
      if (exComp !== 0) {
        return exComp;
      }
      return aParsed.questionNumber - bParsed.questionNumber;
    }

    if (aParsed) return -1;
    if (bParsed) return 1;

    return a.id.localeCompare(b.id);
  });
}

interface SubExerciseGroupProps {
  chapterId: string;
  name: string;
  topics: {
    id: string;
    title: string;
    mark?: string;
    qNum: number;
    displayName: string;
  }[];
  selectedQuestionId: string | null;
  completedSet: Set<string>;
  handleQuestionPress: (questionId: string) => void;
  isAnyQuestionActive: boolean;
}

function SubExerciseGroup({
  chapterId,
  name,
  topics,
  selectedQuestionId,
  completedSet,
  handleQuestionPress,
  isAnyQuestionActive,
}: SubExerciseGroupProps) {
  const [isOpen, setIsOpen] = useState(true);

  const isCompleted = topics.every((t) => completedSet.has(t.id));
  const hasActive = topics.some((t) => t.id === selectedQuestionId);

  useEffect(() => {
    if (hasActive) {
      setIsOpen(true);
    }
  }, [hasActive]);

  return (
    <div className="flex flex-col gap-1.5 relative pl-4 mt-1">
      {/* Connector branch line from Exercise to Sub-Exercise header */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute left-0 top-3.5 h-3.5 w-3.5 rounded-bl-md border-b border-l transition-all duration-300 ${hasActive
            ? "border-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.4)]"
            : "border-zinc-700/60"
          }`}
      />

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left pl-0 pr-1 py-1 text-xs font-semibold text-zinc-300 hover:text-white transition-colors group/sub-exercise"
      >
        <div className="flex items-center gap-1.5">
          <motion.div
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`transition-colors duration-300 ${hasActive
                ? "text-purple-400"
                : "text-zinc-500 group-hover/sub-exercise:text-zinc-300"
              }`}
          >
            <ChevronRight className="h-3 w-3" />
          </motion.div>
          <span
            className={`tracking-wide transition-all duration-300 ${hasActive
                ? "text-white font-bold drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]"
                : "text-zinc-300 group-hover/sub-exercise:text-white"
              }`}
          >
            {name}
          </span>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded transition-colors duration-300 shrink-0 ${hasActive
                ? "bg-purple-950/40 border border-purple-500/20 text-purple-300"
                : "bg-zinc-800/80 text-zinc-400 font-normal"
              }`}
          >
            {topics.length}
          </span>
        </div>

        {isCompleted ? (
          <div className="relative z-10 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-purple-500 text-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.4)] bg-purple-500/10 mr-1 transition-all duration-300">
            <svg
              className="h-2.5 w-2.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        ) : (
          <span className="h-4 w-4 shrink-0 mr-1" />
        )}
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div
              className={`relative ml-1.5 border-l pl-4 flex flex-col gap-1.5 pb-2 pt-1 transition-colors duration-300 ${hasActive ? "border-purple-500/40" : "border-zinc-800/80"
                }`}
            >
              {topics.map((topic) => {
                const isActiveQuestion = selectedQuestionId === topic.id;
                return (
                  <div key={topic.id} className="group/question relative pl-4">
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none absolute left-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-bl-md border-b border-l transition-colors duration-200 ease-in-out ${isActiveQuestion
                          ? "border-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.4)]"
                          : "border-zinc-700/60"
                        }`}
                    />
                    <SubjectQuestionRow
                      topicId={topic.id}
                      title={topic.displayName}
                      active={isActiveQuestion}
                      completed={completedSet.has(topic.id)}
                      onClick={handleQuestionPress}
                    />
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
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
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

  const { user } = useAuth();
  const [completedQuizzes, setCompletedQuizzes] = useState<string[]>([]);

  useEffect(() => {
    if (!user?.id) {
      setCompletedQuizzes([]);
      return;
    }

    let mounted = true;
    const loadCompletedQuizzes = async () => {
      try {
        const { data, error } = await supabase
          .from("user_quiz_progress")
          .select("quizzes_id")
          .eq("users_id", user.id)
          .eq("iscompleted", "Resolved");

        if (error) throw error;

        if (mounted && data) {
          const ids = data.map((row: any) => String(row.quizzes_id));
          setCompletedQuizzes(ids);
        }
      } catch (err) {
        console.error("Failed to load completed quizzes:", err);
      }
    };

    void loadCompletedQuizzes();

    return () => {
      mounted = false;
    };
  }, [user?.id, rawData?.subjectId]);

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

  // Automatically open chapter and category when active question changes
  useEffect(() => {
    if (selectedQuestionId && rawData) {
      const question = rawData.questions.find((q) => String(q.id) === String(selectedQuestionId));
      if (question) {
        if (question.chapter_id) {
          setOpenChapterId(String(question.chapter_id));
        }
        const categoryName = question.category ? String(question.category).trim() : "Other";
        const categoryKey = `${question.chapter_id}:${categoryName}`;
        setOpenCategories((prev) => {
          if (prev[categoryKey]) return prev;
          return {
            ...prev,
            [categoryKey]: true,
          };
        });
      }
    }
  }, [selectedQuestionId, rawData]);

  const normalizeMode = (value: unknown): string => {
    const normalized = String(value ?? "").trim().toLowerCase();
    if (!normalized) return "";
    if (normalized.includes("interior")) return "interior";
    if (normalized.includes("bookback") || normalized.includes("book-back")) return "book-back";
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
        const data = await fetchSubjectPanelData(subjectFilter ?? {}, { forceRefresh: true });
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
      return { subjectId: "", subject: "Mathematics", totalQuestions: 0, chapters: [] as GroupedChapter[] };
    }

    const chaptersMap = new Map<string, GroupedChapter>();

    rawData.chapters.forEach((row, index) => {
      const chapterNo = row.chapter_no || index + 1;
      chaptersMap.set(String(row.id), {
        id: String(row.id),
        label: `CHAPTER ${chapterNo}`,
        title: String(row.name || ""),
        completion: 0,
        topics: [],
        categories: [],
      });
    });

    const requestedMode = mode.toLowerCase();
    const requestedMark = selectedMark.toLowerCase();
    const subjectStandard = normalizeStandard(rawData.standard ?? subjectFilter?.standard ?? "");

    const standardAlias = new Set([subjectStandard]);
    if (subjectStandard === "10") {
      standardAlias.add("10th");
    } else if (subjectStandard === "10th") {
      standardAlias.add("10");
    } else if (subjectStandard === "12") {
      standardAlias.add("12th");
    } else if (subjectStandard === "12th") {
      standardAlias.add("12");
    }

    const questions = rawData.questions.filter((row) => {
      if (playlistQuestionIds && playlistQuestionIds.length > 0) {
        const rowId = String(row.id ?? "").trim();
        if (!playlistQuestionIds.includes(rowId)) {
          return false;
        }
      }

      const rowStandard = normalizeStandard(row.standard);
      if (subjectStandard && rowStandard && !standardAlias.has(rowStandard)) {
        return false;
      }

      if (!playlistQuestionIds || playlistQuestionIds.length === 0) {
        const rowMode = normalizeMode(row.mode);
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
    const chapterCategories = new Map<string, Map<string, ExtendedTopic[]>>();

    const isMath = rawData.subject.toLowerCase().includes("math");

    questions.forEach((row) => {
      const rawChapterId = row.chapter_id;
      const chapterId = String(rawChapterId ?? "").trim();
      let chapter = chapterId ? chaptersMap.get(chapterId) : undefined;

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
            categories: [],
          };
          chaptersMap.set(fallbackId, chapter);
        }
      }

      let categoryName = row.category ? String(row.category).trim() : "Other";
      if (isMath && /^exercise/i.test(categoryName)) {
        categoryName = "Exercise";
      }

      let catMap = chapterCategories.get(chapter.id);
      if (!catMap) {
        catMap = new Map<string, ExtendedTopic[]>();
        chapterCategories.set(chapter.id, catMap);
      }

      let categoryTopics = catMap.get(categoryName);
      if (!categoryTopics) {
        categoryTopics = [];
        catMap.set(categoryName, categoryTopics);
      }

      categoryTopics.push({
        id: String(row.id),
        title: String(row.question_name),
        mark: String((row as any).question_marks ?? (row as any).questions_marks ?? (row as any).mark ?? (row as any).marks ?? (row as any).questions_sections ?? ""),
        dbCategory: row.category ? String(row.category).trim() : "",
      });
    });

    const mainCategories = [
      "Short Answer",
      "Detail Answer",
      "Answer in Detail",
      "Brief Answer",
      "Answer Briefly",
      "Very Short Answer",
      "Detail",
      "Numerical Problem",
      "Hot Questions",
      "Exercise",
      "Example"
    ];

    const chaptersWithQuestions: GroupedChapter[] = [];

    chaptersMap.forEach((chapter) => {
      const catMap = chapterCategories.get(chapter.id);

      const categoriesList: GroupedCategory[] = [];
      const flatTopics: Topic[] = [];

      mainCategories.forEach((catName) => {
        const topics = catMap ? (catMap.get(catName) || []) : [];
        if (topics.length > 0) {
          const sortedTopics = (isMath && catName === "Exercise")
            ? sortMathExerciseTopics(topics)
            : [...topics].sort((a, b) => a.id.localeCompare(b.id));

          categoriesList.push({
            name: catName,
            topics: sortedTopics,
          });

          flatTopics.push(...sortedTopics);
        }
      });


      if (flatTopics.length === 0) {
        return;
      }

      chapter.topics = flatTopics;
      chapter.categories = categoriesList;
      chaptersWithQuestions.push(chapter);
    });

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

      <motion.div className="flex flex-col gap-2.5 border-b border-zinc-800 pb-3">
        {!isPlaylistMode ? (
          <div className="flex items-center justify-between gap-2 w-full">
            {/* Left: Title & Counter */}
            <div className="flex items-center gap-2 min-w-0">
              <h2 className={`font-semibold text-white flex items-center gap-1.5 shrink-0 whitespace-nowrap ${isLongSubject ? "text-sm" : "text-base"}`}>
                <span title={formatSubjectName(panelData.subject)} className="truncate max-w-[120px] sm:max-w-none">
                  {formatSubjectName(panelData.subject)}
                </span>
                <span className="text-xs font-normal text-zinc-400 shrink-0">{chapterCounter}</span>
              </h2>
            </div>

            {/* Right: Filters and Collapse */}
            <div className="flex items-center gap-1.5 shrink-0">
              <MarkFilterDropdown
                options={markOptions}
                selected={selectedMark}
                onChange={setSelectedMark}
                placeholder="Marks"
                widthClass="w-24"
                align="right"
              />
              <MarkFilterDropdown
                options={["All", "1", "2", "3", "4", "5"]}
                selected={selectedLevel}
                onChange={setSelectedLevel}
                placeholder="Level"
                widthClass="w-24"
                align="right"
              />
              {onCollapse && (
                <button
                  type="button"
                  onClick={onCollapse}
                  className="hidden lg:flex items-center justify-center p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors shrink-0"
                  title="Minimize Subject Panel"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full">
            <h2 className={`font-semibold text-white flex items-center gap-1.5 shrink-0 whitespace-nowrap ${isLongSubject ? "text-sm" : "text-base"}`}>
              <span>Playlist Mode</span>
            </h2>
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
        )}
      </motion.div>

      <motion.div className="mt-3 max-h-full lg:max-h-[calc(100vh-150px)] min-h-0 flex-1 overflow-y-auto overflow-x-hidden pr-1 no-scrollbar">
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
            const chapterQuizzes = rawData?.quizzes
              ? rawData.quizzes.filter(
                (q) =>
                  String(q.chapter_id) === String(chapter.id) &&
                  (!q.mode || q.mode.toLowerCase() === mode.toLowerCase()),
              )
              : [];

            const questionsCompleted =
              chapter.topics.length > 0 &&
              chapter.topics.every((topic) => completedSet.has(topic.id));

            const quizzesCompleted =
              chapterQuizzes.length === 0 ||
              chapterQuizzes.every((quiz) => completedQuizzes.includes(quiz.id));

            const isChapterCompleted = questionsCompleted && quizzesCompleted;

            const categories = chapter.categories || [];

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
                      <motion.div className="mt-2 ml-8 flex flex-col gap-3 pb-3 pr-1">
                        {categories.length === 0 ? (
                          <p className="text-xs text-zinc-500">No questions available</p>
                        ) : (
                          categories.map((category) => {
                            const categoryName = category.name;
                            const categoryKey = `${chapter.id}:${categoryName}`;
                            const isCategoryOpen = openCategories[categoryKey] !== false;

                            const toggleCategory = () => {
                              setOpenCategories((prev) => ({
                                ...prev,
                                [categoryKey]: prev[categoryKey] === false,
                              }));
                            };

                            const isCategoryCompleted = category.topics.every((topic) =>
                              completedSet.has(topic.id)
                            );

                            const isAnyQuestionActive = category.topics.some((topic) =>
                              topic.id === selectedQuestionId
                            );

                            return (
                              <div key={categoryName} className="flex flex-col gap-1.5 relative pl-4">
                                {/* Connector branch line from Chapter to Category header */}
                                <span
                                  aria-hidden="true"
                                  className={`pointer-events-none absolute left-0 top-3 h-3 w-3 rounded-bl-md border-b border-l transition-all duration-300 ${isAnyQuestionActive
                                    ? "border-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.4)]"
                                    : "border-zinc-700/60"
                                    }`}
                                />

                                {/* Category Header Button */}
                                <button
                                  type="button"
                                  onClick={toggleCategory}
                                  className="flex items-center justify-between w-full text-left pl-0 pr-1 py-1 text-xs font-semibold text-zinc-300 hover:text-white transition-colors group/category"
                                >
                                  <div className="flex items-center gap-1.5">
                                    <motion.div
                                      animate={{ rotate: isCategoryOpen ? 90 : 0 }}
                                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                      className={`transition-colors duration-300 ${isAnyQuestionActive
                                        ? "text-purple-400"
                                        : "text-zinc-500 group-hover/category:text-zinc-300"
                                        }`}
                                    >
                                      <ChevronRight className="h-3 w-3" />
                                    </motion.div>
                                    <span className={`tracking-wide transition-all duration-300 ${isAnyQuestionActive
                                      ? "text-white font-bold drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]"
                                      : "text-zinc-300 group-hover/category:text-white"
                                      }`}>
                                      {categoryName}
                                    </span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded transition-colors duration-300 shrink-0 ${isAnyQuestionActive
                                      ? "bg-purple-950/40 border border-purple-500/20 text-purple-300"
                                      : "bg-zinc-800/80 text-zinc-400 font-normal"
                                      }`}>
                                      {category.topics.length}
                                    </span>
                                  </div>

                                  {isCategoryCompleted ? (
                                    <div className="relative z-10 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-purple-500 text-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.4)] bg-purple-500/10 mr-1 transition-all duration-300">
                                      <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                      </svg>
                                    </div>
                                  ) : (
                                    <span className="h-4 w-4 shrink-0 mr-1" />
                                  )}
                                </button>

                                {/* Category Questions (Collapsible) */}
                                <AnimatePresence initial={false}>
                                  {isCategoryOpen && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.25, ease: "easeInOut" }}
                                      className="overflow-hidden"
                                    >
                                      {/* Container with a left vertical border representing the '│' line */}
                                      <div className={`relative ml-1.5 border-l pl-4 flex flex-col gap-1.5 pb-2 pt-1 transition-colors duration-300 ${isAnyQuestionActive
                                        ? "border-purple-500/40"
                                        : "border-zinc-800/80"
                                        }`}>
                                        {(() => {
                                          const isMath = rawData?.subject.toLowerCase().includes("math");
                                          const isExerciseCategory = isMath && categoryName === "Exercise";

                                          if (isExerciseCategory) {
                                            const groups = new Map<string, {
                                              name: string;
                                              exNum: string;
                                              topics: { id: string; title: string; mark?: string; qNum: number; displayName: string; }[];
                                            }>();

                                            category.topics.forEach((topic) => {
                                              const extTopic = topic as ExtendedTopic;
                                              const parsed = parseMathExercise(extTopic.title, extTopic.dbCategory || "");
                                              const exName = parsed ? `Exercise ${parsed.exerciseNumber}` : "Exercise 1.1";
                                              const exNum = parsed ? parsed.exerciseNumber : "1.1";
                                              const qNum = parsed ? parsed.questionNumber : 0;
                                              const displayName = parsed ? parsed.displayName : extTopic.title;

                                              let g = groups.get(exName);
                                              if (!g) {
                                                g = { name: exName, exNum, topics: [] };
                                                groups.set(exName, g);
                                              }
                                              g.topics.push({
                                                id: extTopic.id,
                                                title: extTopic.title,
                                                mark: extTopic.mark,
                                                qNum,
                                                displayName,
                                              });
                                            });

                                            const sortedGroups = Array.from(groups.values()).sort((a, b) => compareExerciseNumbers(a.exNum, b.exNum));

                                            sortedGroups.forEach((g) => {
                                              g.topics.sort((a, b) => a.qNum - b.qNum);
                                            });

                                            return sortedGroups.map((group) => {
                                              const hasActiveQuestion = group.topics.some((t) => t.id === selectedQuestionId);
                                              return (
                                                <SubExerciseGroup
                                                  key={group.name}
                                                  chapterId={chapter.id}
                                                  name={group.name}
                                                  topics={group.topics}
                                                  selectedQuestionId={selectedQuestionId}
                                                  completedSet={completedSet}
                                                  handleQuestionPress={handleQuestionPress}
                                                  isAnyQuestionActive={hasActiveQuestion}
                                                />
                                              );
                                            });
                                          }

                                          return category.topics.map((topic) => {
                                            const isActiveQuestion = selectedQuestionId === topic.id;
                                            return (
                                              <div key={topic.id} className="group/question relative pl-4">
                                                {/* L-connector line from the Category's vertical line to the Question */}
                                                <span
                                                  aria-hidden="true"
                                                  className={`pointer-events-none absolute left-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-bl-md border-b border-l transition-colors duration-200 ease-in-out ${isActiveQuestion
                                                    ? "border-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.4)]"
                                                    : "border-zinc-700/60"
                                                    }`}
                                                />
                                                <SubjectQuestionRow
                                                  topicId={topic.id}
                                                  title={topic.title}
                                                  active={isActiveQuestion}
                                                  completed={completedSet.has(topic.id)}
                                                  onClick={handleQuestionPress}
                                                />
                                              </div>
                                            );
                                          });
                                        })()}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
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
                            completedQuizzes={completedQuizzes}
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
