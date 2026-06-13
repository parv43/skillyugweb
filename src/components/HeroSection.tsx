"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useAccessControl } from "@/hooks/useAccessControl"
import { Phone } from "lucide-react"

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
      {/* ── Responsive Unified Hero Section ── */}
      <section className="relative w-full min-h-[90vh] lg:min-h-[95vh] flex items-center bg-white dark:bg-[#0a0f1c] overflow-hidden pt-24 pb-20">
        
        {/* Full-bleed Background Image with priority loading for LCP optimization */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <Image
            src="/ChatGPT Image Jun 13, 2026, 12_54_30 PM.png"
            alt="Skillyug AI Bootcamp background"
            fill
            priority
            className="object-cover object-center pointer-events-none select-none opacity-90 dark:opacity-40"
            sizes="100vw"
            quality={90}
          />
          
          {/* Gradients for text legibility and page transition */}
          {/* Desktop Left-to-Right Fade */}
          <div className="absolute inset-y-0 left-0 w-full lg:w-[65%] bg-gradient-to-r from-white via-white/90 to-transparent dark:from-[#0a0f1c] dark:via-[#0a0f1c]/95 dark:to-transparent z-10 pointer-events-none hidden md:block" />
          
          {/* Mobile Full-screen Soft Fade & Bottom Blend */}
          <div className="absolute inset-0 bg-white/75 dark:bg-[#0a0f1c]/75 md:hidden z-10 pointer-events-none" />
          
          {/* Bottom Edge Blend (faded backing for the cloud border) */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white to-transparent dark:from-[#0a0f1c] dark:to-transparent z-10 pointer-events-none" />
        </div>

        {/* ── Dynamic Claymorphic Constellation & Floating Badges ── */}
        <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden hidden lg:block">
          <style>{`
            @keyframes float1 {
              0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
              50% { transform: translate3d(0, -12px, 0) rotate(2deg); }
            }
            @keyframes float2 {
              0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
              50% { transform: translate3d(0, -15px, 0) rotate(-3deg); }
            }
            @keyframes float3 {
              0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
              50% { transform: translate3d(0, -10px, 0) rotate(1.5deg); }
            }
            @keyframes float4 {
              0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
              50% { transform: translate3d(0, -14px, 0) rotate(-2deg); }
            }
            @keyframes float5 {
              0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
              50% { transform: translate3d(0, -8px, 0) rotate(2deg); }
            }
            .clay-badge {
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
              cursor: pointer;
              backdrop-filter: blur(8px);
              -webkit-backdrop-filter: blur(8px);
            }
            .clay-badge-light {
              background: rgba(255, 255, 255, 0.82);
              border: 1.5px solid rgba(255, 255, 255, 0.95);
              box-shadow: 
                0 15px 35px -5px rgba(99, 102, 241, 0.16),
                0 8px 15px -6px rgba(0, 0, 0, 0.06),
                inset 4px 4px 8px rgba(255, 255, 255, 1),
                inset -5px -5px 10px rgba(129, 140, 248, 0.28);
            }
            .clay-badge-dark {
              background: rgba(20, 26, 46, 0.75);
              border: 1.5px solid rgba(255, 255, 255, 0.12);
              box-shadow: 
                0 20px 40px -5px rgba(0, 0, 0, 0.5),
                0 10px 20px -8px rgba(0, 0, 0, 0.3),
                inset 3px 3px 6px rgba(255, 255, 255, 0.15),
                inset -5px -5px 12px rgba(0, 0, 0, 0.85),
                inset 0 0 10px rgba(139, 92, 246, 0.2);
            }
            .clay-badge:hover {
              transform: scale(1.15) !important;
            }
            .clay-badge-light:hover {
              box-shadow: 
                0 25px 45px -5px rgba(99, 102, 241, 0.35),
                inset 4px 4px 8px rgba(255, 255, 255, 1),
                inset -5px -5px 10px rgba(99, 102, 241, 0.4);
            }
            .clay-badge-dark:hover {
              box-shadow: 
                0 30px 50px -5px rgba(139, 92, 246, 0.45),
                inset 4px 4px 6px rgba(255, 255, 255, 0.25),
                inset -5px -5px 12px rgba(0, 0, 0, 0.7),
                inset 0 0 16px rgba(139, 92, 246, 0.4);
            }
          `}</style>

          {/* 1. Gemini Badge */}
          <div 
            className="absolute top-[14%] left-[62%] w-[68px] h-[68px] pointer-events-auto select-none"
            style={{ animation: "float1 6s ease-in-out infinite" }}
          >
            <div className="clay-badge clay-badge-light dark:clay-badge-dark w-full h-full p-[16px]">
              <img src="/gemini.svg" alt="Gemini" className="w-full h-full object-contain" />
            </div>
          </div>

          {/* 2. Perplexity Badge */}
          <div 
            className="absolute top-[10%] left-[76%] w-[65px] h-[65px] pointer-events-auto select-none"
            style={{ animation: "float2 7s ease-in-out infinite" }}
          >
            <div className="clay-badge clay-badge-light dark:clay-badge-dark w-full h-full p-[16px]">
              <img src="/perplexity.svg" alt="Perplexity" className="w-full h-full object-contain" />
            </div>
          </div>

          {/* 3. Claude AI Badge */}
          <div 
            className="absolute top-[15%] left-[91%] w-[70px] h-[70px] pointer-events-auto select-none"
            style={{ animation: "float3 8s ease-in-out infinite" }}
          >
            <div className="clay-badge clay-badge-light dark:clay-badge-dark w-full h-full p-[18px]">
              <img src="/claude-ai-icon.svg" alt="Claude AI" className="w-full h-full object-contain" />
            </div>
          </div>

          {/* 4. Napkin AI Badge */}
          <div 
            className="absolute top-[42%] left-[93%] w-[70px] h-[70px] pointer-events-auto select-none"
            style={{ animation: "float4 7.5s ease-in-out infinite" }}
          >
            <div className="clay-badge clay-badge-light dark:clay-badge-dark w-full h-full p-[14px] overflow-hidden">
              <img src="/napkin_logos.jpeg" alt="Napkin AI" className="w-full h-full object-cover rounded-full" />
            </div>
          </div>

          {/* 5. Gamma Badge */}
          <div 
            className="absolute top-[68%] left-[91%] w-[66px] h-[66px] pointer-events-auto select-none"
            style={{ animation: "float5 5s ease-in-out infinite" }}
          >
            <div className="clay-badge clay-badge-light dark:clay-badge-dark w-full h-full p-[16px]">
              <img src="/Gamma.Icon" alt="Gamma" className="w-full h-full object-contain" />
            </div>
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
          {/* Content Block */}
          <div className="w-full lg:max-w-3xl xl:max-w-4xl flex flex-col items-center md:items-start text-center md:text-left">
            
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-200 dark:border-blue-500/30 bg-blue-50/50 dark:bg-blue-500/5 shadow-sm mb-6">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-[10px] sm:text-xs font-bold text-blue-700 dark:text-blue-200 uppercase tracking-widest">
                Skillyug Summer AI Bootcamp • Classes 6–12
              </span>
            </div>

            {/* Main Title */}
            <h1 className="text-[34px] sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-br dark:from-white dark:via-slate-200 dark:to-slate-400 mb-6 drop-shadow-sm tracking-tight leading-[1.15]">
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
