import type { SessionActivityItem } from "@/features/session/components/sessionStore";

type SessionActivityProps = {
  activities: SessionActivityItem[];
};

const toneStyles = {
  green: "bg-emerald-500",
  blue: "bg-violet-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
} as const;

export function SessionActivity({ activities }: SessionActivityProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-[32px] font-bold tracking-tight text-white sm:text-[36px]">Recent Activity</h2>
      <div className="mt-5 divide-y divide-slate-100">
        {activities.map((activity) => (
          <article className="flex gap-3 py-4 first:pt-0 last:pb-0" key={activity.id}>
            <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${toneStyles[activity.tone]}`} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-medium text-slate-950">{activity.title}</p>
                <time className="text-xs font-medium text-slate-400">{activity.timestamp}</time>
              </div>
              <p className="mt-1 text-sm leading-6 text-slate-600">{activity.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
