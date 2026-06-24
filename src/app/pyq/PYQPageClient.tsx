"use client";

import { useState, useMemo, useEffect } from "react";
import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ClipboardList, 
  Search, 
  FileText, 
  Pin, 
  BookOpen, 
  Award, 
  HelpCircle,
  GraduationCap,
  Download,
  Calendar,
  FileCheck,
  BookOpenCheck,
  ArrowLeft,
  ChevronRight
} from "lucide-react";
import { ProfileService } from "@/features/profile/services/profile.service";
import { PYQService, SupabaseQuestionPaper, SupabaseSubject, SupabaseChapter } from "@/features/profile/services/pyq.service";
import { useAuth } from "@/providers/AuthProvider";

interface PYQItem {
  id: string;
  title: string;
  papersCount: number;
  icon: any;
  isPinned: boolean;
}

export function PYQPageClient() {
  const { user, isLoading: isAuthLoading, openLoginModal } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Navigation states
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [activeMobileTab, setActiveMobileTab] = useState<"subject" | "content">("subject");
  const [openSubjects, setOpenSubjects] = useState<Record<string, boolean>>({});

  // Dynamic Supabase states
  const [userStandard, setUserStandard] = useState<string>("10");
  const [dbQuestionPapers, setDbQuestionPapers] = useState<SupabaseQuestionPaper[]>([]);
  const [subjects, setSubjects] = useState<SupabaseSubject[]>([]);
  const [chapters, setChapters] = useState<SupabaseChapter[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Years derived dynamically from Supabase
  const [pyqs, setPyqs] = useState<PYQItem[]>([]);

  useEffect(() => {
    async function loadSupabaseData() {
      try {
        setLoading(true);

        // 1. Fetch user profile standard (best-effort, don't block if it fails)
        let rawStandard = "10";
        let cleanStd = "10";
        if (user) {
          try {
            const profile = await ProfileService.getProfile();
            rawStandard = profile?.standard || "10";
            cleanStd = rawStandard.replace(/\D/g, "") || "10";
            setUserStandard(rawStandard);
          } catch (profileErr) {
            console.warn("Profile fetch failed, defaulting standard to 10:", profileErr);
          }
        }

        // 2. Fetch subjects + chapters + question papers in parallel
        const [fetchedSubjects, fetchedChapters, fetchedPapers] = await Promise.all([
          PYQService.fetchSubjects(),
          PYQService.fetchChapters(),
          PYQService.fetchQuestionPapers(),
        ]);

        const numericStd = parseInt(cleanStd, 10);
        // Standard filter based on subjects
        const subjectsForStd = isNaN(numericStd)
          ? fetchedSubjects
          : fetchedSubjects.filter((s) => Number(s.standard) === numericStd);
        const subjectIds = new Set(subjectsForStd.map((s) => String(s.id)));

        // Question papers matching standard
        const papersForStd = fetchedPapers.filter((p) => subjectIds.has(String(p.subject_id)));

        // 3. Derive distinct years dynamically (YYYY from YYYY-MM-DD)
        const allYears = [...new Set(papersForStd.map((p) => p.year ? p.year.split("-")[0] : ""))]
          .filter(Boolean)
          .sort((a, b) => Number(b) - Number(a)); // newest first

        const dynamicPyqs: PYQItem[] = allYears.map((year, idx) => ({
          id: `pyq-${year}`,
          title: year,
          papersCount: 0, // computed dynamically in pyqListWithCounts
          icon: BookOpen,
          isPinned: idx === 0, // newest pinned by default
        }));

        setPyqs(dynamicPyqs);
        setSubjects(subjectsForStd);
        setChapters(fetchedChapters);
        setDbQuestionPapers(papersForStd);
      } catch (error) {
        console.error("Failed to load dynamic PYQ data from Supabase:", error);
      } finally {
        setLoading(false);
      }
    }
    loadSupabaseData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleTogglePin = (id: string) => {
    if (!user) {
      openLoginModal(`/pyq`);
      return;
    }
    setPyqs((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isPinned: !item.isPinned } : item
      )
    );
  };

  const pyqListWithCounts = useMemo(() => {
    return pyqs.map((item) => {
      const count = dbQuestionPapers.filter((p) => p.year && p.year.startsWith(item.title)).length;
      return { ...item, papersCount: count };
    });
  }, [pyqs, dbQuestionPapers]);

  const filteredYears = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const filtered = pyqListWithCounts.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.papersCount.toString().includes(query)
    );

    return [...filtered].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.title.localeCompare(a.title);
    });
  }, [pyqListWithCounts, searchQuery]);

  // Grouped list of subjects and chapters for the selected year
  const yearSubjectsAndChapters = useMemo(() => {
    if (!selectedYear) return [];

    const yearPapers = dbQuestionPapers.filter(
      (p) => p.year && p.year.startsWith(selectedYear)
    );

    const activeSubjects = subjects.filter((s) =>
      yearPapers.some((p) => String(p.subject_id) === String(s.id))
    );

    const result = activeSubjects.map((subject) => {
      const subjectPapers = yearPapers.filter((p) => String(p.subject_id) === String(subject.id));
      const subjectChapters = chapters.filter((c) =>
        subjectPapers.some((p) => String(p.chapter_id) === String(c.id))
      );

      const sortedChapters = [...subjectChapters].sort((a, b) => a.chapter_no - b.chapter_no);

      return {
        subjectId: String(subject.id),
        subjectName: subject.subject_name,
        chapters: sortedChapters.map((c) => {
          const paper = subjectPapers.find((p) => String(p.chapter_id) === String(c.id));
          return {
            id: c.id,
            name: c.name,
            chapterNo: c.chapter_no,
            fileUrl: paper?.file_url || null,
          };
        }),
      };
    });

    return result.sort((a, b) => a.subjectName.localeCompare(b.subjectName));
  }, [selectedYear, dbQuestionPapers, subjects, chapters]);

  // Active chapter metadata for display
  const activeChapterData = useMemo(() => {
    if (!selectedChapterId) return null;
    
    const chap = chapters.find(c => String(c.id) === String(selectedChapterId));
    if (!chap) return null;

    const subj = subjects.find(s => String(s.id) === String(chap.subject_id));

    const paper = dbQuestionPapers.find(
      p => p.year && p.year.startsWith(selectedYear || "") && 
      String(p.subject_id) === String(chap.subject_id) && 
      String(p.chapter_id) === String(chap.id)
    );

    return {
      chapterName: chap.name,
      chapterNo: chap.chapter_no,
      subjectName: subj?.subject_name || "",
      fileUrl: paper?.file_url || null,
    };
  }, [selectedChapterId, selectedYear, chapters, subjects, dbQuestionPapers]);

  // Load initial navigation states from URL params on mount
  useEffect(() => {
    if (isAuthLoading) return;
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const yearParam = params.get("year");
      const chapterParam = params.get("chapter");
      
      if (yearParam || chapterParam) {
        if (!user) {
          // Clear params
          const cleanUrl = new URL(window.location.href);
          cleanUrl.searchParams.delete("year");
          cleanUrl.searchParams.delete("chapter");
          window.history.replaceState({}, "", cleanUrl.toString());
          
          setSelectedYear(null);
          setSelectedChapterId(null);
          
          const nextParams = new URLSearchParams();
          if (yearParam) nextParams.set("year", yearParam);
          if (chapterParam) nextParams.set("chapter", chapterParam);
          openLoginModal(`/pyq?${nextParams.toString()}`);
        } else {
          if (yearParam) {
            setSelectedYear(yearParam);
          }
          if (chapterParam) {
            setSelectedChapterId(chapterParam);
          }
        }
      }
    }
  }, [user, isAuthLoading, openLoginModal]);

  // Listen to popstate event
  useEffect(() => {
    const handlePopState = () => {
      if (!user) return;
      const params = new URLSearchParams(window.location.search);
      const yearParam = params.get("year");
      const chapterParam = params.get("chapter");
      
      setSelectedYear(yearParam);
      setSelectedChapterId(chapterParam);
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [user]);

  // Auto-expand the active subject accordion
  useEffect(() => {
    if (selectedChapterId && chapters.length > 0) {
      const chap = chapters.find((c) => String(c.id) === String(selectedChapterId));
      if (chap) {
        setOpenSubjects((prev) => ({
          ...prev,
          [String(chap.subject_id)]: true,
        }));
      }
    }
  }, [selectedChapterId, chapters]);

  // Handle year click
  const handleYearClick = (yearTitle: string) => {
    if (!user) {
      openLoginModal(`/pyq?year=${yearTitle}`);
      return;
    }
    setSelectedYear(yearTitle);
    setSelectedChapterId(null);
    
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("year", yearTitle);
      url.searchParams.delete("chapter");
      window.history.pushState({}, "", url.toString());
    }
    
    // Auto-expand all subjects for this year by default
    const papersForYear = dbQuestionPapers.filter(
      (p) => p.year && p.year.startsWith(yearTitle)
    );
    const initialOpen: Record<string, boolean> = {};
    papersForYear.forEach((p) => {
      initialOpen[String(p.subject_id)] = true;
    });
    setOpenSubjects(initialOpen);

    setActiveMobileTab("subject");
  };

  const handleChapterClick = (chapterId: string) => {
    setSelectedChapterId(chapterId);
    setActiveMobileTab("content");

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("chapter", chapterId);
      window.history.pushState({}, "", url.toString());
    }
  };

  // Split View Layout (Year Selected)
  if (selectedYear) {
    return (
      <div className="bg-black text-zinc-200 min-h-screen text-white font-sans flex flex-col h-screen overflow-hidden">
        <DashboardHeader activeLabel="PYQs" />

        {/* Mobile Tab Switcher */}
        <div className="flex border-b border-zinc-800 bg-[#0c0c0e] lg:hidden shrink-0">
          <button
            type="button"
            onClick={() => setActiveMobileTab("subject")}
            className={`flex-1 py-3 text-center text-xs font-semibold tracking-wider uppercase transition-colors ${
              activeMobileTab === "subject"
                ? "text-purple-400 border-b-2 border-purple-500 bg-purple-500/5"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Papers List
          </button>
          <button
            type="button"
            onClick={() => setActiveMobileTab("content")}
            className={`flex-1 py-3 text-center text-xs font-semibold tracking-wider uppercase transition-colors ${
              activeMobileTab === "content"
                ? "text-purple-400 border-b-2 border-purple-500 bg-purple-500/5"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Questions View
          </button>
        </div>

        <motion.div 
          className="box-border flex flex-col lg:flex-row flex-1 min-h-0 min-w-0 overflow-hidden px-4 pb-4 pt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* LEFT: Accordion Tree List Panel */}
          <div
            className={`transition-all duration-300 ease-in-out flex h-full min-h-0 shrink-0 w-full lg:w-[380px] lg:shrink-0 lg:pr-4 ${
              activeMobileTab === "subject" ? "flex" : "hidden lg:flex"
            }`}
          >
            <aside className="flex h-full w-full min-w-0 shrink flex-col rounded-2xl border border-zinc-800/80 bg-[#121212] p-4 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
              {/* Back to Grid header */}
              <div className="flex items-center mb-4 border-b border-zinc-800 pb-3.5">
                <h2 className="text-xl font-bold text-white tracking-tight truncate">
                  {selectedYear} PYQs
                </h2>
              </div>

              {/* Available Question Papers */}
              <div className="mt-2 min-h-0 flex-1 overflow-y-auto pr-1 custom-scrollbar no-scrollbar">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">
                  Subjects & Chapters
                </p>
                
                {yearSubjectsAndChapters.length === 0 ? (
                  <p className="text-xs text-zinc-500">No subjects available</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {yearSubjectsAndChapters.map((subject) => {
                      const isExpanded = openSubjects[subject.subjectId] !== false;
                      const toggleSubject = () => {
                        setOpenSubjects((prev) => ({
                          ...prev,
                          [subject.subjectId]: prev[subject.subjectId] === false,
                        }));
                      };

                      return (
                        <div key={subject.subjectId} className="flex flex-col gap-1.5 relative pl-4">
                          {/* L-connector line from top to Subject header */}
                          <span
                            aria-hidden="true"
                            className="pointer-events-none absolute left-0 top-3 h-3 w-3 rounded-bl-md border-b border-l border-zinc-700/60"
                          />

                          {/* Subject Accordion Header */}
                          <button
                            type="button"
                            onClick={toggleSubject}
                            className="flex items-center justify-between w-full text-left pl-0 pr-1 py-1 text-xs font-semibold text-zinc-300 hover:text-white transition-colors group/subject"
                          >
                            <div className="flex items-center gap-1.5">
                              <motion.div
                                animate={{ rotate: isExpanded ? 90 : 0 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className="text-zinc-500 group-hover/subject:text-zinc-300"
                              >
                                <ChevronRight className="h-3 w-3" />
                              </motion.div>
                              <span className="tracking-wide text-zinc-200 group-hover/subject:text-white transition-colors">{subject.subjectName}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-450 font-normal shrink-0">
                                {subject.chapters.length}
                              </span>
                            </div>
                          </button>

                          {/* Chapters list under the Subject */}
                          <AnimatePresence initial={false}>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25, ease: "easeInOut" }}
                                className="overflow-hidden"
                              >
                                {/* Left vertical border connector line */}
                                <div className="relative ml-1.5 border-l border-zinc-800/80 pl-4 flex flex-col gap-1.5 pb-2 pt-1">
                                  {subject.chapters.map((chapter) => {
                                    const isActive = selectedChapterId === chapter.id;
                                    return (
                                      <div key={chapter.id} className="group/chapter relative pl-4">
                                        {/* L-connector line to the Chapter item */}
                                        <span
                                          aria-hidden="true"
                                          className={`pointer-events-none absolute left-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-bl-md border-b border-l transition-colors duration-200 ease-in-out ${
                                            isActive
                                              ? "border-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.4)]"
                                              : "border-zinc-700/60"
                                          }`}
                                        />
                                        
                                        <motion.button
                                          type="button"
                                          onClick={() => handleChapterClick(chapter.id)}
                                          whileHover={{ x: 5 }}
                                          whileTap={{ scale: 0.98 }}
                                          className={`flex items-center justify-between py-1.5 pl-2 pr-1 text-xs font-semibold text-left transition-colors duration-300 cursor-pointer w-full bg-transparent border-transparent ${
                                            isActive
                                              ? "text-white font-bold drop-shadow-md"
                                              : "text-zinc-400 hover:text-zinc-200"
                                          }`}
                                        >
                                          <span>Chapter {chapter.chapterNo}: {chapter.name}</span>
                                        </motion.button>
                                      </div>
                                    );
                                  })}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </aside>
          </div>

          {/* RIGHT: Document Preview Panel */}
          <div
            className={`transition-all duration-300 ease-in-out flex-1 min-w-0 h-full min-h-0 ${
              activeMobileTab === "content" ? "flex" : "hidden lg:flex"
            }`}
          >
            <aside className="rounded-2xl border border-zinc-800/90 bg-[#121212] shadow-[0_18px_36px_rgba(0,0,0,0.42)] h-full w-full min-w-0 flex shrink flex-col overflow-hidden">
              
              {/* Header bar */}
              <div className="flex w-full shrink-0 items-center justify-between border-b border-zinc-800 px-6 py-4">
                <h3 className="text-sm font-semibold text-zinc-200">
                  {activeChapterData ? `${activeChapterData.subjectName} - Chapter ${activeChapterData.chapterNo}` : "Question Paper View"}
                </h3>
              </div>

              {/* Panel content scroll area */}
              <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto p-6 flex flex-col">
                {!activeChapterData ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center text-zinc-500">
                    <BookOpen size={36} className="mb-3 opacity-30 text-purple-400" />
                    <p className="text-sm font-medium">Select a Chapter to view Question Paper</p>
                  </div>
                ) : activeChapterData.fileUrl ? (
                  <div className="flex-1 flex flex-col gap-5 min-h-0">
                    {/* Header Details */}
                    <div className="flex flex-col items-start gap-1 text-left shrink-0">
                      <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">
                        {activeChapterData.subjectName}
                      </span>
                      <h4 className="text-lg font-bold text-white leading-tight">
                        Chapter {activeChapterData.chapterNo}: {activeChapterData.chapterName}
                      </h4>
                    </div>

                    {/* Preview Area */}
                    {activeChapterData.fileUrl.toLowerCase().endsWith(".pdf") ? (
                      <div className="flex-1 rounded-xl overflow-hidden border border-zinc-800/80 bg-zinc-950 flex flex-col min-h-[300px]">
                        <iframe
                          src={activeChapterData.fileUrl}
                          className="w-full h-full border-none flex-1"
                          title="PDF Preview"
                        />
                      </div>
                    ) : activeChapterData.fileUrl.toLowerCase().match(/\.(jpeg|jpg|gif|png|webp)/) ? (
                      <div className="flex-1 rounded-xl overflow-hidden border border-zinc-800/80 bg-zinc-950 flex items-center justify-center p-3 min-h-[300px]">
                        <img
                          src={activeChapterData.fileUrl}
                          alt={activeChapterData.chapterName}
                          className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-md"
                        />
                      </div>
                    ) : (
                      <div className="flex-1 rounded-xl border border-dashed border-zinc-800 bg-zinc-950/20 flex flex-col items-center justify-center p-8 text-zinc-500 min-h-[200px]">
                        <FileText size={48} className="mb-3 opacity-30 text-purple-400" />
                        <p className="text-sm font-medium">Document preview not supported for this file format.</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-4 mt-auto pt-2 shrink-0">
                      <a
                        href={activeChapterData.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#a855f7] px-5 py-3 text-sm font-bold text-white shadow-[0_0_15px_rgba(124,58,237,0.4)] transition hover:brightness-110 active:scale-[0.98] cursor-pointer"
                      >
                        <BookOpen size={16} />
                        <span>Open Document</span>
                      </a>
                      <a
                        href={activeChapterData.fileUrl}
                        download
                        className="flex items-center justify-center gap-2 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-zinc-800 active:scale-[0.98] cursor-pointer"
                      >
                        <Download size={16} />
                        <span>Download</span>
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center text-zinc-500">
                    <FileText size={36} className="mb-3 opacity-30 text-purple-400" />
                    <p className="text-sm font-medium">Question paper file is currently empty/not uploaded yet.</p>
                  </div>
                )}
              </div>

            </aside>
          </div>
        </motion.div>
      </div>
    );
  }

  // Grid View Layout (Initial state showing years list)
  return (
    <div className="bg-black text-zinc-200 min-h-screen text-white font-sans overflow-x-hidden">
      <DashboardHeader activeLabel="PYQs" />

      <main className="px-8 md:px-12 py-12 max-w-[1660px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-[40px] font-black tracking-tight uppercase">PYQs</h1>
            <p className="text-gray-400 text-sm font-medium">Access previous year question papers.</p>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-[340px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-gray-400" />
              <input
                type="text"
                placeholder="Search PYQs"
                suppressHydrationWarning
                className="w-full bg-[#121212] border border-zinc-800 focus:border-violet-500/50 rounded-full py-3 pl-11 pr-5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,240px))] gap-5 justify-start">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse flex h-[220px] w-full max-w-[240px] flex-col rounded-2xl border border-zinc-800 bg-[#121212] p-4 gap-3">
                <div className="flex justify-between">
                  <div className="h-2 w-2 rounded-full bg-zinc-700" />
                  <div className="h-3 w-3 rounded-full bg-zinc-700" />
                </div>
                <div className="mt-4 h-10 w-10 rounded-lg bg-zinc-800" />
                <div className="mt-auto space-y-2">
                  <div className="h-5 w-16 rounded bg-zinc-800" />
                  <div className="h-3 w-24 rounded bg-zinc-800" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredYears.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <HelpCircle size={48} className="text-zinc-600 mb-4 animate-pulse" />
            <p className="text-zinc-400 text-lg font-medium">No question papers found</p>
            <p className="text-zinc-600 text-sm mt-1">
              {searchQuery ? "Try modifying your search query." : "No PYQs are available for your standard yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,240px))] gap-5 justify-start">
            <AnimatePresence>
              {filteredYears.map((pyq) => {
                const IconComponent = pyq.icon;
                return (
                  <motion.div
                     key={pyq.id}
                     layout
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.95 }}
                     transition={{ duration: 0.2 }}
                     className="group flex h-full min-h-[220px] w-full max-w-[240px] cursor-pointer flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-[#121212] transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/30 hover:shadow-[0_8px_30px_rgba(139,92,246,0.1)]"
                     role="button"
                     tabIndex={0}
                     onClick={() => handleYearClick(pyq.title)}
                  >
                    {/* Top Header: Dot & Pin */}
                    <div className="flex items-center justify-between p-4 pb-0">
                      <div className="h-[7px] w-[7px] rounded-full bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          className="p-1 focus:outline-none"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleTogglePin(pyq.id);
                          }}
                          aria-label={pyq.isPinned ? "Unpin paper" : "Pin paper"}
                        >
                          <Pin
                            className={
                              pyq.isPinned
                                ? "h-[15px] w-[15px] cursor-pointer text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                                : "h-[15px] w-[15px] cursor-pointer text-zinc-500 transition-colors hover:text-white"
                            }
                            fill={pyq.isPinned ? "currentColor" : "none"}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Big Center Icon */}
                    <div className="flex flex-1 items-center justify-center p-6 text-white transition-transform duration-300 group-hover:scale-105">
                      <IconComponent size={42} strokeWidth={1.2} />
                    </div>

                    {/* Title */}
                    <div className="flex items-start justify-between px-4 pb-4">
                      <h3 className="line-clamp-2 pr-2 text-[15px] font-bold tracking-wide text-white">
                        {pyq.title}
                      </h3>
                    </div>

                    {/* Footer Details */}
                    <div className="mt-auto border-t border-zinc-800 p-3 px-4">
                      <div className="flex items-center justify-center text-[11px] font-semibold tracking-wide text-violet-400">
                        <div className="flex items-center gap-1.5">
                          <ClipboardList size={14} strokeWidth={2.2} />
                          <span>{pyq.papersCount} Question Papers</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
