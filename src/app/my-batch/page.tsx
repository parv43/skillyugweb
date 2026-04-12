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
  const [accessDenied, setAccessDenied] = useState(false);
  const [user, setUser] = useState<BatchUser | null>(null);

  useEffect(() => {
    const loadSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login?redirect=/my-batch");
        return;
      }

      const fullName = session.user.user_metadata?.full_name || "Skillyug Student";
      const avatarUrl = session.user.user_metadata?.avatar_url || null;
      const accessResponse = await fetch("/api/my-batch/access", { cache: "no-store" });

      if (!accessResponse.ok) {
        setAccessDenied(true);
        setLoading(false);
        router.replace("/");
        return;
      }

      const accessData = (await accessResponse.json()) as { hasAccess?: boolean };
      if (!accessData.hasAccess) {
        setAccessDenied(true);
        setLoading(false);
        router.replace("/");
        return;
      }

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center text-slate-200">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  if (accessDenied || !user) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center text-slate-200">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#020617] text-slate-50 relative overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none opacity-80">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(168,85,247,0.16),_transparent_28%),linear-gradient(to_bottom,_rgba(15,23,42,0.3),_rgba(2,6,23,0.95))]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.05)_1px,transparent_1px)] bg-[size:72px_72px]" />
      </div>

      <Navbar />

      <section className="relative z-10 px-6 pt-32 pb-16 lg:px-12">
        <div className="max-w-7xl mx-auto space-y-10">
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
                  className="mx-auto h-20 w-auto object-contain scale-[1.5]"
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

          <div className="grid grid-cols-1 gap-8 xl:grid-cols-[0.72fr_0.28fr]">
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
                </div>
              </div>
              
              <BatchCalendar />
            </section>

            <aside className="space-y-8">
              <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] backdrop-blur-xl p-7">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-blue-300" />
                  <h2 className="text-xl font-black tracking-tight">Batch pulse</h2>
                </div>
                <div className="mt-7 space-y-5">
                  <div className="rounded-[1.35rem] border border-white/8 bg-slate-950/30 p-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-slate-400">
                      Next live session
                    </p>
                    <p className="mt-3 text-lg font-bold text-white">Thursday, 7:00 PM IST</p>
                    <p className="mt-2 text-sm text-slate-300">
                      AI video workflows and performance hooks.
                    </p>
                  </div>

                </div>
              </section>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
