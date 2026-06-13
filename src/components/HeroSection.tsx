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
          
          {/* Bottom Edge Blend */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent dark:from-[#0a0f1c] dark:to-transparent z-10 pointer-events-none" />
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
