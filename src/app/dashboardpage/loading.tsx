export default function Loading() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_20%_0%,#111827_0%,#020617_52%,#01030a_100%)] p-6">
      <div className="mx-auto max-w-[1400px] animate-pulse space-y-6">
        <div className="h-16 rounded-2xl bg-white/10" />
        <div className="h-28 rounded-3xl bg-white/10" />
        <div className="h-10 w-72 rounded-xl bg-white/10" />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="aspect-square rounded-3xl bg-white/10" />
          ))}
        </div>
      </div>
    </main>
  );
}
