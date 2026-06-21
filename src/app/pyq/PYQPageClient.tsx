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
  Layers,
  ArrowLeft,
  ChevronRight
} from "lucide-react";
import { ProfileService } from "@/features/profile/services/profile.service";
import { PYQService, SupabasePYQ, SupabaseSubject } from "@/features/profile/services/pyq.service";

interface PYQItem {
  id: string;
  title: string;
  papersCount: number;
  icon: any;
  isPinned: boolean;
}

interface QuestionDetail {
  number: number;
  text: string;
  solution: string;
  marking: string;
}

interface SectionDetail {
  title: string;
  questions: QuestionDetail[];
}

interface PaperData {
  id: string;
  name: string;
  title: string;
  description: string;
  image_url?: string;
  sections: SectionDetail[];
}

interface GroupedPapers {
  category: "BOARD_EXAM_PAPER" | "BAORD_SAMPLE_PAPER";
  label: string;
  papers: {
    id: string;
    subjectName: string;
    image_url?: string;
  }[];
}

// Static dataset for PYQ question papers & solutions
const PAPERS_DATA: Record<string, PaperData[]> = {
  "2026": [
    {
      id: "2026-math-board",
      name: "Mathematics Board Paper",
      title: "2026 Mathematics Board Paper",
      description: "Official CBSE Class 10 Mathematics board exam paper.",
      sections: []
    },
    {
      id: "2026-physics-board",
      name: "Physics Board Paper",
      title: "2026 Physics Board Paper",
      description: "Official CBSE Class 10 Physics board exam paper.",
      sections: []
    },
    {
      id: "2026-social-board",
      name: "Social Science Board Paper",
      title: "2026 Social Science Board Paper",
      description: "Official CBSE Class 10 Social Science board exam paper.",
      sections: []
    },
    {
      id: "2026-math-sample",
      name: "Mathematics Board Sample Paper",
      title: "2026 Mathematics Board Sample Paper",
      description: "Official CBSE Class 10 Mathematics board sample paper.",
      sections: []
    },
    {
      id: "2026-physics-sample",
      name: "Physics Board Sample Paper",
      title: "2026 Physics Board Sample Paper",
      description: "Official CBSE Class 10 Physics board sample paper.",
      sections: []
    },
    {
      id: "2026-social-sample",
      name: "Social Science Board Sample Paper",
      title: "2026 Social Science Board Sample Paper",
      description: "Official CBSE Class 10 Social Science board sample paper.",
      sections: []
    }
  ],
  "2025": [
    {
      id: "2025-math-board",
      name: "Mathematics Board Paper",
      title: "2025 Mathematics Board Paper",
      description: "Official CBSE Class 10 Mathematics board exam paper.",
      sections: []
    },
    {
      id: "2025-physics-board",
      name: "Physics Board Paper",
      title: "2025 Physics Board Paper",
      description: "Official CBSE Class 10 Physics board exam paper.",
      sections: []
    },
    {
      id: "2025-social-board",
      name: "Social Science Board Paper",
      title: "2025 Social Science Board Paper",
      description: "Official CBSE Class 10 Social Science board exam paper.",
      sections: []
    },
    {
      id: "2025-math-sample",
      name: "Mathematics Board Sample Paper",
      title: "2025 Mathematics Board Sample Paper",
      description: "Official CBSE Class 10 Mathematics board sample paper.",
      sections: []
    },
    {
      id: "2025-physics-sample",
      name: "Physics Board Sample Paper",
      title: "2025 Physics Board Sample Paper",
      description: "Official CBSE Class 10 Physics board sample paper.",
      sections: []
    },
    {
      id: "2025-social-sample",
      name: "Social Science Board Sample Paper",
      title: "2025 Social Science Board Sample Paper",
      description: "Official CBSE Class 10 Social Science board sample paper.",
      sections: []
    }
  ]
};

