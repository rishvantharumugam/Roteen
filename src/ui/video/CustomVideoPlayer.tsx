"use client";

import { useState, useRef, useEffect } from "react";
import ReactPlayerImport from "react-player";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from "lucide-react";

// Robustly handle ESM vs CJS default export resolution for Turbopack
const Player = ((ReactPlayerImport as any).default || ReactPlayerImport) as any;

interface CustomVideoPlayerProps {
  url: string;
}

export default function CustomVideoPlayer({ url }: CustomVideoPlayerProps) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isSeeking, setIsSeeking] = useState(false);
  const [isReady, setIsReady] = useState(false);
  
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Formatting time Helper
  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return "00:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const togglePlay = () => {
    setPlaying(!playing);
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlayedSeconds(parseFloat(e.target.value));
  };

  const handleSeekMouseDown = () => {
    setIsSeeking(true);
  };

  const handleSeekMouseUp = (e: React.MouseEvent<HTMLInputElement> | React.TouchEvent<HTMLInputElement>) => {
    setIsSeeking(false);
    const target = e.target as HTMLInputElement;
    const nextTime = parseFloat(target.value);
    const player = playerRef.current as any;
    if (player && typeof player.seekTo === "function") {
      player.seekTo(nextTime);
      return;
    }
    if (player && typeof player.currentTime === "number") {
      player.currentTime = nextTime;
      return;
    }
    if (player && player.current && typeof player.current.currentTime === "number") {
      player.current.currentTime = nextTime;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (muted) {
      setVolume(1);
      setMuted(false);
    } else {
      setVolume(0);
      setMuted(true);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch((err) => {
        console.warn(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 2500);
  };

  const handleMouseLeave = () => {
    if (playing) setShowControls(false);
  };

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, []);

  const markReady = () => setIsReady(true);

  return (
    <div 
      ref={containerRef} 
      className="relative group w-full h-full rounded-[15px] overflow-hidden bg-black flex flex-col items-center justify-center"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Video Container - Pointer events none prevents interacting with YouTube iframe directly */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-[15px]">
        {/* Scale up slightly to crop out the youtube edges if needed, though react-player handles it fairly well */}
        <div className="w-full h-full scale-[1.16]">
          {isMounted && (
            <Player
              ref={playerRef}
            src={url}
            width="100%"
            height="100%"
            playing={playing}
            volume={volume}
            muted={muted}
            onReady={markReady}
            onCanPlay={markReady}
            onPlaying={markReady}
            onPlay={markReady}
            onProgress={(state: any) => {
              if (!isSeeking) {
                const nextPlayed =
                  typeof state?.playedSeconds === "number"
                    ? state.playedSeconds
                    : typeof state?.currentTime === "number"
                    ? state.currentTime
                    : state?.currentTarget?.currentTime;
                setPlayedSeconds(Number.isFinite(nextPlayed) ? nextPlayed : 0);
                if (Number.isFinite(nextPlayed) && nextPlayed >= 0) markReady();
              }
            }}
            onDurationChange={(payload: any) => {
              const nextDuration =
                typeof payload === "number" ? payload : payload?.currentTarget?.duration;
              setDuration(Number.isFinite(nextDuration) ? nextDuration : 0);
              if (Number.isFinite(nextDuration) && nextDuration > 0) markReady();
            }}
            onEnded={() => setPlaying(false)}
            onError={() => setIsReady(true)}
            controls={false}
            playsInline
            config={{
              youtube: {
                playerVars: { 
                  controls: 0,
                  modestbranding: 1,
                  rel: 0,
                  iv_load_policy: 3,
                  disablekb: 1,
                  fs: 0,
                  playsinline: 1
                }
              } as any
            }}
            />
          )}
        </div>
      </div>

      {/* Invisible overlay to catch clicks on video for play/pause */}
      <div 
        className="absolute inset-0 z-10 cursor-pointer"
        onClick={togglePlay}
      />

      {/* Control Bar Overlay */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent px-4 pb-4 pt-12 transition-opacity duration-300 z-20 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Progress Bar */}
        <div className="group/progress relative h-1.5 w-full bg-white/20 rounded-full cursor-pointer mb-4">
          <div 
            className="absolute top-0 left-0 h-full bg-purple-500 rounded-full pointer-events-none" 
            style={{ width: `${(playedSeconds / duration) * 100 || 0}%` }}
          />
          <input
            type="range"
            min={0}
            max={Number.isFinite(duration) ? duration : 0}
            step="any"
            value={Number.isFinite(playedSeconds) ? playedSeconds : 0}
            onChange={handleSeekChange}
            onMouseDown={handleSeekMouseDown}
            onMouseUp={handleSeekMouseUp}
            onTouchStart={handleSeekMouseDown}
            onTouchEnd={handleSeekMouseUp}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-5">
            <button 
              onClick={togglePlay} 
              className="hover:text-purple-400 transition outline-none"
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
            </button>
            
            <div className="flex items-center gap-2 group/volume relative">
              <button 
                onClick={toggleMute} 
                className="hover:text-purple-400 transition outline-none"
                aria-label={muted ? "Unmute" : "Mute"}
              >
                {muted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <div className="w-0 overflow-hidden group-hover/volume:w-20 transition-all duration-300 ease-in-out flex items-center">
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={muted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 h-1 bg-zinc-600 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>
            </div>

            <span className="text-[13px] font-medium text-zinc-300 tabular-nums">
              {formatTime(playedSeconds)} / {formatTime(duration)}
            </span>
          </div>

          <button 
            onClick={toggleFullscreen} 
            className="hover:text-purple-400 transition outline-none"
            aria-label="Fullscreen"
          >
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>
        </div>
      </div>
      
      {/* Loading Spinner Overlay */}
      {!isReady && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Big Play Button Overlay (when paused initially) */}
      {!playing && playedSeconds === 0 && isReady && (
        <button 
          onClick={togglePlay}
          className="absolute inset-0 m-auto w-16 h-16 flex items-center justify-center bg-purple-600/80 hover:bg-purple-500 rounded-full text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] transition transform hover:scale-110 z-20"
        >
          <Play size={30} fill="currentColor" className="ml-1.5" />
        </button>
      )}
    </div>
  );
}
