/* eslint-disable @next/next/no-img-element, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react-hooks/exhaustive-deps */
"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Download,
  FolderOpen,
  Loader2,
  Sparkles,
  Users,
  Lock,
  PlayCircle,
  Calendar,
  EyeOff,
  HelpCircle,
  X,
  PauseCircle,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Copy,
  Clock,
  Video
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabaseClient";
import BatchCalendar from "@/components/BatchCalendar";
import VoucherCard from "@/components/VoucherCard";
import FirstClassCountdown from "@/components/FirstClassCountdown";

const MOCK_VIDEOS = [
  { id: 1, title: "Coming soon", date: "xx-xx-xxxx", videoId: "" },
  { id: 2, title: "Coming soon", date: "xx-xx-xxxx", videoId: "" },
  { id: 3, title: "Coming soon", date: "xx-xx-xxxx", videoId: "" },
];

type BatchUser = {
  avatarUrl: string | null;
  batchLabel: string;
  email: string;
  fullName: string;
};

const resourceCards = [
  {
    title: "Coming Soon",
    description: "Prompt frameworks, idea systems and other resources coming soon.",
    meta: "12.4 MB PDF",
    icon: BookOpen,
    accent: "from-blue-500/20 to-cyan-400/10",
  }
];

interface SecureVideoPlayerProps {
  videos: any[];
  activeVideo: any;
  setActiveVideo: (v: any) => void;
  isAdmin: boolean;
  isSyncing: boolean;
  syncStatus: any;
  handleSyncVideos: () => void;
  userEmail: string;
}

