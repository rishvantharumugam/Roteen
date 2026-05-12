export default function Loading() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_20%_0%,#111827_0%,#020617_52%,#01030a_100%)] p-6">
      <div className="animate-pulse space-y-5">
        <div className="h-16 rounded-2xl bg-white/10" />
        <div className="grid gap-5 xl:grid-cols-[22%_38%_40%]">
          <div className="h-[70vh] rounded-3xl bg-white/10" />
          <div className="space-y-5">
            <div className="h-[44vh] rounded-3xl bg-white/10" />
            <div className="h-[24vh] rounded-3xl bg-white/10" />
          </div>
          <div className="h-[70vh] rounded-3xl bg-white/10" />
        </div>
      </div>
    </main>
  );
}
