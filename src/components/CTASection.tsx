"use client"

import React from "react"
import { motion } from "framer-motion"

export default function CTASection() {
  return (
    <section className="relative w-full py-40 bg-[#020617] flex items-center justify-center overflow-hidden border-t-2 border-slate-800">
      {/* Deep glow circle (optimized) */}
      <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
        <div className="w-[80vw] md:w-[60vw] h-[80vw] md:h-[60vw] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-600/15 via-blue-600/5 to-transparent rounded-full animate-[pulse_4s_infinite]"></div>
      </div>

      <motion.div 
        className="relative z-10 glass-panel max-w-5xl mx-auto px-8 py-20 rounded-[3rem] shadow-[0_0_30px_rgba(59,130,246,0.15)] overflow-hidden flex flex-col items-center text-center w-11/12"
        initial={{ scale: 0.9, y: 50 }}
        whileInView={{ scale: 1, y: 0 }}
        
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Subtle wireframe background inside standard glass panel */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-50"></div>

        <motion.div
           initial={{ y: 20 }}
           whileInView={{ y: 0 }}
           transition={{ delay: 0.2 }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full border border-purple-500/40 bg-purple-500/10 text-purple-300 text-sm font-bold tracking-widest mb-6 uppercase shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            Final Step
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-blue-100 to-slate-400 mb-8 max-w-4xl leading-[1.1]">
            Stop Scrolling. Start Creating the Future.
          </h2>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-12 font-light hidden sm:block">
             Give your child the exact AI skills they need to build projects, automate their workflows, and stay ahead of the curve.
          </p>

          {/* Dual Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-10 w-full">
            <button className="glow-button px-10 py-5 rounded-full text-white font-bold text-xl tracking-wide shadow-2xl hover:scale-[1.03] transition-transform w-full sm:w-auto text-center border border-blue-400/50">
              Join the Bootcamp
            </button>
            <button className="glass-panel px-10 py-5 rounded-full text-white font-bold text-xl tracking-wide hover:bg-white/5 transition-colors w-full sm:w-auto border border-white/20 text-center">
              View Curriculum
            </button>
          </div>
          
          {/* Urgency Indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 border-t border-white/10 pt-8 mt-4 mx-auto max-w-lg">
            
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse shadow-[0_0_10px_rgba(96,165,250,0.8)]"></div>
              <p className="text-sm font-semibold text-slate-300 tracking-wide">
                Next cohort starting soon
              </p>
            </div>
            
            <div className="hidden sm:block w-[1px] h-6 bg-white/10"></div>
            
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-[pulse_1s_infinite] shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
              <p className="text-sm font-bold text-red-400 tracking-wide">
                80% seats filled
              </p>
            </div>
            
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