// Generates fallback mock papers for other years (2024, 2023, 2022) to keep UI fully populated
function getMockPapers(year: string): PaperData[] {
  return [
    {
      id: `${year}-math-board`,
      name: "Mathematics Board Paper",
      title: `${year} Mathematics Board Paper`,
      description: `Official board exam question paper for Class 10 Mathematics from the year ${year}.`,
      sections: []
    },
    {
      id: `${year}-physics-board`,
      name: "Physics Board Paper",
      title: `${year} Physics Board Paper`,
      description: `Official board exam question paper for Class 10 Physics from the year ${year}.`,
      sections: []
    },
    {
      id: `${year}-social-board`,
      name: "Social Science Board Paper",
      title: `${year} Social Science Board Paper`,
      description: `Official board exam question paper for Class 10 Social Science from the year ${year}.`,
      sections: []
    },
    {
      id: `${year}-math-sample`,
      name: "Mathematics Board Sample Paper",
      title: `${year} Mathematics Board Sample Paper`,
      description: `Official board exam question paper for Class 10 Mathematics from the year ${year}.`,
      sections: []
    },
    {
      id: `${year}-physics-sample`,
      name: "Physics Board Sample Paper",
      title: `${year} Physics Board Sample Paper`,
      description: `Official board exam question paper for Class 10 Physics from the year ${year}.`,
      sections: []
    },
    {
      id: `${year}-social-sample`,
      name: "Social Science Board Sample Paper",
      title: `${year} Social Science Board Sample Paper`,
      description: `Official board exam question paper for Class 10 Social Science from the year ${year}.`,
      sections: []
    }
  ];
}

