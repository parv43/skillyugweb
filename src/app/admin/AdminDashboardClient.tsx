"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import {
  Users,
  Video,
  Award,
  Sparkles,
  RefreshCw,
  Lock,
  Unlock,
  ShieldCheck,
  Search,
  ExternalLink,
  ChevronRight,
  ArrowLeft,
  Calendar,
  Phone,
  Mail,
  GraduationCap,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

interface StudentRecord {
  name: string;
  email: string;
  phone: string;
  grade_class: string;
  payment_status: string;
  amount_paid?: number;
  promo_code?: string;
  created_at: string;
  user_id?: string;
}

interface RecordingRecord {
  id: string;
  title: string;
  custom_date: string;
  youtube_video_id: string;
  published_at: string;
}

interface CertificateRecord {
  id: number;
  user_name: string;
  cert_id: string;
  created_at: string;
  user_id?: string;
}

interface AdminProfileData {
  name: string;
  email: string;
  role: string;
  assignedBatchId: string;
  assignedBatchName: string;
}

interface BatchData {
  id: string;
  name: string;
  label: string;
  start_date: string;
  end_date: string;
  meet_link?: string;
  youtube_playlist_id?: string;
  is_active: boolean;
}

export default function AdminDashboardClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [admin, setAdmin] = useState<AdminProfileData | null>(null);
  const [batch, setBatch] = useState<BatchData | null>(null);
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [recordings, setRecordings] = useState<RecordingRecord[]>([]);
  const [issuedCerts, setIssuedCerts] = useState<CertificateRecord[]>([]);
  const [certsUnlocked, setCertsUnlocked] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState<"students" | "recordings" | "certificates">("students");
  const [searchQuery, setSearchQuery] = useState("");

  // Sync State
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Certificate Toggle State
  const [isTogglingCert, setIsTogglingCert] = useState(false);
  const [certActionStatus, setCertActionStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const loadBatchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) {
        router.replace("/login?redirect=/admin");
        return;
      }

      const res = await fetch("/api/admin/batch", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache",
        },
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          setError("Access Denied: You do not have administrator permissions.");
          setLoading(false);
          return;
        }
        throw new Error(`Failed to load admin data (${res.status})`);
      }

      const data = await res.json();
      setAdmin(data.admin);
      setBatch(data.batch);
      setStudents(data.students || []);
      setRecordings(data.recordings || []);
      setIssuedCerts(data.issuedCertificates || []);
      setCertsUnlocked(Boolean(data.certificatesUnlocked));
    } catch (err: any) {
      console.error("[AdminDashboard] Error loading batch data:", err);
      setError(err.message || "Failed to load admin batch data.");
    } finally {
      setLoading(false);
    }
  }, [router, supabase]);

  useEffect(() => {
    loadBatchData();
  }, [loadBatchData]);

  // Handle Video Synchronization
  const handleSyncVideos = async () => {
    if (!admin) return;
    setIsSyncing(true);
    setSyncStatus(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const res = await fetch("/api/videos/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ batch_id: admin.assignedBatchId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to synchronize recordings.");
      }

      setSyncStatus({
        type: "success",
        message: data.message || `Synced ${data.count} recordings successfully!`,
      });

      // Reload batch recordings
      loadBatchData();
    } catch (err: any) {
      console.error("[AdminDashboard] Sync error:", err);
      setSyncStatus({
        type: "error",
        message: err.message || "Failed to synchronize videos.",
      });
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncStatus(null), 6000);
    }
  };

  // Handle Certificate Lock/Unlock Toggle
  const handleToggleCertificates = async () => {
    if (!admin) return;
    setIsTogglingCert(true);
    setCertActionStatus(null);

    const newTargetState = !certsUnlocked;

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const res = await fetch("/api/admin/batch/certificates/toggle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          batchId: admin.assignedBatchId,
          unlocked: newTargetState,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update certificate status.");
      }

      setCertsUnlocked(newTargetState);
      setCertActionStatus({
        type: "success",
        message: data.message || `Certificates are now ${newTargetState ? "UNLOCKED" : "LOCKED"}.`,
      });
    } catch (err: any) {
      console.error("[AdminDashboard] Cert toggle error:", err);
      setCertActionStatus({
        type: "error",
        message: err.message || "Failed to toggle certificate state.",
      });
    } finally {
      setIsTogglingCert(false);
      setTimeout(() => setCertActionStatus(null), 6000);
    }
  };

  // Filter students by search query
  const filteredStudents = students.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (s.name || "").toLowerCase().includes(q) ||
      (s.email || "").toLowerCase().includes(q) ||
      (s.phone || "").toLowerCase().includes(q) ||
      (s.grade_class || "").toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex flex-col items-center justify-center p-6 text-slate-600 dark:text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-[#0060aa] dark:text-[#ff9d3b] mb-4" />
        <p className="text-sm font-bold uppercase tracking-widest">Loading Batch Admin Console...</p>
      </div>
    );
  }

  if (error || !admin || !batch) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex flex-col items-center justify-center p-6 text-slate-800 dark:text-slate-200">
        <div className="max-w-md w-full bg-white dark:bg-[#0a0f1c] border border-rose-200 dark:border-rose-900/30 rounded-3xl p-8 text-center shadow-xl">
          <div className="w-14 h-14 bg-rose-50 dark:bg-rose-950/40 rounded-2xl flex items-center justify-center mx-auto mb-4 text-rose-600 dark:text-rose-400">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Admin Access Restricted</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
            {error || "You are not authorized to view this batch admin console."}
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/my-batch"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#0060aa] to-[#ff8b12] text-white font-bold text-xs uppercase tracking-widest shadow-md hover:scale-[1.02] transition-transform"
            >
              Return to My Batch
            </Link>
            <Link
              href="/"
              className="w-full py-3 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300 pb-20">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/my-batch" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors text-xs font-bold uppercase tracking-wider">
              <ArrowLeft className="w-4 h-4" />
              Student View
            </Link>
            <div className="h-4 w-px bg-slate-300 dark:bg-white/10 hidden sm:block" />
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#0060aa] to-[#ff8b12] text-white shadow-sm font-black text-sm">
                SY
              </div>
              <div>
                <h1 className="text-base font-black tracking-tight leading-none text-slate-900 dark:text-white">
                  Admin Console
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#0060aa] dark:text-[#ff9d3b]">
                  {admin.assignedBatchName}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-900 dark:text-white">{admin.name}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">{admin.email}</p>
            </div>
            <span className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              {admin.role}
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 pt-8 space-y-8">
        {/* Banner: Batch Scope Isolation Notice */}
        <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#0a0f1c]/70 backdrop-blur-md p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                Isolated Administrative Scope
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Managing {batch.label || batch.name}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
              You are authenticated as the designated administrator for this cohort. Operations performed here—including video synchronization, recording management, and certificate issuance—are strictly scoped to this batch.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={loadBatchData}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>

            <Link
              href="/admin/comments"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
            >
              Moderate Comments
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Global Notifications */}
        {syncStatus && (
          <div
            className={`p-4 rounded-2xl border text-sm font-semibold flex items-center gap-3 ${
              syncStatus.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                : "bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-300"
            }`}
          >
            {syncStatus.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0" />
            )}
            <span>{syncStatus.message}</span>
          </div>
        )}

        {certActionStatus && (
          <div
            className={`p-4 rounded-2xl border text-sm font-semibold flex items-center gap-3 ${
              certActionStatus.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                : "bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-300"
            }`}
          >
            {certActionStatus.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0" />
            )}
            <span>{certActionStatus.message}</span>
          </div>
        )}

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Batch Status */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0a0f1c]/80 backdrop-blur-md p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Cohort Details
              </span>
              <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                batch.is_active
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                  : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10"
              }`}>
                {batch.is_active ? "Live Cohort" : "Archived / Legacy"}
              </span>
            </div>
            <p className="mt-4 text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {batch.name}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Starts: {batch.start_date || "To be announced"}
            </p>
          </div>

          {/* Card 2: Enrolled Students */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0a0f1c]/80 backdrop-blur-md p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Enrolled Students
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="mt-4 text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {students.length}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Verified cohort bookings
            </p>
          </div>

          {/* Card 3: Session Recordings */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0a0f1c]/80 backdrop-blur-md p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Class Recordings
              </span>
              <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-[#ff8b12] dark:text-[#ff9d3b] flex items-center justify-center">
                <Video className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {recordings.length}
              </p>
              <button
                onClick={handleSyncVideos}
                disabled={isSyncing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#0060aa] to-[#ff8b12] hover:from-[#005291] hover:to-[#e0770b] text-white text-xs font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {isSyncing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                Sync Now
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Synced with YouTube playlist
            </p>
          </div>

          {/* Card 4: Certificate Status */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0a0f1c]/80 backdrop-blur-md p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Certificates
              </span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {certsUnlocked ? (
                  <Unlock className="w-5 h-5 text-emerald-500" />
                ) : (
                  <Lock className="w-5 h-5 text-amber-500" />
                )}
                <span className={`text-base font-black uppercase tracking-wider ${
                  certsUnlocked ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                }`}>
                  {certsUnlocked ? "UNLOCKED" : "LOCKED"}
                </span>
              </div>
              <button
                onClick={handleToggleCertificates}
                disabled={isTogglingCert}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm ${
                  certsUnlocked
                    ? "bg-amber-100 hover:bg-amber-200 text-amber-900 dark:bg-amber-950/50 dark:hover:bg-amber-900/60 dark:text-amber-300"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                }`}
              >
                {isTogglingCert ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : certsUnlocked ? (
                  "Lock Certs"
                ) : (
                  "Unlock Certs"
                )}
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {issuedCerts.length} certificates generated
            </p>
          </div>
        </div>

        {/* Tab Navigation Toolbar */}
        <div className="border-b border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-4 pb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("students")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "students"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
              }`}
            >
              <Users className="w-4 h-4" />
              Students ({students.length})
            </button>

            <button
              onClick={() => setActiveTab("recordings")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "recordings"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
              }`}
            >
              <Video className="w-4 h-4" />
              Recordings ({recordings.length})
            </button>

            <button
              onClick={() => setActiveTab("certificates")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "certificates"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
              }`}
            >
              <Award className="w-4 h-4" />
              Certificates ({issuedCerts.length})
            </button>
          </div>

          {activeTab === "students" && (
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-[#0a0f1c] border border-slate-200 dark:border-white/10 outline-none focus:ring-1 focus:ring-[#0060aa] text-slate-900 dark:text-white"
              />
            </div>
          )}
        </div>

        {/* Tab 1: Enrolled Students */}
        {activeTab === "students" && (
          <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0a0f1c]/80 backdrop-blur-md overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-4 px-6">Student</th>
                    <th className="py-4 px-6">Contact</th>
                    <th className="py-4 px-6">Grade</th>
                    <th className="py-4 px-6">Payment</th>
                    <th className="py-4 px-6">Promo Code</th>
                    <th className="py-4 px-6">Enrolled Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 dark:text-slate-500 font-medium">
                        No students found for this cohort.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((st, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 px-6">
                          <p className="font-bold text-slate-900 dark:text-white text-sm">{st.name}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">{st.email}</p>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{st.phone || "—"}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-semibold text-slate-700 dark:text-slate-300">
                          {st.grade_class || "—"}
                        </td>
                        <td className="py-4 px-6">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            {st.payment_status || "captured"}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                          {st.promo_code || "—"}
                        </td>
                        <td className="py-4 px-6 text-slate-500 dark:text-slate-400">
                          {new Date(st.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Session Recordings */}
        {activeTab === "recordings" && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0a0f1c]/80 backdrop-blur-md p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  YouTube Synchronization
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
                  {batch.youtube_playlist_id ? (
                    <>Connected to playlist <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{batch.youtube_playlist_id}</span>. Clicking sync fetches latest videos, creates new database entries, and clears deleted videos.</>
                  ) : (
                    "No playlist is currently configured in batches table for this cohort."
                  )}
                </p>
              </div>

              <button
                onClick={handleSyncVideos}
                disabled={isSyncing}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#0060aa] to-[#ff8b12] hover:from-[#005291] hover:to-[#e0770b] px-6 py-3 text-xs font-bold uppercase tracking-widest text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer shadow-md shrink-0"
              >
                {isSyncing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Synchronizing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Sync Batch Recordings
                  </>
                )}
              </button>
            </div>

            <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0a0f1c]/80 backdrop-blur-md overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                      <th className="py-4 px-6">Video Title</th>
                      <th className="py-4 px-6">Custom Date</th>
                      <th className="py-4 px-6">YouTube Video ID</th>
                      <th className="py-4 px-6">Published At</th>
                      <th className="py-4 px-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {recordings.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400 dark:text-slate-500 font-medium">
                          No session recordings present for {batch.name}.
                        </td>
                      </tr>
                    ) : (
                      recordings.map((rec) => (
                        <tr key={rec.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors">
                          <td className="py-4 px-6 font-bold text-slate-900 dark:text-white text-sm max-w-md truncate">
                            {rec.title}
                          </td>
                          <td className="py-4 px-6 font-medium text-slate-600 dark:text-slate-350">
                            {rec.custom_date || "—"}
                          </td>
                          <td className="py-4 px-6 font-mono text-blue-600 dark:text-blue-400 font-bold">
                            {rec.youtube_video_id}
                          </td>
                          <td className="py-4 px-6 text-slate-500 dark:text-slate-400">
                            {new Date(rec.published_at).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <a
                              href={`https://www.youtube.com/watch?v=${rec.youtube_video_id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#ff8b12] hover:underline"
                            >
                              Watch
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Certificate Management */}
        {activeTab === "certificates" && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0a0f1c]/80 backdrop-blur-md p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                    Cohort Certificate Release
                  </h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
                  {certsUnlocked
                    ? "Certificates are currently UNLOCKED for this cohort. Eligible students can generate, view and download their verified PDF certificates."
                    : "Certificates are currently LOCKED. Direct API requests and downloads by students are blocked until you release them."}
                </p>
              </div>

              <button
                onClick={handleToggleCertificates}
                disabled={isTogglingCert}
                className={`inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-xs font-bold uppercase tracking-widest transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer shadow-md shrink-0 ${
                  certsUnlocked
                    ? "bg-amber-600 hover:bg-amber-700 text-white"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                }`}
              >
                {isTogglingCert ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating...
                  </>
                ) : certsUnlocked ? (
                  <>
                    <Lock className="w-4 h-4" />
                    Lock Certificates
                  </>
                ) : (
                  <>
                    <Unlock className="w-4 h-4" />
                    Unlock Certificates Now
                  </>
                )}
              </button>
            </div>

            <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0a0f1c]/80 backdrop-blur-md overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-100 dark:border-white/5">
                <h4 className="text-sm font-bold uppercase tracking-widest text-slate-700 dark:text-slate-300">
                  Issued Certificates for {batch.name}
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                      <th className="py-4 px-6">Student Name</th>
                      <th className="py-4 px-6">Certificate ID</th>
                      <th className="py-4 px-6">Issued Date</th>
                      <th className="py-4 px-6 text-right">Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {issuedCerts.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-slate-400 dark:text-slate-500 font-medium">
                          No certificates issued yet for {batch.name}.
                        </td>
                      </tr>
                    ) : (
                      issuedCerts.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors">
                          <td className="py-4 px-6 font-bold text-slate-900 dark:text-white text-sm">
                            {c.user_name}
                          </td>
                          <td className="py-4 px-6 font-mono font-bold text-[#0060aa] dark:text-[#ff9d3b]">
                            {c.cert_id}
                          </td>
                          <td className="py-4 px-6 text-slate-500 dark:text-slate-400">
                            {new Date(c.created_at).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <Link
                              href={`/verify/${c.cert_id}`}
                              target="_blank"
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              Verify
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

