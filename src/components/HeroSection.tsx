"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useAccessControl } from "@/hooks/useAccessControl"
import { Phone } from "lucide-react"

// ─── Mobile-Only Hero ───────────────────────────────────────────────────────
function MobileHero() {
  const { isLoggedIn, hasSlot, loading } = useAccessControl()

  return (
    <section className="relative min-h-[90vh] pt-[120px] pb-0 flex flex-col justify-start bg-white dark:bg-[#0a0f1c] overflow-hidden">
      {/* Subtle Background Glows matching the screenshot */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-[5%] left-[0%] w-[300px] h-[300px] bg-purple-600/5 dark:bg-purple-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="px-6 relative z-20 w-full flex flex-col items-start text-left">
        {/* Header Copy */}
        <h2
          className="text-[38px] font-extrabold leading-[1.2] tracking-tight mb-5 text-slate-900 dark:text-white"
        >
          Help your child build <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-fuchsia-600 dark:from-blue-400 dark:via-indigo-400 dark:to-fuchsia-400">
            AI skills that improve study, projects, and creative confidence.
          </span>
        </h2>
        <p
          className="text-slate-600 dark:text-slate-300 text-[17px] leading-relaxed max-w-sm mb-10 font-normal"
        >
          In a highly competitive world, standard school education isn&apos;t enough. We train your child to leverage advanced AI, giving them a massive edge in academics and their future career.
        </p>

        {/* CTAs */}
        <div className="w-full mb-6">
          {!loading && !hasSlot ? (
            <div className="flex gap-3 w-full">
              <Link
                href={isLoggedIn ? "/book-slot" : "/signup?redirect=/book-slot"}
                className="flex-[1.25] py-4 px-4 rounded-full text-[15px] sm:text-[17px] font-bold text-white text-center active:scale-95 transition-transform flex items-center justify-center"
                style={{ 
                  background: "linear-gradient(90deg, #4b6cb7 0%, #8b5cf6 100%)",
                  boxShadow: "0 4px 20px rgba(139,92,246,0.3)" 
                }}
              >
                Join Bootcamp
              </Link>
              <a
                href="tel:7835049710"
                className="flex-1 py-4 px-4 rounded-full text-[15px] sm:text-[17px] font-bold text-slate-800 dark:text-slate-200 text-center active:scale-95 transition-all border border-slate-350 dark:border-white/20 bg-white/50 dark:bg-white/5 flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Phone size={16} />
                Call Advisor
              </a>
            </div>
          ) : (
            !loading && (
              <a
                href="tel:7835049710"
                className="w-full py-4 px-4 rounded-full text-[15px] sm:text-[17px] font-bold text-slate-800 dark:text-slate-200 text-center active:scale-95 transition-all border border-slate-350 dark:border-white/20 bg-white/50 dark:bg-white/5 flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Phone size={16} />
                Talk to Advisor
              </a>
            )
          )}
        </div>
      </div>

      {/* Full-width Hero Image bleeding to edges */}
      <div
        className="relative w-full mt-[-120px] flex items-end justify-center z-10"
      >
        <Image
          src="/hero-mobile-optimized.webp"
          alt="Father and son learning AI together on a laptop"
          width={800}
          height={1376}
          className="w-full h-auto object-cover object-top"
          priority
          sizes="100vw"
          quality={85}
        />
        {/* Connection gradients: Top for text legibility, Bottom for section transition */}
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white via-white/40 to-transparent dark:from-[#0a0f1c] dark:via-[#0a0f1c]/40 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white to-transparent dark:from-[#0a0f1c] dark:to-transparent pointer-events-none" />
      </div>
    </section>
  )
}

export default function HeroSection() {
  const { isLoggedIn, hasSlot, loading } = useAccessControl()
  const [showSticky, setShowSticky] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 500) {
        setShowSticky(true)
      } else {
        setShowSticky(false)
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      {/* ── Mobile Hero (< md) ── */}
      <div className="md:hidden">
        <MobileHero />
      </div>

      {/* ── Responsive Unified Hero Section (Desktop only: md and up) ── */}
      <section className="hidden md:flex relative w-full min-h-[90vh] lg:min-h-[95vh] items-center bg-white dark:bg-[#0a0f1c] overflow-hidden pt-24 pb-20">
        
        {/* Full-bleed Background Image with priority loading for LCP optimization */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <Image
            src="/ChatGPT Image Jun 13, 2026, 12_54_30 PM.png"
            alt="Skillyug AI Bootcamp background"
            fill
            priority
            unoptimized
            className="object-cover object-right md:object-right-bottom pointer-events-none select-none opacity-90 dark:opacity-40"
          />
          
          {/* Gradients for text legibility and page transition */}
          {/* Desktop Left-to-Right Fade */}
          <div className="absolute inset-y-0 left-0 w-full lg:w-[65%] bg-gradient-to-r from-white via-white/90 to-transparent dark:from-[#0a0f1c] dark:via-[#0a0f1c]/95 dark:to-transparent z-10 pointer-events-none hidden md:block" />
          
          {/* Mobile Full-screen Soft Fade & Bottom Blend */}
          <div className="absolute inset-0 bg-white/75 dark:bg-[#0a0f1c]/75 md:hidden z-10 pointer-events-none" />
          
          {/* Bottom Edge Blend (faded backing for the cloud border) */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white to-transparent dark:from-[#0a0f1c] dark:to-transparent z-10 pointer-events-none" />
        </div>

        {/* ── Static 3D Claymorphic Background Elements ── */}
        <div className="absolute inset-0 pointer-events-none z-10 hidden lg:block overflow-hidden">
          {/* Left Side: 3D Open Book */}
          <div className="absolute top-[12%] left-[3%] w-24 h-24 opacity-45 select-none">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.15)]">
              <defs>
                <linearGradient id="bookCover" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#4c1d95" />
                </linearGradient>
                <linearGradient id="bookPage" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#f3f4f6" />
                </linearGradient>
                <linearGradient id="bookSpineShadow" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#d1d5db" stopOpacity="0" />
                  <stop offset="50%" stopColor="#9ca3af" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#d1d5db" stopOpacity="0" />
                </linearGradient>
              </defs>
              <rect x="6" y="24" width="88" height="58" rx="8" fill="url(#bookCover)" />
              <rect x="6" y="28" width="88" height="54" rx="8" fill="#311075" opacity="0.3" />
              <path d="M12 28 C25 24, 42 26, 48 31 L48 76 C42 71, 25 69, 12 73 Z" fill="url(#bookPage)" />
              <path d="M14 29 C25 26, 40 28, 46 32 L46 74 C40 70, 25 68, 14 71 Z" fill="#ffffff" opacity="0.6" />
              <path d="M88 28 C75 24, 58 26, 52 31 L52 76 C58 71, 75 69, 88 73 Z" fill="url(#bookPage)" />
              <path d="M86 29 C75 26, 60 28, 54 32 L54 74 C60 70, 75 68, 86 71 Z" fill="#ffffff" opacity="0.6" />
              <rect x="47" y="29" width="6" height="48" fill="url(#bookSpineShadow)" />
              <path d="M18 38 H38 M18 46 H40 M18 54 H35 M18 62 H38" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
              <path d="M62 38 H82 M60 46 H82 M65 54 H82 M62 62 H82" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
            </svg>
          </div>

          {/* Left Side: 3D Lightbulb */}
          <div className="absolute top-[75%] left-[6%] w-20 h-20 opacity-40 select-none">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_12px_24px_rgba(245,158,11,0.25)]">
              <defs>
                <radialGradient id="bulbGlass" cx="50%" cy="40%" r="50%" fx="30%" fy="30%">
                  <stop offset="0%" stopColor="#ffedd5" />
                  <stop offset="40%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#d97706" />
                </radialGradient>
                <linearGradient id="bulbBase" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#94a3b8" />
                  <stop offset="50%" stopColor="#e2e8f0" />
                  <stop offset="100%" stopColor="#64748b" />
                </linearGradient>
                <filter id="bulbGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="8" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              <circle cx="50" cy="45" r="28" fill="#f59e0b" opacity="0.25" filter="url(#bulbGlow)" />
              <path d="M50 15 C30 15, 26 38, 38 52 C42 56, 42 66, 44 70 H56 C58 66, 58 56, 62 52 C74 38, 70 15, 50 15 Z" fill="url(#bulbGlass)" />
              <path d="M38 25 C34 30, 32 38, 36 44" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
              <path d="M44 48 L46 32 C47 30, 53 30, 54 32 L56 48" stroke="#ffedd5" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="50" cy="31" r="3" fill="#ffedd5" />
              <rect x="42" y="70" width="16" height="5" rx="2.5" fill="url(#bulbBase)" />
              <rect x="42" y="76" width="16" height="5" rx="2.5" fill="url(#bulbBase)" />
              <rect x="44" y="82" width="12" height="4" rx="2" fill="url(#bulbBase)" />
              <path d="M47 86 H53 L50 90 Z" fill="#334155" />
            </svg>
          </div>

          {/* Right Side: 3D Space Rocket */}
          <div className="absolute top-[18%] right-[8%] w-24 h-24 select-none">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_16px_32px_rgba(239,68,68,0.25)]">
              <defs>
                <linearGradient id="rocketBody" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="40%" stopColor="#f1f5f9" />
                  <stop offset="100%" stopColor="#cbd5e1" />
                </linearGradient>
                <linearGradient id="rocketAccent" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#b91c1c" />
                </linearGradient>
                <radialGradient id="rocketWindow" cx="40%" cy="40%" r="60%">
                  <stop offset="0%" stopColor="#e0f2fe" />
                  <stop offset="100%" stopColor="#0284c7" />
                </radialGradient>
                <linearGradient id="rocketFlame" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="50%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M43 78 C43 92, 50 98, 50 98 C50 98, 57 92, 57 78 Z" fill="url(#rocketFlame)" />
              <path d="M46 78 C46 86, 50 90, 50 90 C50 90, 54 86, 54 78 Z" fill="#fbbf24" />
              <path d="M40 60 L24 74 C22 76, 26 80, 30 78 L42 70 Z" fill="url(#rocketAccent)" />
              <path d="M25 73 L29 77 L40 67 Z" fill="#7f1d1d" opacity="0.3" />
              <path d="M60 60 L76 74 C78 76, 74 80, 70 78 L58 70 Z" fill="url(#rocketAccent)" />
              <path d="M75 73 L71 77 L60 67 Z" fill="#7f1d1d" opacity="0.3" />
              <rect x="44" y="72" width="12" height="6" rx="2" fill="#475569" />
              <path d="M50 8 C64 24, 60 56, 58 72 H42 C40 56, 36 24, 50 8 Z" fill="url(#rocketBody)" />
              <path d="M47 16 C39 30, 42 52, 44 68" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" opacity="0.6" />
              <path d="M50 8 C57 16, 58 24, 58 28 H42 C42 24, 43 16, 50 8 Z" fill="url(#rocketAccent)" />
              <circle cx="50" cy="38" r="9" fill="#475569" />
              <circle cx="50" cy="38" r="7.5" fill="url(#rocketWindow)" />
              <path d="M46.5 35 C45 38, 47 42, 50 43.5" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
            </svg>
          </div>

          {/* Right Side: 3D AI Chat Bubble */}
          <div className="absolute top-[55%] right-[4%] w-24 h-24 select-none">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_16px_32px_rgba(99,102,241,0.25)]">
              <defs>
                <radialGradient id="bubbleGrad" cx="30%" cy="30%" r="75%">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="60%" stopColor="#4f46e5" />
                  <stop offset="100%" stopColor="#312e81" />
                </radialGradient>
                <filter id="sparkleGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              <rect x="8" y="16" width="84" height="58" rx="22" fill="url(#bubbleGrad)" />
              <rect x="10" y="18" width="80" height="54" rx="20" stroke="#a5b4fc" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />
              <rect x="9" y="20" width="82" height="52" rx="20" stroke="#1e1b4b" strokeWidth="2.5" strokeLinecap="round" opacity="0.3" />
              <path d="M28 73 C30 84, 18 90, 18 90 C18 90, 36 88, 42 74 Z" fill="#312e81" />
              <path d="M28 73 C30 84, 18 90, 18 90 C18 90, 36 88, 42 74 Z" fill="url(#bubbleGrad)" />
              <path d="M20 28 C32 22, 68 22, 80 28" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" opacity="0.45" />
              <path d="M50 28 L53 39 L64 42 L53 45 L50 56 L47 45 L36 42 L47 39 Z" fill="#ffffff" filter="url(#sparkleGlow)" />
              <path d="M68 46 L69.5 51.5 L75 53 L69.5 54.5 L68 60 L66.5 54.5 L61 53 L66.5 51.5 Z" fill="#a5b4fc" />
            </svg>
          </div>
        </div>

        {/* ── Dynamic Claymorphic Constellation & Floating Badges ── */}
        {/* Right-aligned container to keep the constellation perfectly in sync with the father/son image */}
        <div className="absolute right-0 top-0 bottom-0 w-[50%] pointer-events-none z-10 hidden lg:block overflow-hidden">


          {/* SVG Connection Path - framing cards inside the right 50% container */}
          <svg 
            className="absolute inset-0 w-full h-full pointer-events-none select-none animate-pulse duration-[4000ms]" 
            viewBox="0 0 100 100" 
            preserveAspectRatio="none"
          >
            <path 
              d="M 9,43 C 12,30 14,25 17,22 C 30,15 42,12 52,14 C 65,15 73,19 77,22 C 83,30 87,38 87,46 C 87,54 87,60 87,66" 
              fill="none" 
              className="stroke-slate-250/50 dark:stroke-slate-800/40"
              strokeWidth="0.18"
              strokeDasharray="0.8, 0.8"
            />
          </svg>

          {/* 1. Canva AI Badge (Leftmost, now clean colored SVG and square badge style) */}
          <div 
            className="absolute top-[38%] left-[2%] w-[105px] h-[105px] pointer-events-auto select-none"
            style={{ animation: "float6 7s ease-in-out infinite" }}
          >
            <div className="clay-badge clay-badge-square w-full h-full flex flex-col items-center justify-center p-3 group">
              <img src="/canva.svg" alt="Canva" className="w-[46px] h-[46px] object-contain transition-transform duration-300 group-hover:scale-110 mb-1" />
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 tracking-tight">Canva AI</span>
            </div>
          </div>

          {/* 2. Antigravity Badge */}
          <div 
            className="absolute top-[15%] left-[10%] w-[105px] h-[105px] pointer-events-auto select-none"
            style={{ animation: "float1 6.5s ease-in-out infinite" }}
          >
            <div className="clay-badge clay-badge-square w-full h-full flex flex-col items-center justify-center p-3 group">
              <img src="/antigravity.svg" alt="Antigravity" className="w-[46px] h-[46px] object-contain transition-transform duration-300 group-hover:scale-110 mb-1" />
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 tracking-tight">Antigravity</span>
            </div>
          </div>

          {/* 3. Gemini Badge */}
          <div 
            className="absolute top-[7%] left-[45%] w-[105px] h-[105px] pointer-events-auto select-none"
            style={{ animation: "float2 8s ease-in-out infinite" }}
          >
            <div className="clay-badge clay-badge-square w-full h-full flex flex-col items-center justify-center p-3 group">
              <img src="/gemini.svg" alt="Gemini" className="w-[46px] h-[46px] object-contain transition-transform duration-300 group-hover:scale-110 mb-1" />
              <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 tracking-tight">Gemini</span>
            </div>
          </div>

          {/* 4. Napkin AI Badge (Replacing Figma, using the high-quality transparent vector SVG) */}
          <div 
            className="absolute top-[16%] left-[70%] w-[105px] h-[105px] pointer-events-auto select-none"
            style={{ animation: "float3 7.5s ease-in-out infinite" }}
          >
            <div className="clay-badge clay-badge-square w-full h-full flex flex-col items-center justify-center p-3 group">
              <svg viewBox="0 0 28 37" className="w-[46px] h-[46px] text-[#484848] dark:text-slate-200 transition-transform duration-300 group-hover:scale-110 mb-1" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.02257 35.1681C9.23542 35.9609 10.2252 36.227 10.8052 35.647L25.9552 20.4863L7.88379 30.9163L9.02257 35.1734V35.1681Z" fill="currentColor" />
                <path d="M2.63646 0.578489C1.92871 0.168742 1.04004 0.679596 1.04004 1.49909V10.7157L10.6132 5.18682L2.63646 0.578489Z" fill="currentColor" />
                <path d="M13.4602 6.83643L1.04004 14.0043V21.2414L19.7181 10.455L13.4602 6.83643Z" fill="currentColor" />
                <path d="M27.2213 14.7922L22.5651 12.0996L1.04004 24.5304V29.9316C1.04004 30.7298 1.8755 31.2247 2.57792 30.8788L13.5772 24.5304L27.2213 16.6388C27.9291 16.229 27.9291 15.2073 27.2213 14.7976V14.7922Z" fill="currentColor" />
              </svg>
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 tracking-tight">Napkin AI</span>
            </div>
          </div>

          {/* 5. Claude Badge */}
          <div 
            className="absolute top-[40%] left-[80%] w-[105px] h-[105px] pointer-events-auto select-none"
            style={{ animation: "float4 9s ease-in-out infinite" }}
          >
            <div className="clay-badge clay-badge-square w-full h-full flex flex-col items-center justify-center p-3 group">
              <img src="/claude-ai-icon.svg" alt="Claude" className="w-[46px] h-[46px] object-contain transition-transform duration-300 group-hover:scale-110 mb-1" />
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 tracking-tight">Claude</span>
            </div>
          </div>

          {/* 6. Perplexity Badge */}
          <div 
            className="absolute top-[60%] left-[80%] w-[105px] h-[105px] pointer-events-auto select-none"
            style={{ animation: "float5 6s ease-in-out infinite" }}
          >
            <div className="clay-badge clay-badge-square w-full h-full flex flex-col items-center justify-center p-3 group">
              <img src="/perplexity.svg" alt="Perplexity" className="w-[46px] h-[46px] object-contain dark:invert transition-transform duration-300 group-hover:scale-110 mb-1" />
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 tracking-tight">perplexity</span>
            </div>
          </div>

          {/* Decorative floating particles from the reference image */}
          {/* A. Purple sphere near Canva */}
          <div 
            className="absolute top-[52%] left-[0.5%] pointer-events-none select-none"
            style={{ animation: "floatParticle1 5s ease-in-out infinite" }}
          >
            <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-purple-400 to-indigo-600 shadow-md shadow-purple-500/25" />
          </div>

          {/* B. Purple sphere above father's head */}
          <div 
            className="absolute top-[17%] left-[32%] pointer-events-none select-none"
            style={{ animation: "floatParticle2 4.5s ease-in-out infinite" }}
          >
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 shadow-md shadow-purple-500/20" />
          </div>

          {/* C. Cyan sphere above father's head */}
          <div 
            className="absolute top-[16%] left-[48%] pointer-events-none select-none"
            style={{ animation: "floatParticle1 5.5s ease-in-out infinite" }}
          >
            <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 shadow-md shadow-cyan-500/25" />
          </div>

          {/* D. Sparkle star near Claude */}
          <div 
            className="absolute top-[40%] left-[73%] pointer-events-none select-none"
            style={{ animation: "floatParticle2 6s ease-in-out infinite" }}
          >
            <svg className="w-5 h-5 text-amber-400 drop-shadow-[0_2px_8px_rgba(251,191,36,0.5)] animate-pulse" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4L12 0Z" />
            </svg>
          </div>

          {/* E. Blue sphere below Perplexity */}
          <div 
            className="absolute top-[72%] left-[80%] pointer-events-none select-none"
            style={{ animation: "floatParticle1 4.8s ease-in-out infinite" }}
          >
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 shadow-md shadow-blue-500/20" />
          </div>
        </div>

        {/* ── Puffed Cloud-Like Claymorphic Bottom Divider ── */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-30 pointer-events-none translate-y-[1px]">
          <svg 
            viewBox="0 0 1440 120" 
            className="relative block w-full h-10 sm:h-16 md:h-24 lg:h-28 text-white dark:text-[#020617]" 
            preserveAspectRatio="none"
          >
            <defs>
              {/* Light Theme Highlight Gradient */}
              <linearGradient id="cloud-highlight-light" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                <stop offset="40%" stopColor="#e0e7ff" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#818cf8" stopOpacity="0.0" />
              </linearGradient>
              {/* Dark Theme Highlight Gradient */}
              <linearGradient id="cloud-highlight-dark" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.2" />
                <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.06" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0.45" />
              </linearGradient>
            </defs>
            
            {/* Shadow layer underneath to lift the cloud up */}
            <path 
              d="M0,80 C 180,20 360,20 540,60 C 720,100 900,100 1080,60 C 1260,20 1380,30 1440,50 L 1440,120 L 0,120 Z" 
              fill="currentColor"
              className="opacity-15 translate-y-[-4px] blur-sm text-slate-450 dark:text-black"
            />
            
            {/* Main background filled path */}
            <path 
              d="M0,80 C 180,20 360,20 540,60 C 720,100 900,100 1080,60 C 1260,20 1380,30 1440,50 L 1440,120 L 0,120 Z" 
              fill="currentColor"
            />
            
            {/* Clay highlight/inner shadow layer */}
            <path 
              d="M0,80 C 180,20 360,20 540,60 C 720,100 900,100 1080,60 C 1260,20 1380,30 1440,50" 
              fill="none" 
              stroke="url(#cloud-highlight-light)" 
              strokeWidth="6" 
              className="dark:hidden opacity-95"
            />
            <path 
              d="M0,80 C 180,20 360,20 540,60 C 720,100 900,100 1080,60 C 1260,20 1380,30 1440,50" 
              fill="none" 
              stroke="url(#cloud-highlight-dark)" 
              strokeWidth="6" 
              className="hidden dark:block opacity-95"
            />

            {/* Thin crisp top light reflection line */}
            <path 
              d="M0,80 C 180,20 360,20 540,60 C 720,100 900,100 1080,60 C 1260,20 1380,30 1440,50" 
              fill="none" 
              stroke="#ffffff" 
              strokeWidth="1.5" 
              className="opacity-50 dark:opacity-20"
            />
          </svg>
        </div>

        <div className="container mx-auto px-6 relative z-20 flex items-center justify-start w-full">
          {/* Content Block - Constrained to prevent overlap with right-side constellation */}
          <div className="w-full lg:max-w-[48%] xl:max-w-[48%] flex flex-col items-center md:items-start text-center md:text-left">
            
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-200 dark:border-blue-500/30 bg-blue-50/50 dark:bg-blue-500/5 shadow-sm mb-6">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-[10px] sm:text-xs font-bold text-blue-700 dark:text-blue-200 uppercase tracking-widest">
                Skillyug Summer AI Bootcamp • Classes 6–12
              </span>
            </div>

            <h1 className="text-[34px] sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-br dark:from-white dark:via-slate-200 dark:to-slate-400 mb-6 drop-shadow-sm tracking-tight leading-[1.2]">
              Give Your Child the AI Tools<br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400">
                They Need to Build Real World Things
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg md:text-xl text-slate-750 dark:text-slate-300 max-w-2xl mb-10 font-normal leading-relaxed">
              In a highly competitive world, standard school education isn&apos;t enough. We train your child to leverage advanced AI, giving them a massive edge in academics and their future career.
            </p>

            {/* Call to Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              {!loading && !hasSlot && (
                <Link 
                  href={isLoggedIn ? "/book-slot" : "/signup?redirect=/book-slot"}
                  className="glow-button px-8 py-4 rounded-full text-white font-bold text-[16px] sm:text-lg hover:scale-105 transition-transform w-full sm:w-auto text-center inline-block"
                  style={{
                    background: "linear-gradient(90deg, #4b6cb7 0%, #8b5cf6 100%)",
                    boxShadow: "0 4px 20px rgba(139,92,246,0.3)"
                  }}
                >
                  Join the Bootcamp
                </Link>
              )}
              <a 
                href="tel:7835049710"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border border-slate-350 dark:border-white/20 bg-white/50 dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 hover:border-slate-400 dark:hover:border-white/30 text-slate-800 dark:text-slate-200 font-bold text-[16px] sm:text-lg hover:scale-105 transition-all w-full sm:w-auto text-center cursor-pointer shadow-sm"
              >
                <Phone size={18} />
                Talk to Advisor
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* Sticky Floating CTA Button */}
      <a
        href="tel:7835049710"
        className={`fixed bottom-24 right-6 md:bottom-8 md:right-8 z-40 flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 border border-blue-400/20 ${
          showSticky ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
        title="Talk to Advisor"
      >
        <Phone size={18} className="animate-pulse" />
        <span className="text-sm md:text-base font-bold tracking-wide">Talk to Advisor</span>
      </a>
    </>
  )
}
