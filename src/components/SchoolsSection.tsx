"use client"

import React from "react"
import { motion } from "framer-motion"

export default function SchoolsSection() {
  return (
    <section className="relative w-full py-32 bg-[#020617] flex items-center justify-center overflow-hidden border-y border-white/5">
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 md:grid-cols-2 gap-16 items-center relative z-10 w-full">
        
        <motion.div 
          className="relative w-full aspect-square md:aspect-auto md:h-[400px] flex items-center justify-center glass-panel rounded-full md:rounded-[3rem] p-8 overflow-hidden shadow-[inset_0_0_60px_rgba(59,130,246,0.1)]"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* Holographic school representation */}
          <div className="absolute inset-0 bg-blue-500/5 animate-pulse" />
          
          <div className="relative w-full h-full flex items-center justify-center">
             <div className="absolute w-40 h-40 bg-cyan-400/20 rounded-full blur-2xl"></div>
             
             {/* Simple geometric representation of connection */}
             <svg viewBox="0 0 200 200" className="w-full max-w-[300px] drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">
               <polygon points="100,20 180,60 180,140 100,180 20,140 20,60" fill="none" stroke="#22d3ee" strokeWidth="2" strokeDasharray="5,5" />
               <polygon points="100,40 160,75 160,125 100,160 40,125 40,75" fill="none" stroke="#8b5cf6" strokeWidth="1" />
               <circle cx="100" cy="100" r="20" fill="none" stroke="#ec4899" strokeWidth="4" />
               <circle cx="100" cy="100" r="4" fill="#fff" />
               
               <line x1="100" y1="20" x2="100" y2="80" stroke="#22d3ee" strokeWidth="1" />
               <line x1="20" y1="140" x2="80" y2="110" stroke="#22d3ee" strokeWidth="1" />
               <line x1="180" y1="140" x2="120" y2="110" stroke="#22d3ee" strokeWidth="1" />
             </svg>
          </div>
        </motion.div>

        <motion.div
           initial={{ opacity: 0, x: 50 }}
           whileInView={{ opacity: 1, x: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.8, delay: 0.2 }}
           className="flex flex-col text-center md:text-left items-center md:items-start space-y-6"
        >
          <div className="inline-flex px-3 py-1 text-xs font-bold uppercase tracking-widest text-cyan-400 border border-cyan-400/30 rounded-full bg-cyan-400/10">
            For Institutions
          </div>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-white">
            Upgrade your school's operating system.
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            Partner with Skillyug to bring world-class AI education directly to your classrooms. We provide the curriculum, the tools, and the neuro-styled platforms needed for tomorrow's education.
          </p>
          
          <button className="relative group px-8 py-4 rounded-xl overflow-hidden glass-panel border border-cyan-500/50 mt-4">
             <div className="absolute inset-0 bg-cyan-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
             <span className="text-cyan-300 font-bold tracking-wide relative z-10">Partner With Us →</span>
          </button>
        </motion.div>
      </div>

    </section>
  )
}
