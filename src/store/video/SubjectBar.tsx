"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type Chapter, type QuestionMode } from "@/service/video";
import {
  fetchSubjectPanelData,
  getSubjectPanelCacheKey,
  readSubjectPanelCache,
  type VideoSubjectFilter,
} from "@/service/videoSubjectService";
import SubjectModeToggle from "@/store/video/SubjectModeToggle";
import SubjectChapterRow from "@/store/video/SubjectChapterRow";
import SubjectQuestionRow from "@/store/video/SubjectQuestionRow";
import MarkFilterDropdown from "@/store/video/MarkFilterDropdown";
import { videoStyles } from "@/styles/video";

interface SubjectBarProps {
  subjectFilter?: VideoSubjectFilter;
  playlistQuestionIds?: string[] | null;
  isSubjectFiltered?: boolean;
  isPlaylistMode?: boolean;
  activeChapterId: string;
  selectedQuestionId: string | null;
  completedQuestions: string[];
  onChapterSelect: (chapterId: string) => void;
  onQuestionSelect: (questionId: string) => void;
  onQuestionsLoaded?: (questions: { chapterId: string; questionId: string; questionTitle: string }[]) => void;
  onSubjectResolved?: (subject: { id: string; name: string; standard: string | null }) => void;
}

export default function SubjectBar(props: SubjectBarProps) {
  const {
    subjectFilter,
    playlistQuestionIds = null,
    isPlaylistMode = false,
    activeChapterId,
    selectedQuestionId,
    completedQuestions,
    onChapterSelect,
    onQuestionSelect,
    onQuestionsLoaded,
    onSubjectResolved,
  } = props;

  const [mode, setMode] = useState<QuestionMode>("Bookback");
  const [rawData, setRawData] = useState<ReturnType<typeof readSubjectPanelCache>>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openChapterId, setOpenChapterId] = useState<string | null>(activeChapterId);
  const [selectedMark, setSelectedMark] = useState<string>("All");

  const markOptions = ["All", "2M", "3M", "5M", "7M", "10M"];
  const cacheKey = getSubjectPanelCacheKey(subjectFilter ?? {});

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

  useEffect(() => {
    let mounted = true;

    const loadSubjectData = async () => {
      const hasCache = Boolean(readSubjectPanelCache(cacheKey));
      if (!hasCache) {
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
          setError(err instanceof Error ? err.message : "Unable to load data.");
        }
      } finally {
        if (mounted && !readSubjectPanelCache(cacheKey)) {
          setLoading(false);
        } else if (mounted) {
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
      return { subject: "Math", totalQuestions: 0, chapters: [] as Chapter[] };
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
          const rowMark = String(row.question_marks ?? row.questions_marks ?? "").trim().toLowerCase();
          if (rowMark !== requestedMark) {
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
        mark: String(row.question_marks ?? row.questions_marks ?? ""),
      });
    });

    const chaptersWithQuestions = Array.from(chaptersMap.values()).filter(
      (chapter) => chapter.topics.length > 0,
    );

    return {
      subject: rawData.subject,
      totalQuestions: questions.length,
      chapters: chaptersWithQuestions,
    };
  }, [playlistQuestionIds, rawData, mode, selectedMark, subjectFilter?.standard]);

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

  const handleChapterPress = (chapterId: string) => {
    const nextOpenChapterId = openChapterId === chapterId ? null : chapterId;
    setOpenChapterId(nextOpenChapterId);
    if (nextOpenChapterId) {
      onChapterSelect(nextOpenChapterId);
    }
  };

  const handleQuestionPress = (questionId: string) => {
    onQuestionSelect(questionId);
  };

  return (
    <aside className={videoStyles.style_715a8ed41f266}>
      {!isPlaylistMode && <SubjectModeToggle mode={mode} onChange={setMode} />}

      <motion.div className={videoStyles.style_51da20a792f93}>
        {!isPlaylistMode && (
          <>
            <h2 className={videoStyles.style_edfe6c65ccbc0}>
              {panelData.subject}
              <span className={videoStyles.style_127fb746f0794e}>{chapterCounter}</span>
            </h2>
            <MarkFilterDropdown
              options={markOptions}
              selected={selectedMark}
              onChange={setSelectedMark}
            />
          </>
        )}
      </motion.div>

      <motion.div className={videoStyles.style_14301a35f9bb99}>
        {loading ? (
          <div className="space-y-3 px-1 py-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <motion.div
                key={index}
                className="h-10 animate-pulse rounded-lg bg-white/5"
              />
            ))}
          </div>
        ) : error ? (
          <p className={videoStyles.style_cbd02a5466655}>{error}</p>
        ) : panelData.chapters.length === 0 ? (
          <p className={videoStyles.style_cbd02a5466655}>No chapters available</p>
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
                      <motion.div className={videoStyles.style_f50e73581e486}>
                        {chapter.topics.length === 0 ? (
                          <p className={videoStyles.style_1266d476879826}>No questions available</p>
                        ) : (
                          chapter.topics.map((topic) => {
                            const isActiveQuestion = selectedQuestionId === topic.id;
                            return (
                              <motion.div key={topic.id} className={videoStyles.style_1963bf9c16a942}>
                                <span
                                  aria-hidden="true"
                                  className={`pointer-events-none absolute left-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-bl-md border-b border-l transition-colors duration-200 ease-in-out ${
                                    isActiveQuestion
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
