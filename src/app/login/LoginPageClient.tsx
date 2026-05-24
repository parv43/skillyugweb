/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, Suspense } from "react";
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2, User } from "lucide-react";
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from "@/lib/supabaseClient";
import { validateEmail } from "@/lib/emailValidation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/my-batch';
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailSuggestion, setEmailSuggestion] = useState("");

  React.useEffect(() => {
    const checkLoggedIn = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        let role = session.user.user_metadata?.role;
        
        // Try local storage cache next
        if (!role) {
          try {
            role = localStorage.getItem("user_role") || undefined;
          } catch {}
        }
        
        // Fallback to database query if not found anywhere
        if (!role) {
          try {
            const { data: profile } = await supabase
              .from("users")
              .select("role")
              .eq("id", session.user.id)
              .maybeSingle();
            if (profile?.role) {
              role = profile.role;
              try {
                localStorage.setItem("user_role", role);
              } catch {}
            }
          } catch (err) {
            console.error("Error fetching user role on automatic redirect check:", err);
          }
        } else {
          // Sync role cache to local storage
          try {
            localStorage.setItem("user_role", role);
          } catch {}
        }
        
        const searchStr = window.location.search;
        if (role === "parent") {
          router.replace(`/parent-portal${searchStr}`);
        } else if (role === "student") {
          router.replace(`/my-batch${searchStr}`);
        } else {
          router.replace(`${redirectTo}${searchStr}`);
        }
      }
    };
    checkLoggedIn();
  }, [router, redirectTo]);
  
  const authInfoMsg =
    searchParams.get("reset") === "success"
      ? "Your password has been updated. Log in with your new password."
      : searchParams.get("error") === "auth_error"
        ? "We could not complete that sign-in. Please try again."
        : "";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setEmailSuggestion("");

    // Email validation
    const validation = validateEmail(email);
    if (validation.error) {
      setErrorMsg(validation.error);
      if (validation.suggestion) {
        setEmailSuggestion(validation.suggestion);
      }
      return;
    }

    setLoading(true);

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (
        error.message.toLowerCase().includes("email not confirmed") ||
        error.message.toLowerCase().includes("invalid login credentials")
      ) {
        setErrorMsg(
          "Invalid email or password. Please make sure your credentials are correct."
        );
      } else {
        setErrorMsg(error.message);
      }
      setLoading(false);
    } else if (authData.user) {
      let role = authData.user.user_metadata?.role;
      if (!role) {
        try {
          const { data: profile } = await supabase
            .from("users")
            .select("role")
            .eq("id", authData.user.id)
            .maybeSingle();
          if (profile?.role) {
            role = profile.role;
          }
        } catch (roleErr) {
          console.error("Error fetching user role on login:", roleErr);
        }
      }

      if (role) {
        try {
          localStorage.setItem("user_role", role);
        } catch {}
      }

      if (role === "parent") {
        setSuccessMsg("Success! Routing to Parent Portal...");
        setTimeout(() => router.push("/parent-portal"), 50);
      } else if (role === "student") {
        setSuccessMsg("Success! Routing to Student Batch...");
        setTimeout(() => router.push("/my-batch"), 50);
      } else {
        setSuccessMsg("Success! Loading dashboard...");
        setTimeout(() => router.push(redirectTo), 50);
      }
    }
  };

  const handleEmailBlur = () => {
    const validation = validateEmail(email);
    if (validation.suggestion) {
      setEmailSuggestion(validation.suggestion);
    } else {
      setEmailSuggestion("");
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col md:flex-row relative font-sans select-none overflow-x-hidden">
      
      {/* Left Column Sidebar (Deep Purple-Blue) */}
      <div className="md:w-[40%] bg-gradient-to-b from-[#2a1b6d] to-[#100735] text-white p-8 flex flex-col justify-between relative md:min-h-screen">
        <div className="absolute -right-20 -top-20 w-60 h-60 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />
        <div>
          <button onClick={() => router.push("/")} className="hover:scale-105 transition-transform duration-300 bg-transparent border-none cursor-pointer">
            <img src="/skillyug-optimized.svg" alt="Skillyug Logo" className="h-16 w-auto object-contain brightness-0 invert" />
          </button>
        </div>
        <div className="flex-grow flex items-center justify-center py-12">
          <img src="/onboarding-illustration.png" alt="Skillyug" className="w-full max-w-[320px] md:max-w-full h-auto object-contain rounded-3xl shadow-2xl" />
        </div>
        <div className="text-[10px] font-mono tracking-widest text-slate-400 uppercase text-center md:text-left">
          © 2026 Skillyug • AI Bootcamp Portal
        </div>
      </div>

      {/* Right Column Login Form */}
      <div className="flex-1 bg-white p-6 md:p-12 lg:p-20 flex flex-col justify-center items-center md:items-start min-h-[500px]">
        <div className="w-full max-w-md space-y-10">
          
          {/* Header */}
          <div className="space-y-3 text-center md:text-left">
            <Link href="/onboarding" className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors text-xs font-bold uppercase tracking-wider mb-2">
              ← Back
            </Link>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Welcome Back
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Login to access your student batch or parent portal.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-700 rounded-xl text-center text-xs font-semibold border border-red-200">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-green-50 text-green-700 rounded-xl text-center text-xs font-semibold border border-green-200">
              {successMsg}
            </div>
          )}

          {authInfoMsg && (
            <div className="p-3 bg-blue-50 text-blue-700 rounded-xl text-center text-xs font-semibold border border-blue-200">
              {authInfoMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Email Address */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-[0.18em] text-slate-500" htmlFor="email">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (emailSuggestion) setEmailSuggestion(""); }}
                  onBlur={handleEmailBlur}
                  placeholder="name@example.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>
              {emailSuggestion && (
                <div className="mt-2 text-xs text-purple-600 flex items-center gap-1.5 animate-in fade-in duration-200">
                  <span>💡 Did you mean </span>
                  <button type="button" onClick={() => { const [name] = email.split("@"); setEmail(`${name}@${emailSuggestion}`); setEmailSuggestion(""); }} className="font-bold underline hover:text-purple-800 transition-colors">
                    {emailSuggestion}?
                  </button>
                </div>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold uppercase tracking-[0.18em] text-slate-500" htmlFor="password">Password</label>
                <Link
                  href={`/forgot-password${email ? `?loginEmail=${encodeURIComponent(email)}` : ''}`}
                  className="text-[10px] font-bold uppercase tracking-[0.15em] text-blue-600 hover:text-blue-500 hover:underline transition-all"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-[0.2em] shadow-lg hover:bg-blue-500 active:scale-[0.98] transition-all disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Login
            </button>
          </form>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-slate-100"></div>
            <span className="flex-shrink-0 mx-4 text-slate-400 text-[10px] font-bold uppercase tracking-wider">Or</span>
            <div className="flex-grow border-t border-slate-100"></div>
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={async () => {
              setErrorMsg("");
              const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                  redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(`/onboarding/resolve?role=student`)}`,
                },
              });
              if (error) setErrorMsg(error.message);
            }}
            className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold py-3.5 rounded-xl text-xs uppercase tracking-[0.18em] transition-all flex items-center justify-center gap-2.5 active:scale-[0.98]"
          >
            <img src="/Google.png" alt="Google" className="w-4 h-4" />
            Continue with Google
          </button>

          <div className="pt-4 text-center">
            <p className="text-slate-400 text-sm">
              Don&apos;t have an account? 
              <Link href={`/onboarding`} className="text-blue-600 font-bold hover:underline ml-1">Sign Up</Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
