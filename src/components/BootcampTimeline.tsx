"use client"

import React, { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"

const TimelineNode = ({ title, desc, icon, index }: any) => {
  return (
    <div className="relative flex justify-center mb-24 lg:mb-32 group">
      {/* Connector line behind */}
      <div className="absolute top-12 bottom-[-100px] lg:bottom-[-130px] w-1 bg-gradient-to-b from-blue-500/50 to-purple-500/10 timeline-line -z-10 hidden sm:block"></div>

      {/* Floating UI element */}
      <motion.div
        className="glass-panel w-full sm:w-[500px] p-6 rounded-3xl z-10 mx-6 hover:shadow-[0_0_30px_rgba(139,92,246,0.3)] transition-all duration-300"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
      >
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-[#0f172a] border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.5)] flex items-center justify-center -mt-14 mb-6 relative">
            <span className="text-2xl">{icon}</span>
            <div className="absolute inset-0 rounded-2xl animate-ping opacity-20 bg-blue-400"></div>
          </div>
          <span className="text-sm uppercase tracking-widest text-blue-400 font-bold mb-2 block">
            Phase 0{index + 1}
          </span>
          <h3 className="text-2xl font-black text-white mb-3 text-center">{title}</h3>
          <p className="text-slate-400 text-center text-sm leading-relaxed">
            {desc}
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default function BootcampTimeline() {
  const containerRef = useRef(null)
  
  return (
    <section ref={containerRef} className="relative w-full py-40 bg-[radial-gradient(ellipse_at_bottom,#1e1b4b_0%,#020617_100%)] overflow-hidden">
      
      <div className="text-center mb-32 z-20 px-6 max-w-4xl mx-auto">
        <motion.h2 
          className="text-4xl md:text-5xl lg:text-6xl font-black text-white drop-shadow-[0_0_20px_rgba(168,85,247,0.4)] mb-6"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          The Bootcamp Journey
        </motion.h2>
        <p className="text-slate-300 text-lg md:text-xl font-light">
          A structured neural-pathway from absolute beginner to autonomous AI creator.
        </p>
      </div>

      <div className="w-full relative z-10">
        <TimelineNode 
          index={0}
          title="AI Core Foundations" 
          desc="Understanding the neural networks, LLMs, and precisely what AI is capable of in 2026."
          icon="🧠" 
        />
        <TimelineNode 
          index={1}
          title="Mastering AI Prompts" 
          desc="Learning advanced zero-shot and few-shot prompt engineering techniques to generate exact outputs."
          icon="✍️" 
        />
        <TimelineNode 
          index={2}
          title="Visual Intelligence" 
          desc="Using tools like Midjourney, Runway, and DALL-E to generate stunning visual art and videos from text."
          icon="🎨" 
        />
        <TimelineNode 
          index={3}
          title="Building with Code Generation" 
          desc="Leveraging AI as a pair-programmer to build fully functional web and mobile applications without massive syntax knowledge."
          icon="💻" 
        />
        <TimelineNode 
          index={4}
          title="The Final Prototype" 
          desc="Presenting a cohesive, AI-built startup idea or tool in a culminating demo day for parents and guests."
          icon="🚀" 
        />
      </div>
    </section>
  )
}
