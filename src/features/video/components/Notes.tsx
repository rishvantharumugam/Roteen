

interface NotesProps {
  value: string;
  onChange: (value: string) => void;
}

export default function Notes({ value, onChange }: NotesProps) {
  return (
    <section className={`rounded-2xl border border-zinc-800/90 bg-[radial-gradient(circle_at_10%_7%,rgba(62,43,138,0.22),rgba(8,12,24,0.96)_42%),linear-gradient(160deg,#050915,#040710)] shadow-[0_18px_36px_rgba(0,0,0,0.42)] p-4`}>
      <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-zinc-800 bg-black p-2 text-zinc-400">
        {["B", "I", "U", "-", "=", "T", "</>"].map((item) => (
          <button key={item} type="button" className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800/90 text-xs font-semibold text-zinc-100">{item}</button>
        ))}
      </div>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Write your notes here..."
        className="min-h-[180px] w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm text-zinc-200 outline-none placeholder:text-zinc-500 focus:border-purple-500"
      />
    </section>
  );
}
