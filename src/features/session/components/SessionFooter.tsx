
type SessionFooterProps = {
  weeklyProgress: number;
  weeklySummary: string;
  motivation: string;
};

export function SessionFooter({
  weeklyProgress,
  weeklySummary,
  motivation,
}: SessionFooterProps) {
  return (
    <footer className="rounded-lg border border-teal-100 bg-white p-5 shadow-sm md:p-6">
      <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <h2 className="text-[32px] font-bold tracking-tight text-white sm:text-[36px]">Weekly Progress</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{weeklySummary}</p>
          <p className="mt-1 text-sm font-medium text-teal-700">{motivation}</p>
        </div>
        <div className="min-w-48">
          <div className="flex items-center justify-between text-sm font-medium text-slate-600">
            <span>Completion</span>
            <span>{weeklyProgress}%</span>
          </div>
          <div className="mt-3 h-3 rounded-full bg-slate-100">
            <div
              className="h-3 rounded-full bg-teal-500"
              style={{ width: `${weeklyProgress}%` }}
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
