/* eslint-disable @next/next/no-img-element */
"use client";

import React, { Suspense, useState } from "react";
import Link from 'next/link';
import { Eye, EyeOff, Mail } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { validateEmail } from "@/lib/emailValidation";

function SignUpForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/my-batch";
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailSuggestion, setEmailSuggestion] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setEmailSuggestion("");

    // Strict Email Validation
    const validation = validateEmail(email);
    if (validation.error) {
      setErrorMsg(validation.error);
      if (validation.suggestion) setEmailSuggestion(validation.suggestion);
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
        }
      }
    });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
    } else if (data.user && data.user.identities && data.user.identities.length === 0) {
      // User already exists (Supabase returns empty identities for existing unverified accounts)
      setErrorMsg("An account with this email already exists. Please log in instead.");
    } else {
      // Verification email sent — show inbox screen
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

  // ── CHECK YOUR INBOX SCREEN ────────────────────────────────────────────
  if (emailSent) {
    return (
      <div className="bg-transparent text-slate-800 dark:text-slate-200 min-h-screen flex flex-col overflow-x-hidden font-sans transition-colors duration-300">
        <header className="fixed top-0 w-full z-50 bg-white/70 dark:bg-[#020617]/70 border-b border-slate-200/40 dark:border-white/5 backdrop-blur-3xl flex justify-between items-center px-6 md:px-12 h-24">
          <Link href="/" className="hover:scale-105 transition-transform duration-300">
            <img src="/skillyug-optimized.svg" alt="Skillyug Logo" className="h-16 md:h-20 w-auto object-contain" />
          </Link>
        </header>

        <main className="flex-grow flex items-center justify-center pt-24 pb-12 px-6 relative">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] bg-[#0060aa]/5 blur-[120px] rounded-full"></div>
            <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-[#ff8b12]/5 blur-[120px] rounded-full"></div>
          </div>

          <div className="w-full max-w-xl z-10">
            <div className="bg-white/80 dark:bg-[#0a0f1c]/80 backdrop-blur-md border border-slate-200/60 dark:border-white/5 p-8 md:p-12 rounded-[2rem] shadow-lg relative overflow-hidden text-center">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#0060aa]/5 blur-3xl"></div>

              {/* Icon */}
              <div className="flex items-center justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-orange-50 dark:bg-orange-950/40 flex items-center justify-center ring-4 ring-orange-100 dark:ring-orange-900/30">
                  <Mail className="w-10 h-10 text-[#ff8b12] dark:text-[#ff9d3b]" />
                </div>
              </div>

              <span className="text-[#0060aa] dark:text-[#ff9d3b] tracking-[0.2em] font-bold text-sm block mb-3">ALMOST THERE</span>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">
                Check Your Mail Inbox
              </h1>
              <p className="text-slate-600 dark:text-slate-350 text-base leading-relaxed mb-2">
                We&apos;ve sent a verification link to:
              </p>
              <p className="text-[#0060aa] dark:text-[#ff9d3b] font-bold text-lg mb-6 break-all">
                {email}
              </p>
              <p className="text-slate-650 dark:text-slate-350 text-sm leading-relaxed mb-8">
                Click the link in the email to verify your account and start your AI journey. The link expires in 24 hours.
              </p>

              <div className="space-y-4">
                {resendSuccess && (
                  <div className="p-3 bg-green-50 dark:bg-green-950/20 text-green-750 dark:text-green-400 rounded-xl text-sm font-semibold border border-green-200 dark:border-green-900/30">
                    ✓ Verification email resent! Check your inbox again.
                  </div>
                )}
                {errorMsg && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-405 rounded-xl text-sm font-semibold border border-red-200 dark:border-red-900/30">
                    {errorMsg}
                  </div>
                )}
                <button
                  onClick={handleResendEmail}
                  disabled={resendLoading}
                  className="w-full py-3 rounded-full border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 font-semibold text-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  {resendLoading ? "Resending..." : "Resend Verification Email"}
                </button>
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <Link href="/login" className="text-sm font-bold text-[#0060aa] dark:text-[#ff9d3b] hover:text-[#005291] dark:hover:text-[#ff8b12]">
                    Back to Log In
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ── STANDARD SIGNUP FORM ──────────────────────────────────────────────
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

          {/* Signup Card */}
          <div className="bg-white/80 dark:bg-[#0a0f1c]/80 backdrop-blur-md border border-slate-200/60 dark:border-white/5 rounded-xl p-8 md:p-12 shadow-lg relative overflow-hidden">
            {/* Internal Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#0060aa]/5 blur-[80px] rounded-full pointer-events-none"></div>

            <header className="mb-10 relative z-10">
              <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 bg-white/70 hover:bg-slate-50/80 border border-slate-200 px-3 py-1.5 rounded-lg transition-all duration-200 text-sm mb-6 w-fit dark:bg-[#0a0f1c]/70 dark:hover:bg-[#0f172a]/80 dark:border-white/5 dark:text-slate-400 dark:hover:text-white">
                <span className="font-bold tracking-widest text-xs uppercase pl-2">← BACK</span>
              </Link>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">Create Account</h1>
            </header>

            {errorMsg && (
              <div className="p-4 mb-6 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 rounded-xl text-center text-sm font-semibold border border-red-200 dark:border-red-900/30 relative z-10">
                {errorMsg}
              </div>
            )}

            <form className="space-y-6 relative z-10" onSubmit={handleSignUp}>
              {/* Full Name */}
              <div className="space-y-2">
                <label className="block text-slate-500 dark:text-slate-450 tracking-[0.05em] uppercase font-bold text-xs">Student Full Name</label>
                <input 
                  type="text" 
                  className="w-full bg-white/70 border border-slate-200 rounded-lg py-4 px-5 text-slate-800 placeholder:text-slate-400 focus:ring-1 focus:ring-[#ff8b12]/20 focus:border-[#ff8b12] dark:focus:ring-[#ff9d3b]/20 dark:focus:border-[#ff9d3b] transition-all duration-300 outline-none dark:bg-[#020617]/70 dark:border-white/10 dark:text-white dark:placeholder:text-slate-550"
                  placeholder="Enter full name"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                />
              </div>

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

              {/* Phone Input */}
              <div className="space-y-2">
                <label className="block text-slate-500 dark:text-slate-450 tracking-[0.05em] uppercase font-bold text-xs">WhatsApp Number (For class links)</label>
                <input 
                  type="tel"
                  pattern="\d{10}"
                  maxLength={10}
                  onInput={(e) => {
                    e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, "");
                  }}
                  className="w-full bg-white/70 border border-slate-200 rounded-lg py-4 px-5 text-slate-800 placeholder:text-slate-400 focus:ring-1 focus:ring-[#ff8b12]/20 focus:border-[#ff8b12] dark:focus:ring-[#ff9d3b]/20 dark:focus:border-[#ff9d3b] transition-all duration-300 outline-none dark:bg-[#020617]/70 dark:border-white/10 dark:text-white dark:placeholder:text-slate-550"
                  placeholder="WhatsApp number"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))}
                  required
                />
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="block text-slate-500 dark:text-slate-450 tracking-[0.05em] uppercase font-bold text-xs">Password</label>
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
                {loading ? "Creating Account..." : "Create Account"}
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
              <p className="text-sm text-slate-500 dark:text-slate-455">
                Already have an account?{" "}
                <Link 
                  href="/login" 
                  className="font-bold text-[#0060aa] dark:text-[#ff9d3b] hover:text-[#005291] dark:hover:text-[#ff8b12] transition-colors"
                >
                  Log In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 flex items-center justify-center bg-[#f8fafc] dark:bg-[#020617]">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-orange-200 border-t-[#0060aa]" />
      </div>
    }>
      <SignUpForm />
    </Suspense>
  );
}
