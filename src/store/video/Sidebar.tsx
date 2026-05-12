import type { Chapter } from "@/service/video";
import { videoStyles } from "@/styles/video";

interface SidebarProps {
  subject: string;
  chapterCounter: string;
  chapters: Chapter[];
  activeChapterId: string;
  onChapterSelect: (chapterId: string) => void;
}

export default function Sidebar({ subject, chapterCounter, chapters, activeChapterId, onChapterSelect }: SidebarProps) {
  return (
    <aside className={`${videoStyles.card} ${videoStyles.sidebar} relative`}>
      <div className={videoStyles.style_13175d22538533}>
        <p className={videoStyles.style_18c66d03fef8c8}>SUBJECT</p>
        <div className={videoStyles.style_c29ff58872fed}>
          <h2 className={videoStyles.style_1a26aad2cd1ac6}>{subject}</h2>
          <span className={videoStyles.style_12ebb96d2c5429}>{chapterCounter}</span>
        </div>
      </div>
      <div className={videoStyles.style_1b567876d8eae3}>
        {chapters.map((chapter) => {
          const active = chapter.id === activeChapterId;
          return (
            <button key={chapter.id} type="button" className={videoStyles.style_1e3d1a3a660e96} onClick={() => onChapterSelect(chapter.id)}>
              <div className={`rounded-2xl border p-4 transition ${active ? "border-purple-500 bg-purple-900/20 shadow-[0_10px_24px_rgba(130,77,255,0.15)]" : "border-zinc-800/90 bg-zinc-900/70 hover:border-zinc-700"}`}>
                <p className={`text-sm font-semibold tracking-widest ${active ? "text-purple-300" : "text-zinc-500"}`}>{chapter.label} {chapter.completion}%</p>
                <h3 className={videoStyles.style_16637e39ca5ec3}>{chapter.title}</h3>
                {chapter.topics.length > 0 && (
                  <ul className={videoStyles.style_f4aa08b5769cc}>
                    {chapter.topics.map((topic) => (
                      <li key={topic.id} className={videoStyles.style_f2f5cc2df18a3}>{topic.title}</li>
                    ))}
                  </ul>
                )}
              </div>
            </button>
          );
        })}
      </div>
      <button type="button" className={videoStyles.style_109dbb766a0a82}>N</button>
    </aside>
  );
}
