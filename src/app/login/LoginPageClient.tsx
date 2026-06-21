/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, Suspense } from "react";
import Link from 'next/link';
import { Eye, EyeOff } from "lucide-react";
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
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailSuggestion, setEmailSuggestion] = useState("");
  const authInfoMsg =
    searchParams.get("reset") === "success"
      ? "Your password has been updated. Log in with your new password."
      : searchParams.get("error") === "auth_error"
        ? "We could not complete that sign-in. Please try again."
        : "";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setEmailSuggestion("");

    // Strict Email Validation
    const validation = validateEmail(email);
    if (validation.error) {
      setErrorMsg(validation.error);
      if (validation.suggestion) {
        setEmailSuggestion(validation.suggestion);
      }
      setLoading(false);
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (
        error.message.toLowerCase().includes("email not confirmed") ||
        error.message.toLowerCase().includes("invalid login credentials")
      ) {
        setErrorMsg(
          "Please verify your email first. Check your Mail inbox for a verification link from Skillyug."
        );
      } else {
        setErrorMsg(error.message);
      }
      setLoading(false);
    } else {
      router.push(redirectTo);
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
    <div className="bg-transparent text-slate-800 dark:text-slate-200 min-h-screen relative overflow-hidden font-sans transition-colors duration-300">
      {/* Background Layer */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-transparent z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(0,96,170,0.03)_0%,_transparent_70%)] z-20"></div>
      </div>

      {/* Layout Shell */}
      <main className="relative z-10 flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-[480px]">
          {/* Brand Anchor */}
          <div className="flex justify-center mb-12">
            <Link href="/" className="hover:scale-105 transition-transform duration-300">
              <img src="/skillyug-optimized.svg" alt="Skillyug Logo" className="h-36 md:h-56 w-auto object-contain" />
            </Link>
          </div>

          {/* Login Card */}
          <div className="bg-white/80 dark:bg-[#0a0f1c]/80 backdrop-blur-md border border-slate-200/60 dark:border-white/5 rounded-xl p-8 md:p-12 shadow-lg relative overflow-hidden">
            {/* Internal Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#0060aa]/5 blur-[80px] rounded-full pointer-events-none"></div>
            
            <header className="mb-10 relative z-10">
              <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 bg-white/70 hover:bg-slate-50/80 border border-slate-200 px-3 py-1.5 rounded-lg transition-all duration-200 text-sm mb-6 w-fit dark:bg-[#0a0f1c]/70 dark:hover:bg-[#0f172a]/80 dark:border-white/5 dark:text-slate-400 dark:hover:text-white">
                <span className="font-bold tracking-widest text-xs uppercase pl-2">← BACK</span>
              </Link>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">Welcome Back</h1>
            </header>

            {errorMsg && (
              <div className="p-4 mb-6 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 rounded-xl text-center text-sm font-semibold border border-red-200 dark:border-red-900/30 relative z-10">
                {errorMsg}
              </div>
            )}

            {authInfoMsg && (
              <div className="p-4 mb-6 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 rounded-xl text-center text-sm font-semibold border border-blue-200 dark:border-blue-900/30 relative z-10">
                {authInfoMsg}
              </div>
            )}

            <form className="space-y-6 relative z-10" onSubmit={handleLogin}>
              {/* Email Input */}
              <div className="space-y-2">
                <label className="block text-slate-500 dark:text-slate-450 tracking-[0.05em] uppercase font-bold text-xs">Email Address</label>
                <div className="group">
                  <input 
                    type="email"
                    className="w-full bg-white/70 border border-slate-200 rounded-lg py-4 px-5 text-slate-800 placeholder:text-slate-400 focus:ring-1 focus:ring-[#ff8b12]/20 focus:border-[#ff8b12] dark:focus:ring-[#ff9d3b]/20 dark:focus:border-[#ff9d3b] transition-all duration-300 outline-none dark:bg-[#020617]/70 dark:border-white/10 dark:text-white dark:placeholder:text-slate-550" 
                    placeholder="name@gmail.com"
                    value={email}
                    onChange={e => {
                      setEmail(e.target.value);
                      if (emailSuggestion) setEmailSuggestion("");
                    }}
                    onBlur={handleEmailBlur}
                    required
                  />
                </div>
                {emailSuggestion && (
                  <div className="mt-2 text-sm text-[#0060aa] dark:text-[#ff9d3b] flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-300">
                    <span>💡 Did you mean </span>
                    <button 
                      type="button"
                      onClick={() => {
                        const [name] = email.split("@");
                        setEmail(`${name}@${emailSuggestion}`);
                        setEmailSuggestion("");
                      }}
                      className="font-bold underline text-[#0060aa] dark:text-[#ff9d3b] hover:text-[#005291] dark:hover:text-[#ff8b12]"
                    >
                      {emailSuggestion}
                    </button>
                    <span>?</span>
                  </div>
                )}
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-500 dark:text-slate-450 tracking-[0.05em] uppercase font-bold text-xs">Password</label>
                  <Link 
                    href="/forgot-password" 
                    className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-450 dark:hover:text-white transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    className="w-full bg-white/70 border border-slate-200 rounded-lg py-4 px-5 text-slate-800 placeholder:text-slate-400 focus:ring-1 focus:ring-[#ff8b12]/20 focus:border-[#ff8b12] dark:focus:ring-[#ff9d3b]/20 dark:focus:border-[#ff9d3b] transition-all duration-300 outline-none dark:bg-[#020617]/70 dark:border-white/10 dark:text-white dark:placeholder:text-slate-550" 
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full glow-button bg-gradient-to-r from-[#0060aa] to-[#ff8b12] hover:from-[#005291] hover:to-[#e0770b] text-white py-4 rounded-full font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-[0_4px_15px_rgba(255,139,18,0.15)] mt-4 disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Logging In..." : "Log In"}
              </button>

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-slate-200 dark:border-white/10"></div>
                <span className="flex-shrink-0 mx-4 text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider">Or</span>
                <div className="flex-grow border-t border-slate-200 dark:border-white/10"></div>
              </div>
              
              <button
                type="button"
                onClick={async () => {
                  setErrorMsg("");
                  const { error } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                      redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
                    },
                  });
                  if (error) setErrorMsg(error.message);
                }}
                className="w-full bg-white/80 dark:bg-transparent border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 font-bold py-4 rounded-full shadow-sm hover:shadow transition-all flex items-center justify-center gap-3 active:scale-[0.98] cursor-pointer"
              >
                <img src="/Google.png" alt="Google" className="w-5 h-5 object-contain" />
                Continue with Google
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80 text-center relative z-10">
              <p className="text-sm text-slate-500 dark:text-slate-450">
                Don&apos;t have an account?{" "}
                <Link 
                  href="/signup" 
                  className="font-bold text-[#0060aa] dark:text-[#ff9d3b] hover:text-[#005291] dark:hover:text-[#ff8b12] transition-colors"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 flex items-center justify-center bg-[#f8fafc] dark:bg-[#020617]">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-orange-200 border-t-[#0060aa]" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
