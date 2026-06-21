const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/features/progress/components/ProgressPageUI.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Normalize line endings to LF
content = content.replace(/\r\n/g, '\n');

const replacements = [
  {
    target: `  const [profileStandard, setProfileStandard] = useState<string>("10");
  const [loading, setLoading] = useState<boolean>(true);`,
    replace: `  const [profileStandard, setProfileStandard] = useState<string>("10");
  const [loading, setLoading] = useState<boolean>(true);
  const [averageLearning, setAverageLearning] = useState<number>(0);
  const [longestStreak, setLongestStreak] = useState<number>(0);
  const [quizTrend, setQuizTrend] = useState<{ percent: number; days: number }>({ percent: 0, days: 30 });`
  },
  {
    target: `        // 3. Fetch user's resolved quiz attempts
        const { data: attemptsData, error: attemptError } = await supabase
          .from("user_quiz_progress")
          .select("quizzes_id")
          .eq("users_id", user.id)
          .eq("iscompleted", "Resolved");

        let uniqueResolvedIds = new Set<string>();
        if (attemptsData) {
          uniqueResolvedIds = new Set(attemptsData.map((row) => String(row.quizzes_id)).filter(Boolean));
        }
        setDbTakenCount(uniqueResolvedIds.size);`,
    replace: `        // 3. Fetch user's resolved quiz attempts
        const { data: attemptsData, error: attemptError } = await supabase
          .from("user_quiz_progress")
          .select("quizzes_id, score, completed_at, quizzes(total_questions)")
          .eq("users_id", user.id)
          .eq("iscompleted", "Resolved");

        let uniqueResolvedIds = new Set<string>();
        let totalPercentage = 0;
        let validPercentageCount = 0;
        const firstQuizCompletions: Record<string, number> = {};

        if (attemptsData) {
          attemptsData.forEach((row) => {
            if (row.quizzes_id) {
              uniqueResolvedIds.add(String(row.quizzes_id));
            }
            const quizInfo = row.quizzes as any;
            const totalQ = quizInfo?.total_questions || 0;
            const scoreVal = row.score || 0;
            
            if (row.completed_at && totalQ > 0) {
              totalPercentage += (scoreVal / totalQ) * 100;
              validPercentageCount++;
            }
            if (row.quizzes_id && row.completed_at) {
              const compTime = new Date(row.completed_at).getTime();
              if (!isNaN(compTime)) {
                if (firstQuizCompletions[row.quizzes_id] === undefined || compTime < firstQuizCompletions[row.quizzes_id]) {
                  firstQuizCompletions[row.quizzes_id] = compTime;
                }
              }
            }
          });
        }
        setDbTakenCount(uniqueResolvedIds.size);

        if (validPercentageCount > 0) {
          setAverageLearning(Math.round(totalPercentage / validPercentageCount));
        } else {
          setAverageLearning(0);
        }

        // Calculate highest streak using first completed_at of each quiz
        const uniqueDates = new Set<string>();
        Object.values(firstQuizCompletions).forEach((timestamp) => {
          const date = new Date(timestamp);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          uniqueDates.add(\`\${year}-\${month}-\${day}\`);
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

        // Calculate the quiz completion trends (using completed_at only)
        const now = Date.now();
        const oneDayMs = 24 * 60 * 60 * 1000;
        
        let quizCount10Current = 0;
        let quizCount10Previous = 0;
        let quizCount20Current = 0;
        let quizCount20Previous = 0;
        let quizCount30Current = 0;
        let quizCount30Previous = 0;

        if (attemptsData) {
          attemptsData.forEach((row) => {
            if (row.completed_at) {
              const compTime = new Date(row.completed_at).getTime();
              if (!isNaN(compTime)) {
                const diffDays = (now - compTime) / oneDayMs;
                
                // 10-day bins
                if (diffDays >= 0 && diffDays < 10) {
                  quizCount10Current++;
                } else if (diffDays >= 10 && diffDays < 20) {
                  quizCount10Previous++;
                }
                
                // 20-day bins
                if (diffDays >= 0 && diffDays < 20) {
                  quizCount20Current++;
                } else if (diffDays >= 20 && diffDays < 40) {
                  quizCount20Previous++;
                }
                
                // 30-day bins
                if (diffDays >= 0 && diffDays < 30) {
                  quizCount30Current++;
                } else if (diffDays >= 30 && diffDays < 60) {
                  quizCount30Previous++;
                }
              }
            }
          });
        }

        // Determine which window to display based on activity
        let selectedDays = 30;
        let currentCount = quizCount30Current;
        let previousCount = quizCount30Previous;

        if (quizCount10Current > 0 || quizCount10Previous > 0) {
          selectedDays = 10;
          currentCount = quizCount10Current;
          previousCount = quizCount10Previous;
        } else if (quizCount20Current > 0 || quizCount20Previous > 0) {
          selectedDays = 20;
          currentCount = quizCount20Current;
          previousCount = quizCount20Previous;
        }

        // Calculate percentage change
        let percentChange = 0;
        if (previousCount > 0) {
          percentChange = Math.round(((currentCount - previousCount) / previousCount) * 100);
        } else if (currentCount > 0) {
          percentChange = 100;
        }

        setQuizTrend({
          percent: percentChange,
          days: selectedDays
        });`
  },
  {
    target: `  // Mock statistics matching the user screenshot
  const totalQuestions = 480;
  const averageScore = 68;
  const longestStreak = 7;`,
    replace: `  // Mock statistics matching the user screenshot
  const totalQuestions = 480;
  const averageScore = 68;`
  },
  {
    target: '  const PRESET_COLORS = ["#8B5CF6", "#3B82F6", "#10B981", "#F59E0B", "#06B6D4", "#EC4899", "#F43F5E", "#14B8A6", "#6366F1", "#10B981"];',
    replace: `  const PRESET_COLORS = [
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
  ];`
  },
  {
    target: '    const color = mockSubjectStats[key]?.color || PRESET_COLORS[index % PRESET_COLORS.length];',
    replace: '    const color = PRESET_COLORS[index % PRESET_COLORS.length];'
  },
  {
    target: `  // Calculate dynamic totals
  const totalQuizzes = subjectProgressMapped.reduce((sum, s) => sum + s.quizzes, 0);
  const totalQuizzesAvailable = subjectProgressMapped.reduce((sum, s) => sum + s.total, 0);

  // Add percentage to each subject dynamically based on relative contribution and sort by highest percentage descending
  const subjectProgress = subjectProgressMapped
    .map((subject) => {
      const percentage = totalQuizzes > 0 ? Math.round((subject.quizzes / totalQuizzes) * 100) : 0;
      return {
        ...subject,
        percentage
      };
    })
    .sort((a, b) => b.percentage - a.percentage);

  const highestPercent = subjectProgress.length > 0 ? subjectProgress[0].percentage : 0;

  // SVG Donut calculation constants
  const radius = 45;
  const circumference = 2 * Math.PI * radius; // ~282.74

  // Accumulate offsets for SVG donut segments
  let accumulatedPercent = 0;
  const donutSegments = subjectProgress.map((subject) => {
    const segmentLength = (subject.quizzes / totalQuizzes) * circumference;
    const gap = 2; // tiny spacing gap between segments
    const strokeDash = \`\${Math.max(0, segmentLength - gap)} \${circumference}\`;
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
  });`,
    replace: `  // Calculate dynamic totals
  const totalQuizzes = subjectProgressMapped.reduce((sum, s) => sum + s.quizzes, 0);
  const totalQuizzesAvailable = subjectProgressMapped.reduce((sum, s) => sum + s.total, 0);

  // Add percentage to each subject dynamically based on completion and sort by highest percentage descending
  const subjectProgress = subjectProgressMapped
    .map((subject) => {
      const percentage = subject.total > 0 ? Math.round((subject.quizzes / subject.total) * 100) : 0;
      return {
        ...subject,
        percentage,
        trackBg: \`\${subject.color}10\`
      };
    })
    .sort((a, b) => b.percentage - a.percentage);

  const highestPercent = subjectProgress.length > 0 ? subjectProgress[0].percentage : 0;

  // SVG Donut calculation constants
  const radius = 45;
  const circumference = 2 * Math.PI * radius; // ~282.74

  // Accumulate offsets for SVG donut segments
  let accumulatedPercent = 0;
  const donutSegments = subjectProgress.map((subject) => {
    const segmentLength = (subject.quizzes / totalQuizzes) * circumference;
    const gap = 2; // tiny spacing gap between segments
    const strokeDash = \`\${Math.max(0, segmentLength - gap)} \${circumference}\`;
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

  const questionLearnedPercentage = totalQuestionsAvailable > 0 ? Math.round((totalQuestionsAnswered / totalQuestionsAvailable) * 100) : 0;`
  },
  {
    target: `                {/* Total Quiz Card */}
                <div className="rounded-2xl border border-zinc-800/80 bg-[#0c0c0e] p-5 sm:p-6 flex flex-col gap-4 shadow-lg hover:border-zinc-700/80 transition duration-300">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold tracking-wider text-zinc-400 uppercase">Total Quiz</span>
                    <div className="h-10 w-10 shrink-0 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                      <HelpCircle size={18} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 mt-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                      {dbQuizCount !== null ? dbQuizCount : totalQuizzesAvailable}
                    </span>
                    <p className="text-xs text-zinc-500 font-semibold flex items-center gap-1.5">
                      <span className="text-emerald-400 font-bold">↗ 15%</span> from last 30 days
                    </p>
                  </div>
                </div>`,
    replace: `                {/* Total Quiz Card */}
                <div className="rounded-2xl border border-zinc-800/80 bg-[#0c0c0e] p-5 sm:p-6 flex flex-col gap-4 shadow-lg hover:border-zinc-700/80 transition duration-300">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold tracking-wider text-zinc-400 uppercase">Total Quiz</span>
                    <div className="h-10 w-10 shrink-0 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                      <HelpCircle size={18} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 mt-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                      {dbQuizCount !== null ? dbQuizCount : totalQuizzesAvailable}
                    </span>
                  </div>
                </div>`
  },
  {
    target: `                {/* Total Quiz taken Card */}
                <div className="rounded-2xl border border-zinc-800/80 bg-[#0c0c0e] p-5 sm:p-6 flex flex-col gap-4 shadow-lg hover:border-zinc-700/80 transition duration-300">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold tracking-wider text-zinc-400 uppercase">Total Quiz taken</span>
                    <div className="h-10 w-10 shrink-0 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shadow-[0_0_15px_rgba(124,58,237,0.16)]">
                      <ClipboardCheck size={18} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 mt-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                      {dbTakenCount !== null ? dbTakenCount : totalQuizzes}
                    </span>
                    <p className="text-xs text-zinc-500 font-semibold flex items-center gap-1.5">
                      <span className="text-emerald-400 font-bold">↗ 12%</span> from last 30 days
                    </p>
                  </div>
                </div>`,
    replace: `                {/* Total Quiz taken Card */}
                <div className="rounded-2xl border border-zinc-800/80 bg-[#0c0c0e] p-5 sm:p-6 flex flex-col gap-4 shadow-lg hover:border-zinc-700/80 transition duration-300">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold tracking-wider text-zinc-400 uppercase">Total Quiz taken</span>
                    <div className="h-10 w-10 shrink-0 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shadow-[0_0_15px_rgba(124,58,237,0.16)]">
                      <ClipboardCheck size={18} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 mt-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                      {dbTakenCount !== null ? dbTakenCount : totalQuizzes}
                    </span>
                    <p className="text-xs text-zinc-500 font-semibold flex items-center gap-1.5">
                      <span className={\`\${quizTrend.percent >= 0 ? 'text-emerald-400' : 'text-rose-400'} font-bold\`}>
                        \${quizTrend.percent >= 0 ? '↗' : '↘'} \${Math.abs(quizTrend.percent)}%
                      </span>{' '}
                      from last \${quizTrend.days} days
                    </p>
                  </div>
                </div>`
  },
  {
    target: `                {/* Average Score Card */}
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
                </div>`,
    replace: `                {/* Average Score Card */}
                <div className="rounded-2xl border border-zinc-800/80 bg-[#0c0c0e] p-5 sm:p-6 flex flex-col gap-4 shadow-lg hover:border-zinc-700/80 transition duration-300">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold tracking-wider text-zinc-400 uppercase">Average learning</span>
                    <div className="h-10 w-10 shrink-0 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                      <BarChart3 size={18} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 mt-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{averageLearning}%</span>
                    <p className="text-xs text-zinc-500 font-semibold flex items-center gap-1.5">
                      <span className="text-emerald-400 font-bold">↗ 8%</span> from last 30 days
                    </p>
                  </div>
                </div>`
  },
  {
    target: `                {/* Total Questions Card */}
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
                </div>`,
    replace: `                {/* Total Questions Card */}
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
                </div>`
  },
  {
    target: `                {/* Total Questions Learned Card */}
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
                </div>`,
    replace: `                {/* Total Questions Learned Card */}
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
                      <span className="text-emerald-400 font-bold">\${questionLearnedPercentage}%</span> of total answered
                    </p>
                  </div>
                </div>`
  },
  {
    target: `                {/* Average Score Card */}
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
                </div>`,
    replace: `                {/* Average Score Card */}
                <div className="rounded-2xl border border-zinc-800/80 bg-[#0c0c0e] p-5 sm:p-6 flex flex-col gap-4 shadow-lg hover:border-zinc-700/80 transition duration-300">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold tracking-wider text-zinc-400 uppercase">Average learning</span>
                    <div className="h-10 w-10 shrink-0 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                      <BarChart3 size={18} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 mt-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{averageLearning}%</span>
                    <p className="text-xs text-zinc-500 font-semibold flex items-center gap-1.5">
                      <span className="text-emerald-400 font-bold">↗ 8%</span> from last 30 days
                    </p>
                  </div>
                </div>`
  }
];

let successCount = 0;
for (const item of replacements) {
  const targetNorm = item.target.replace(/\r\n/g, '\n');
  const replaceNorm = item.replace.replace(/\r\n/g, '\n');
  if (content.includes(targetNorm)) {
    content = content.replace(targetNorm, replaceNorm);
    successCount++;
  } else {
    console.warn(`Target not found for index ${replacements.indexOf(item)}:`, targetNorm.substring(0, 100) + '...');
  }
}

// Convert back to CRLF before writing on Windows
content = content.replace(/\n/g, '\r\n');

fs.writeFileSync(filePath, content, 'utf8');
console.log(`Applied ${successCount} / ${replacements.length} replacements successfully.`);
