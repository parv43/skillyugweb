"use client";

import React, { useState } from "react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Supabase returns "Email not confirmed" when user hasn't verified
      if (error.message.toLowerCase().includes("email not confirmed") || error.message.toLowerCase().includes("invalid login credentials")) {
        setErrorMsg("Wrong credentials or email not verified. Please check your inbox and verify your email first.");
      } else {
        setErrorMsg(error.message);
      }
      setLoading(false);
    } else {
      router.push("/book-slot");
    }
  };

  return (
    <div className="bg-[#0e0e10] text-[#f9f5f8] min-h-screen selection:bg-[#a4a6ff]/30 relative overflow-hidden font-sans">
      {/* Background Layer */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[#0e0e10]/80 z-10" />
        <img 
          alt="Abstract flow" 
          className="w-full h-full object-cover opacity-20 scale-110 blur-3xl" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBKcLNe4nCx6jDQ4EVV_02UM6m6QJi_0LiI7l7BOYGCvUfePGpBf-4iq0oD97lRJqplgkKfvQWD0GBG99GEyd5o7D02N-7QpzqTdXC4UupM-OfyKFoKrQi8DHlPUrvTCvJQQ4DSYmJHKMrwmmGcspe4XyEhsPcvtyRW5UHFUk1gh7Oq1ax02nkjQ7vXBzrilSRlKcbMzcGwTuJpnS6BO9md1N6C7rmanrP1-JFEYbcgO-oyUxhepXupvaNomp79iKCHAibUpyvnVGU" 
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(85,22,190,0.15)_0%,_transparent_70%)] z-20"></div>
      </div>

      {/* Layout Shell */}
      <main className="relative z-10 flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-[480px]">
          {/* Brand Anchor */}
          <div className="flex justify-center mb-12">
            <Link href="/">
              <span className="font-black text-[#f9f5f8] tracking-tighter text-4xl cursor-pointer">Skillyug</span>
            </Link>
          </div>

          {/* Login Card */}
          <div className="bg-[#262528]/40 backdrop-blur-3xl border-t border-l border-[#48474a]/25 rounded-xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
            {/* Internal Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#ac8aff]/10 blur-[80px] rounded-full pointer-events-none"></div>
            
            <header className="mb-10 relative z-10">
              <Link href="/" className="inline-flex items-center gap-2 text-[#adaaad] hover:text-[#f9f5f8] bg-[#f9f5f8]/5 hover:bg-[#f9f5f8]/10 px-3 py-1.5 rounded-lg transition-all duration-200 text-sm mb-6 w-fit">
                <span className="font-bold tracking-widest text-xs uppercase pl-2">← BACK</span>
              </Link>
              <h1 className="text-4xl font-extrabold tracking-tight text-[#f9f5f8] mb-2">Welcome Back</h1>
            </header>

            {errorMsg && (
              <div className="p-4 mb-6 bg-red-500/20 text-red-300 rounded-xl text-center text-sm font-semibold border border-red-500/30 relative z-10">
                {errorMsg}
              </div>
            )}

            <form className="space-y-6 relative z-10" onSubmit={handleLogin}>
              {/* Email Input */}
              <div className="space-y-2">
                <label className="block text-[#adaaad] tracking-[0.05em] uppercase font-bold text-xs">Email Address</label>
                <div className="group">
                  <input 
                    type="email"
                    className="w-full bg-[#262528]/30 border-none rounded-lg py-4 px-5 text-[#f9f5f8] placeholder:text-[#adaaad]/40 focus:ring-1 focus:ring-[#a4a6ff] transition-all duration-300 outline-none" 
                    placeholder="name@gmail.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-[#adaaad] tracking-[0.05em] uppercase font-bold text-xs">Password</label>
                </div>
                <div className="group relative">
                  <input 
                    type="password"
                    className="w-full bg-[#262528]/30 border-none rounded-lg py-4 px-5 text-[#f9f5f8] placeholder:text-[#adaaad]/40 focus:ring-1 focus:ring-[#a4a6ff] transition-all duration-300 outline-none" 
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* CTA */}
              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#ac8aff] to-[#a4a6ff] text-black font-bold py-4 rounded-full shadow-lg hover:opacity-90 active:scale-[0.98] transition-all duration-200 disabled:opacity-50"
                >
                  {loading ? "Logging in..." : "Login"}
                </button>
              </div>
            </form>

            <footer className="mt-10 text-center relative z-10">
              <p className="text-[#adaaad]">
                Don't have an account? 
                <Link href="/signup" className="text-[#a4a6ff] font-bold hover:text-[#ac8aff] transition-colors duration-200 ml-1">Sign Up</Link>
              </p>
            </footer>
          </div>
        </div>
      </main>
    </div>
  );
}
