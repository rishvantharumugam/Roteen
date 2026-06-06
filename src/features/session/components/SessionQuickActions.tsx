import type { SessionQuickAction } from "@/features/session/components/sessionStore";

type SessionQuickActionsProps = {
  actions: SessionQuickAction[];
};

export function SessionQuickActions({ actions }: SessionQuickActionsProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-slate-950 p-5 text-white shadow-sm">
      <h2 className="text-[32px] font-bold tracking-tight text-white sm:text-[36px]">Quick Actions</h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
        {actions.map((action) => (
          <button className="group flex min-h-20 items-center gap-4 rounded-md border border-white/10 bg-white/[0.08] p-4 text-left transition hover:border-teal-300/60 hover:bg-white/[0.12]" key={action.id} type="button">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-teal-400 text-xs font-bold text-slate-950">{action.icon}</span>
            <span className="min-w-0">
              <span className="block font-semibold">{action.label}</span>
              <span className="mt-1 block text-sm leading-5 text-slate-300">{action.description}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
