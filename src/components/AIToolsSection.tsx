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

      {/* ── Mobile Layout (< lg) ── */}
      <div className="flex flex-col w-full px-4 lg:hidden z-10 relative gap-8">

        {/* Tool Cards — 2-column grid */}
        <div className="grid grid-cols-2 gap-3 w-full">
          {[
            { icon: TerminalSquare, label: "Initial Prompt", desc: "Student defines vision & logic", color: "slate" },
            { icon: MessageSquare, label: "ChatGPT & Claude", desc: "Brainstorms ideas & writes copy", color: "blue" },
            { icon: Image, label: "Midjourney & DALL-E", desc: "Generates stunning AI visuals", color: "purple" },
            { icon: Layout, label: "Canva & Figma", desc: "Assembles into pro layouts", color: "pink" },
            { icon: Binary, label: "Live Deployment", desc: "Ships a real app or project", color: "emerald" },
            { icon: Zap, label: "AI Automation", desc: "Automates repetitive tasks", color: "yellow" },
          ].map(({ icon: Icon, label, desc, color }, i) => (
            <motion.div
              key={i}
              className="bg-[#0f172a]/80 border border-white/8 rounded-2xl p-4 flex flex-col items-center text-center gap-2"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              viewport={{ once: true }}
            >
              <div className={`w-12 h-12 rounded-xl bg-[#020617] flex items-center justify-center border border-${color}-500/30 mb-1`}>
                <Icon className={`w-6 h-6 text-${color}-400`} />
              </div>
              <h4 className="text-white font-bold text-xs leading-tight">{label}</h4>
              <p className="text-slate-400 text-[11px] leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Flow connector */}
        <div className="flex items-center gap-2 px-2">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
          <span className="text-slate-500 text-xs font-semibold tracking-widest uppercase">Student Workflow</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
        </div>

        {/* Workflow Steps — numbered list cards */}
        <div className="flex flex-col gap-3 w-full">
          {[
            { step: "01", title: "Prompt Design", desc: "Students write a structured prompt explaining their idea to an LLM.", color: "from-blue-500/20 to-blue-500/5", border: "border-blue-500/20" },
            { step: "02", title: "AI Generation", desc: "AI tools output the raw code, text, graphics, and structure required.", color: "from-purple-500/20 to-purple-500/5", border: "border-purple-500/20" },
            { step: "03", title: "Human Polish", desc: "Students use Canva to refine layouts and edit out AI hallucinations.", color: "from-pink-500/20 to-pink-500/5", border: "border-pink-500/20" },
            { step: "04", title: "Final Project", desc: "A complete, functioning website, game, or presentation is created.", color: "from-emerald-500/20 to-emerald-500/5", border: "border-emerald-500/20" },
          ].map(({ step, title, desc, color, border }, i) => (
            <motion.div
              key={i}
              className={`relative bg-gradient-to-br ${color} border ${border} rounded-2xl p-4 flex items-start gap-4 overflow-hidden`}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              viewport={{ once: true }}
            >
              <span className="text-4xl font-black font-mono opacity-15 absolute right-4 top-3 select-none">{step}</span>
              <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white font-black text-xs">{step}</span>
              </div>
              <div>
                <h3 className="text-white font-bold text-sm mb-1">{title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Desktop Workflow Steps (≥ lg) ── */}
      <div className="w-full max-w-6xl mx-auto px-6 mt-32 z-20 hidden lg:block">
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
