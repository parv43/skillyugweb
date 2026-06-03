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
  RotateCw
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabaseClient";
import BatchCalendar from "@/components/BatchCalendar";
import VoucherCard from "@/components/VoucherCard";

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
    accent: "from-blue-50 to-cyan-50/50",
  }
];

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

  useEffect(() => {
    if (!user) return;

    const isPaid = hasSlotAccess || user.email === "eternallytanuj@gmail.com" || isAdmin;
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

  // Track global errors for diagnostics
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      addDebugLog(`Global Error: ${event.message}`);
    };
    window.addEventListener("error", handleGlobalError);
    return () => window.removeEventListener("error", handleGlobalError);
  }, []);

  // Dynamically load YouTube script & initialize player
  useEffect(() => {
    setCurrentTime(0);
    setDuration(0);
    setBufferedFraction(0);
    setIsPlaying(false);
    setPlayerError(null);
    setPlaybackSpeed(1); // Reset speed on video change

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
      // Clear existing HTML to prevent React duplicate mounts
      containerRef.current.innerHTML = '<div id="youtube-player-element" class="w-full h-full pointer-events-none"></div>';

      try {
        player = new (window as any).YT.Player('youtube-player-element', {
          height: '100%',
          width: '100%',
          videoId: activeVideo.videoId,
          playerVars: {
            autoplay: 0,
            controls: 0, // chromeless
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
              
              // Set initial playback speed
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
              // 1 = playing, 2 = paused, 0 = ended, 3 = buffering
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

    // Ensure the script is injected
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

  // Continuously read currentTime and videoLoadedFraction when playing
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

  // Track fullscreen changes
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
        router.replace("/login?redirect=/my-batch");
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

      // ── Fast path: serve from sessionStorage cache (5-min TTL) ──
      try {
        const cached = sessionStorage.getItem("mybatch_access");
        if (cached) {
          const { value, expiry } = JSON.parse(cached);
          if ((expiry > Date.now() && value.hasAccess) || isAdminUser) {
            const fullName = session.user.user_metadata?.full_name || "Skillyug Student";
            const avatarUrl = session.user.user_metadata?.avatar_url || null;
            setHasSlotAccess(Boolean(value.hasSlot));
            setUserId(session.user.id);
            setUser({
              avatarUrl,
              batchLabel: "Summer AI Creator Cohort",
              email: session.user.email ?? "",
              fullName,
            });
            setLoading(false);
            return; // skip the API call entirely
          }
        }
      } catch { /* ignore */ }

      // ── Slow path: call API (first visit or cache expired) ──
      let hasAccess = false;
      let slotAccess = false;
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
          const data = (await res.json()) as { hasAccess?: boolean; hasSlot?: boolean };
          hasAccess = Boolean(data.hasAccess);
          slotAccess = Boolean(data.hasSlot);
          try {
            sessionStorage.setItem(
              "mybatch_access",
              JSON.stringify({ value: { hasAccess, hasSlot: slotAccess }, expiry: Date.now() + 5 * 60 * 1000 })
            );
          } catch { /* ignore */ }
        } else {
          console.error("[MyBatch] Access API status:", res.status);
        }
      } catch (e) {
        console.error("[MyBatch] Access fetch error:", e);
      }

      if (!hasAccess && !isAdminUser) {
        router.replace("/");
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-600">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const isPaidUser = hasSlotAccess || user.email === "eternallytanuj@gmail.com";
  // Only allowlisted users can download the certificate
  const CERT_ALLOWED_UIDS = ["9627ec86-c86d-4fce-8e13-6e8f3f157a83"];
  const canDownloadCert =
    user.email === "eternallytanuj@gmail.com" ||
    (userId !== null && CERT_ALLOWED_UIDS.includes(userId));

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 relative overflow-x-hidden select-none">
      {/* Screen recording deterrence overlay */}
      {isBlurred && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-50/95 backdrop-blur-3xl px-4 text-center">
          <EyeOff className="w-16 h-16 text-slate-400 mb-6" />
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Content Protected</h2>
          <p className="mt-2 text-slate-600 text-sm max-w-md mx-auto">
            For security reasons, this dashboard is hidden when the window loses focus. Please click back into the window to continue.
          </p>
        </div>
      )}
      <div className="fixed inset-0 pointer-events-none opacity-80">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.04),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(168,85,247,0.03),_transparent_28%),linear-gradient(to_bottom,_rgba(241,245,249,0.3),_rgba(248,250,252,0.95))]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.12)_1px,transparent_1px)] bg-[size:72px_72px]" />
      </div>

      <Navbar />

      <section className="relative z-10 px-6 pt-24 md:pt-32 pb-12 md:pb-16 lg:px-12">
        <div className="max-w-7xl mx-auto space-y-10">
          {isPaidUser ? (
            <>

          {/* Top Section: Profile & Circular Progress */}
          <div className="grid grid-cols-1 gap-6 md:gap-8 xl:grid-cols-[1.35fr_0.65fr]">
            <div className="rounded-[2rem] border border-slate-200 bg-white backdrop-blur-xl p-6 md:p-6 md:p-10 shadow-sm self-start">
              <div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-[0.28em] text-blue-600">
                <span className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2">
                  My Batch Workspace
                </span>
                <span className="text-slate-500">Live cohort dashboard</span>
              </div>
              <div className="mt-8 pt-8 border-t border-slate-100">
                <div className="flex items-center gap-4">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={`${user.fullName} profile`}
                      className="h-16 w-16 rounded-full border border-slate-200 object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full border border-slate-200 bg-blue-50 text-xl font-black text-blue-600">
                      {user?.fullName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-2xl font-black text-slate-900">{user?.fullName}</p>
                    <p className="mt-1 text-sm uppercase tracking-[0.24em] text-slate-500">
                      {user?.batchLabel}
                    </p>
                  </div>
                </div>
                <p className="mt-6 text-sm text-slate-600 break-all">{user?.email}</p>
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 md:p-8 shadow-sm flex flex-col items-center justify-center relative">
              <p className="absolute top-6 left-6 md:top-8 md:left-8 text-[11px] font-bold uppercase tracking-[0.28em] text-slate-500">
                Bootcamp Progress
              </p>
              <div className="relative mt-8 w-40 h-40 flex items-center justify-center">
                {/* SVG Circle for Pie Graph (0% completion) */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background Circle */}
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(15,23,42,0.06)" strokeWidth="12" />
                  {/* Progress Circle (0% of 251.2 circumference = 0) */}
                  <circle 
                    cx="50" cy="50" r="40" fill="transparent" stroke="#3b82f6" strokeWidth="12"
                    strokeDasharray="251.2" strokeDashoffset="251.2"
                    className="drop-shadow-[0_2px_4px_rgba(59,130,246,0.1)]"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl md:text-3xl font-black text-slate-900">0%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Section 1: Next Live Session & Locked Certificate */}
          <div className="grid grid-cols-1 gap-6 md:gap-8 xl:grid-cols-2">
            <div className="rounded-[2rem] border border-slate-200 bg-white backdrop-blur-xl p-6 md:p-8 shadow-sm">
              <div className="flex items-center gap-3">
                <Calendar className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-black tracking-tight text-slate-900">Next Live Session</h2>
              </div>
              <div className="mt-8 rounded-[1.5rem] border border-slate-100 bg-slate-50 p-6 md:p-8 flex flex-col items-center justify-center min-h-[200px]">
                <p className="text-xl font-black text-slate-400 uppercase tracking-widest">
                  None
                </p>
              </div>
            </div>

            {/* Certificate Card — unlocked only for allowlisted users */}
            {canDownloadCert ? (
              <div className="rounded-[2rem] border border-blue-200 bg-gradient-to-br from-blue-500/5 to-purple-500/5 p-6 md:p-8 shadow-sm relative overflow-hidden flex flex-col justify-center group">
                <div className="absolute -right-12 -top-12 w-32 h-32 bg-blue-500/5 blur-[60px] rounded-full transition-opacity group-hover:opacity-100 opacity-50"></div>
                
                <div className="flex items-start justify-between gap-4">
                  <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 shadow-inner">
                    <BadgeCheck className="h-6 w-6 text-blue-600" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.26em] text-blue-600">
                    OFFICIAL
                  </span>
                </div>
                <h3 className="mt-8 text-2xl font-black tracking-tight text-slate-900">
                  Certificate of Attendance
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  Claim your official Skillyug AI Education Bootcamp certificate. Includes a unique verification ID and scannable QR.
                </p>
                <button
                  type="button"
                  onClick={openCertModal}
                  disabled={isGenerating}
                  className="mt-8 w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-xs font-bold uppercase tracking-[0.24em] text-white transition-all hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
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
              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 md:p-8 shadow-sm relative overflow-hidden flex flex-col justify-center">
                {/* Blurred background content */}
                <div className="absolute inset-0 p-6 md:p-8 blur-[10px] opacity-40 pointer-events-none select-none flex flex-col justify-center transition-all duration-500 hover:blur-[6px] hover:opacity-60">
                  <div className="flex items-start justify-between gap-4">
                    <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                      <BadgeCheck className="h-6 w-6 text-blue-600" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.26em] text-blue-600">
                      OFFICIAL
                    </span>
                  </div>
                  <h3 className="mt-8 text-2xl font-black tracking-tight text-slate-900">
                    Certificate of Attendance
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    Claim your official Skillyug AI Education Bootcamp certificate.
                  </p>
                  <div className="mt-8 w-full rounded-xl bg-blue-600/50 py-5" />
                </div>

                {/* Lock overlay */}
                <div className="relative z-10 flex flex-col items-center justify-center text-center">
                  <div className="rounded-full bg-slate-50 p-5 border border-slate-200 mb-6 shadow-sm relative">
                    <Lock className="w-8 h-8 text-slate-500" />
                    {/* Chain element */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-1.5 bg-slate-300/80 rotate-45 pointer-events-none rounded-full blur-[0.5px]" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Certificate Locked</h3>
                  <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600 max-w-[200px] mx-auto leading-relaxed">
                    Complete the course to download certificate
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Middle Section 2: Resource Library */}
          <div className="rounded-[2rem] border border-slate-200 bg-white backdrop-blur-xl p-6 md:p-8 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-slate-500">
                  Curriculum Resources
                </p>
                <h2 className="mt-3 text-2xl md:text-3xl font-black tracking-tight text-slate-900">Your resource library</h2>
              </div>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {resourceCards.map((card) => {
                const Icon = card.icon;
                return (
                  <article
                    key={card.title}
                    className={`rounded-[1.75rem] border border-slate-100 bg-gradient-to-br ${card.accent} p-6 shadow-sm`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <Icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.26em] text-slate-500">
                        {card.meta}
                      </span>
                    </div>
                    <h3 className="mt-8 text-2xl font-black tracking-tight text-slate-900">
                      {card.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">
                      {card.description}
                    </p>
                    <button
                      type="button"
                      className="mt-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-blue-600 transition-colors hover:text-blue-800"
                    >
                      Download
                      <Download className="h-4 w-4" />
                    </button>
                  </article>
                );
              })}
              
              <div className="flex flex-col items-center justify-center w-full">
                <VoucherCard />
              </div>
            </div>
          </div>

          {/* Middle Section 3: Secure Video Player */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm overflow-hidden">
            <div className="flex flex-col lg:flex-row gap-4 h-auto lg:h-[600px]">
              {/* Left Side: Video List (30%) */}
              <div className="lg:w-[30%] bg-slate-50 rounded-3xl border border-slate-100 p-4 flex flex-col h-[300px] lg:h-full">
                <div className="px-4 py-3 border-b border-slate-200 mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Session Recordings</h3>
                    <p className="text-xs text-slate-500 mt-1">Past live classes</p>
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
                      className={`w-full text-left p-4 rounded-2xl transition-all ${activeVideo.id === video.id ? 'bg-blue-50 border border-blue-200 text-blue-700' : 'hover:bg-slate-100/50 border border-transparent text-slate-700'}`}
                    >
                      <div className="flex items-center gap-3">
                        <PlayCircle className={`w-8 h-8 flex-shrink-0 ${activeVideo.id === video.id ? 'text-blue-600' : 'text-slate-400'}`} />
                        <div>
                          <p className={`text-sm font-bold ${activeVideo.id === video.id ? 'text-blue-700 font-bold' : 'text-slate-700'}`}>{video.title}</p>
                          <p className="text-[10px] uppercase tracking-wider text-slate-400 mt-1">{video.date}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Right Side: Secure Video Player (70%) */}
              <div className="lg:w-[70%] bg-black rounded-3xl relative flex flex-col overflow-hidden border border-slate-200 min-h-[350px] lg:min-h-0">

                {/* React YouTube component mount point */}
                <div className="flex-1 w-full h-[75%] lg:h-[80%] relative bg-black flex items-center justify-center overflow-hidden">
                  {/* Invisible Shield to block YouTube UI clicks (Security Feature 2) */}
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
                          {user?.email || "student@skillyug.com"}
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
                <div className="bg-slate-900 p-4 flex flex-col justify-center z-40 border-t border-slate-800 h-[25%] lg:h-[20%]">
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
                      <div className="flex items-center justify-between w-full">
                        {/* Left side: Play/Pause/Skip controls, Mute, Volume, Time */}
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-3.5">
                            {/* Skip Backward 10s */}
                            <button
                              onClick={skipBackward}
                              className="text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center justify-center"
                              title="Skip Backward 10s"
                            >
                              <RotateCcw className="w-5 h-5" />
                            </button>

                            {/* Play/Pause Button */}
                            <button 
                              onClick={handlePlayPause}
                              className="text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center justify-center"
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
                              className="text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center justify-center"
                              title="Skip Forward 10s"
                            >
                              <RotateCw className="w-5 h-5" />
                            </button>
                          </div>

                          {/* Mute/Volume controls */}
                          <div className="flex items-center gap-2 group/volume relative">
                            <button 
                              onClick={handleToggleMute}
                              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                              title={isMuted ? "Unmute" : "Mute"}
                            >
                              {isMuted || volume === 0 ? (
                                <VolumeX className="w-5 h-5" />
                              ) : (
                                <Volume2 className="w-5 h-5" />
                              )}
                            </button>
                            
                            {/* Sleek volume slider that expands on hover/focus */}
                            <input 
                              type="range"
                              min={0}
                              max={100}
                              value={isMuted ? 0 : volume}
                              onChange={handleVolumeChange}
                              className="w-0 group-hover/volume:w-20 transition-all duration-300 h-1 bg-white/20 accent-blue-500 rounded-full cursor-pointer"
                            />
                          </div>

                          {/* Time Display */}
                          <div className="text-xs font-medium text-slate-400 tracking-wider">
                            {formatTime(currentTime)} <span className="text-slate-600">/</span> {formatTime(duration)}
                          </div>
                        </div>

                        {/* Right side: playback speed, branding & fullscreen */}
                        <div className="flex items-center gap-3">
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

                          <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 select-none">
                            Skillyug Player
                          </span>
                          <button 
                            onClick={handleFullscreen}
                            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
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

          {/* Bottom Section: Bootcamp Calendar */}
          <div className="rounded-[2rem] border border-slate-200 bg-white backdrop-blur-xl p-6 md:p-8 shadow-sm">
            <BatchCalendar hasSlot={hasSlotAccess} />
          </div>
        
            </>
          ) : (
            <>
          <div className="grid grid-cols-1 gap-6 md:gap-8 xl:grid-cols-[1.35fr_0.65fr]">
            <div className="rounded-[2rem] border border-slate-200 bg-white backdrop-blur-xl p-6 md:p-6 md:p-10 shadow-sm self-start">
              <div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-[0.28em] text-blue-600">
                <span className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2">
                  My Batch Workspace
                </span>
                <span className="text-slate-500">Live cohort dashboard</span>
              </div>
              <div className="mt-8 pt-8 border-t border-slate-100">
                <div className="flex items-center gap-4">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={`${user.fullName} profile`}
                      className="h-14 w-14 rounded-full border border-slate-200 object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 bg-blue-50 text-lg font-black text-blue-600">
                      {user?.fullName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-lg font-black text-slate-900">{user?.fullName}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-500">
                      {user?.batchLabel}
                    </p>
                  </div>
                </div>
                <p className="mt-5 text-sm text-slate-600 break-all">{user?.email}</p>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-blue-600" />
                  <h2 className="text-xl font-black tracking-tight text-slate-900">Batch pulse</h2>
                </div>
                <div className="mt-6 rounded-[1.35rem] border border-slate-100 bg-slate-50 p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-slate-500">
                    Next live session
                  </p>
                  <p className="mt-3 text-lg font-bold text-slate-900">28th May, 1:00 PM IST</p>
                  <p className="mt-2 text-sm text-slate-600">
                    First Class
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-slate-500">
                    Cohort Identity
                  </p>
                  <p className="mt-3 text-xl font-bold text-slate-900">{user?.batchLabel}</p>
                </div>
                <div className="rounded-full border border-violet-200 bg-violet-50 p-3">
                  <Sparkles className="w-5 h-5 text-violet-600" />
                </div>
              </div>

              <div className="mt-10 rounded-[1.75rem] border border-slate-100 bg-slate-50/50 px-6 py-8 text-center">
                <Image
                  src="/skillyug-optimized.svg"
                  alt="Skillyug logo"
                  width={260}
                  height={120}
                  className="mx-auto h-20 w-auto object-contain"
                />
                <p className="mt-6 text-sm leading-relaxed text-slate-600">
                  Built for focused execution across every session, milestone, and creator sprint.
                </p>
              </div>

              <div className="mt-8 rounded-[1.5rem] border border-blue-200 bg-blue-50 px-5 py-5">
                <div className="flex items-start gap-3">
                  <BadgeCheck className="mt-0.5 h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-bold text-slate-900">Batch status</p>
                    <p className="mt-1 text-sm text-slate-600">
                      You are synced with the latest cohort resources and task timeline.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:gap-8">
            <section className="space-y-8">
              <div className="rounded-[2rem] border border-slate-200 bg-white backdrop-blur-xl p-6 md:p-8 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-slate-500">
                      Curriculum Resources
                    </p>
                    <h2 className="mt-3 text-2xl md:text-3xl font-black tracking-tight text-slate-900">Your resource library</h2>
                  </div>
                  <Link
                    href="/#projects"
                    className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-blue-600 transition-colors hover:bg-blue-100 hover:text-blue-800"
                  >
                    Explore projects
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="mt-8 grid gap-6 md:grid-cols-2">
                  {resourceCards.map((card) => {
                    const Icon = card.icon;
                    return (
                      <article
                        key={card.title}
                        className={`rounded-[1.75rem] border border-slate-100 bg-gradient-to-br ${card.accent} p-6 shadow-sm`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="rounded-2xl border border-slate-200 bg-white p-4">
                            <Icon className="h-6 w-6 text-blue-600" />
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-[0.26em] text-slate-500">
                            {card.meta}
                          </span>
                        </div>
                        <h3 className="mt-8 text-2xl font-black tracking-tight text-slate-900">
                          {card.title}
                        </h3>
                        <p className="mt-3 text-sm leading-relaxed text-slate-600">
                          {card.description}
                        </p>
                        <button
                          type="button"
                          className="mt-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-blue-600 transition-colors hover:text-blue-800"
                        >
                          Download
                          <Download className="h-4 w-4" />
                        </button>
                      </article>
                    );
                  })}

                  {/* Certificate Card */}
                  <article className="rounded-[1.75rem] border border-blue-200 bg-gradient-to-br from-blue-500/5 to-purple-500/5 p-6 shadow-sm relative overflow-hidden group">
                    <div className="absolute -right-12 -top-12 w-32 h-32 bg-blue-500/5 blur-[60px] rounded-full transition-opacity group-hover:opacity-100 opacity-50"></div>
                    
                    <div className="flex items-start justify-between gap-4">
                      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 shadow-inner">
                        <BadgeCheck className="h-6 w-6 text-blue-600" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.26em] text-blue-600">
                        OFFICIAL
                      </span>
                    </div>
                    <h3 className="mt-8 text-2xl font-black tracking-tight text-slate-900">
                      Certificate of Attendance
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">
                      Claim your official Skillyug AI Education Bootcamp certificate. Includes a unique verification ID and scannable QR.
                    </p>
                    <button
                      type="button"
                      onClick={openCertModal}
                      disabled={isGenerating}
                      className="mt-8 w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-xs font-bold uppercase tracking-[0.24em] text-white transition-all hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
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
                  </article>
                </div>
              </div>
              
              <BatchCalendar hasSlot={hasSlotAccess} />
            </section>

          </div>
        
            </>
          )}
        </div>
      </section>

      {/* ── Certificate Name Modal ──────────────────────────────────── */}
      {(showCertModal || isGenerating) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(15,23,42,0.4)", backdropFilter: "blur(12px)" }}
        >
          <div className="relative w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-6 md:p-8 shadow-lg">
            {/* Close button */}
            <button
              onClick={() => setShowCertModal(false)}
              className="absolute top-5 right-6 text-slate-505 hover:text-slate-900 transition-colors text-2xl leading-none"
              aria-label="Close modal"
            >
              ×
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">
                <BadgeCheck className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-slate-500">Certificate</p>
                <h3 className="text-lg font-black text-slate-900">Enter Names</h3>
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
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
                  className="flex items-center justify-between w-full rounded-xl border border-blue-200 bg-blue-50/50 p-4 transition-all hover:bg-blue-100/50 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-blue-50 p-2">
                      <Download className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-bold text-slate-900">Student Certificate</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-slate-800 group-hover:translate-x-1 transition-all" />
                </a>

                {generatedCerts.parent && (
                  <a
                    href={generatedCerts.parent.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between w-full rounded-xl border border-purple-200 bg-purple-50/50 p-4 transition-all hover:bg-purple-100/50 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-purple-50 p-2">
                        <Download className="h-4 w-4 text-purple-600" />
                      </div>
                      <span className="text-sm font-bold text-slate-900">Parent Certificate</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-slate-800 group-hover:translate-x-1 transition-all" />
                  </a>
                )}

                <button
                  onClick={() => setShowCertModal(false)}
                  className="mt-6 w-full rounded-xl border border-slate-200 bg-slate-50 py-3 text-xs font-bold uppercase tracking-[0.22em] text-slate-700 transition-all hover:bg-slate-100"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-[0.22em] text-slate-505 mb-2">
                      Student&apos;s Full Name <span className="text-blue-600">*</span>
                    </label>
                    <input
                      id="cert-student-name"
                      type="text"
                      value={certStudentName}
                      onChange={e => { setCertStudentName(e.target.value); setCertError(""); }}
                      placeholder="e.g. Tanuj Pathak"
                      className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-[0.22em] text-slate-505 mb-2">
                      Parent&apos;s Full Name <span className="text-slate-500">(optional)</span>
                    </label>
                    <input
                      id="cert-parent-name"
                      type="text"
                      value={certParentName}
                      onChange={e => setCertParentName(e.target.value)}
                      placeholder=""
                      className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                  {certError && (
                    <p className="text-xs text-red-600 font-medium">{certError}</p>
                  )}
                </div>

                <div className="mt-8 flex gap-3">
                  <button
                    onClick={() => setShowCertModal(false)}
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 py-3 text-xs font-bold uppercase tracking-[0.22em] text-slate-700 transition-all hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    id="cert-generate-btn"
                    onClick={handleGenerateCertificates}
                    disabled={isGenerating}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-xs font-bold uppercase tracking-[0.22em] text-white transition-all hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
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
          className="fixed bottom-8 right-8 z-50 flex items-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-xs font-bold uppercase tracking-widest text-white shadow-lg transition-all hover:scale-105 hover:bg-blue-700 border border-blue-500"
        >
          <HelpCircle className="w-5 h-5" />
          <span className="hidden md:inline">Raise a Ticket</span>
        </button>
      )}

      {/* Ticket Modal */}
      {showTicketModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-slate-900">Raise a Ticket</h2>
              <button 
                onClick={() => setShowTicketModal(false)}
                className="rounded-full bg-slate-100 p-2 text-slate-505 hover:bg-slate-200 hover:text-slate-955 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {ticketStatus?.type === 'success' ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="w-16 h-16 bg-green-50 border border-green-200 rounded-full flex items-center justify-center mb-4">
                  <BadgeCheck className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Ticket Created</h3>
                <p className="mt-2 text-sm text-slate-600">{ticketStatus.message}</p>
                <button
                  onClick={() => setShowTicketModal(false)}
                  className="mt-6 w-full rounded-xl bg-slate-50 border border-slate-200 py-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleTicketSubmit} className="space-y-5">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.15em] text-slate-505">
                    Subject
                  </label>
                  <input
                    type="text"
                    required
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="Briefly describe the issue"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.15em] text-slate-505">
                    Message
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    placeholder="Provide details so our team can help you faster..."
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                  />
                </div>
                
                {ticketStatus?.type === 'error' && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-center text-xs font-bold text-red-700">
                    {ticketStatus.message}
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={isSubmittingTicket}
                  className="mt-2 w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white transition-all hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
    </main>
  );
}
