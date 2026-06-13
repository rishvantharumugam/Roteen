"use client";

import React, { useState, useEffect, useRef } from "react";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface CustomVideoPlayerProps {
  url: string;
  videoId?: string | null;
  initialProgress?: number;
  onProgressUpdate?: (seconds: number) => void;
  onPlay?: () => void;
  onPause?: (seconds: number) => void;
  onEnded?: (seconds: number) => void;
  onSeeked?: (seconds: number) => void;
}

function getYouTubeId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

function isDirectVideoLink(url: string): boolean {
  if (!url) return false;
  const cleanUrl = url.split("?")[0].toLowerCase();
  return (
    cleanUrl.endsWith(".mp4") ||
    cleanUrl.endsWith(".webm") ||
    cleanUrl.endsWith(".ogg") ||
    cleanUrl.endsWith(".mov")
  );
}

let ytApiPromise: Promise<void> | null = null;
function loadYouTubeApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.YT && window.YT.Player) {
    return Promise.resolve();
  }
  if (ytApiPromise) {
    return ytApiPromise;
  }
  ytApiPromise = new Promise<void>((resolve) => {
    const existingScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
    
    const checkInterval = setInterval(() => {
      if (window.YT && window.YT.Player) {
        clearInterval(checkInterval);
        resolve();
      }
    }, 100);

    if (!existingScript) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (previousReady) previousReady();
      clearInterval(checkInterval);
      resolve();
    };
  });
  return ytApiPromise;
}

