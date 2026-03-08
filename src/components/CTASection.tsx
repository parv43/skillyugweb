"use client"

import React from "react"
import { motion } from "framer-motion"

export default function CTASection() {
  return (
    <section className="relative w-full py-40 bg-[#020617] flex items-center justify-center overflow-hidden border-t-2 border-slate-800">
      {/* Deep glow circle */}
      <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
        <div className="w-[80vw] md:w-[60vw] h-[80vw] md:h-[60vw] bg-blue-600/10 rounded-full blur-[100px] animate-pulse"></div>
      </div>

      <motion.div 
        className="relative z-10 glass-panel max-w-5xl mx-auto px-8 py-20 rounded-[3rem] shadow-[0_0_80px_rgba(59,130,246,0.15)] overflow-hidden flex flex-col items-center text-center w-11/12"
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Subtle wireframe background inside standard glass panel */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-50"></div>

        <motion.div
           initial={{ y: 20, opacity: 0 }}
           whileInView={{ y: 0, opacity: 1 }}
           transition={{ delay: 0.2 }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full border border-purple-500/40 bg-purple-500/10 text-purple-300 text-sm font-bold tracking-widest mb-6 uppercase shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            Final Step
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-blue-100 to-slate-400 mb-8 max-w-3xl leading-[1.1]">
            Initialize Your Child's Neural Advantage.
          </h2>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 font-light hidden sm:block">
             Book a live Rs99 demo class right now to see exactly how we train students to become autonomous AI creators. The future is waiting.
          </p>

          <button className="glow-button px-10 py-5 rounded-full text-white font-bold text-xl tracking-wide shadow-2xl hover:scale-[1.03] transition-transform w-full sm:w-auto">
            Book Demo Class – ₹99
          </button>
          <p className="text-xs font-mono text-blue-400/60 mt-6 tracking-widest">
            SYSTEM BOOTING... _ _ 
          </p>
        </motion.div>
      </motion.div>
    </section>
  )
}
