import type { SessionTimelineItem } from "@/features/session/components/sessionStore";

type SessionTimelineProps = {
  items: SessionTimelineItem[];
};

const statusStyles = {
  Completed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  "In Progress": "bg-zinc-800 text-zinc-300 ring-zinc-700",
  Upcoming: "bg-slate-100 text-slate-600 ring-slate-200",
} as const;

export function SessionTimeline({ items }: SessionTimelineProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-[32px] font-bold tracking-tight text-white sm:text-[36px]">Session Timeline</h2>
          <p className="mt-1 text-sm text-slate-400">Progress across today&apos;s key sessions</p>
        </div>
        <span className="w-fit rounded-full border border-teal-300/25 bg-teal-500/12 px-4 py-1.5 text-sm font-semibold text-teal-300">Live</span>
      </div>

      <div className="mt-6 space-y-5">
        {items.map((item, index) => (
          <article className="relative pl-8" key={item.id}>
            <span className="absolute left-0 top-1.5 h-4 w-4 rounded-full border-4 border-white bg-teal-500 shadow ring-1 ring-teal-200" />
            {index < items.length - 1 ? <span className="absolute bottom-[-18px] left-2 top-6 w-px bg-slate-200" /> : null}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-medium text-slate-950">{item.title}</p>
                <p className="mt-1 text-sm text-slate-500">{item.time}</p>
              </div>
              <span className={`w-fit rounded-md px-2.5 py-1 text-xs font-semibold ring-1 ${statusStyles[item.status]}`}>
                {item.status}
              </span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-slate-100">
              <div className="h-2 rounded-full bg-teal-500" style={{ width: `${item.progress}%` }} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
