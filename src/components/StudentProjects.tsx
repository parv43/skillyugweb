"use client"

import React from "react"
import { motion } from "framer-motion"

const ProjectPanel = ({ title, tech, delay, align }: any) => {
  return (
    <motion.div
      className={`glass-panel relative w-full md:w-[600px] p-8 rounded-3xl overflow-hidden \${align === 'left' ? 'md:ml-auto md:-mr-20 lg:-mr-32' : 'md:mr-auto md:-ml-20 lg:-ml-32'} transform hover:shadow-[0_0_40px_rgba(59,130,246,0.2)] transition-shadow duration-500`}
      initial={{ opacity: 0, y: 50, rotateX: align === 'left' ? 10 : -10 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, delay, type: "spring" }}
      style={{ perspective: "1000px" }}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[40px] rounded-full pointer-events-none" />
      
      <div className="flex items-center gap-4 mb-6 relative z-10">
        <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-xl shadow-[inset_0_0_15px_rgba(255,255,255,0.05)]">
          🚀
        </div>
        <div>
          <h3 className="text-2xl font-bold text-slate-100">{title}</h3>
          <p className="text-sm font-semibold text-blue-400 mt-1">{tech}</p>
        </div>
      </div>
      
      <div className="relative z-10 w-full h-40 mt-4 rounded-2xl bg-gradient-to-br from-slate-900/80 to-black/80 border border-slate-700/30 font-mono text-xs p-5 overflow-hidden group">
        <div className="text-emerald-400 mb-2">{'>'} Initializing application logic...</div>
        <div className="text-blue-300 mb-2">{'>'} Loading neural weights... [OK]</div>
        <div className="text-purple-300 mb-2">{'>'} Compiling prompt structures...</div>
        <motion.div
          className="absolute inset-0 bg-blue-500/5 mix-blend-overlay"
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Hover overlay wireframe */}
        <div className="absolute inset-0 border border-blue-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:10px_10px]" />
      </div>
    </motion.div>
  )
}

export default function StudentProjects() {
  return (
    <section className="relative w-full py-32 bg-[#020617] overflow-hidden flex flex-col pt-32 pb-40 border-t border-white/5">
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-blue-900/10 blur-[150px] pointer-events-none rounded-full z-0" />

      <div className="text-center mb-24 z-20 px-6">
        <motion.h2 
          className="text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 mb-6 drop-shadow-md"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          Built by Students
        </motion.h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg">
          Not just theory. Real products engineered by middle and high school students using futuristic AI stacks.
        </p>
      </div>

      <div className="flex flex-col gap-12 lg:gap-8 px-6 max-w-7xl mx-auto w-full z-10 relative">
        {/* Center alignment line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-blue-500/30 to-transparent hidden md:block -translate-x-1/2"></div>
        
        <ProjectPanel 
          title="AI Homework Assistant bot" 
          tech="Powered by Custom GPTs & OpenAI"
          align="left"
          delay={0.2}
        />
        <ProjectPanel 
          title="Generate-a-Story Platform" 
          tech="Built with Midjourney & Claude"
          align="right"
          delay={0.4}
        />
        <ProjectPanel 
          title="Voice-Activated Game UX" 
          tech="Prototyped using ElevenLabs & Vercel v0"
          align="left"
          delay={0.6}
        />
      </div>
    </section>
  )
}
