export default function RevisionLoading() {
  return (
    <div className="min-h-screen bg-[#060a14] p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="h-10 w-64 animate-pulse rounded bg-white/10" />
        <div className="h-12 w-full animate-pulse rounded-xl bg-white/10" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-44 animate-pulse rounded-2xl bg-white/10" />
          ))}
        </div>
      </div>
    </div>
  );
}

