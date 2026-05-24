import { memo } from "react";
import { Play } from "lucide-react";

export type OngoingVideo = {
  id: string;
  title: string;
  timeRemaining: string;
  progressPercent: number;
  icon: React.ReactNode;
  bgGradient: string;
};

export const OngoingVideoCard = memo(function OngoingVideoCard({
  video,
}: {
  video: OngoingVideo;
}) {
  return (
    <article className="group relative flex w-[280px] flex-shrink-0 cursor-pointer snap-start flex-col gap-3 rounded-2xl border border-white/[0.06] bg-[#121221] p-3 shadow-lg transition-colors hover:bg-[#18182e] sm:w-[300px]">
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
      <div className="flex flex-col gap-3">
        <h3 className="text-[15px] font-bold text-white truncate">{video.title}</h3>
        
        <div className="flex flex-col gap-2">
          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#9333EA] to-[#A855F7] rounded-full"
              style={{ width: `${video.progressPercent}%` }}
            />
          </div>
          <p className="text-[12px] text-gray-400 font-medium">{video.timeRemaining}</p>
        </div>
      </div>
    </article>
  );
});
