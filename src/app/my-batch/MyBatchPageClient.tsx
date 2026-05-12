/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState } from "react";
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
  EyeOff
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabaseClient";
import BatchCalendar from "@/components/BatchCalendar";

type BatchUser = {
  avatarUrl: string | null;
  batchLabel: string;
  email: string;
  fullName: string;
};

const resourceCards = [
  {
    title: "AI Toolkit V1",
    description: "Prompt frameworks, idea systems, and creator workflows for fast execution.",
    meta: "12.4 MB PDF",
    icon: BookOpen,
    accent: "from-blue-500/20 to-cyan-400/10",
  },
  {
    title: "Creator Project Pack",
    description: "Templates, pitch decks, and launch briefs used across the current cohort.",
    meta: "8 Assets",
    icon: FolderOpen,
    accent: "from-purple-500/20 to-pink-400/10",
  },
];

export default function MyBatchPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<BatchUser | null>(null);
  const [hasSlotAccess, setHasSlotAccess] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  // Certificate modal state
  const [showCertModal, setShowCertModal] = useState(false);
  const [certStudentName, setCertStudentName] = useState("");
  const [certParentName, setCertParentName] = useState("");
  const [certError, setCertError] = useState("");
  const [generatedCerts, setGeneratedCerts] = useState<{ student: { downloadUrl: string }; parent?: { downloadUrl: string } } | null>(null);
  const [isBlurred, setIsBlurred] = useState(false);

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

  useEffect(() => {
    const loadSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login?redirect=/my-batch");
        return;
      }

      // Always fetch fresh from API — never trust stale cache for the access gate
      let hasAccess = false;
      let slotAccess = false;
      try {
        const res = await fetch("/api/my-batch/access", {
          credentials: "include",
          headers: { "Cache-Control": "no-cache, no-store" },
        });
        if (res.ok) {
          const data = (await res.json()) as { hasAccess?: boolean; hasSlot?: boolean };
          hasAccess = Boolean(data.hasAccess);
          slotAccess = Boolean(data.hasSlot);
          // Update sessionStorage so Navbar/other components can use it
          try {
            sessionStorage.setItem(
              "mybatch_access",
              JSON.stringify({ value: { hasAccess, hasSlot: slotAccess }, expiry: Date.now() + 5 * 60 * 1000 })
            );
          } catch { /* ignore */ }
        } else {
          console.error("Access API returned:", res.status, await res.text().catch(() => ""));
        }
      } catch (e) {
        console.error("Access fetch failed:", e);
      }

      if (!hasAccess) {
        router.replace("/");
        return;
      }

      const fullName = session.user.user_metadata?.full_name || "Skillyug Student";
      const avatarUrl = session.user.user_metadata?.avatar_url || null;

      setHasSlotAccess(slotAccess);
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

  const isPaidUser = hasSlotAccess || user.email === "eternallytanuj@gmail.com";

  return (
    <main className="min-h-screen bg-[#020617] text-slate-50 relative overflow-x-hidden select-none">
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
      <div className="fixed inset-0 pointer-events-none opacity-80">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(168,85,247,0.16),_transparent_28%),linear-gradient(to_bottom,_rgba(15,23,42,0.3),_rgba(2,6,23,0.95))]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.05)_1px,transparent_1px)] bg-[size:72px_72px]" />
      </div>

      <Navbar />

      <section className="relative z-10 px-6 pt-32 pb-16 lg:px-12">
        <div className="max-w-7xl mx-auto space-y-10">
          {isPaidUser ? (
            <>

          {/* Top Section: Profile & Circular Progress */}
          <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.35fr_0.65fr]">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] backdrop-blur-xl p-8 md:p-10 shadow-[0_0_60px_rgba(59,130,246,0.08)] self-start">
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

            <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-900/90 via-slate-950/85 to-[#090d1f] p-8 shadow-[0_0_80px_rgba(124,77,255,0.12)] flex flex-col items-center justify-center relative">
              <p className="absolute top-8 left-8 text-[11px] font-bold uppercase tracking-[0.28em] text-slate-400">
                Bootcamp Progress
              </p>
              <div className="relative mt-8 w-40 h-40 flex items-center justify-center">
                {/* SVG Circle for Pie Graph (45% completion) */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background Circle */}
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(255,255,255,0.1)" strokeWidth="12" />
                  {/* Progress Circle (45% of 251.2 circumference = 113) */}
                  <circle 
                    cx="50" cy="50" r="40" fill="transparent" stroke="#3b82f6" strokeWidth="12"
                    strokeDasharray="251.2" strokeDashoffset="138.16"
                    className="drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-white">45%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Section 1: Next Live Session & Locked Certificate */}
          <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] backdrop-blur-xl p-8 shadow-[0_0_60px_rgba(59,130,246,0.08)]">
              <div className="flex items-center gap-3">
                <Calendar className="h-6 w-6 text-blue-300" />
                <h2 className="text-2xl font-black tracking-tight">Next Live Session</h2>
              </div>
              <div className="mt-8 rounded-[1.5rem] border border-white/8 bg-slate-950/40 p-8">
                <p className="text-sm font-bold uppercase tracking-[0.26em] text-blue-400">
                  May 10, 2026 • 8:00 PM IST
                </p>
                <p className="mt-4 text-3xl font-black text-white">Advanced AI Workflows</p>
                <p className="mt-3 text-lg text-slate-300">
                  Module 4: Automating content creation at scale.
                </p>
                <button className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white/[0.05] border border-white/10 px-6 py-3 text-sm font-bold uppercase tracking-[0.2em] text-white transition-all hover:bg-white/[0.1]">
                  Join Zoom Link <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Locked Certificate */}
            <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-900/90 via-slate-950/85 to-[#090d1f] p-8 shadow-[0_0_80px_rgba(124,77,255,0.12)] relative overflow-hidden flex flex-col justify-center">
              {/* Blurred background content */}
              <div className="absolute inset-0 p-8 blur-[10px] opacity-40 pointer-events-none select-none flex flex-col justify-center transition-all duration-500 hover:blur-[6px] hover:opacity-60">
                <div className="flex items-start justify-between gap-4">
                  <div className="rounded-2xl border border-white/10 bg-blue-500/20 p-4">
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
                  Claim your official Skillyug AI Education Bootcamp certificate.
                </p>
                <div className="mt-8 w-full rounded-xl bg-blue-600/50 py-5" />
              </div>
              
              {/* Lock overlay */}
              <div className="relative z-10 flex flex-col items-center justify-center text-center">
                <div className="rounded-full bg-slate-950/90 p-5 border border-white/10 mb-6 shadow-2xl relative drop-shadow-[0_0_15px_rgba(0,0,0,0.8)]">
                  <Lock className="w-8 h-8 text-slate-300" />
                  {/* Chain element */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-1.5 bg-slate-600/80 rotate-45 pointer-events-none rounded-full blur-[0.5px]" />
                </div>
                <h3 className="text-xl font-black text-white tracking-tight">Certificate Locked</h3>
                <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.2em] text-blue-300 max-w-[200px] mx-auto leading-relaxed">
                  Complete the course to download certificate
                </p>
              </div>
            </div>
          </div>

          {/* Middle Section 2: Resource Library */}
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] backdrop-blur-xl p-8">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/8 pb-5">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-slate-400">
                  Curriculum Resources
                </p>
                <h2 className="mt-3 text-3xl font-black tracking-tight">Your resource library</h2>
              </div>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {resourceCards.map((card) => {
                const Icon = card.icon;
                return (
                  <article
                    key={card.title}
                    className={`rounded-[1.75rem] border border-white/8 bg-gradient-to-br ${card.accent} p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                        <Icon className="h-6 w-6 text-blue-200" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.26em] text-slate-300">
                        {card.meta}
                      </span>
                    </div>
                    <h3 className="mt-8 text-2xl font-black tracking-tight text-white">
                      {card.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-slate-300">
                      {card.description}
                    </p>
                    <button
                      type="button"
                      className="mt-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-blue-200 transition-colors hover:text-white"
                    >
                      Download
                      <Download className="h-4 w-4" />
                    </button>
                  </article>
                );
              })}
            </div>
          </div>

          {/* Middle Section 3: Video Player */}
          <div className="rounded-[2rem] border border-white/10 bg-[#060a1f] p-4 shadow-[0_0_60px_rgba(59,130,246,0.05)] overflow-hidden">
            <div className="flex flex-col lg:flex-row gap-4 h-auto lg:h-[600px]">
              {/* Left Side: Video List (30%) */}
              <div className="lg:w-[30%] bg-white/[0.02] rounded-3xl border border-white/5 p-4 flex flex-col h-[300px] lg:h-full">
                <div className="px-4 py-3 border-b border-white/5 mb-4">
                  <h3 className="text-lg font-black text-white">Session Recordings</h3>
                  <p className="text-xs text-slate-400 mt-1">Past live classes</p>
                </div>
                <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <button key={i} className={`w-full text-left p-4 rounded-2xl transition-all ${i === 1 ? 'bg-blue-500/10 border border-blue-500/20' : 'hover:bg-white/[0.05] border border-transparent'}`}>
                      <div className="flex items-center gap-3">
                        <PlayCircle className={`w-8 h-8 flex-shrink-0 ${i === 1 ? 'text-blue-400' : 'text-slate-500'}`} />
                        <div>
                          <p className={`text-sm font-bold ${i === 1 ? 'text-white' : 'text-slate-300'}`}>Session {i}: AI Basics</p>
                          <p className="text-[10px] uppercase tracking-wider text-slate-500 mt-1">May 0{i}, 2026</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Right Side: Video Player (70%) */}
              <div className="lg:w-[70%] bg-black rounded-3xl relative flex items-center justify-center overflow-hidden min-h-[300px] group border border-white/5">
                {/* Dummy Video Player UI */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none z-10" />
                <img src="https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2070&auto=format&fit=crop" alt="Video thumbnail" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                
                <button className="z-20 rounded-full bg-blue-600/90 text-white p-6 backdrop-blur-sm border border-white/10 shadow-2xl transition-transform transform group-hover:scale-110">
                  <PlayCircle className="w-12 h-12" fill="currentColor" />
                </button>

                {/* Dummy Player Controls */}
                <div className="absolute bottom-0 left-0 right-0 p-6 z-20 flex items-center gap-4 text-white">
                  <button><PlayCircle className="w-6 h-6" /></button>
                  <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden relative cursor-pointer">
                    <div className="absolute top-0 left-0 bottom-0 w-1/3 bg-blue-500 rounded-full" />
                  </div>
                  <span className="text-xs font-mono">24:15 / 1:30:00</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section: Bootcamp Calendar */}
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] backdrop-blur-xl p-8">
            <BatchCalendar hasSlot={hasSlotAccess} />
          </div>
        
            </>
          ) : (
            <>
          <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.35fr_0.65fr]">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] backdrop-blur-xl p-8 md:p-10 shadow-[0_0_60px_rgba(59,130,246,0.08)] self-start">
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
                      className="h-14 w-14 rounded-full border border-white/10 object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-blue-500/10 text-lg font-black text-blue-200">
                      {user?.fullName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-lg font-black text-white">{user?.fullName}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-400">
                      {user?.batchLabel}
                    </p>
                  </div>
                </div>
                <p className="mt-5 text-sm text-slate-300 break-all">{user?.email}</p>
              </div>

              <div className="mt-8 pt-8 border-t border-white/5">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-blue-300" />
                  <h2 className="text-xl font-black tracking-tight">Batch pulse</h2>
                </div>
                <div className="mt-6 rounded-[1.35rem] border border-white/8 bg-slate-950/30 p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-slate-400">
                    Next live session
                  </p>
                  <p className="mt-3 text-lg font-bold text-white">10th May, 8:00 PM IST</p>
                  <p className="mt-2 text-sm text-slate-300">
                    Intro Session
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-900/90 via-slate-950/85 to-[#090d1f] p-8 shadow-[0_0_80px_rgba(124,77,255,0.12)]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-slate-400">
                    Cohort Identity
                  </p>
                  <p className="mt-3 text-xl font-bold text-white">{user?.batchLabel}</p>
                </div>
                <div className="rounded-full border border-white/10 bg-white/[0.04] p-3">
                  <Sparkles className="w-5 h-5 text-violet-300" />
                </div>
              </div>

              <div className="mt-10 rounded-[1.75rem] border border-white/8 bg-white/[0.03] px-6 py-8 text-center">
                <Image
                  src="/skillyug-optimized.svg"
                  alt="Skillyug logo"
                  width={260}
                  height={120}
                  className="mx-auto h-20 w-auto object-contain"
                />
                <p className="mt-6 text-sm leading-relaxed text-slate-300">
                  Built for focused execution across every session, milestone, and creator sprint.
                </p>
              </div>

              <div className="mt-8 rounded-[1.5rem] border border-blue-400/15 bg-blue-500/10 px-5 py-5">
                <div className="flex items-start gap-3">
                  <BadgeCheck className="mt-0.5 h-5 w-5 text-blue-300" />
                  <div>
                    <p className="text-sm font-bold text-white">Batch status</p>
                    <p className="mt-1 text-sm text-slate-300">
                      You are synced with the latest cohort resources and task timeline.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8">
            <section className="space-y-8">
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] backdrop-blur-xl p-8">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/8 pb-5">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-slate-400">
                      Curriculum Resources
                    </p>
                    <h2 className="mt-3 text-3xl font-black tracking-tight">Your resource library</h2>
                  </div>
                  <Link
                    href="/#projects"
                    className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-blue-300 transition-colors hover:bg-blue-500/20"
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
                        className={`rounded-[1.75rem] border border-white/8 bg-gradient-to-br ${card.accent} p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                            <Icon className="h-6 w-6 text-blue-200" />
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-[0.26em] text-slate-300">
                            {card.meta}
                          </span>
                        </div>
                        <h3 className="mt-8 text-2xl font-black tracking-tight text-white">
                          {card.title}
                        </h3>
                        <p className="mt-3 text-sm leading-relaxed text-slate-300">
                          {card.description}
                        </p>
                        <button
                          type="button"
                          className="mt-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-blue-200 transition-colors hover:text-white"
                        >
                          Download
                          <Download className="h-4 w-4" />
                        </button>
                      </article>
                    );
                  })}

                  {/* Certificate Card */}
                  <article className="rounded-[1.75rem] border border-blue-500/20 bg-gradient-to-br from-blue-600/20 to-purple-500/10 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] relative overflow-hidden group">
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
          style={{ background: "rgba(2,6,23,0.85)", backdropFilter: "blur(12px)" }}
        >
          <div className="relative w-full max-w-md rounded-[2rem] border border-white/10 bg-white/[0.06] backdrop-blur-xl p-8 shadow-[0_0_80px_rgba(59,130,246,0.15)]">
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
    </main>
  );
}
