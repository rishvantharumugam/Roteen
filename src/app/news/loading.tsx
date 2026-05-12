export default function Loading() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_20%_0%,#111827_0%,#020617_52%,#01030a_100%)] p-6">
      <div className="animate-pulse space-y-5">
        <div className="h-16 rounded-2xl bg-white/10" />
        <div className="h-24 rounded-3xl bg-white/10" />
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="h-28 rounded-2xl bg-white/10" />
        ))}
      </div>
    </main>
  );
}
