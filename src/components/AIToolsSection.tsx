"use client"

import React, { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { MessageSquare, Image, Layout, Sparkles, Binary, Zap, TerminalSquare } from "lucide-react"

// A connection line that draws itself when scrolled into view
const FlowLine = ({ d, strokeDasharray, duration = 1.5, delay = 0 }: any) => {
  return (
    <motion.path
      d={d}
      stroke="url(#flowGradient)"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeDasharray={strokeDasharray}
      initial={{ pathLength: 0, opacity: 0 }}
      whileInView={{ pathLength: 1, opacity: 0.6 }}
      
      transition={{ duration, delay, ease: "easeInOut" }}
    />
  )
}

const EcosystemNode = ({ icon: Icon, label, desc, position, delay = 0, color = "blue" }: any) => {
  return (
    <motion.div
      className={`absolute flex flex-col items-center justify-center z-20 ${position} w-48 text-center will-change-transform`}
      transition={{ duration: 0.5, delay, type: "spring" }}
    >
      <div className={`w-16 h-16 rounded-2xl bg-[#0f172a]/80 flex items-center justify-center mb-4 border border-${color}-500/30 shadow-[0_8px_16px_rgba(0,0,0,0.2)] group hover:-translate-y-2 transition-transform duration-300 relative`}>
        <Icon className={`w-8 h-8 text-${color}-400 group-hover:opacity-80 transition-opacity`} />
        {/* Input/Output port dots */}
        <div className={`absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-${color}-400/50`} />
        <div className={`absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-${color}-400/50`} />
      </div>
      <h4 className="text-white font-bold text-sm mb-1">{label}</h4>
      <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
    </motion.div>
  )
}

const WorkflowStep = ({ step, title, desc, delay }: any) => {
  return (
    <motion.div 
      className="workflow-card flex-1 bg-[#0f172a]/90 shadow-[0_8px_16px_rgba(0,0,0,0.15)] p-6 rounded-3xl border border-white/5 relative z-10 hover:border-purple-500/30 transition-colors will-change-transform"
      transition={{ duration: 0.6, delay }}
    >
      <div className="text-4xl opacity-20 absolute right-6 top-6 font-black font-mono">{step}</div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-sm">{desc}</p>
    </motion.div>
  )
}

export default function AIToolsSection() {
  return (
    <section className="relative w-full py-32 bg-[#020617] overflow-hidden flex flex-col items-center border-t border-slate-900">
      
      {/* Background Ambience (optimized) */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/15 via-blue-900/5 to-transparent rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/15 via-purple-900/5 to-transparent rounded-full pointer-events-none" />

      {/* Header */}
      <div className="text-center mb-24 z-20 px-6 max-w-3xl">
        <motion.h2 
          className="text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300 mb-6 drop-shadow-md tracking-tight leading-tight"
        >
          Tools Students Will Learn
        </motion.h2>
        <p className="text-slate-400 text-lg md:text-xl font-light">
          An interconnected ecosystem. We train students to chain powerful AI platforms together to build fully functional systems from scratch.
        </p>
      </div>

      {/* Interactive Ecosystem Layout (Desktop) */}
      <div className="relative w-full max-w-5xl h-[600px] mx-auto hidden lg:block z-10">
        
        {/* Connection SVGs */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          <defs>
            <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" opacity="0.4" />
              <stop offset="50%" stopColor="#8b5cf6" opacity="0.8" />
              <stop offset="100%" stopColor="#ec4899" opacity="1" />
            </linearGradient>
          </defs>

          {/* Hardcoded network routing paths */}
          {/* Prompt -> LLMs */}
          <FlowLine d="M 230 260 Q 350 260 410 110" duration={1} delay={0.2} />
          {/* Prompt -> Generators */}
          <FlowLine d="M 230 260 Q 350 260 410 490" duration={1} delay={0.2} strokeDasharray="4 4" />
          
          {/* LLMs -> Design/Code */}
          <FlowLine d="M 580 110 Q 750 110 820 190" duration={1.2} delay={0.6} />
          {/* Generators -> Design/Code */}
          <FlowLine d="M 580 490 Q 750 490 820 400" duration={1.2} delay={0.8} />

          {/* Cross connections */}
          <FlowLine d="M 480 160 L 480 440" duration={1.5} delay={1} strokeDasharray="2 6" />
        </svg>

        {/* Dynamic Nodes */}
        <EcosystemNode 
          icon={TerminalSquare} label="Initial Prompt" 
          desc="Student defines the logic and creative vision." 
          position="top-[220px] left-[50px]" delay={0.1} color="slate"
        />
        
        <EcosystemNode 
          icon={MessageSquare} label="ChatGPT & Claude" 
          desc="Brainstorms features, writes copy, and generates raw code." 
          position="top-[50px] left-[400px]" delay={0.4} color="blue"
        />
        
        <EcosystemNode 
          icon={Image} label="Midjourney & DALL-E" 
          desc="Generates stunning UI assets and visual photography." 
          position="bottom-[50px] left-[400px]" delay={0.6} color="purple"
        />
        
        <EcosystemNode 
          icon={Layout} label="Canva & Figma" 
          desc="Students assemble the AI output into professional layouts." 
          position="top-[150px] right-[50px]" delay={1.0} color="pink"
        />
        
        <EcosystemNode 
          icon={Binary} label="Live Deployment" 
          desc="Compiling the final creative assets into a real app or presentation." 
          position="top-[350px] right-[50px]" delay={1.2} color="emerald"
        />
      </div>

      {/* Mobile Stack Layout */}
      <div className="flex flex-col gap-6 w-full px-6 lg:hidden z-10 relative">
        <EcosystemNode icon={TerminalSquare} label="Initial Prompt" desc="Student defines vision." position="relative w-full" delay={0.1} />
        <div className="w-1 h-8 bg-gradient-to-b from-blue-500/50 to-transparent mx-auto" />
        <EcosystemNode icon={MessageSquare} label="ChatGPT & Claude" desc="Generates raw material." position="relative w-full" delay={0.2} />
        <div className="w-1 h-8 bg-gradient-to-b from-purple-500/50 to-transparent mx-auto" />
        <EcosystemNode icon={Image} label="Midjourney & DALL-E" desc="Generates visual art." position="relative w-full" delay={0.3} />
        <div className="w-1 h-8 bg-gradient-to-b from-pink-500/50 to-transparent mx-auto" />
        <EcosystemNode icon={Binary} label="Final Deployment" desc="Assembling the pieces." position="relative w-full" delay={0.4} />
      </div>

      {/* Real Student Workflow Visualization */}
      <div className="w-full max-w-6xl mx-auto px-6 mt-32 z-20">
        <div className="text-center mb-12">
          <h3 className="text-2xl font-bold text-white mb-4">Example Student Workflow</h3>
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-blue-500 to-transparent mx-auto" />
        </div>

        <div className="flex flex-col md:flex-row gap-6 md:gap-4 lg:gap-8 relative">
          {/* Background connector line for horizontal flow */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-white/10 hidden md:block -z-10" />

          <WorkflowStep 
            step="01"
            title="Prompt Design" 
            desc="Students write a structured prompt explaining their idea to an LLM."
            delay={0.2}
          />
          <WorkflowStep 
            step="02"
            title="AI Generation" 
            desc="AI tools output the raw code, text, graphics, and structure required."
            delay={0.4}
          />
          <WorkflowStep 
            step="03"
            title="Human Polish" 
            desc="Students use Canva to refine layouts and edit out AI hallucinations."
            delay={0.6}
          />
          <WorkflowStep 
            step="04"
            title="Final Project" 
            desc="A complete, functioning website, game, or presentation is created."
            delay={0.8}
          />
        </div>
      </div>
    </section>
  )
}
