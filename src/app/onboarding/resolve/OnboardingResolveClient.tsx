"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

function ResolveContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const resolveRoleAndRedirect = async () => {
      try {
        const role = searchParams.get("role");
        const token = searchParams.get("token") || "";

        if (!role || !["student", "parent"].includes(role)) {
          setErrorMsg("Invalid onboarding parameters.");
          return;
        }

        // Get current authenticated user
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          // If not logged in, redirect back to onboarding with original params
          let redirectUrl = `/onboarding`;
          const params = new URLSearchParams();
          if (role) params.set("role", role);
          if (token) params.set("token", token);
          const qs = params.toString();
          if (qs) redirectUrl += `?${qs}`;
          
          router.replace(redirectUrl);
          return;
        }

        // Save role in public.users database
        const res = await fetch("/api/onboarding/role", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            role,
            fullName: session.user.user_metadata?.full_name
          })
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to save onboarding role");
        }

        // Clear local storage and session cache for my-batch access to force refresh
        try {
          sessionStorage.removeItem("mybatch_access");
        } catch {}

        // Redirect based on role
        if (role === "student") {
          const fromParam = searchParams.get("from");
          if (fromParam === "bootcamp") {
            router.replace("/book-slot?from=bootcamp");
          } else {
            router.replace("/my-batch");
          }
        } else if (role === "parent") {
          let parentPath = "/parent-portal";
          if (token) {
            parentPath += `?token=${encodeURIComponent(token)}`;
          }
          router.replace(parentPath);
        }
      } catch (err: any) {
        console.error("[Onboarding Resolve] Error resolving role:", err);
        setErrorMsg(err.message || "An error occurred during onboarding setup.");
      }
    };

    resolveRoleAndRedirect();
  }, [router, searchParams]);

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-[#020617] text-slate-50 flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center space-y-4">
          <p className="text-sm font-bold text-red-400">Onboarding Configuration Error</p>
          <p className="text-xs text-slate-400 leading-relaxed">{errorMsg}</p>
          <button
            onClick={() => router.push("/onboarding")}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold uppercase tracking-wider text-white transition-colors"
          >
            Back to Onboarding
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-50 flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      <p className="text-xs font-mono uppercase tracking-[0.24em] text-slate-400">
        Configuring your Skillyug workspace...
      </p>
    </div>
  );
}

export default function OnboardingResolveClient() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#020617] flex items-center justify-center text-slate-200">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    }>
      <ResolveContent />
    </Suspense>
  );
}
