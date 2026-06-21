"use client"

import React from "react"
import Link from "next/link"
import { useAccessControl } from "@/hooks/useAccessControl"

export default function CTASection() {
  const { isLoggedIn, hasSlot, loading } = useAccessControl()

  return (
    <section className="relative w-full py-40 bg-transparent flex items-center justify-center overflow-hidden border-t border-slate-200/40 dark:border-white/5">
      {/* Deep glow circle (optimized) */}
      <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
        <div className="w-[80vw] md:w-[60vw] h-[80vw] md:h-[60vw] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#ff8b12]/10 via-[#0060aa]/5 to-transparent rounded-full animate-[pulse_4s_infinite]"></div>
      </div>

      <div 
        className="relative z-10 glass-panel max-w-5xl mx-auto px-8 py-20 rounded-[3rem] shadow-[0_0_30px_rgba(255,139,18,0.1)] overflow-hidden flex flex-col items-center text-center w-11/12"
      >
        {/* Subtle wireframe background inside standard glass panel */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-50"></div>

        <div>
          <span className="inline-block px-4 py-1.5 rounded-full border border-orange-200 bg-orange-50/70 text-[#ff8b12] dark:border-orange-900/30 dark:bg-orange-950/40 dark:text-[#ff9d3b] text-sm font-bold tracking-widest mb-6 uppercase shadow-sm">
            Final Step
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#0060aa] via-[#8b5cf6] to-[#ff8b12] mb-8 max-w-4xl leading-tight pb-2 drop-shadow-sm">
            Stop Scrolling. Start Creating the Future.
          </h2>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-12 font-light hidden sm:block leading-relaxed">
             Give your child the exact AI skills they need to build projects, automate their workflows, and stay ahead of the curve.
          </p>

          {/* Dual Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-10 w-full">
            {!loading && !hasSlot && (
              <Link
                href={isLoggedIn ? "/book-slot" : "/signup?redirect=/book-slot"}
                className="glow-button px-10 py-5 rounded-full bg-gradient-to-r from-[#0060aa] to-[#ff8b12] hover:from-[#005291] hover:to-[#e0770b] text-white font-bold text-xl tracking-wide shadow-lg shadow-orange-500/10 hover:scale-[1.03] transition-transform w-full sm:w-auto text-center inline-block"
              >
                Join the Bootcamp
              </Link>
            )}
            <button className="px-10 py-5 rounded-full text-slate-800 dark:text-white bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 font-bold text-xl tracking-wide transition-colors w-full sm:w-auto text-center">
              View Curriculum
            </button>
          </div>
          
          {/* Urgency Indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 border-t border-slate-200/60 dark:border-white/10 pt-8 mt-4 mx-auto max-w-lg">
            
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400 animate-pulse"></div>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 tracking-wide">
                Next cohort starting soon
              </p>
            </div>
            
            <div className="hidden sm:block w-[1px] h-6 bg-slate-200 dark:bg-white/10"></div>
            
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-[pulse_1s_infinite]"></div>
              <p className="text-sm font-bold text-red-600 dark:text-red-400 tracking-wide">
                80% seats filled
              </p>
            </div>
            
          </div>
        </div>
      </div>
    </section>
  )
}
