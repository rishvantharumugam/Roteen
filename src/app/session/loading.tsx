export default function SessionLoading() {
  return (
    <div className="min-h-screen bg-[#030610] p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="h-10 w-72 animate-pulse rounded bg-white/10" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-32 animate-pulse rounded-2xl bg-white/10" />
          ))}
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="h-80 animate-pulse rounded-2xl bg-white/10" />
          ))}
        </div>
      </div>
    </div>
  );
}