function SecureVideoPlayer({
  videos,
  activeVideo,
  setActiveVideo,
  isAdmin,
  isSyncing,
  syncStatus,
  handleSyncVideos,
  userEmail
}: SecureVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedFraction, setBufferedFraction] = useState(0);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);

  const [playerError, setPlayerError] = useState<string | null>(null);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  const addDebugLog = (msg: string) => {
    setDebugLogs(prev => [...prev.slice(-9), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      addDebugLog(`Global Error: ${event.message}`);
    };
    window.addEventListener("error", handleGlobalError);
    return () => window.removeEventListener("error", handleGlobalError);
  }, []);

  useEffect(() => {
    setCurrentTime(0);
    setDuration(0);
    setBufferedFraction(0);
    setIsPlaying(false);
    setPlayerError(null);
    setPlaybackSpeed(1);

    if (!activeVideo.videoId) {
      playerRef.current = null;
      addDebugLog("No active videoId, skipping initialization.");
      return;
    }

    addDebugLog(`Starting initialization for videoId: ${activeVideo.videoId}`);
    let player: any = null;
    let checkTimeoutId: any = null;

    const initPlayer = () => {
      if (!containerRef.current) {
        addDebugLog("initPlayer: containerRef.current is null.");
        return;
      }

      addDebugLog("Initializing YT.Player instance...");
      containerRef.current.innerHTML = '<div id="youtube-player-element" class="w-full h-full pointer-events-none"></div>';

      try {
        player = new (window as any).YT.Player('youtube-player-element', {
          height: '100%',
          width: '100%',
          videoId: activeVideo.videoId,
          playerVars: {
            autoplay: 0,
            controls: 0,
            rel: 0,
            modestbranding: 1,
            disablekb: 1,
            fs: 0,
            iv_load_policy: 3,
            origin: typeof window !== 'undefined' ? window.location.origin : '',
          },
          events: {
            onReady: (event: any) => {
              addDebugLog("Player Event: onReady");
              setPlayerError(null);
              playerRef.current = event.target;
              event.target.setVolume(volume);
              
              if (typeof event.target.setPlaybackRate === 'function') {
                event.target.setPlaybackRate(playbackSpeed);
              }

              if (isMuted) {
                event.target.mute();
              } else {
                event.target.unMute();
              }
              setDuration(event.target.getDuration() || 0);
            },
            onStateChange: (event: any) => {
              const state = event.data;
              addDebugLog(`Player State Changed: ${state}`);
              if (state === 1) {
                setIsPlaying(true);
              } else {
                setIsPlaying(false);
              }

              if (event.target && typeof event.target.getDuration === 'function') {
                setDuration(event.target.getDuration() || 0);
              }
            },
            onError: (event: any) => {
              addDebugLog(`Player Event: onError (${event.data})`);
              let errMsg = "An error occurred loading the video.";
              if (event.data === 2) errMsg = "Invalid video ID parameter.";
              if (event.data === 5) errMsg = "HTML5 player playback error.";
              if (event.data === 100) errMsg = "Video not found / removed.";
              if (event.data === 101 || event.data === 150) {
                errMsg = "Playback restricted by owner (embedding disabled).";
              }
              setPlayerError(errMsg);
            }
          },
        });
      } catch (err: any) {
        addDebugLog(`YT.Player instantiation failed: ${err.message || err}`);
      }
    };

    const checkAndInit = () => {
      const win = window as any;
      if (win.YT && win.YT.Player && win.YT.Player.prototype) {
        addDebugLog("YT.Player prototype is ready.");
        initPlayer();
      } else if (win.YT && typeof win.YT.ready === 'function') {
        addDebugLog("YT namespace exists, waiting via YT.ready...");
        win.YT.ready(initPlayer);
      } else {
        addDebugLog("Waiting for YT library to download...");
        checkTimeoutId = setTimeout(checkAndInit, 150);
      }
    };

    let tag = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
    if (!tag) {
      addDebugLog("Injecting YouTube IFrame API script tag...");
      tag = document.createElement('script');
      (tag as HTMLScriptElement).src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    } else {
      addDebugLog("YouTube API script tag already present.");
    }

    checkAndInit();

    return () => {
      addDebugLog("Cleaning up player...");
      if (checkTimeoutId) clearTimeout(checkTimeoutId);
      if (player && typeof player.destroy === 'function') {
        try {
          player.destroy();
          addDebugLog("Player destroyed successfully.");
        } catch (e: any) {
          addDebugLog(`Error destroying player: ${e.message || e}`);
        }
      }
      playerRef.current = null;
    };
  }, [activeVideo.videoId]);

  useEffect(() => {
    let intervalId: any = null;

    if (isPlaying && playerRef.current) {
      intervalId = setInterval(() => {
        const player = playerRef.current;
        if (player && typeof player.getCurrentTime === 'function') {
          setCurrentTime(player.getCurrentTime());
          setBufferedFraction(player.getVideoLoadedFraction() || 0);
        }
      }, 250);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPlaying]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const handlePlayPause = () => {
    const player = playerRef.current;
    if (!player) return;
    if (isPlaying) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  };

  const skipBackward = () => {
    const player = playerRef.current;
    if (!player) return;
    try {
      const newTime = Math.max(0, player.getCurrentTime() - 10);
      player.seekTo(newTime, true);
      setCurrentTime(newTime);
      addDebugLog("Skipped back 10s");
    } catch (e: any) {
      addDebugLog(`Skip backward failed: ${e.message || e}`);
    }
  };

  const skipForward = () => {
    const player = playerRef.current;
    if (!player) return;
    try {
      const newTime = Math.min(duration, player.getCurrentTime() + 10);
      player.seekTo(newTime, true);
      setCurrentTime(newTime);
      addDebugLog("Skipped forward 10s");
    } catch (e: any) {
      addDebugLog(`Skip forward failed: ${e.message || e}`);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    const player = playerRef.current;
    if (player && typeof player.setPlaybackRate === 'function') {
      try {
        player.setPlaybackRate(speed);
        addDebugLog(`Speed changed to: ${speed}x`);
      } catch (e: any) {
        addDebugLog(`Set playback rate failed: ${e.message || e}`);
      }
    }
  };

  const handleToggleMute = () => {
    const player = playerRef.current;
    if (!player) return;
    if (isMuted) {
      player.unMute();
      setIsMuted(false);
    } else {
      player.mute();
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
    const player = playerRef.current;
    if (player && typeof player.setVolume === 'function') {
      player.setVolume(newVolume);
    }
    if (newVolume > 0 && isMuted) {
      if (player && typeof player.unMute === 'function') {
        player.unMute();
      }
      setIsMuted(false);
    }
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);
    setCurrentTime(newTime);
    const player = playerRef.current;
    if (player && typeof player.seekTo === 'function') {
      player.seekTo(newTime, true);
    }
  };

  const handleFullscreen = () => {
    const container = containerRef.current?.parentElement;
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return "0:00";
    const hrs = Math.floor(timeInSeconds / 3600);
    const mins = Math.floor((timeInSeconds % 3600) / 60);
    const secs = Math.floor(timeInSeconds % 60);

    if (hrs > 0) {
      return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="rounded-[2rem] border border-white/10 bg-[#060a1f] p-4 shadow-[0_0_60px_rgba(59,130,246,0.05)] overflow-hidden">
      <div className="flex flex-col lg:flex-row gap-4 h-auto lg:h-[600px]">
        {/* Left Side: Video List (30%) */}
        <div className="lg:w-[30%] bg-white/[0.02] rounded-3xl border border-white/5 p-4 flex flex-col h-[300px] lg:h-full">
          <div className="px-4 py-3 border-b border-white/5 mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-white">Session Recordings</h3>
              <p className="text-xs text-slate-400 mt-1">Past live classes</p>
            </div>
            {isAdmin && (
              <button
                onClick={handleSyncVideos}
                disabled={isSyncing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/80 hover:bg-blue-600 disabled:bg-slate-800 disabled:text-slate-500 text-xs font-bold text-white transition-all hover:scale-105 active:scale-95 disabled:scale-100 cursor-pointer shadow-md"
              >
                {isSyncing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                Sync
              </button>
            )}
          </div>
          {syncStatus && (
            <div className={`mx-4 mb-3 px-3 py-2 rounded-xl text-center text-xs font-semibold border ${
              syncStatus.type === "success" 
                ? "bg-green-500/10 border-green-500/20 text-green-400" 
                : "bg-red-500/10 border-red-500/20 text-red-400"
            }`}>
              {syncStatus.message}
            </div>
          )}
          <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
            {videos.map((video) => (
              <button 
                key={video.id} 
                onClick={() => {
                  setActiveVideo(video);
                  setIsPlaying(false);
                }}
                className={`w-full text-left p-4 rounded-2xl transition-all ${activeVideo.id === video.id ? 'bg-blue-500/10 border border-blue-500/20' : 'hover:bg-white/[0.05] border border-transparent'}`}
              >
                <div className="flex items-center gap-3">
                  <PlayCircle className={`w-8 h-8 flex-shrink-0 ${activeVideo.id === video.id ? 'text-blue-400' : 'text-slate-500'}`} />
                  <div>
                    <p className={`text-sm font-bold ${activeVideo.id === video.id ? 'text-white' : 'text-slate-300'}`}>{video.title}</p>
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 mt-1">{video.date}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Right Side: Secure Video Player (70%) */}
        <div className="lg:w-[70%] bg-black rounded-3xl relative flex flex-col overflow-hidden border border-white/5 min-h-[350px] lg:min-h-0">

          {/* React YouTube component mount point */}
          <div className="flex-1 w-full h-[75%] lg:h-[80%] relative bg-black flex items-center justify-center overflow-hidden">
            {/* Invisible Shield to block YouTube UI clicks */}
            <div 
              className="absolute inset-0 z-20" 
              onContextMenu={(e) => e.preventDefault()}
            ></div>

            <style dangerouslySetInnerHTML={{__html: `
              @keyframes float-watermark {
                0% { transform: translate(-30%, -30%) rotate(-12deg); }
                25% { transform: translate(30%, -15%) rotate(12deg); }
                50% { transform: translate(15%, 30%) rotate(-8deg); }
                75% { transform: translate(-25%, 20%) rotate(8deg); }
                100% { transform: translate(-30%, -30%) rotate(-12deg); }
              }
              .animate-float-watermark {
                animation: float-watermark 25s infinite linear;
              }
            `}} />

            {activeVideo.videoId ? (
              <>
                <div ref={containerRef} className="absolute inset-0 w-full h-full pointer-events-none" />
                
                {/* Floating Watermark for Screen Recording Protection */}
                <div className="absolute inset-0 z-30 pointer-events-none select-none flex items-center justify-center opacity-30">
                  <div className="text-white text-xs md:text-sm font-semibold tracking-wider bg-black/45 px-3 py-1.5 rounded-full border border-white/10 whitespace-nowrap animate-float-watermark">
                    {userEmail}
                  </div>
                </div>

                {/* Diagnostic Overlay for Admins */}
                {isAdmin && (
                  <div className="absolute top-4 left-4 z-40 bg-black/90 text-[10px] text-green-400 p-2.5 rounded-xl font-mono border border-green-500/20 max-w-[280px] pointer-events-auto select-text max-h-[140px] overflow-y-auto custom-scrollbar">
                    <div className="font-bold border-b border-green-500/20 pb-1 mb-1 flex justify-between items-center">
                      <span>DIAGNOSTICS PANEL</span>
                      <button onClick={() => setDebugLogs([])} className="text-red-400 hover:underline">Clear</button>
                    </div>
                    {debugLogs.length === 0 ? (
                      <div className="text-gray-500">No logs captured...</div>
                    ) : (
                      debugLogs.map((log, idx) => (
                        <div key={idx} className="leading-tight mb-0.5 break-all">{log}</div>
                      ))
                    )}
                  </div>
                )}

                {/* Video Load/Error States */}
                {playerError && (
                  <div className="absolute inset-0 bg-black/95 z-35 flex flex-col items-center justify-center text-center p-4">
                    <HelpCircle className="w-10 h-10 text-red-500 mb-2" />
                    <p className="text-white text-sm font-bold">{playerError}</p>
                    <p className="text-slate-500 text-xs mt-1">Please verify YouTube channel embedding permissions.</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center z-40 relative">
                <Lock className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Recording Unavailable</p>
                <p className="text-xs text-slate-500 mt-2">Session recording will appear here once ready.</p>
              </div>
            )}
          </div>

          {/* Custom Controls */}
          <div className="bg-[#060a1f] p-4 flex flex-col justify-center z-40 border-t border-white/10 h-auto min-h-[90px] lg:h-[20%]">
            {activeVideo.videoId ? (
              <div className="w-full flex flex-col gap-3">
                {/* Timeline Slider with custom tracks */}
                <div className="relative w-full group flex items-center h-4">
                  {/* Background Track */}
                  <div className="absolute left-0 right-0 h-1 rounded-full bg-white/10 pointer-events-none" />
                  
                  {/* Buffer Bar */}
                  <div 
                    className="absolute left-0 h-1 rounded-full bg-white/20 pointer-events-none transition-all duration-300"
                    style={{ width: `${bufferedFraction * 100}%` }}
                  />
                  
                  {/* Progress Bar */}
                  <div 
                    className="absolute left-0 h-1 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 pointer-events-none"
                    style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                  />

                  {/* Slider Thumb */}
                  <div 
                    className="absolute w-3 h-3 rounded-full bg-blue-400 border border-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none transform -translate-x-1/2"
                    style={{ left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                  />

                  {/* Input Range for Seeking */}
                  <input 
                    type="range"
                    min={0}
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleSeekChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                </div>

                {/* Controls Toolbar Row */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between w-full gap-3.5 sm:gap-0">
                  {/* Left side / Top Row on Mobile: Play/Pause/Skip & Time */}
                  <div className="flex items-center justify-between sm:justify-start gap-4">
                    <div className="flex items-center gap-3.5">
                      {/* Skip Backward 10s */}
                      <button
                        onClick={skipBackward}
                        className="text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center justify-center p-1"
                        title="Skip Backward 10s"
                      >
                        <RotateCcw className="w-5 h-5" />
                      </button>

                      {/* Play/Pause Button */}
                      <button 
                        onClick={handlePlayPause}
                        className="text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center justify-center p-1"
                        title={isPlaying ? "Pause" : "Play / Continue"}
                      >
                        {isPlaying ? (
                          <Pause className="w-5 h-5" />
                        ) : (
                          <Play className="w-5 h-5" fill="currentColor" />
                        )}
                      </button>

                      {/* Skip Forward 10s */}
                      <button
                        onClick={skipForward}
                        className="text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center justify-center p-1"
                        title="Skip Forward 10s"
                      >
                        <RotateCw className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Time Display */}
                    <div className="text-xs font-semibold text-slate-400 tracking-wider font-mono">
                      {formatTime(currentTime)} <span className="text-slate-600">/</span> {formatTime(duration)}
                    </div>
                  </div>

                  {/* Right side / Bottom Row on Mobile: Volume, speed, fullscreen */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-3">
                    {/* Mute/Volume controls */}
                    <div className="flex items-center gap-2 group/volume relative">
                      <button 
                        onClick={handleToggleMute}
                        className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1"
                        title={isMuted ? "Unmute" : "Mute"}
                      >
                        {isMuted || volume === 0 ? (
                          <VolumeX className="w-5 h-5" />
                        ) : (
                          <Volume2 className="w-5 h-5" />
                        )}
                      </button>
                      
                      {/* Sleek volume slider that is slightly visible on mobile, expands on desktop hover */}
                      <input 
                        type="range"
                        min={0}
                        max={100}
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-16 sm:w-0 sm:group-hover/volume:w-20 transition-all duration-300 h-1 bg-white/20 accent-blue-500 rounded-full cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={playbackSpeed}
                        onChange={(e) => handleSpeedChange(Number(e.target.value))}
                        className="bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-300 outline-none cursor-pointer transition-colors"
                        title="Playback Speed"
                      >
                        <option value={0.25} className="bg-[#060a1f] text-slate-300">0.25x</option>
                        <option value={0.5} className="bg-[#060a1f] text-slate-300">0.5x</option>
                        <option value={0.75} className="bg-[#060a1f] text-slate-300">0.75x</option>
                        <option value={1} className="bg-[#060a1f] text-slate-300">1.0x (Normal)</option>
                        <option value={1.25} className="bg-[#060a1f] text-slate-300">1.25x</option>
                        <option value={1.5} className="bg-[#060a1f] text-slate-300">1.5x</option>
                        <option value={1.75} className="bg-[#060a1f] text-slate-300">1.75x</option>
                        <option value={2} className="bg-[#060a1f] text-slate-300">2.0x</option>
                      </select>

                      <span className="hidden md:inline text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 select-none">
                        Skillyug Player
                      </span>

                      <button 
                        onClick={handleFullscreen}
                        className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1"
                        title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                      >
                        {isFullscreen ? (
                          <Minimize2 className="w-5 h-5" />
                        ) : (
                          <Maximize2 className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center w-full">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-widest select-none">
                  No active recording
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MyBatchPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<BatchUser | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [hasSlotAccess, setHasSlotAccess] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  // Certificate modal state
  const [showCertModal, setShowCertModal] = useState(false);
  const [certStudentName, setCertStudentName] = useState("");
  const [certParentName, setCertParentName] = useState("");
  const [certError, setCertError] = useState("");
  const [generatedCerts, setGeneratedCerts] = useState<{ student: { downloadUrl: string }; parent?: { downloadUrl: string } } | null>(null);
  const [isBlurred, setIsBlurred] = useState(false);

  // Support Ticket State
  const [showTicketModal, setShowTicketModal] = useState(false);
  
  // Video Player State
  const [activeVideo, setActiveVideo] = useState(MOCK_VIDEOS[0]);
  const [videos, setVideos] = useState<any[]>(MOCK_VIDEOS);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Custom states for onboarding & sponsorship flow
  const [isParentViewOnly, setIsParentViewOnly] = useState(false);
  const [viewOnlyStudentName, setViewOnlyStudentName] = useState("");
  const [sponsorLoading, setSponsorLoading] = useState(false);
  const [sponsorToken, setSponsorToken] = useState("");
  const [showSponsorModal, setShowSponsorModal] = useState(false);
  const [liveSession, setLiveSession] = useState<{
    title: string;
    scheduled_at: string;
    join_url: string;
  } | null>(null);

  const [copiedSponsor, setCopiedSponsor] = useState(false);

  const handleShareSponsor = async () => {
    const credText = `Hey! I want to join the Skillyug AI Bootcamp to learn future tech. Click here to sponsor my enrollment: ${sponsorUrl}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Sponsor Skillyug AI Bootcamp",
          text: credText,
          url: sponsorUrl
        });
        return;
      } catch (err) {
        console.log("Error sharing:", err);
      }
    }
    
    // Clipboard fallback
    try {
      await navigator.clipboard.writeText(sponsorUrl);
      setCopiedSponsor(true);
      setTimeout(() => setCopiedSponsor(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  useEffect(() => {
    if (!user) return;

    const isPaid = hasSlotAccess || user.email === "eternallytanuj@gmail.com" || isAdmin || isParentViewOnly;
    if (!isPaid) return;

    const fetchVideos = async () => {
      try {
        const { data: recordings, error } = await supabase
          .from("session_recordings")
          .select("id, title, custom_date, youtube_video_id")
          .order("published_at", { ascending: false });

        if (error) {
          console.error("Error fetching session recordings:", error);
          return;
        }

        const mappedRecordings = (recordings || [])
          .filter((rec: any) => {
            const titleLower = (rec.title || "").toLowerCase();
            return titleLower !== "deleted video" && titleLower !== "private video";
          })
          .map((rec: any, idx: number) => ({
            id: rec.id || `db-${idx}`,
            title: rec.title,
            date: rec.custom_date || "Unknown Date",
            videoId: rec.youtube_video_id
          }));

        const combined = [...mappedRecordings];
        if (combined.length < MOCK_VIDEOS.length) {
          for (let i = combined.length; i < MOCK_VIDEOS.length; i++) {
            combined.push({
              ...MOCK_VIDEOS[i],
              id: `mock-${i}`
            });
          }
        }

        setVideos(combined);
        const firstPlayable = combined.find(v => v.videoId) || combined[0];
        setActiveVideo(firstPlayable);
      } catch (err) {
        console.error("Failed to load videos from Supabase:", err);
      }
    };

    fetchVideos();
  }, [user, hasSlotAccess, isAdmin]);

  useEffect(() => {
    if (!user) return;
    const isPaid = hasSlotAccess || user.email === "eternallytanuj@gmail.com" || isAdmin || isParentViewOnly;
    if (!isPaid) return;

    const fetchLiveSession = async () => {
      try {
        const res = await fetch("/api/my-batch/live-session");
        if (res.ok) {
          const data = await res.json();
          if (data.session) {
            setLiveSession(data.session);
          }
        }
      } catch (err) {
        console.error("Failed to load live session details:", err);
      }
    };

    fetchLiveSession();
  }, [user, hasSlotAccess, isAdmin, isParentViewOnly]);


  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
  const [ticketStatus, setTicketStatus] = useState<{type: "success" | "error", message: string} | null>(null);

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketMessage.trim() || !ticketSubject.trim()) return;
    
    setIsSubmittingTicket(true);
    setTicketStatus(null);
    try {
      const sessionResponse = await supabase.auth.getSession();
      const token = sessionResponse.data.session?.access_token;
      
      const res = await fetch("/api/support/ticket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ subject: ticketSubject.trim(), message: ticketMessage.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit ticket");
      
      setTicketStatus({ type: "success", message: "Ticket submitted successfully! Our team will reach out to you." });
      setTicketSubject("");
      setTicketMessage("");
    } catch (err: any) {
      setTicketStatus({ type: "error", message: err.message });
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  useEffect(() => {
    const handleBlur = () => setIsBlurred(true);
    const handleFocus = () => setIsBlurred(false);

    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // Opens the name-collection modal pre-filled with the user's name
  const openCertModal = () => {
    if (!user || isGenerating) return;
    setCertStudentName(user.fullName);
    setCertParentName("");
    setCertError("");
    setGeneratedCerts(null);
    setShowCertModal(true);
  };

  const handleGenerateCertificates = async () => {
    if (!certStudentName.trim()) {
      setCertError("Please enter the student's name.");
      return;
    }
    try {
      setIsGenerating(true);
      setCertError("");
      // NOTE: do NOT close the modal here — we need it open to show results or errors

      const res = await fetch("/api/certificate/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: certStudentName.trim(),
          parentName: certParentName.trim(),
          userId: (await supabase.auth.getSession()).data.session?.user.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate certificate");
      if (!data.student?.downloadUrl) throw new Error("No download URL returned from server");

      // Show download buttons inside the modal
      setGeneratedCerts({
        student: data.student,
        parent: data.parent || undefined,
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Could not generate certificates.";
      // Show error inline so it's always visible (modal stays open)
      setCertError(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSyncVideos = async () => {
    setIsSyncing(true);
    setSyncStatus(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Session not found. Please log in.");
      }

      const res = await fetch("/api/videos/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        }
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Sync request failed.");
      }

      setSyncStatus({
        type: "success",
        message: `Synced ${data.count} videos successfully!`
      });

      // Fetch the updated recordings lists immediately
      const { data: recordings, error } = await supabase
        .from("session_recordings")
        .select("id, title, custom_date, youtube_video_id")
        .order("published_at", { ascending: false });

      if (error) {
        console.error("Error fetching updated recordings:", error);
      } else if (recordings) {
        const mappedRecordings = recordings.map((rec: any, idx: number) => ({
          id: rec.id || `db-${idx}`,
          title: rec.title,
          date: rec.custom_date || "Unknown Date",
          videoId: rec.youtube_video_id
        }));

        const combined = [...mappedRecordings];
        if (combined.length < MOCK_VIDEOS.length) {
          for (let i = combined.length; i < MOCK_VIDEOS.length; i++) {
            combined.push({
              ...MOCK_VIDEOS[i],
              id: `mock-${i}`
            });
          }
        }
        setVideos(combined);
        const firstPlayable = combined.find(v => v.videoId) || combined[0];
        setActiveVideo(firstPlayable);
      }
    } catch (err: any) {
      setSyncStatus({
        type: "error",
        message: err.message || "Failed to synchronize videos."
      });
    } finally {
      setIsSyncing(false);
      setTimeout(() => {
        setSyncStatus(null);
      }, 5000);
    }
  };

  useEffect(() => {
    const loadSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/onboarding");
        return;
      }

      // Check if viewing in Parent View-Only Mode
      const urlParams = new URLSearchParams(window.location.search);
      const viewOnly = urlParams.get("viewOnly") === "true";
      const studentId = urlParams.get("studentId");

      if (viewOnly && studentId) {
        // Authenticated user must be parent, and must be linked to studentId
        const { data: relation, error: relationError } = await supabase
          .from("student_parent_relations")
          .select("parent_id")
          .eq("student_id", studentId)
          .eq("parent_id", session.user.id)
          .maybeSingle();

        if (relationError || !relation) {
          console.error("Parent-student relation not verified or error occurred:", relationError);
          router.replace("/onboarding");
          return;
        }

        // Fetch student's profile information to display
        const { data: studentProfile, error: profileError } = await supabase
          .from("users")
          .select("id, email, full_name")
          .eq("id", studentId)
          .maybeSingle();

        if (profileError || !studentProfile) {
          console.error("Student profile fetch failed:", profileError);
          router.replace("/onboarding");
          return;
        }

        // Set state for view-only student
        setIsParentViewOnly(true);
        setViewOnlyStudentName(studentProfile.full_name || "Skillyug Student");
        setUserId(studentId);
        setHasSlotAccess(true); // Parent view-only unlocks all modules
        setUser({
          avatarUrl: null,
          batchLabel: "Summer AI Creator Cohort (Parent View Only)",
          email: studentProfile.email,
          fullName: studentProfile.full_name || "Student Profile",
        });
        setLoading(false);
        return;
      }

      // Check admin status immediately
      let isAdminUser = false;
      try {
        const { data: adminRow } = await supabase
          .from("admins")
          .select("id")
          .eq("user_id", session.user.id)
          .maybeSingle();
        isAdminUser = !!adminRow;
        setIsAdmin(isAdminUser);
      } catch (err) {
        console.error("Error checking admin status:", err);
      }

      // Fetch from API
      let hasAccess = false;
      let slotAccess = false;
      let role = "student";
      try {
        const res = await fetch("/api/my-batch/access", {
          method: "GET",
          credentials: "same-origin",
          headers: {
            "Authorization": `Bearer ${session.access_token}`,
            "Cache-Control": "no-cache",
          },
        });
        if (res.ok) {
          const data = await res.json();
          hasAccess = Boolean(data.hasAccess);
          slotAccess = Boolean(data.hasSlot);
          role = data.role || "student";
          try {
            sessionStorage.setItem(
              "mybatch_access",
              JSON.stringify({ value: { hasAccess, hasSlot: slotAccess, role }, expiry: Date.now() + 5 * 60 * 1000 })
            );
          } catch { /* ignore */ }
        } else {
          console.error("[MyBatch] Access API status:", res.status);
        }
      } catch (e) {
        console.error("[MyBatch] Access fetch error:", e);
      }

      if (role === "parent") {
        router.replace("/parent-portal");
        return;
      }

      if (!hasAccess && !isAdminUser) {
        router.replace("/onboarding");
        return;
      }

      const fullName = session.user.user_metadata?.full_name || "Skillyug Student";
      const avatarUrl = session.user.user_metadata?.avatar_url || null;

      setHasSlotAccess(slotAccess);
      setUserId(session.user.id);
      setUser({
        avatarUrl,
        batchLabel: "Summer AI Creator Cohort",
        email: session.user.email ?? "",
        fullName,
      });
      setLoading(false);
    };

    loadSession();
  }, [router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center text-slate-200">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  const handleAskParentToPay = async () => {
    setSponsorLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch("/api/enroll/sponsor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setSponsorToken(data.token);
        setShowSponsorModal(true);
      } else {
        alert("Failed to generate sponsorship token. Please try again.");
      }
    } catch (err) {
      console.error("Sponsor generation failed:", err);
    } finally {
      setSponsorLoading(false);
    }
  };

  const sponsorUrl = typeof window !== "undefined" ? `${window.location.origin}/sponsor/${sponsorToken}` : "";
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
    `Hey! I want to join the Skillyug AI Bootcamp to learn future tech. Click here to sponsor my enrollment: ${sponsorUrl}`
  )}`;

  const isPaidUser = hasSlotAccess || user.email === "eternallytanuj@gmail.com" || isAdmin || isParentViewOnly;
  // Only allowlisted users can download the certificate
  const CERT_ALLOWED_UIDS = ["9627ec86-c86d-4fce-8e13-6e8f3f157a83"];
  const canDownloadCert =
    user.email === "eternallytanuj@gmail.com" ||
    (userId !== null && CERT_ALLOWED_UIDS.includes(userId));

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-100 relative overflow-x-hidden select-none">
      {isParentViewOnly && (
        <>
          <style dangerouslySetInnerHTML={{ __html: `
            header.fixed, header {
              top: 2.75rem !important;
              transition: top 0.3s ease !important;
            }
            .parent-banner-btn:hover .arrow-icon {
              transform: translateX(-3px);
            }
            /* Add top padding shift to the main container if parent banner is visible */
            main {
              padding-top: 2.75rem !important;
            }
          `}} />
          <div className="fixed top-0 inset-x-0 h-11 bg-[#090d1a]/95 backdrop-blur-md border-b border-blue-500/30 z-[100] flex items-center justify-between px-4 sm:px-6 shadow-lg select-none">
            <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
              <div className="hidden sm:flex w-6 h-6 rounded-lg bg-blue-500/15 border border-blue-500/30 items-center justify-center flex-shrink-0 animate-pulse">
                <BadgeCheck className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-left min-w-0">
                <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider text-blue-400 block font-mono">Parent Oversight</span>
                <span className="text-[10px] sm:text-xs font-semibold text-slate-200 block truncate">
                  <span className="hidden sm:inline">Viewing </span>{viewOnlyStudentName}
                </span>
              </div>
            </div>
            
            <button
              onClick={() => router.push("/parent-portal")}
              className="parent-banner-btn flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-1.5 rounded-full bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 hover:border-blue-500/50 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-blue-300 hover:text-white transition-all shadow-[0_2px_8px_rgba(59,130,246,0.05)] cursor-pointer active:scale-95 duration-200 flex-shrink-0"
            >
              <span className="arrow-icon transition-transform duration-200 text-xs">←</span>
              <span className="hidden sm:inline">Back to </span>Parent Portal
            </button>
          </div>
        </>
      )}
      {/* Screen recording deterrence overlay */}
      {isBlurred && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#020617]/95 backdrop-blur-3xl px-4 text-center">
          <EyeOff className="w-16 h-16 text-slate-400 mb-6" />
          <h2 className="text-2xl font-black text-white tracking-tight">Content Protected</h2>
          <p className="mt-2 text-slate-400 text-sm max-w-md mx-auto">
            For security reasons, this dashboard is hidden when the window loses focus. Please click back into the window to continue.
          </p>
        </div>
      )}
      <div className="fixed inset-0 pointer-events-none opacity-50 z-0 bg-slate-50 dark:bg-[#020617]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.04),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(168,85,247,0.04),_transparent_28%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.03)_1px,transparent_1px)] bg-[size:72px_72px]" />
      </div>

      <Navbar />

      <section className="relative z-10 px-6 pt-24 md:pt-32 pb-12 md:pb-16 lg:px-12">
        <div className="max-w-7xl mx-auto space-y-10">
          {isPaidUser && <FirstClassCountdown />}
          {isPaidUser ? (
            <>

          {/* Top Section: Profile & Circular Progress */}
          <div className="grid grid-cols-1 gap-6 md:gap-8 xl:grid-cols-[1.35fr_0.65fr]">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6 md:p-6 md:p-10 shadow-[0_0_60px_rgba(59,130,246,0.08)] self-start">
              <div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-[0.28em] text-blue-300">
                <span className="rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2">
                  My Batch Workspace
                </span>
                <span className="text-slate-500">Live cohort dashboard</span>
              </div>
              <div className="mt-8 pt-8 border-t border-white/5">
                <div className="flex items-center gap-4">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={`${user.fullName} profile`}
                      className="h-16 w-16 rounded-full border border-white/10 object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-blue-500/10 text-xl font-black text-blue-200">
                      {user?.fullName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-2xl font-black text-white">{user?.fullName}</p>
                    <p className="mt-1 text-sm uppercase tracking-[0.24em] text-slate-400">
                      {user?.batchLabel}
                    </p>
                  </div>
                </div>
                <p className="mt-6 text-sm text-slate-300 break-all">{user?.email}</p>
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 dark:border-white/5 bg-white dark:bg-[#090d1f] p-6 md:p-8 shadow-sm flex flex-col items-center justify-center relative">
              <p className="absolute top-6 left-6 md:top-8 md:left-8 text-[11px] font-bold uppercase tracking-[0.28em] text-slate-400">
                Bootcamp Progress
              </p>
              <div className="relative mt-8 w-40 h-40 flex items-center justify-center">
                {/* SVG Circle for Pie Graph (0% completion) */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background Circle */}
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" strokeWidth="12" className="text-slate-200 dark:text-slate-800" />
                  {/* Progress Circle (0% of 251.2 circumference = 0) */}
                  <circle 
                    cx="50" cy="50" r="40" fill="transparent" stroke="#3b82f6" strokeWidth="12"
                    strokeDasharray="251.2" strokeDashoffset="251.2"
                    className="drop-shadow-[0_2px_8px_rgba(59,130,246,0.15)]"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl md:text-3xl font-black text-white">0%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Section 1: Next Live Session & Locked Certificate */}
          <div className="grid grid-cols-1 gap-6 md:gap-8 xl:grid-cols-2">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6 md:p-8 shadow-[0_0_60px_rgba(59,130,246,0.08)]">
              <div className="flex items-center gap-3">
                <Calendar className="h-6 w-6 text-blue-300" />
                <h2 className="text-2xl font-black tracking-tight">Next Live Session</h2>
              </div>
              {liveSession ? (
                <div className="mt-8 rounded-[1.5rem] border border-white/8 bg-slate-950/40 p-5 md:p-6 flex flex-col justify-between min-h-[200px] hover:border-white/15 transition-all duration-300 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-[40px] rounded-full group-hover:bg-blue-500/10 transition-colors pointer-events-none"></div>
                  <div>
                    <h3 className="text-lg font-black text-white group-hover:text-blue-300 transition-colors">
                      {liveSession.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-2 font-medium">
                      {new Date(liveSession.scheduled_at).toLocaleString('en-IN', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                        timeZone: 'Asia/Kolkata'
                      }) + " IST"}
                    </p>
                  </div>
                  
                  <div className="mt-6 flex flex-wrap gap-3">
                    <a
                      href={liveSession.join_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white uppercase tracking-wider transition-all hover:scale-[1.03] active:scale-[0.97]"
                    >
                      <Video className="w-4 h-4" />
                      Join Live Meeting
                    </a>
                    
                    <a
                      href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(liveSession.title)}&dates=${
                        (() => {
                          const start = new Date(liveSession.scheduled_at);
                          const end = new Date(start.getTime() + 90 * 60 * 1000);
                          const toGCalISO = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
                          return `${toGCalISO(start)}/${toGCalISO(end)}`;
                        })()
                      }&details=Join+live+session+at:+${encodeURIComponent(liveSession.join_url)}&sf=true`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.03] text-xs font-bold text-slate-200 uppercase tracking-wider transition-all hover:bg-white/[0.08] hover:text-white hover:scale-[1.03] active:scale-[0.97]"
                    >
                      <Clock className="w-4 h-4 text-blue-300" />
                      Add to Calendar
                    </a>
                  </div>
                </div>
              ) : (
                <div className="mt-8 rounded-[1.5rem] border border-white/8 bg-slate-950/40 p-6 md:p-8 flex flex-col items-center justify-center min-h-[200px]">
                  <p className="text-xl font-black text-slate-500 uppercase tracking-widest">
                    None
                  </p>
                </div>
              )}
            </div>

            {/* Certificate Card — unlocked only for allowlisted users */}
            {canDownloadCert ? (
              <div className="rounded-[2rem] border border-blue-500/20 bg-gradient-to-br from-blue-600/20 to-purple-500/10 p-6 md:p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] relative overflow-hidden flex flex-col justify-center group">
                <div className="absolute -right-12 -top-12 w-32 h-32 bg-blue-500/10 blur-[60px] rounded-full transition-opacity group-hover:opacity-100 opacity-50"></div>
                
                <div className="flex items-start justify-between gap-4">
                  <div className="rounded-2xl border border-white/10 bg-blue-500/20 p-4 shadow-inner">
                    <BadgeCheck className="h-6 w-6 text-blue-300" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.26em] text-blue-300">
                    OFFICIAL
                  </span>
                </div>
                <h3 className="mt-8 text-2xl font-black tracking-tight text-white">
                  Certificate of Attendance
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  Claim your official Skillyug AI Education Bootcamp certificate. Includes a unique verification ID and scannable QR.
                </p>
                <button
                  type="button"
                  onClick={openCertModal}
                  disabled={isGenerating}
                  className="mt-8 w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-xs font-bold uppercase tracking-[0.24em] text-white transition-all hover:bg-blue-500 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      Download Certificate
                      <Download className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* Locked Certificate — shown to everyone else */
              <div className="rounded-[2rem] border border-slate-200 dark:border-white/5 bg-white dark:bg-[#090d1f] p-6 md:p-8 shadow-sm relative overflow-hidden flex flex-col justify-center">
                {/* Blurred background content */}
                <div className="absolute inset-0 p-6 md:p-8 blur-[10px] opacity-25 pointer-events-none select-none flex flex-col justify-center transition-all duration-500 hover:blur-[6px] hover:opacity-40">
                  <div className="flex items-start justify-between gap-4">
                    <div className="rounded-2xl border border-slate-200 dark:border-white/5 bg-blue-50 dark:bg-blue-950/30 p-4">
                      <BadgeCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.26em] text-blue-600">
                      OFFICIAL
                    </span>
                  </div>
                  <h3 className="mt-8 text-2xl font-black tracking-tight text-white">
                    Certificate of Attendance
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-300">
                    Claim your official Skillyug AI Education Bootcamp certificate. Includes a unique verification ID and scannable QR.
                  </p>
                  <div className="mt-8 w-full rounded-xl bg-blue-600/30 py-5" />
                </div>

                {/* Lock overlay */}
                <div className="relative z-10 flex flex-col items-center justify-center text-center">
                  <div className="rounded-full bg-slate-100 dark:bg-[#020617] p-5 border border-slate-200 dark:border-white/5 mb-6 shadow-md relative">
                    <Lock className="w-8 h-8 text-slate-600 dark:text-slate-400" />
                    {/* Chain element */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-1.5 bg-slate-300/80 dark:bg-slate-700 rotate-45 pointer-events-none rounded-full blur-[0.5px]" />
                  </div>
                  <h3 className="text-xl font-black text-white tracking-tight">Certificate Locked</h3>
                  <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.2em] text-blue-300 max-w-[200px] mx-auto leading-relaxed">
                    Complete the course to download certificate
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Middle Section 2: Resource Library */}
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] backdrop-blur-xl p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/8 pb-5">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-slate-400">
                  Curriculum Resources
                </p>
                <h2 className="mt-3 text-2xl md:text-3xl font-black tracking-tight">Your resource library</h2>
              </div>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-1 max-w-xl">
              {resourceCards.map((card) => {
                const Icon = card.icon;
                return (
                  <article
                    key={card.title}
                    className={`rounded-[1.75rem] border border-slate-200 dark:border-white/5 bg-white dark:bg-[#090d1f] p-6 shadow-sm`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-[#020617] p-4">
                        <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.26em] text-slate-500">
                        {card.meta}
                      </span>
                    </div>
                    <h3 className="mt-8 text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                      {card.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      {card.description}
                    </p>
                    <button
                      type="button"
                      className="mt-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-blue-600 transition-colors hover:text-blue-700"
                    >
                      Download
                      <Download className="h-4 w-4" />
                    </button>
                  </article>
                );
              })}
            </div>
          </div>

          {/* Middle Section 3: Secure Video Player */}
          <SecureVideoPlayer
            videos={videos}
            activeVideo={activeVideo}
            setActiveVideo={setActiveVideo}
            isAdmin={isAdmin}
            isSyncing={isSyncing}
            syncStatus={syncStatus}
            handleSyncVideos={handleSyncVideos}
            userEmail={user?.email || "student@skillyug.com"}
          />

          {/* Bottom Section: Bootcamp Calendar */}
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6 md:p-8">
            <BatchCalendar hasSlot={hasSlotAccess} />
          </div>

          {/* Discount Voucher Section */}
          <div className="max-w-md mx-auto pt-6">
            <VoucherCard />
          </div>
        
            </>
          ) : (
            <>
              {/* Syllabus & Instructor Bios */}
              <div className="grid grid-cols-1 gap-6 md:gap-8 xl:grid-cols-[1.35fr_0.65fr]">
                <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6 md:p-10 shadow-[0_0_60px_rgba(59,130,246,0.08)] self-start">
                  <div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-[0.28em] text-blue-300">
                    <span className="rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2">
                      Syllabus
                    </span>
                    <span className="text-slate-500 font-medium">Bootcamp Course Outline</span>
                  </div>
                  
                  <div className="mt-8 space-y-5">
                    {[
                      { topic: "Session 1: Generative AI Foundations", desc: "Learn Prompt Engineering, ChatGPT frameworks, and how LLMs work." },
                      { topic: "Session 2: Visual Creation with Canva AI", desc: "Generate professional social media assets and graphics using AI design tools." },
                      { topic: "Session 3: Dynamic Presentations with Gamma", desc: "Build gorgeous landing pages and presentation decks in under 5 minutes using Gamma." },
                      { topic: "Session 4: Advanced Prompting & LLMs", desc: "Deep dive into context windows, system prompts, and multi-turn AI reasoning." },
                      { topic: "Session 5: Capstone Project Showcase", desc: "Build and deploy your first end-to-end AI agent product and earn certification." }
                    ].map((item, idx) => (
                      <div key={idx} className="flex gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center font-bold text-xs text-blue-300">
                          {idx + 1}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-white">{item.topic}</h4>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-900/90 via-slate-950/85 to-[#090d1f] p-6 md:p-8 shadow-[0_0_80px_rgba(124,77,255,0.12)] flex flex-col justify-between min-h-[420px]">
                  <div className="space-y-6">
                    <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-slate-400">
                      Instructors
                    </p>
                    
                    <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                      <img
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBKcLNe4nCx6jDQ4EVV_02UM6m6QJi_0LiI7l7BOYGCvUfePGpBf-4iq0oD97lRJqplgkKfvQWD0GBG99GEyd5o7D02N-7QpzqTdXC4UupM-OfyKFoKrQi8DHlPUrvTCvJQQ4DSYmJHKMrwmmGcspe4XyEhsPcvtyRW5UHFUk1gh7Oq1ax02nkjQ7vXBzrilSRlKcbMzcGwTuJpnS6BO9md1N6C7rmanrP1-JFEYbcgO-oyUxhepXupvaNomp79iKCHAibUpyvnVGU"
                        alt="Tanuj Pathak"
                        className="h-14 w-14 rounded-full border border-white/10 object-cover"
                      />
                      <div>
                        <p className="text-base font-black text-white">Tanuj Pathak</p>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-blue-300 mt-0.5">Lead Mentor</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-medium">
                      Ex-software architect specializing in generative AI applications and systems. Tanuj mentors students in classes 6-12 on building functional projects using advanced AI tools.
                    </p>
                  </div>

                  <div className="mt-8 rounded-[1.5rem] border border-blue-400/15 bg-blue-500/10 px-5 py-4 flex gap-3 items-center">
                    <Sparkles className="h-5 w-5 text-blue-300 flex-shrink-0 animate-pulse" />
                    <div>
                      <p className="text-xs font-bold text-white uppercase tracking-wider">Cohort Identity</p>
                      <p className="text-[11px] text-slate-300 mt-0.5">Summer AI Creator Cohort</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Locked Modules Preview with Ask Parent CTA */}
              <div className="relative rounded-[2rem] border border-white/10 bg-slate-950/40 p-1 overflow-hidden min-h-[450px] flex items-center justify-center">
                {/* Blurred content representations */}
                <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 blur-md opacity-25 select-none pointer-events-none">
                  <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 space-y-4">
                    <div className="h-10 w-24 bg-white/10 rounded-xl" />
                    <div className="h-6 w-48 bg-white/10 rounded-lg" />
                    <div className="h-16 w-full bg-white/10 rounded-xl" />
                  </div>
                  
                  <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 space-y-4">
                    <div className="h-10 w-24 bg-white/10 rounded-xl" />
                    <div className="h-6 w-48 bg-white/10 rounded-lg" />
                    <div className="h-16 w-full bg-white/10 rounded-xl" />
                  </div>
                </div>

                {/* Glassmorphic overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-black/40 backdrop-blur-[5px] z-30">
                  <div className="w-20 h-20 rounded-full bg-slate-950/95 border border-white/15 shadow-2xl flex items-center justify-center relative mb-6">
                    <Lock className="w-8 h-8 text-blue-300 animate-pulse" />
                    <div className="absolute inset-0 bg-blue-500/10 blur-xl rounded-full" />
                  </div>
                  
                  <h3 className="text-2xl font-black text-white tracking-tight">AI Learning Modules Locked</h3>
                  <p className="mt-3 text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                    Access to 5+ hours of recorded classes, project resources, calendars, and certificates is locked. Ask a parent to sponsor your slot enrollment.
                  </p>

                  <button
                    type="button"
                    onClick={handleAskParentToPay}
                    disabled={sponsorLoading}
                    className="mt-8 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3.5 text-xs font-bold uppercase tracking-[0.24em] text-white hover:scale-[1.03] transition-all duration-200 active:scale-[0.98] disabled:opacity-50 shadow-[0_0_20px_rgba(59,130,246,0.3)] border border-white/10"
                  >
                    {sponsorLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating Link...
                      </>
                    ) : (
                      <>
                        Ask a Parent to Pay
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── Certificate Name Modal ──────────────────────────────────── */}
      {(showCertModal || isGenerating) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(2,6,23,0.85)", backdropFilter: "blur(12px)" }}
        >
          <div className="relative w-full max-w-md rounded-[2rem] border border-white/10 bg-white/[0.06] backdrop-blur-xl p-6 md:p-8 shadow-[0_0_80px_rgba(59,130,246,0.15)]">
            {/* Close button */}
            <button
              onClick={() => setShowCertModal(false)}
              className="absolute top-5 right-6 text-slate-400 hover:text-white transition-colors text-2xl leading-none"
              aria-label="Close modal"
            >
              ×
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-xl border border-blue-400/20 bg-blue-500/15 p-3">
                <BadgeCheck className="h-5 w-5 text-blue-300" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-slate-400">Certificate</p>
                <h3 className="text-lg font-black text-white">Enter Names</h3>
              </div>
            </div>

            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              {generatedCerts 
                ? "Your certificates are ready! Click the buttons below to download them."
                : "We'll generate two certificates — one for the student and one for the parent."
              }
            </p>

            {generatedCerts ? (
              <div className="space-y-4">
                <a
                  href={generatedCerts.student.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between w-full rounded-xl border border-blue-400/30 bg-blue-500/10 p-4 transition-all hover:bg-blue-500/20 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-blue-500/20 p-2">
                      <Download className="h-4 w-4 text-blue-300" />
                    </div>
                    <span className="text-sm font-bold text-white">Student Certificate</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </a>

                {generatedCerts.parent && (
                  <a
                    href={generatedCerts.parent.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between w-full rounded-xl border border-purple-400/30 bg-purple-500/10 p-4 transition-all hover:bg-purple-500/20 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-purple-500/20 p-2">
                        <Download className="h-4 w-4 text-purple-300" />
                      </div>
                      <span className="text-sm font-bold text-white">Parent Certificate</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </a>
                )}

                <button
                  onClick={() => setShowCertModal(false)}
                  className="mt-6 w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 text-xs font-bold uppercase tracking-[0.22em] text-slate-400 transition-all hover:bg-white/[0.08]"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-[0.22em] text-slate-400 mb-2">
                      Student&apos;s Full Name <span className="text-blue-400">*</span>
                    </label>
                    <input
                      id="cert-student-name"
                      type="text"
                      value={certStudentName}
                      onChange={e => { setCertStudentName(e.target.value); setCertError(""); }}
                      placeholder="e.g. Tanuj Pathak"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-400/50 focus:ring-1 focus:ring-blue-400/30 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-[0.22em] text-slate-400 mb-2">
                      Parent&apos;s Full Name <span className="text-slate-500">(optional)</span>
                    </label>
                    <input
                      id="cert-parent-name"
                      type="text"
                      value={certParentName}
                      onChange={e => setCertParentName(e.target.value)}
                      placeholder=""
                      className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-400/50 focus:ring-1 focus:ring-blue-400/30 transition-all"
                    />
                  </div>
                  {certError && (
                    <p className="text-xs text-red-400 font-medium">{certError}</p>
                  )}
                </div>

                <div className="mt-8 flex gap-3">
                  <button
                    onClick={() => setShowCertModal(false)}
                    className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] py-3 text-xs font-bold uppercase tracking-[0.22em] text-slate-300 transition-all hover:bg-white/[0.08]"
                  >
                    Cancel
                  </button>
                  <button
                    id="cert-generate-btn"
                    onClick={handleGenerateCertificates}
                    disabled={isGenerating}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-xs font-bold uppercase tracking-[0.22em] text-white transition-all hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {isGenerating ? (
                      <><Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />Generating...</>
                    ) : (
                      <><Download className="h-4 w-4 flex-shrink-0" />Generate &amp; Download</>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Floating Support Button */}
      {isPaidUser && (
        <button
          onClick={() => setShowTicketModal(true)}
          className="fixed bottom-8 right-8 z-50 flex items-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-xs font-bold uppercase tracking-widest text-white shadow-2xl backdrop-blur-md transition-all hover:scale-105 hover:bg-blue-500 border border-white/10"
        >
          <HelpCircle className="w-5 h-5" />
          <span className="hidden md:inline">Raise a Ticket</span>
        </button>
      )}

      {/* Ticket Modal */}
      {showTicketModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#060a1f] p-6 md:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-white">Raise a Ticket</h2>
              <button 
                onClick={() => setShowTicketModal(false)}
                className="rounded-full bg-white/5 p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {ticketStatus?.type === 'success' ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="w-16 h-16 bg-green-500/20 border border-green-500/50 rounded-full flex items-center justify-center mb-4">
                  <BadgeCheck className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-lg font-bold text-white">Ticket Created</h3>
                <p className="mt-2 text-sm text-slate-400">{ticketStatus.message}</p>
                <button
                  onClick={() => setShowTicketModal(false)}
                  className="mt-6 w-full rounded-xl bg-white/[0.05] border border-white/10 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white hover:bg-white/[0.1] transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleTicketSubmit} className="space-y-5">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
                    Subject
                  </label>
                  <input
                    type="text"
                    required
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="Briefly describe the issue"
                    className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
                    Message
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    placeholder="Provide details so our team can help you faster..."
                    className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                  />
                </div>
                
                {ticketStatus?.type === 'error' && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-center text-xs font-bold text-red-400">
                    {ticketStatus.message}
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={isSubmittingTicket}
                  className="mt-2 w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white transition-all hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingTicket ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                  ) : (
                    "Submit Ticket"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
      {/* ── WhatsApp Sponsor Share Modal ────────────────────────────── */}
      {showSponsorModal && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg"
        >
          <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-[2.5rem] border border-white/10 bg-[#060a1f] p-6 md:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200" style={{ pointerEvents: 'auto' }}>
            <button
              onClick={() => setShowSponsorModal(false)}
              className="absolute top-5 right-6 text-slate-400 hover:text-white transition-colors text-2xl leading-none"
            >
              ×
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-xl border border-purple-400/20 bg-purple-500/15 p-3">
                <Sparkles className="h-5 w-5 text-purple-300 animate-pulse" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-slate-400">Sponsorship Ticket</p>
                <h3 className="text-lg font-black text-white">Ask Parent to Sponsor</h3>
              </div>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              Send this sponsorship link to your parent. Once they complete the payment of ₹3,800, your batch dashboard will immediately unlock!
            </p>

            <div className="space-y-4">
              {/* Pre-filled Message Display */}
              <div className="rounded-xl border border-white/5 bg-slate-950/60 p-4 font-mono text-[10px] text-slate-400 leading-relaxed select-text">
                <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider mb-1.5">Prefilled Message</span>
                &quot;Hey! I want to join the Skillyug AI Bootcamp to learn future tech. Click here to sponsor my enrollment: {sponsorUrl}&quot;
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#20ba59] py-3 text-xs font-bold uppercase tracking-[0.15em] text-white transition-all active:scale-[0.98] text-center"
                >
                  <Users className="w-4 h-4 flex-shrink-0" />
                  Share on WhatsApp
                </a>
                
                <button
                  type="button"
                  onClick={handleShareSponsor}
                  className="flex-grow flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] py-3 text-xs font-bold uppercase tracking-[0.15em] text-slate-300 transition-all active:scale-[0.97]"
                >
                  <Copy className="w-4 h-4" />
                  {copiedSponsor ? "Copied!" : "Share / Copy Link"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