export function PYQPageClient() {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Navigation states
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedPaperId, setSelectedPaperId] = useState<string>("");
  const [activeMobileTab, setActiveMobileTab] = useState<"subject" | "content">("subject");
  const [expandedCategory, setExpandedCategory] = useState<"BOARD_EXAM_PAPER" | "BAORD_SAMPLE_PAPER" | null>(null);

  // Dynamic Supabase states
  const [userStandard, setUserStandard] = useState<string>("10");
  const [dbPapers, setDbPapers] = useState<PaperData[]>([]);
  const [subjects, setSubjects] = useState<SupabaseSubject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Years fetched dynamically from Supabase
  const [pyqs, setPyqs] = useState<PYQItem[]>([]);

  // Icon palette for year cards (cycles)
  const YEAR_ICONS = [GraduationCap, Award, BookOpen, FileText, ClipboardList, Calendar, FileCheck, BookOpenCheck];

  useEffect(() => {
    async function loadSupabaseData() {
      try {
        setLoading(true);

        // 1. Fetch user profile standard (best-effort, don't block if it fails)
        let rawStandard = "10";
        let cleanStd = "10";
        try {
          const profile = await ProfileService.getProfile();
          rawStandard = profile?.standard || "10";
          cleanStd = rawStandard.replace(/\D/g, "") || "10";
          setUserStandard(rawStandard);
        } catch (profileErr) {
          console.warn("Profile fetch failed, defaulting standard to 10:", profileErr);
        }

        // 2. Fetch subjects + ALL PYQs in parallel (no standard filter — we filter client-side)
        const [fetchedSubjects, fetchedPyqs] = await Promise.all([
          PYQService.fetchSubjects(),
          PYQService.fetchPYQs(),
        ]);

        setSubjects(fetchedSubjects);

        console.log("[PYQ] fetchedPyqs:", fetchedPyqs.length, "rows", fetchedPyqs);

        // 3. Derive distinct years directly from the fetched rows (no extra DB call needed)
        const allYears = [...new Set(fetchedPyqs.map(r => String(r.year)))]
          .filter(Boolean)
          .sort((a, b) => Number(b) - Number(a)); // newest first

        console.log("[PYQ] distinct years:", allYears);

        const dynamicPyqs: PYQItem[] = allYears.map((year, idx) => ({
          id: `pyq-${year}`,
          title: year,
          papersCount: 0, // updated in pyqListWithCounts
          icon: YEAR_ICONS[idx % YEAR_ICONS.length],
          isPinned: idx === 0, // newest pinned by default
        }));
        setPyqs(dynamicPyqs);

        // 4. Filter PYQs matching the user's standard (standard is int4 in Supabase)
        const numericStd = parseInt(cleanStd, 10);
        const matchedPyqs = isNaN(numericStd)
          ? fetchedPyqs // show everything if no valid standard
          : fetchedPyqs.filter(row => Number(row.standard) === numericStd);

        console.log("[PYQ] matched pyqs for std", numericStd, ":", matchedPyqs.length);

        // 5. Map DB PYQs to PaperData
        const mappedPapers: PaperData[] = matchedPyqs.map(row => {
          const foundSub = fetchedSubjects.find(s => String(s.id) === String(row.subject_id));
          let subjectName = "";
          if (foundSub) {
            subjectName = foundSub.subject_name;
          } else {
            const s = String(row.subject_id);
            subjectName = isNaN(Number(s)) ? s.charAt(0).toUpperCase() + s.slice(1) : "General";
          }

          const isSample = String(row.category).toUpperCase().includes("SAMPLE");
          const paperName = isSample ? `${subjectName} Board Sample Paper` : `${subjectName} Board Paper`;

          return {
            id: String(row.id),
            name: paperName,
            title: `${row.year} ${paperName}`,
            description: `Official ${paperName} for standard ${row.standard}.`,
            image_url: row.image_url || undefined,
            sections: []
          };
        });

        console.log("[PYQ] mapped papers:", mappedPapers.length);
        setDbPapers(mappedPapers);
      } catch (error) {
        console.error("Failed to load dynamic PYQ data from Supabase:", error);
      } finally {
        setLoading(false);
      }
    }
    loadSupabaseData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTogglePin = (id: string) => {
    setPyqs((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isPinned: !item.isPinned } : item
      )
    );
  };

  const pyqListWithCounts = useMemo(() => {
    return pyqs.map((item) => {
      const count = dbPapers.filter((p) => p.title.startsWith(item.title) || p.id.includes(item.title)).length;
      return { ...item, papersCount: count };
    });
  }, [pyqs, dbPapers]);

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

  // Grouped list of papers for the selected year (Board Paper vs Sample Paper with inner subjects)
  const groupedPapersList = useMemo<GroupedPapers[]>(() => {
    if (!selectedYear) return [];

    // Filter DB papers for the selected year
    const dbYearPapers = dbPapers.filter((p) => {
      return p.title.startsWith(selectedYear) || p.id.includes(selectedYear);
    });

    const examPapers: GroupedPapers["papers"] = [];
    const samplePapers: GroupedPapers["papers"] = [];

    if (dbYearPapers.length > 0) {
      dbYearPapers.forEach((p) => {
        let subjectName = p.name.replace("Board Paper", "").replace("Board Sample Paper", "").trim();
        if (!subjectName) subjectName = "General";

        const isSample = p.name.includes("Sample");
        const item = {
          id: p.id,
          subjectName: subjectName,
          image_url: p.image_url
        };

        if (isSample) {
          samplePapers.push(item);
        } else {
          examPapers.push(item);
        }
      });
    } else {
      // Fallback to static mockup data if database table has absolutely no records for this year
      const staticPapers = PAPERS_DATA[selectedYear] || getMockPapers(selectedYear);
      staticPapers.forEach((p) => {
        const isSample = p.name.includes("Sample");
        let subjectName = p.name.replace("Board Paper", "").replace("Board Sample Paper", "").trim();
        if (!subjectName) subjectName = "Mathematics";

        const item = {
          id: p.id,
          subjectName: subjectName,
          image_url: p.image_url
        };

        if (isSample) {
          samplePapers.push(item);
        } else {
          examPapers.push(item);
        }
      });
    }

    return [
      {
        category: "BOARD_EXAM_PAPER",
        label: "Board Paper",
        papers: examPapers
      },
      {
        category: "BAORD_SAMPLE_PAPER",
        label: "Board Sample Paper",
        papers: samplePapers
      }
    ];
  }, [selectedYear, dbPapers]);

  // List of papers for the selected year
  const papersList = useMemo<PaperData[]>(() => {
    if (!selectedYear) return [];
    // Prioritize DB papers for this year
    const yearPapers = dbPapers.filter((p) => p.title.startsWith(selectedYear) || p.id.includes(selectedYear));
    if (yearPapers.length > 0) {
      return yearPapers;
    }
    return PAPERS_DATA[selectedYear] || getMockPapers(selectedYear);
  }, [selectedYear, dbPapers]);

  // Retrieve matching active paper details
  const activePaper = useMemo<PaperData | null>(() => {
    if (!selectedPaperId || papersList.length === 0) return null;
    return papersList.find((p) => p.id === selectedPaperId) || null;
  }, [papersList, selectedPaperId]);

  // Load initial navigation states from URL search params on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const yearParam = params.get("year");
      const paperIdParam = params.get("paper");
      
      if (yearParam) {
        setSelectedYear(yearParam);
      }
      if (paperIdParam) {
        setSelectedPaperId(paperIdParam);
      }
    }
  }, []);

  // Listen to popstate event to handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const yearParam = params.get("year");
      const paperIdParam = params.get("paper");
      
      setSelectedYear(yearParam);
      setSelectedPaperId(paperIdParam || "");
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // Auto-expand the accordion category containing the selected paper
  useEffect(() => {
    if (selectedPaperId && papersList.length > 0) {
      const activeP = papersList.find((p) => p.id === selectedPaperId);
      if (activeP) {
        const isSample = activeP.name.includes("Sample");
        setExpandedCategory(isSample ? "BAORD_SAMPLE_PAPER" : "BOARD_EXAM_PAPER");
      }
    }
  }, [selectedPaperId, papersList]);

  // Handle year card click/tap
  const handleYearClick = (yearTitle: string) => {
    setSelectedYear(yearTitle);
    setSelectedPaperId(""); // Start with no active paper, prompting the user to select a subject
    
    // Sync to URL
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("year", yearTitle);
      url.searchParams.delete("paper");
      window.history.pushState({}, "", url.toString());
    }
    
    const yearPapers = dbPapers.filter((p) => p.title.startsWith(yearTitle) || p.id.includes(yearTitle));
    if (yearPapers.length > 0) {
      const isSample = yearPapers[0].name.includes("Sample");
      setExpandedCategory(isSample ? "BAORD_SAMPLE_PAPER" : "BOARD_EXAM_PAPER");
    } else {
      const list = PAPERS_DATA[yearTitle] || getMockPapers(yearTitle);
      if (list.length > 0) {
        const isSample = list[0].name.includes("Sample");
        setExpandedCategory(isSample ? "BAORD_SAMPLE_PAPER" : "BOARD_EXAM_PAPER");
      }
    }
    setActiveMobileTab("subject");
  };

  // Split View Layout (Year Selected)
  if (selectedYear) {
    return (
      <div className="bg-black text-zinc-200 min-h-screen text-white font-sans flex flex-col h-screen overflow-hidden">
        <DashboardHeader activeLabel="PYQs" />

        {/* Mobile Tab Switcher matching /video page style */}
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
          {/* LEFT: Papers List Panel (Replaced Subject tabs and Outline) */}
          <div
            className={`transition-all duration-300 ease-in-out flex h-full min-h-0 shrink-0 w-full lg:w-[380px] lg:shrink-0 lg:pr-4 ${
              activeMobileTab === "subject" ? "flex" : "hidden lg:flex"
            }`}
          >
            <aside className="flex h-full w-full min-w-0 shrink flex-col rounded-2xl border border-zinc-800/80 bg-[#121212] p-4 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
              {/* Back to Grid header */}
              <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-3.5">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {selectedYear} PYQs
                </h2>
              </div>

              {/* Available Question Papers */}
              <div className="mt-2 min-h-0 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">
                  Available Papers
                </p>
                <div className="flex flex-col gap-3">
                  {groupedPapersList.map((group) => {
                    const isExpanded = expandedCategory === group.category;
                    return (
                      <div key={group.category} className="flex flex-col">
                        {/* Category Header Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setExpandedCategory(isExpanded ? null : group.category);
                          }}
                          className="group relative flex w-full items-center justify-between py-3 pl-3 pr-2 text-left transition-all duration-300 cursor-pointer bg-transparent border-transparent select-none rounded-xl"
                        >
                          {/* Active Left Indicator Bar */}
                          {isExpanded && (
                            <div 
                              className="absolute left-[-16px] bottom-1/4 top-1/4 w-1 rounded-r-full bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.8)]"
                            />
                          )}

                          <div className="flex items-center gap-3 pl-1">
                            {/* Icon Container */}
                            <div className={`mt-0.5 transition-colors duration-300 ${
                              isExpanded ? "text-purple-400" : "text-zinc-500 group-hover:text-purple-400/70"
                            }`}>
                              <BookOpen size={20} className="w-5 h-5" />
                            </div>

                            {/* Text Stack */}
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-white uppercase tracking-wider">
                                {group.category === "BOARD_EXAM_PAPER" ? "BOARD EXAM PAPER" : "SAMPLE BOARD EXAM PAPER"}
                              </span>
                            </div>
                          </div>

                          <motion.div
                            animate={{ rotate: isExpanded ? 90 : 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className={`transition-colors ${
                              isExpanded ? "text-purple-400" : "text-zinc-600 group-hover:text-zinc-450"
                            }`}
                          >
                            <ChevronRight size={16} />
                          </motion.div>
                        </button>

                        {/* Subject Items List under this Category */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="flex flex-col pl-6 ml-6 mt-1.5 gap-2 overflow-hidden"
                            >
                              {group.papers.length > 0 ? (
                                group.papers.map((paper, index) => {
                                  const isActive = selectedPaperId === paper.id;
                                  return (
                                    <div key={paper.id} className="relative flex items-center w-full min-h-[36px] py-0.5">
                                      {/* Curved connector branch */}
                                      <span
                                        aria-hidden="true"
                                        className={`pointer-events-none absolute left-[-24px] top-[-8px] h-[26px] w-6 rounded-bl-lg border-l border-b transition-all duration-300 ease-in-out ${
                                          isActive
                                            ? "border-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.4)]"
                                            : "border-zinc-800/80"
                                        }`}
                                      />
                                      
                                      <motion.button
                                        type="button"
                                        onClick={() => {
                                          setSelectedPaperId(paper.id);
                                          setActiveMobileTab("content");

                                          // Sync to URL
                                          if (typeof window !== "undefined") {
                                            const url = new URL(window.location.href);
                                            url.searchParams.set("paper", paper.id);
                                            window.history.pushState({}, "", url.toString());
                                          }
                                        }}
                                        whileHover={{ x: 5 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={`flex items-center justify-between py-1.5 pl-2 pr-1 text-sm font-semibold text-left transition-colors duration-300 cursor-pointer w-full bg-transparent border-transparent ${
                                          isActive
                                            ? "text-white font-bold drop-shadow-md"
                                            : "text-zinc-400 hover:text-zinc-200"
                                        }`}
                                      >
                                        <span>{paper.subjectName}</span>
                                      </motion.button>
                                    </div>
                                  );
                                })
                              ) : (
                                <p className="text-xs text-zinc-600 py-1 pl-2">No papers available</p>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            </aside>
          </div>

          {/* RIGHT: Another Panel (Displaying Full Question Paper Details) */}
          <div
            className={`transition-all duration-300 ease-in-out flex-1 min-w-0 h-full min-h-0 ${
              activeMobileTab === "content" ? "flex" : "hidden lg:flex"
            }`}
          >
            <aside className="rounded-2xl border border-zinc-800/90 bg-[#121212] shadow-[0_18px_36px_rgba(0,0,0,0.42)] h-full w-full min-w-0 flex shrink flex-col overflow-hidden">
              
              {/* Header bar matching the styling */}
              <div className="flex w-full shrink-0 items-center justify-between border-b border-zinc-800 px-6 py-4">
                <h3 className="text-sm font-semibold text-zinc-200">
                  {activePaper ? activePaper.title : "Question Paper View"}
                </h3>
              </div>

              {/* Panel content scroll area */}
              <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-center text-zinc-500">
                {!activePaper ? (
                  <>
                    <BookOpen size={36} className="mb-3 opacity-30 text-purple-400" />
                    <p className="text-sm font-medium">Select a Subject for Question Paper</p>
                  </>
                ) : activePaper.image_url ? (
                  <div className="flex flex-col items-center justify-center w-full h-full p-4 bg-zinc-950/20 rounded-xl border border-zinc-800/50">
                    <img
                      src={activePaper.image_url}
                      alt={activePaper.title}
                      className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                    />
                  </div>
                ) : (
                  <>
                    <FileText size={36} className="mb-3 opacity-30 text-purple-400" />
                    <p className="text-sm font-medium">Question paper content is currently empty.</p>
                  </>
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
