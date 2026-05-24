/* eslint-disable @next/next/no-img-element */
"use client";

import React, { Suspense, useState } from "react";
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { validateEmail } from "@/lib/emailValidation";

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/my-batch";
  const role = "parent"; // Forced to parent as students are registered via Parent Portal checkout

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailSuggestion, setEmailSuggestion] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  React.useEffect(() => {
    const checkLoggedIn = async () => {
      try {
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
              console.error("Error checking session role on signup redirect:", err);
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
          }
        }
      } catch (err) {
        console.error("Error checking signup auth session:", err);
      }
    };
    checkLoggedIn();
  }, [router]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setEmailSuggestion("");

    // Email validation
    const validation = validateEmail(email);
    if (validation.error) {
      setErrorMsg(validation.error);
      if (validation.suggestion) setEmailSuggestion(validation.suggestion);
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
        data: {
          full_name: fullName,
          phone_number: phoneNumber,
          role: role,
        }
      }
    });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
    } else if (data.user && data.user.identities && data.user.identities.length === 0) {
      setErrorMsg("An account with this email already exists. Please log in instead.");
    } else {
      setEmailSent(true);
    }
  };

  const handleResendEmail = async () => {
    setResendLoading(true);
    setResendSuccess(false);
    setErrorMsg("");
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      }
    });
    setResendLoading(false);
    if (!error) {
      setResendSuccess(true);
    } else {
      setErrorMsg("Failed to resend email. Please try again in a minute.");
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

  // ── VERIFICATION EMAIL SENT VIEW ─────────────────────────────────────────
  if (emailSent) {
    return (
      <div className="min-h-screen bg-white text-slate-900 flex flex-col md:flex-row relative font-sans select-none overflow-x-hidden">
        
        {/* Left Column Sidebar */}
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

        {/* Right Column Content */}
        <div className="flex-1 bg-white p-6 md:p-12 lg:p-20 flex flex-col justify-center items-center">
          <div className="w-full max-w-md space-y-8 text-center">
            
            <div className="flex items-center justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shadow-sm">
                <Mail className="w-9 h-9 text-blue-600" />
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-blue-600 tracking-[0.2em] font-bold text-xs uppercase block">Almost There</span>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Check Your Mail Inbox</h1>
              <p className="text-slate-500 text-sm leading-relaxed">
                We&apos;ve sent a verification link to:
              </p>
              <p className="text-blue-600 font-bold text-base break-all bg-blue-50 py-2.5 px-4 rounded-xl border border-blue-100/55">
                {email}
              </p>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm mx-auto">
              Click the link inside the email to verify your account and activate your slot access. The link is valid for 24 hours.
            </p>

            <div className="space-y-4 pt-4 border-t border-slate-100">
              {resendSuccess && (
                <div className="p-3 bg-green-50 text-green-700 rounded-xl text-xs font-semibold border border-green-200">
                  ✓ Verification email resent! Check your inbox again.
                </div>
              )}
              {errorMsg && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-semibold border border-red-200">
                  {errorMsg}
                </div>
              )}
              
              <button
                onClick={handleResendEmail}
                disabled={resendLoading}
                className="w-full py-3.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-400 font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50"
              >
                {resendLoading ? "Resending..." : "Resend Email"}
              </button>
              
              <button
                onClick={() => setEmailSent(false)}
                className="w-full text-slate-400 hover:text-slate-600 font-bold text-xs uppercase tracking-wider transition-colors"
              >
                ← Back to Sign Up
              </button>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // ── REGULAR SIGNUP FORM VIEW ───────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col md:flex-row relative font-sans select-none overflow-x-hidden">
      
      {/* Left Column Sidebar */}
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

      {/* Right Column Signup Form */}
      <div className="flex-1 bg-white p-6 md:p-12 lg:p-20 flex flex-col justify-center items-center md:items-start min-h-[500px]">
        <div className="w-full max-w-md space-y-10">
          
          {/* Header */}
          <div className="space-y-3 text-center md:text-left">
            <span className="text-blue-600 tracking-[0.2em] font-bold text-xs uppercase block">Get Started</span>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Create your {role === "parent" ? "Parent" : "Student"} account
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Start your journey towards AI mastery with Skillyug.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-700 rounded-xl text-center text-xs font-semibold border border-red-200">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-4">
            
            {/* Full Name */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-[0.18em] text-slate-500" htmlFor="full_name">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="full_name"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Tanuj Pathak"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>
            </div>

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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
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

            {/* Phone Number */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-[0.18em] text-slate-500" htmlFor="phone_number">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="phone_number"
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => { const val = e.target.value.replace(/\D/g, ""); if (val.length <= 10) setPhoneNumber(val); }}
                  placeholder="10-digit mobile number"
                  pattern="[0-9]{10}"
                  title="Please enter exactly 10 digits"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-[0.18em] text-slate-500" htmlFor="password">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
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
              Create Account
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
                  redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(`/onboarding/resolve?role=${role}`)}`,
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
              Already have an account? 
              <Link href={`/login?redirect=${encodeURIComponent(redirectTo)}`} className="text-blue-600 font-bold hover:underline ml-1">Log In</Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    }>
      <SignUpForm />
    </Suspense>
  );
}