export default function CustomVideoPlayer({
  url,
  videoId,
  initialProgress = 0,
  onProgressUpdate,
  onPlay,
  onPause,
  onEnded,
  onSeeked,
}: CustomVideoPlayerProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const ytPlayerRef = useRef<HTMLDivElement>(null);
  const [ytPlayer, setYtPlayer] = useState<any>(null);

  const hasResumedRef = useRef(false);
  const isInitialSeekRef = useRef(false);
  const isInitialPauseRef = useRef(false);
  const seekDebounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    hasResumedRef.current = false;
    isInitialSeekRef.current = false;
    isInitialPauseRef.current = false;
  }, [url, videoId]);

  useEffect(() => {
    if (isReady && !hasResumedRef.current) {
      hasResumedRef.current = true;
      if (initialProgress > 0) {
        isInitialSeekRef.current = true;
        seekTo(initialProgress);
      }
    }
  }, [isReady, initialProgress, url, videoId]);

  useEffect(() => {
    return () => {
      if (seekDebounceTimeoutRef.current) {
        clearTimeout(seekDebounceTimeoutRef.current);
      }
    };
  }, []);

  const youtubeId = getYouTubeId(url);
  const isDirect = isDirectVideoLink(url);

  // Validate URL
  useEffect(() => {
    if (!url || !url.trim().startsWith("http")) {
      setError("Invalid or empty video URL provided.");
    } else {
      setError(null);
    }
  }, [url]);

  // Initialize YouTube API and Player
  useEffect(() => {
    if (!youtubeId) return;

    let player: any = null;
    let isMounted = true;

    loadYouTubeApi().then(() => {
      if (!isMounted || !ytPlayerRef.current) return;

      if (window.YT && window.YT.Player) {
        player = new window.YT.Player(ytPlayerRef.current, {
          width: "100%",
          height: "100%",
          videoId: youtubeId,
          playerVars: {
            autoplay: 0,
            controls: 0,
            rel: 0,
            disablekb: 1,
            modestbranding: 1,
            fs: 0,
            iv_load_policy: 3,
            showinfo: 0,
            showsearch: 0,
          },
          events: {
            onReady: (event: any) => {
              if (!isMounted) return;
              setYtPlayer(event.target);
              setDuration(event.target.getDuration() || 0);
              setIsReady(true);
              event.target.setVolume(volume * 100);
              if (isMuted) event.target.mute();
              else event.target.unMute();
            },
             onStateChange: (event: any) => {
              if (!isMounted) return;
              // YT.PlayerState: PLAYING = 1, PAUSED = 2, ENDED = 0, BUFFERING = 3, CUED = 5, UNSTARTED = -1
              if (event.data === 1) {
                if (isInitialSeekRef.current) {
                  isInitialSeekRef.current = false;
                  isInitialPauseRef.current = true;
                  event.target.pauseVideo();
                  setIsPlaying(false);
                  return;
                }
                setIsPlaying(true);
                onPlay?.();
              } else if (event.data === 2 || event.data === 5 || event.data === -1) {
                setIsPlaying(false);
                if (event.data === 2) {
                  if (isInitialPauseRef.current) {
                    isInitialPauseRef.current = false;
                  } else {
                    onPause?.(event.target.getCurrentTime() || 0);
                  }
                }
              } else if (event.data === 0) {
                setIsPlaying(false);
                setCurrentTime(0);
                event.target.seekTo(0, true);
                onEnded?.(event.target.getDuration() || 0);
              }
            },
            onError: () => {
              if (!isMounted) return;
              setError("Failed to load YouTube player.");
            },
          },
        });
      }
    });

    return () => {
      isMounted = false;
      if (player && typeof player.destroy === "function") {
        player.destroy();
      }
      setYtPlayer(null);
      setIsReady(false);
      setIsPlaying(false);
    };
  }, [youtubeId]);

  // YouTube Time Tracking Poller
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && ytPlayer && youtubeId) {
      interval = setInterval(() => {
        if (typeof ytPlayer.getCurrentTime === "function") {
          setCurrentTime(ytPlayer.getCurrentTime() || 0);
        }
        if (typeof ytPlayer.getDuration === "function") {
          setDuration(ytPlayer.getDuration() || 0);
        }
      }, 250);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, ytPlayer, youtubeId]);

  // Controls Visibility Timer
  useEffect(() => {
    if (!isPlaying) {
      setShowControls(true);
      return;
    }

    let timeoutId: NodeJS.Timeout;
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setShowControls(false);
      }, 2500);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove);
      }
      clearTimeout(timeoutId);
    };
  }, [isPlaying]);

  // Handle Fullscreen Event Listener (Esc key / browser exit)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(
        !!document.fullscreenElement && document.fullscreenElement === containerRef.current
      );
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Bubble time changes up
  useEffect(() => {
    if (onProgressUpdate && currentTime !== undefined) {
      onProgressUpdate(currentTime);
    }
  }, [currentTime, onProgressUpdate]);

  if (error) {
    return (
      <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/95 p-4 text-center rounded-[15px]">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10 text-red-500">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <p className="text-base font-semibold text-zinc-100">Playback Error</p>
        <p className="mt-1 text-sm text-zinc-400 max-w-[280px]">{error}</p>
      </div>
    );
  }

  const togglePlay = () => {
    if (youtubeId && ytPlayer && isReady) {
      if (isPlaying) {
        ytPlayer.pauseVideo();
      } else {
        ytPlayer.playVideo();
      }
    } else if (isDirect && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(console.error);
      }
    }
  };

  const seekTo = (seconds: number) => {
    setCurrentTime(seconds);
    if (youtubeId && ytPlayer && isReady) {
      ytPlayer.seekTo(seconds, true);
    } else if (isDirect && videoRef.current) {
      videoRef.current.currentTime = seconds;
    }

    if (seekDebounceTimeoutRef.current) {
      clearTimeout(seekDebounceTimeoutRef.current);
    }
    seekDebounceTimeoutRef.current = setTimeout(() => {
      onSeeked?.(seconds);
    }, 500);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    if (youtubeId && ytPlayer && isReady) {
      ytPlayer.setVolume(newVolume * 100);
      if (newVolume === 0) {
        ytPlayer.mute();
      } else {
        ytPlayer.unMute();
      }
    } else if (isDirect && videoRef.current) {
      videoRef.current.volume = newVolume;
      videoRef.current.muted = newVolume === 0;
    }
  };

  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    if (youtubeId && ytPlayer && isReady) {
      if (nextMute) {
        ytPlayer.mute();
      } else {
        ytPlayer.unMute();
        ytPlayer.setVolume(volume * 100);
      }
    } else if (isDirect && videoRef.current) {
      videoRef.current.muted = nextMute;
    }
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error("Error toggling fullscreen", err);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleFullscreen();
  };

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Direct video event listeners
  const handleDirectPlay = () => {
    setIsPlaying(true);
    onPlay?.();
  };
  const handleDirectPause = () => {
    setIsPlaying(false);
    if (videoRef.current) {
      onPause?.(videoRef.current.currentTime);
    }
  };
  const handleDirectTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };
  const handleDirectDurationChange = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 0);
    }
  };
  const handleDirectCanPlay = () => {
    setIsReady(true);
  };
  const handleDirectEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    const dur = videoRef.current?.duration || 0;
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
    onEnded?.(dur);
  };

  const percent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-zinc-950 rounded-[15px] overflow-hidden flex items-center justify-center group select-none text-zinc-200"
    >
      {/* Video layers */}
      <div className="w-full h-full absolute inset-0 z-0">
        {youtubeId ? (
          <div className="w-full h-full pointer-events-none select-none relative overflow-hidden flex items-center justify-center">
            <div className="absolute w-full h-full scale-[1.35] flex items-center justify-center [&>iframe]:absolute [&>iframe]:inset-0 [&>iframe]:w-full [&>iframe]:h-full">
              <div ref={ytPlayerRef} className="w-full h-full" />
            </div>
          </div>
        ) : isDirect ? (
          <video
            ref={videoRef}
            src={url}
            controls={false}
            preload="metadata"
            className="w-full h-full object-cover"
            onPlay={handleDirectPlay}
            onPause={handleDirectPause}
            onTimeUpdate={handleDirectTimeUpdate}
            onDurationChange={handleDirectDurationChange}
            onCanPlay={handleDirectCanPlay}
            onEnded={handleDirectEnded}
            onError={() => setError("Failed to load video file.")}
          />
        ) : (
          <iframe
            src={url}
            className="w-full h-full border-0 absolute inset-0 pointer-events-none"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            title="Video Player"
            onError={() => setError("Failed to load video embed.")}
          />
        )}
      </div>

      {/* Click interceptor overlay */}
      <div
        onClick={togglePlay}
        onDoubleClick={handleDoubleClick}
        className="absolute inset-0 z-10 cursor-pointer"
      />

      {/* Loading Spinner */}
      {!isReady && !error && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-zinc-950/90 gap-3">
          <svg className="animate-spin h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="text-xs font-semibold tracking-wide text-zinc-400">Loading learning session...</p>
        </div>
      )}

      {/* Center Big Play Icon */}
      {isReady && !isPlaying && (
        <button
          onClick={togglePlay}
          className="absolute z-20 flex items-center justify-center h-14 w-14 rounded-full bg-black/60 backdrop-blur-sm border border-zinc-800/80 text-indigo-400 cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95 shadow-2xl hover:text-indigo-300 hover:border-zinc-700"
          aria-label="Play video"
        >
          <svg className="w-6 h-6 fill-current translate-x-[2px]" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      )}

      {/* Custom Controls Bar */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`absolute bottom-0 left-0 right-0 z-30 bg-[#0d0d0d]/95 backdrop-blur-md border-t border-zinc-800/80 px-4 py-2.5 flex flex-col gap-1.5 transition-all duration-300 shadow-[0_-8px_30px_rgba(0,0,0,0.8)] ${
          showControls ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
        }`}
      >
        {/* Timeline Row */}
        <div className="relative w-full h-1.5 flex items-center group/timeline">
          <div className="absolute inset-y-0 left-0 right-0 h-1 bg-zinc-700/80 rounded-full" />
          <div
            className="absolute inset-y-0 left-0 h-1 bg-gradient-to-r from-purple-600 to-purple-500 rounded-full"
            style={{ width: `${percent}%` }}
          />
          <div
            className="absolute h-3 w-3 rounded-full bg-purple-400 border border-white shadow shadow-purple-500/50 -ml-1.5 transition-transform duration-150 group-hover/timeline:scale-125 group-focus-within/timeline:scale-125"
            style={{ left: `${percent}%` }}
          />
          <input
            type="range"
            min={0}
            max={duration || 100}
            step="any"
            value={currentTime}
            onChange={(e) => seekTo(parseFloat(e.target.value))}
            className="absolute inset-0 w-full h-8 opacity-0 cursor-pointer z-10 -top-1"
            title="Timeline"
            aria-label="Seek timeline"
          />
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-between mt-1 select-none">
          <div className="flex items-center gap-4">
            {/* Play / Pause button */}
            <button
              onClick={togglePlay}
              className="text-zinc-100 hover:text-white transition-colors duration-150 p-1.5 rounded-lg hover:bg-zinc-800/80"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* Volume control */}
            <div className="flex items-center gap-2 group/volume">
              <button
                onClick={toggleMute}
                className="text-zinc-100 hover:text-white transition-colors duration-150 p-1.5 rounded-lg hover:bg-zinc-800/80"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? (
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.21.05-.42.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                  </svg>
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-0 overflow-hidden group-hover/volume:w-16 focus-within/volume:w-16 transition-all duration-300 h-1 bg-zinc-700 rounded-full accent-purple-500 cursor-pointer"
                title="Volume"
                aria-label="Volume slider"
              />
            </div>

            {/* Time display */}
            <div className="text-xs text-zinc-100 font-mono tracking-wider">
              {formatTime(currentTime)} <span className="text-zinc-400">/</span> {formatTime(duration)}
            </div>
          </div>

          <div className="flex items-center">
            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="text-zinc-100 hover:text-white transition-colors duration-150 p-1.5 rounded-lg hover:bg-zinc-800/80"
              aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? (
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
