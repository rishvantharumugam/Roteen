import { memo } from "react";
import { Play } from "lucide-react";

export type OngoingVideo = {
  id: string;
  title: string;
  timeRemaining: string;
  progressPercent: number;
  icon: React.ReactNode;
  bgGradient: string;
  lastUpdated?: string;
  
  // Custom navigation parameters
  questionId?: string;
  subjectId?: string;
  subjectTitle?: string;
  subjectStandard?: string | null;
};

export const OngoingVideoCard = memo(function OngoingVideoCard({
  video,
  onClick,
}: {
  video: OngoingVideo;
  onClick?: () => void;
}) {
  return (
    <article
      onClick={onClick}
      className="group relative flex flex-shrink-0 cursor-pointer snap-start flex-col gap-3 rounded-2xl border border-zinc-800 bg-[#121212] p-3 shadow-lg transition-colors hover:z-20 hover:border-violet-500/30"
    >
      {/* Thumbnail */}
      <div 
        className="relative w-full aspect-[16/9] rounded-xl overflow-hidden flex items-center justify-center border border-white/10"
        style={{ background: video.bgGradient }}
      >
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
        
        {/* Background Icon (faint) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-30 scale-150 mix-blend-overlay">
          {video.icon}
        </div>
        
        {/* Play Button Overlay */}
        <div className="relative z-10 w-12 h-12 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform">
          <Play fill="currentColor" size={20} className="ml-1" />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2">
        <h3 className="text-[15px] font-bold text-white truncate">{video.title}</h3>
        
        <div className="flex flex-col gap-2.5">
          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#9333EA] to-[#A855F7] rounded-full"
              style={{ width: `${video.progressPercent}%` }}
            />
          </div>
          
          <div className="flex justify-between items-center text-[11px] text-gray-400 font-medium">
            <span>{video.timeRemaining}</span>
            {video.lastUpdated && <span className="text-[10px] text-zinc-500">{video.lastUpdated}</span>}
          </div>

          {/* Resume Button */}
          <div className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/40 text-[11px] font-semibold text-zinc-200 transition-all group-hover:border-purple-500/50 group-hover:bg-purple-600 group-hover:text-white">
            <Play size={10} fill="currentColor" />
            <span>Resume</span>
          </div>
        </div>
      </div>
    </article>
  );
});
