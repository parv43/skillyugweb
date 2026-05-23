/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GraduationCap, Users, Mail, Lock, User, ArrowRight, Loader2, X } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { validateEmail } from "@/lib/emailValidation";

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const from = searchParams.get("from") || "";
  const studentEmail = searchParams.get("studentEmail") || "";

  const [loading, setLoading] = useState(false);
  const [showParentModal, setShowParentModal] = useState(false);
  const [modalTab, setModalTab] = useState<"login" | "signup">("login");

  // Parent Auth States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Handle student Google login
  const handleStudentAuth = async () => {
    setErrorMsg("");
    setLoading(true);
    try {
      let nextPath = "/onboarding/resolve?role=student";
      if (token) {
        nextPath += `&token=${encodeURIComponent(token)}`;
      }
      if (from) {
        nextPath += `&from=${encodeURIComponent(from)}`;
      }
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
        },
      });

      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to start Google sign-in.");
      setLoading(false);
    }
  };

  // Handle parent Google login
  const handleParentGoogleAuth = async () => {
    setErrorMsg("");
    setLoading(true);
    try {
      let nextPath = "/onboarding/resolve?role=parent";
      if (token) {
        nextPath += `&token=${encodeURIComponent(token)}`;
      }
      if (from) {
        nextPath += `&from=${encodeURIComponent(from)}`;
      }
      if (studentEmail) {
        nextPath += `&kidEmail=${encodeURIComponent(studentEmail)}`;
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
        },
      });

      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to start Google sign-in.");
      setLoading(false);
    }
  };

  // Handle parent Email/Password login or signup
  const handleParentAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const emailCheck = validateEmail(email);
    if (emailCheck.error) {
      setErrorMsg(emailCheck.error);
      return;
    }

    if (modalTab === "signup" && !fullName.trim()) {
      setErrorMsg("Please enter your full name.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      if (modalTab === "signup") {
        // Sign Up Parent
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              role: "parent",
            },
          },
        });

        if (error) throw error;

        // Note: trigger handles adding them to public.users automatically
        if (data.session) {
          // Auto-logged in
          setSuccessMsg("Account created! Redirecting...");
          let nextUrl = "/parent-portal";
          const params = new URLSearchParams();
          if (token) params.set("token", token);
          if (studentEmail) params.set("kidEmail", studentEmail);
          const queryString = params.toString();
          if (queryString) nextUrl += `?${queryString}`;
          setTimeout(() => router.push(nextUrl), 50);
        } else {
          setSuccessMsg("Check your inbox/spam for a verification link to activate your parent account.");
          setLoading(false);
        }
      } else {
        // Log In Parent
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          // Explicitly call onboarding role post-check to verify the role is correctly initialized
          await fetch("/api/onboarding/role", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role: "parent", fullName: fullName || data.user.user_metadata?.full_name }),
          });

          setSuccessMsg("Login successful! Redirecting...");
          let nextUrl = "/parent-portal";
          const params = new URLSearchParams();
          if (token) params.set("token", token);
          if (studentEmail) params.set("kidEmail", studentEmail);
          const queryString = params.toString();
          if (queryString) nextUrl += `?${queryString}`;
          setTimeout(() => router.push(nextUrl), 50);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Authentication failed. Please verify credentials.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col md:flex-row relative font-sans select-none overflow-x-hidden">
      
      {/* Left Column - Sidebar (Deep Purple-Blue) */}
      <div className="md:w-[40%] bg-gradient-to-b from-[#2a1b6d] to-[#100735] text-white p-8 flex flex-col justify-between relative overflow-hidden md:min-h-screen">
        {/* Subtle background glows */}
        <div className="absolute -right-20 -top-20 w-60 h-60 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />
        
        {/* Brand Logo */}
        <div className="relative z-10">
          <button onClick={() => router.push("/")} className="hover:scale-105 transition-transform duration-300 bg-transparent border-none cursor-pointer">
            <img src="/skillyug-optimized.svg" alt="Skillyug Logo" className="h-16 w-auto object-contain brightness-0 invert" />
          </button>
        </div>

        {/* Vector Illustration */}
        <div className="relative z-10 flex-grow flex items-center justify-center py-12">
          <img 
            src="/onboarding-illustration.png" 
            alt="Skillyug Learning Together" 
            className="w-full max-w-[340px] md:max-w-full h-auto object-contain rounded-3xl shadow-2xl border border-white/5" 
          />
        </div>

        {/* Bottom Text/Footer */}
        <div className="relative z-10 text-[10px] font-mono tracking-widest text-slate-400 uppercase text-center md:text-left">
          © 2026 Skillyug • AI Bootcamp Portal
        </div>
      </div>

      {/* Right Column - Selection Area (Clean White / Light Slate) */}
      <div className="flex-1 bg-white p-6 md:p-12 lg:p-20 flex flex-col justify-center items-center md:items-start min-h-[500px]">
        <div className="w-full max-w-lg space-y-12">
          
          {token && (
            <div className="px-5 py-3 rounded-xl border border-purple-200 bg-purple-50/70 text-purple-700 text-xs font-semibold tracking-wide animate-pulse">
              Sponsorship request detected! Please sign up or log in as a parent.
            </div>
          )}

          {/* Heading */}
          <div className="space-y-3 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Welcome to Skillyug!
            </h1>
            <p className="text-slate-500 text-sm font-medium">
              Choose an account type to proceed
            </p>
          </div>

          {/* Selection Cards List */}
          <div className="space-y-5">
            {/* Student Account Card */}
            <button
              onClick={handleStudentAuth}
              disabled={loading}
              className="w-full text-left flex items-center justify-between p-5 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white shadow-sm hover:shadow-md transition-all duration-300 group hover:scale-[1.01] cursor-pointer"
            >
              <div className="flex items-center gap-4">
                {/* Icon Container with cyan tint */}
                <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                  <GraduationCap className="w-6 h-6 text-cyan-500" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Student account</h3>
                  <p className="text-xs text-slate-400 mt-0.5">I&apos;m a student</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-1.5 transition-all" />
            </button>

            {/* Parent Account Card */}
            <button
              onClick={() => {
                setModalTab("login");
                setErrorMsg("");
                setSuccessMsg("");
                setShowParentModal(true);
              }}
              disabled={loading}
              className="w-full text-left flex items-center justify-between p-5 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white shadow-sm hover:shadow-md transition-all duration-300 group hover:scale-[1.01] cursor-pointer"
            >
              <div className="flex items-center gap-4">
                {/* Icon Container with violet/purple tint */}
                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                  <Users className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Parent account</h3>
                  <p className="text-xs text-slate-400 mt-0.5">I&apos;m a parent</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-1.5 transition-all" />
            </button>
          </div>

          {/* Bottom Help Notice */}
          <div className="text-xs text-slate-400 text-center md:text-left pt-6 border-t border-slate-100 flex flex-wrap justify-between gap-4">
            <span>Need help onboarding? <a href="/#contact" className="text-blue-600 hover:text-blue-500 hover:underline font-semibold transition-all">Contact support</a></span>
            <span>Classes 6 to 12 AI Bootcamps</span>
          </div>

        </div>
      </div>

      {/* ── Parent Auth Modal ────────────────────────────────────── */}
      {showParentModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-md animate-in fade-in duration-300"
        >
          <div className="relative w-full max-w-md rounded-[2.5rem] border border-slate-100 bg-white p-6 md:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden text-slate-900">
            <div className="absolute -right-16 -top-16 w-36 h-36 bg-purple-500/5 blur-[50px] rounded-full pointer-events-none" />

            <button
              onClick={() => setShowParentModal(false)}
              className="absolute top-6 right-6 rounded-full bg-slate-100 p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-8">
              <div className="rounded-xl border border-purple-100 bg-purple-50 p-3">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-slate-400 font-mono">Parent Access</p>
                <h3 className="text-lg font-black text-slate-900">Parent Portal Gateway</h3>
              </div>
            </div>

            {/* Tabs */}
            <div className="grid grid-cols-2 bg-slate-100 rounded-xl p-1 mb-6 border border-slate-200/50">
              <button
                type="button"
                onClick={() => {
                  setModalTab("login");
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
                className={`py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                  modalTab === "login"
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => {
                  setModalTab("signup");
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
                className={`py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                  modalTab === "signup"
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Sign Up
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 mb-5 rounded-xl border border-red-200 bg-red-50 text-center text-xs font-semibold text-red-700 animate-in fade-in duration-200">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="p-3 mb-5 rounded-xl border border-green-200 bg-green-50 text-center text-xs font-semibold text-green-700 animate-in fade-in duration-200">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleParentAuth} className="space-y-4">
              {modalTab === "signup" && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-[0.2em] shadow-lg hover:bg-blue-500 active:scale-[0.98] transition-all disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {modalTab === "signup" ? "Create Account" : "Log In"}
              </button>

              <div className="relative flex items-center py-3">
                <div className="flex-grow border-t border-slate-100"></div>
                <span className="flex-shrink-0 mx-4 text-slate-400 text-[10px] font-bold uppercase tracking-wider">Or</span>
                <div className="flex-grow border-t border-slate-100"></div>
              </div>

              <button
                type="button"
                onClick={handleParentGoogleAuth}
                disabled={loading}
                className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold py-3.5 rounded-xl text-xs uppercase tracking-[0.18em] transition-all flex items-center justify-center gap-2.5 active:scale-[0.98]"
              >
                <img src="/Google.png" alt="Google" className="w-4 h-4" />
                Continue with Google
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OnboardingClient() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center text-slate-600">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  );
}
