"use client";

import React, { useState } from "react";
import Link from 'next/link';
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from 'next/navigation';
import { supabase } from "@/lib/supabaseClient";

export default function SignUpPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `https://www.skillyugedu.com/auth/callback`,
        data: {
          full_name: fullName,
          phone_number: phoneNumber,
        }
      }
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      // Show the "check your email" screen
      setEmailSent(true);
      setLoading(false);
    }
  };

  // Email verification sent screen
  if (emailSent) {
    return (
      <div className="bg-[#0e0e10] text-[#f9f5f8] min-h-screen flex flex-col items-center justify-center px-6 font-sans">
        <div className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] bg-[#ac8aff]/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-[#a4a6ff]/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="bg-[#262528]/40 backdrop-blur-3xl border-t border-l border-[#48474a]/25 p-10 md:p-14 rounded-[2rem] shadow-2xl relative z-10 max-w-lg w-full text-center space-y-6">
          <div className="text-6xl">📬</div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#f9f5f8]">Check your Mailbox!</h1>
          <p className="text-[#adaaad] text-lg leading-relaxed">
            We sent a verification link to <span className="text-[#a4a6ff] font-bold">{email}</span>.
            Click it to activate your account and access Skillyug.
          </p>
          <p className="text-[#767577] text-sm">Didn't receive it? Check your spam folder.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0e0e10] text-[#f9f5f8] min-h-screen selection:bg-[#a4a6ff]/30 flex flex-col overflow-x-hidden font-sans">
      {/* Header Navigation */}
      <header className="fixed top-0 w-full z-50 bg-[#0e0e10]/80 backdrop-blur-3xl flex justify-between items-center px-6 md:px-12 h-24">
        <Link href="/">
          <div className="text-4xl font-black text-[#f9f5f8] tracking-tighter cursor-pointer">
            Skillyug
          </div>
        </Link>
      </header>

      {/* Main Content Canvas */}
      <main className="flex-grow flex items-center justify-center pt-24 pb-12 px-6 relative">
        {/* Atmospheric Background Glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] bg-[#ac8aff]/10 blur-[120px] rounded-full"></div>
          <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-[#a4a6ff]/10 blur-[120px] rounded-full"></div>
        </div>

        <div className="w-full max-w-xl z-10">
          {/* Glassmorphism Container */}
          <div className="bg-[#262528]/40 backdrop-blur-3xl border-t border-l border-[#48474a]/25 p-8 md:p-12 rounded-[2rem] shadow-2xl relative overflow-hidden">
            {/* Internal Glow Effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#a4a6ff]/5 blur-3xl"></div>
            
            <div className="relative z-10 space-y-8">
              {/* Back Button */}
              <Link href="/" className="inline-flex items-center gap-2 text-[#adaaad] hover:text-[#a4a6ff] transition-colors group mb-4">
                <span className="font-bold text-sm tracking-widest pl-2">← BACK</span>
              </Link>
              
              {/* Editorial Header */}
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
              
              {/* Signup Form */}
              <form className="space-y-6" onSubmit={handleSignUp}>
                {/* Full Name Field */}
                <div className="space-y-2">
                  <label className="text-sm block text-[#adaaad] font-bold tracking-wider" htmlFor="full_name">FULL NAME</label>
                  <div className="relative group">
                    <input 
                      id="full_name"
                      type="text"
                      className="w-full bg-[#262528]/30 border-none rounded-xl py-4 px-4 text-[#f9f5f8] placeholder:text-[#767577] focus:ring-2 focus:ring-[#a4a6ff] transition-all outline-none"
                      placeholder="Full name"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                {/* Email Address Field */}
                <div className="space-y-2">
                  <label className="text-sm block text-[#adaaad] font-bold tracking-wider" htmlFor="email">EMAIL ADDRESS</label>
                  <div className="relative group">
                    <input 
                      id="email"
                      type="email"
                      className="w-full bg-[#262528]/30 border-none rounded-xl py-4 px-4 text-[#f9f5f8] placeholder:text-[#767577] focus:ring-2 focus:ring-[#a4a6ff] transition-all outline-none"
                      placeholder="name@gmail.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                {/* Phone Number Field */}
                <div className="space-y-2">
                  <label className="text-sm block text-[#adaaad] font-bold tracking-wider" htmlFor="phone_number">PHONE NUMBER</label>
                  <div className="relative group">
                    <input 
                      id="phone_number"
                      type="tel"
                      className="w-full bg-[#262528]/30 border-none rounded-xl py-4 px-4 text-[#f9f5f8] placeholder:text-[#767577] focus:ring-2 focus:ring-[#a4a6ff] transition-all outline-none"
                      placeholder="10-digit number"
                      value={phoneNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        if (val.length <= 10) setPhoneNumber(val);
                      }}
                      pattern="[0-9]{10}"
                      title="Please enter exactly 10 digits"
                      required
                    />
                  </div>
                </div>
                
                {/* Password Field */}
                <div className="space-y-2">
                  <label className="text-sm block text-[#adaaad] font-bold tracking-wider" htmlFor="password">PASSWORD</label>
                  <div className="relative group">
                    <input 
                      id="password"
                      type={showPassword ? "text" : "password"}
                      className="w-full bg-[#262528]/30 border-none rounded-xl py-4 px-4 pr-12 text-[#f9f5f8] placeholder:text-[#767577] focus:ring-2 focus:ring-[#a4a6ff] transition-all outline-none"
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#767577] hover:text-[#a4a6ff] transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                
                {/* Primary CTA */}
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-4 rounded-full bg-gradient-to-r from-[#ac8aff] to-[#a4a6ff] text-black font-bold text-lg hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-[#a4a6ff]/20 disabled:opacity-50"
                >
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
                    options: {
                      redirectTo: `${window.location.origin}/auth/callback`,
                    },
                  });
                  if (error) setErrorMsg(error.message);
                }}
                className="w-full bg-[#262528]/50 hover:bg-[#262528] border border-[#48474a]/25 text-[#f9f5f8] font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-3"
              >
                <img src="/Google.png" alt="Google" className="w-5 h-5" />
                Continue with Google
              </button>
              
              {/* Footer Link */}
              <div className="pt-4 text-center">
                <p className="text-[#adaaad]">
                  Already have an account? 
                  <Link href="/login" className="text-[#a4a6ff] font-bold hover:underline ml-1">Log In</Link>
                </p>
              </div>
            </div>
          </div>
          
          {/* Trust Badge Section */}
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
