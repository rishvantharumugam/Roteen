"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import { type Chapter, type QuestionMode } from "@/service/video";
import SubjectModeToggle from "@/store/video/SubjectModeToggle";
import SubjectChapterRow from "@/store/video/SubjectChapterRow";
import SubjectQuestionRow from "@/store/video/SubjectQuestionRow";
import MarkFilterDropdown from "@/store/video/MarkFilterDropdown";
import { videoStyles } from "@/styles/video";

interface SubjectBarProps {
  activeChapterId: string;
  selectedQuestionId: string | null;
  completedQuestions: string[];
  onChapterSelect: (chapterId: string) => void;
  onQuestionSelect: (questionId: string) => void;
  onQuestionsLoaded?: (questions: { chapterId: string; questionId: string }[]) => void;
}

interface SubjectPanelState {
  subject: string;
  totalQuestions: number;
  chapters: Chapter[];
}

export default function SubjectBar(props: SubjectBarProps) {
  const {
    activeChapterId,
    selectedQuestionId,
    completedQuestions,
    onChapterSelect,
    onQuestionSelect,
    onQuestionsLoaded,
  } = props;

  const [mode, setMode] = useState<QuestionMode>("Bookback");

  const [rawData, setRawData] = useState<{
    subject: string;
    chapters: any[];
    questions: any[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [openChapterId, setOpenChapterId] = useState<string | null>(activeChapterId);
  const [selectedMark, setSelectedMark] = useState<string>("All");

  const markOptions = ["All", "2M", "3M", "5M", "7M", "10M"];

  // Read cache immediately on client without breaking hydration
  useEffect(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("roteen_subject_data");
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setRawData(parsed);
          setLoading(false);
        } catch (e) {}
      }
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      // Background fetch: don't set loading if we already have cache
      if (!localStorage.getItem("roteen_subject_data")) {
        setLoading(true);
      }
      setError(null);

      try {
        const { data: subjectRows, error: subjectError } = await supabase
          .from("subjects")
          .select("id, subject_name")
          .eq("subject_name", "Math")
          .eq("standard", 10);

        if (subjectError) throw subjectError;
        const subject = subjectRows?.[0];
        if (!subject) throw new Error("Subject not found.");

        const subjectId = String(subject.id);

        const { data: chapterRows, error: chapterError } = await supabase
          .from("chapters")
          .select("id, chapter_no, name")
          .eq("subject_id", subjectId)
          .order("chapter_no", { ascending: true });

        if (chapterError) throw chapterError;

        const { data: questionRows, error: questionError } = await supabase
          .from("questions")
          .select("id, chapter_id, question_name, mode, standard, questions_marks")
          .eq("subject_id", subjectId)
          .order("chapter_id", { ascending: true })
          .order("id", { ascending: true });

        if (questionError) throw questionError;

        if (!mounted) return;

        const newData = {
          subject: subject.subject_name || "Math",
          chapters: chapterRows || [],
          questions: questionRows || [],
        };

        localStorage.setItem("roteen_subject_data", JSON.stringify(newData));
        setRawData(newData);
      } catch (err: any) {
        if (!mounted) return;
        if (!localStorage.getItem("roteen_subject_data")) {
          setError(err.message || "Unable to load data.");
        }
      } finally {
        if (mounted && !localStorage.getItem("roteen_subject_data")) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, []); // Run only once on mount

  // Compute panelData synchronously during render to avoid intermediate flashes
  const panelData = useMemo(() => {
    if (!rawData) {
      return { subject: "Math", totalQuestions: 0, chapters: [] as Chapter[] };
    }

    const chaptersMap = new Map<string, Chapter>();

    rawData.chapters.forEach((row: any, index: number) => {
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

    const questions = rawData.questions.filter((row: any) => {
      const rowStandard = String(row.standard ?? "").trim().toLowerCase();
      if (rowStandard !== "10" && rowStandard !== "10th") return false;
      
      const rowMode = String(row.mode ?? "").trim().toLowerCase();
      if (rowMode !== requestedMode) return false;
      
      if (selectedMark !== "All") {
        const rowMark = String(row.questions_marks ?? "").trim().toLowerCase();
        if (rowMark !== requestedMark) return false;
      }

      return true;
    });

    questions.forEach((row: any) => {
      const chapterId = String(row.chapter_id);
      const chapter = chaptersMap.get(chapterId);
      if (chapter) {
        chapter.topics.push({
          id: String(row.id),
          title: String(row.question_name),
          mark: String(row.questions_marks)
        });
      }
    });

    return {
      subject: rawData.subject,
      totalQuestions: questions.length,
      chapters: Array.from(chaptersMap.values()),
    };
  }, [rawData, mode, selectedMark]);

  useEffect(() => {
    if (panelData.chapters.length > 0) {
      setOpenChapterId((previous) => {
        if (!previous) return null;
        return panelData.chapters.some((c) => c.id === previous) ? previous : null;
      });
    }
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
        }))
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
      <SubjectModeToggle mode={mode} onChange={setMode} />

      <div className={videoStyles.style_51da20a792f93}>
        <h2 className={videoStyles.style_edfe6c65ccbc0}>
          {panelData.subject}
          <span className={videoStyles.style_127fb746f0794e}>{chapterCounter}</span>
        </h2>
        <MarkFilterDropdown
          options={markOptions}
          selected={selectedMark}
          onChange={setSelectedMark}
        />
      </div>

      <div className={videoStyles.style_14301a35f9bb99}>
        {loading ? (
          <p className={videoStyles.style_12ebb96d2c5429}>Loading chapters...</p>
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
              <div key={chapter.id}>
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
                      <div className={videoStyles.style_f50e73581e486}>
                        {chapter.topics.length === 0 ? (
                          <p className={videoStyles.style_1266d476879826}>No questions available</p>
                        ) : (
                          chapter.topics.map((topic) => {
                            const isActiveQuestion = selectedQuestionId === topic.id;
                            return (
                              <div key={topic.id} className={videoStyles.style_1963bf9c16a942}>
                                <span
                                  aria-hidden="true"
                                  className={`pointer-events-none absolute left-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-bl-md border-b border-l transition-colors duration-200 ease-in-out ${
                                    isActiveQuestion ? "border-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.4)]" : "border-zinc-700"
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
                          })
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
