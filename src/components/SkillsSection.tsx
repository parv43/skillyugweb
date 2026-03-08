"use client"

import React, { useEffect, useRef } from "react"
import { motion, useInView, useAnimation } from "framer-motion"

// Using Lucide React icons
import { Bot, Sparkles, Code2, BrainCircuit, Rocket, Zap } from "lucide-react"

const SkillNode = ({ icon: Icon, label, position, delay }: any) => {
  return (
    <motion.div
      className={`absolute flex flex-col items-center justify-center space-y-3 z-10 \${position}`}
      initial={{ opacity: 0, scale: 0.5 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay, type: "spring" }}
    >
      <div className="w-16 h-16 rounded-2xl glass-panel border-blue-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.2)] animate-float">
        <Icon className="w-8 h-8 text-blue-400" />
      </div>
      <span className="text-sm font-medium text-slate-300 tracking-wide bg-slate-900/50 px-3 py-1 rounded-full backdrop-blur-sm border border-white/5">
        {label}
      </span>
    </motion.div>
  )
}

const ConnectionLine = ({ d, strokeDasharray, duration, delay }: any) => {
  return (
    <motion.path
      d={d}
      stroke="url(#lineGradient)"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeDasharray={strokeDasharray || "4 4"}
      initial={{ pathLength: 0, opacity: 0 }}
      whileInView={{ pathLength: 1, opacity: 0.3 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration, delay, ease: "easeInOut" }}
    />
  )
}

export default function SkillsSection() {
  return (
    <section className="relative w-full py-32 bg-[#020617] overflow-hidden flex flex-col items-center justify-center border-t border-white/5">
      
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-900/10 blur-[150px] pointer-events-none rounded-full" />

      <div className="text-center mb-24 z-20">
        <motion.h2 
          className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-100 to-purple-400 mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Skills of the Future
        </motion.h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg">
          Connect the dots in your child's education. From basic prompts to complex neural thinking.
        </p>
      </div>

      <div className="relative w-full max-w-5xl h-[500px] mx-auto hidden md:block z-10">
        {/* Connection SVGs */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>

          {/* Hardcoded paths connecting nodes */}
          <ConnectionLine d="M 200 120 Q 300 120 400 220" duration={1.5} delay={0.2} />
          <ConnectionLine d="M 800 120 Q 700 120 600 220" duration={1.5} delay={0.4} />
          <ConnectionLine d="M 500 250 L 500 380" duration={1} delay={0.6} strokeDasharray="6 6" />
          <ConnectionLine d="M 200 400 Q 300 400 400 350" duration={1.5} delay={0.8} />
          <ConnectionLine d="M 800 400 Q 700 400 600 350" duration={1.5} delay={1.0} />
          <ConnectionLine d="M 200 120 L 200 400" duration={2} delay={0.5} strokeDasharray="2 4" />
          <ConnectionLine d="M 800 120 L 800 400" duration={2} delay={0.7} strokeDasharray="2 4" />
        </svg>

        {/* Floating Skill Nodes */}
        <SkillNode icon={Sparkles} label="Prompt Engineering" position="top-[100px] left-[150px]" delay={0.2} />
        <SkillNode icon={Code2} label="Code Generation" position="top-[100px] right-[150px]" delay={0.4} />
        <SkillNode icon={BrainCircuit} label="AI Models Core" position="top-[220px] left-[450px]" delay={0.6} />
        <SkillNode icon={Bot} label="Custom Assistants" position="bottom-[100px] left-[150px]" delay={0.8} />
        <SkillNode icon={Rocket} label="Startup Ideation" position="bottom-[100px] right-[150px]" delay={1.0} />
        <SkillNode icon={Zap} label="Logic & Workflows" position="bottom-[50px] left-[450px]" delay={1.2} />
      </div>

      {/* Mobile Flow Layout */}
      <div className="flex flex-col items-center gap-8 md:hidden px-6 z-10 w-full">
         <SkillNode icon={BrainCircuit} label="AI Models Core" position="relative" delay={0.1} />
         <div className="h-10 w-[2px] bg-gradient-to-b from-blue-500/50 to-transparent"></div>
         <SkillNode icon={Sparkles} label="Prompt Engineering" position="relative" delay={0.2} />
         <div className="h-10 w-[2px] bg-gradient-to-b from-purple-500/50 to-transparent"></div>
         <SkillNode icon={Code2} label="Code Generation" position="relative" delay={0.3} />
         <div className="h-10 w-[2px] bg-gradient-to-b from-pink-500/50 to-transparent"></div>
         <SkillNode icon={Bot} label="Custom Assistants" position="relative" delay={0.4} />
      </div>
    </section>
  )
}
