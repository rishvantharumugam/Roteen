import type { Chapter } from "@/features/video/services/video";


interface SidebarProps {
  subject: string;
  chapterCounter: string;
  chapters: Chapter[];
  activeChapterId: string;
  onChapterSelect: (chapterId: string) => void;
}

export default function Sidebar({ subject, chapterCounter, chapters, activeChapterId, onChapterSelect }: SidebarProps) {
  return (
    <aside className={`$"rounded-2xl border border-zinc-800/90 bg-[radial-gradient(circle_at_10%_7%,rgba(62,43,138,0.22),rgba(8,12,24,0.96)_42%),linear-gradient(160deg,#050915,#040710)] shadow-[0_18px_36px_rgba(0,0,0,0.42)]" $"w-[260px] shrink-0" relative`}>
      <div className="mb-2 border-b border-zinc-800 p-4">
        <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">SUBJECT</p>
        <div className="mt-2 flex items-center justify-between">
          <h2 className="text-xl font-semibold leading-none text-zinc-100">{subject}</h2>
          <span className="text-sm text-zinc-400">{chapterCounter}</span>
        </div>
      </div>
      <div className="space-y-3 px-4 pb-20">
        {chapters.map((chapter) => {
          const active = chapter.id === activeChapterId;
          return (
            <button key={chapter.id} type="button" className="w-full text-left" onClick={() => onChapterSelect(chapter.id)}>
              <div className={`rounded-2xl border p-4 transition ${active ? "border-purple-500 bg-purple-900/20 shadow-[0_10px_24px_rgba(130,77,255,0.15)]" : "border-zinc-800/90 bg-zinc-900/70 hover:border-zinc-700"}`}>
                <p className={`text-sm font-semibold tracking-widest ${active ? "text-purple-300" : "text-zinc-500"}`}>{chapter.label} {chapter.completion}%</p>
                <h3 className="mt-2 text-sm font-semibold leading-tight text-zinc-100">{chapter.title}</h3>
                {chapter.topics.length > 0 && (
                  <ul className="mt-3 space-y-1.5">
                    {chapter.topics.map((topic) => (
                      <li key={topic.id} className="text-xs leading-relaxed text-zinc-400">{topic.title}</li>
                    ))}
                  </ul>
                )}
              </div>
            </button>
          );
        })}
      </div>
      <button type="button" className="absolute bottom-5 left-5 flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 bg-black text-lg text-zinc-300">N</button>
    </aside>
  );
}
