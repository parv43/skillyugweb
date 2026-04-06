"use client";

import React, { Suspense, useState } from "react";
import Link from 'next/link';
import { Eye, EyeOff, Mail } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { validateEmail } from "@/lib/emailValidation";

function SignUpForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/book-slot";
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
      <div className="bg-[#0e0e10] text-[#f9f5f8] min-h-screen selection:bg-[#a4a6ff]/30 flex flex-col overflow-x-hidden font-sans">
        <header className="fixed top-0 w-full z-50 bg-[#0e0e10]/80 backdrop-blur-3xl flex justify-between items-center px-6 md:px-12 h-24">
          <Link href="/" className="hover:scale-105 transition-transform duration-300">
            <img src="/skillyug.png" alt="Skillyug Logo" className="h-16 md:h-20 w-auto object-contain" />
          </Link>
        </header>

        <main className="flex-grow flex items-center justify-center pt-24 pb-12 px-6 relative">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] bg-[#ac8aff]/10 blur-[120px] rounded-full"></div>
            <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-[#a4a6ff]/10 blur-[120px] rounded-full"></div>
          </div>

          <div className="w-full max-w-xl z-10">
            <div className="bg-[#262528]/40 backdrop-blur-3xl border-t border-l border-[#48474a]/25 p-8 md:p-12 rounded-[2rem] shadow-2xl relative overflow-hidden text-center">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#a4a6ff]/5 blur-3xl"></div>

              {/* Icon */}
              <div className="flex items-center justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-[#a4a6ff]/20 flex items-center justify-center ring-4 ring-[#a4a6ff]/30">
                  <Mail className="w-10 h-10 text-[#a4a6ff]" />
                </div>
              </div>

              <span className="text-[#ac8aff] tracking-[0.2em] font-bold text-sm block mb-3">ALMOST THERE</span>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#f9f5f8] mb-4">
                Check Your Mail Inbox
              </h1>
              <p className="text-[#adaaad] text-base leading-relaxed mb-2">
                We've sent a verification link to:
              </p>
              <p className="text-[#a4a6ff] font-bold text-lg mb-6 break-all">
                {email}
              </p>
              <p className="text-[#adaaad] text-sm leading-relaxed mb-8">
                Click the link in the email to verify your account and start your AI journey. The link expires in 24 hours.
              </p>

              <div className="space-y-4">
                {resendSuccess && (
                  <div className="p-3 bg-green-500/20 text-green-300 rounded-xl text-sm font-semibold border border-green-500/30">
                    ✓ Verification email resent! Check your inbox again.
                  </div>
                )}
                {errorMsg && (
                  <div className="p-3 bg-red-500/20 text-red-300 rounded-xl text-sm font-semibold border border-red-500/30">
                    {errorMsg}
                  </div>
                )}
                <button
                  onClick={handleResendEmail}
                  disabled={resendLoading}
                  className="w-full py-3 rounded-full border border-[#48474a]/50 text-[#adaaad] hover:text-[#f9f5f8] hover:border-[#a4a6ff]/50 font-semibold text-sm transition-all disabled:opacity-50"
                >
                  {resendLoading ? "Resending..." : "Didn't get it? Resend Email"}
                </button>
                <button
                  onClick={() => setEmailSent(false)}
                  className="w-full py-3 rounded-full text-[#adaaad] hover:text-[#f9f5f8] font-semibold text-sm transition-colors"
                >
                  ← Back to Sign Up
                </button>
              </div>

              <div className="mt-8 pt-6 border-t border-[#48474a]/25">
                <p className="text-[#adaaad] text-sm">
                  Already verified?{" "}
                  <Link href={`/login?redirect=${encodeURIComponent(redirectTo)}`} className="text-[#a4a6ff] font-bold hover:underline">
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

  // ── SIGNUP FORM ────────────────────────────────────────────────────────
  return (
    <div className="bg-[#0e0e10] text-[#f9f5f8] min-h-screen selection:bg-[#a4a6ff]/30 flex flex-col overflow-x-hidden font-sans">
      <header className="fixed top-0 w-full z-50 bg-[#0e0e10]/80 backdrop-blur-3xl flex justify-between items-center px-6 md:px-12 h-24">
        <Link href="/" className="hover:scale-105 transition-transform duration-300">
          <img src="/skillyug.png" alt="Skillyug Logo" className="h-16 md:h-20 w-auto object-contain" />
        </Link>
      </header>

      <main className="flex-grow flex items-center justify-center pt-24 pb-12 px-6 relative">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] bg-[#ac8aff]/10 blur-[120px] rounded-full"></div>
          <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-[#a4a6ff]/10 blur-[120px] rounded-full"></div>
        </div>

        <div className="w-full max-w-xl z-10">
          <div className="bg-[#262528]/40 backdrop-blur-3xl border-t border-l border-[#48474a]/25 p-8 md:p-12 rounded-[2rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#a4a6ff]/5 blur-3xl"></div>
            
            <div className="relative z-10 space-y-8">
              <Link href="/" className="inline-flex items-center gap-2 text-[#adaaad] hover:text-[#a4a6ff] transition-colors group mb-4">
                <span className="font-bold text-sm tracking-widest pl-2">← BACK</span>
              </Link>
              
              <div className="space-y-2 text-center md:text-left">
                <span className="text-[#ac8aff] tracking-[0.2em] font-bold text-sm">GET STARTED</span>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#f9f5f8]">Join Skillyug</h1>
                <p className="text-[#adaaad] text-lg">Start your journey towards AI mastery.</p>
              </div>

              {errorMsg && (
                <div className="p-4 bg-red-500/20 text-red-300 rounded-xl text-center text-sm font-semibold border border-red-500/30">
                  {errorMsg}
                </div>
              )}
              
              <form className="space-y-6" onSubmit={handleSignUp}>
                <div className="space-y-2">
                  <label className="text-sm block text-[#adaaad] font-bold tracking-wider" htmlFor="full_name">FULL NAME</label>
                  <input 
                    id="full_name" type="text"
                    className="w-full bg-[#262528]/30 border-none rounded-xl py-4 px-4 text-[#f9f5f8] placeholder:text-[#767577] focus:ring-2 focus:ring-[#a4a6ff] transition-all outline-none"
                    placeholder="Full name" value={fullName}
                    onChange={e => setFullName(e.target.value)} required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm block text-[#adaaad] font-bold tracking-wider" htmlFor="email">EMAIL ADDRESS</label>
                  <input 
                    id="email" type="email"
                    className="w-full bg-[#262528]/30 border-none rounded-xl py-4 px-4 text-[#f9f5f8] placeholder:text-[#767577] focus:ring-2 focus:ring-[#a4a6ff] transition-all outline-none"
                    placeholder="name@gmail.com" value={email}
                    onChange={e => { setEmail(e.target.value); if (emailSuggestion) setEmailSuggestion(""); }}
                    onBlur={handleEmailBlur} required
                  />
                  {emailSuggestion && (
                    <div className="mt-2 text-sm text-[#ac8aff] flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-300">
                      <span>💡 Did you mean </span>
                      <button type="button" onClick={() => { const [name] = email.split("@"); setEmail(`${name}@${emailSuggestion}`); setEmailSuggestion(""); }} className="font-bold underline hover:text-[#f9f5f8] transition-colors">
                        {emailSuggestion}?
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm block text-[#adaaad] font-bold tracking-wider" htmlFor="phone_number">PHONE NUMBER</label>
                  <input 
                    id="phone_number" type="tel"
                    className="w-full bg-[#262528]/30 border-none rounded-xl py-4 px-4 text-[#f9f5f8] placeholder:text-[#767577] focus:ring-2 focus:ring-[#a4a6ff] transition-all outline-none"
                    placeholder="10-digit number" value={phoneNumber}
                    onChange={(e) => { const val = e.target.value.replace(/\D/g, ""); if (val.length <= 10) setPhoneNumber(val); }}
                    pattern="[0-9]{10}" title="Please enter exactly 10 digits" required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm block text-[#adaaad] font-bold tracking-wider" htmlFor="password">PASSWORD</label>
                  <div className="relative">
                    <input 
                      id="password" type={showPassword ? "text" : "password"}
                      className="w-full bg-[#262528]/30 border-none rounded-xl py-4 px-4 pr-12 text-[#f9f5f8] placeholder:text-[#767577] focus:ring-2 focus:ring-[#a4a6ff] transition-all outline-none"
                      placeholder="••••••••" value={password}
                      onChange={e => setPassword(e.target.value)} required minLength={6}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#767577] hover:text-[#a4a6ff] transition-colors">
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                
                <button type="submit" disabled={loading} className="w-full py-4 rounded-full bg-gradient-to-r from-[#ac8aff] to-[#a4a6ff] text-black font-bold text-lg hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-[#a4a6ff]/20 disabled:opacity-50">
                  {loading ? "Creating account..." : "Sign Up"}
                </button>
              </form>

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-[#48474a]/50"></div>
                <span className="flex-shrink-0 mx-4 text-[#adaaad] text-xs font-semibold uppercase tracking-wider">Or</span>
                <div className="flex-grow border-t border-[#48474a]/50"></div>
              </div>
              
              <button
                type="button"
                onClick={async () => {
                  setErrorMsg("");
                  const { error } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: { redirectTo: `${window.location.origin}/auth/callback` },
                  });
                  if (error) setErrorMsg(error.message);
                }}
                className="w-full bg-[#262528]/50 hover:bg-[#262528] border border-[#48474a]/25 text-[#f9f5f8] font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-3"
              >
                <img src="/Google.png" alt="Google" className="w-5 h-5" />
                Continue with Google
              </button>
              
              <div className="pt-4 text-center">
                <p className="text-[#adaaad]">
                  Already have an account? 
                  <Link href="/login" className="text-[#a4a6ff] font-bold hover:underline ml-1">Log In</Link>
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-12 flex flex-col items-center opacity-60 px-4">
            <div className="flex items-center gap-3">
              <span className="text-[#ac8aff]">✓</span>
              <span className="text-sm tracking-wide">Secure Encryption</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SignUpForm />
    </Suspense>
  );
}
