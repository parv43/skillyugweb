"use client"

import React, { useEffect, useRef } from "react"
import {
  MessageSquare,
  Image,
  Layout,
  Binary,
  Zap,
  TerminalSquare,
  type LucideIcon,
} from "lucide-react"

type AccentColor = "slate" | "blue" | "purple" | "pink" | "emerald" | "yellow"

const ACCENT_STYLES: Record<AccentColor, { border: string; dot: string; text: string; darkText: string }> = {
  slate: { border: "border-slate-300", dot: "bg-slate-400", text: "text-slate-600", darkText: "dark:text-slate-400" },
  blue:  { border: "border-blue-300",  dot: "bg-blue-400",  text: "text-blue-600",  darkText: "dark:text-blue-400"  },
  purple:{ border: "border-purple-300",dot: "bg-purple-400",text: "text-purple-600",darkText: "dark:text-purple-400"},
  pink:  { border: "border-pink-300",  dot: "bg-pink-400",  text: "text-pink-600",  darkText: "dark:text-pink-400"  },
  emerald:{border:"border-emerald-300",dot:"bg-emerald-400",text:"text-emerald-600",darkText: "dark:text-emerald-400"},
  yellow:{ border: "border-yellow-300",dot: "bg-yellow-400",text: "text-yellow-600",darkText: "dark:text-yellow-400"},
}

interface EcosystemNodeProps {
  icon: LucideIcon
  label: string
  desc: string
  position: string
  color?: AccentColor
  delay?: number
}

const EcosystemNode = ({ icon: Icon, label, desc, position, color = "blue", delay = 0 }: EcosystemNodeProps) => {
  const styles = ACCENT_STYLES[color]
  return (
    <div
      className={`ecosystem-node absolute flex flex-col items-center justify-center z-20 ${position} w-48 text-center opacity-0`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className={`w-16 h-16 rounded-2xl bg-white dark:bg-[#0a0f1c] flex items-center justify-center mb-4 border ${styles.border} dark:border-white/10 shadow-sm group hover:-translate-y-2 hover:shadow-md dark:shadow-[0_0_15px_rgba(255,255,255,0.05)] transition-all duration-300 relative`}>
        <Icon className={`w-8 h-8 ${styles.text} ${styles.darkText} group-hover:opacity-80 transition-opacity`} />
        <div className={`absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${styles.dot}`} />
        <div className={`absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${styles.dot}`} />
      </div>
      <h4 className="text-slate-900 dark:text-white font-bold text-sm mb-1">{label}</h4>
      <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">{desc}</p>
    </div>
  )
}

export default function AIToolsSection() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const nodes = section.querySelectorAll(".ecosystem-node, .mobile-tool-card, .workflow-step")

    const paths = section.querySelectorAll(".animate-draw")

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("ai-tools-visible")
            if (entry.target.classList.contains("animate-draw")) {
              entry.target.classList.add("draw-active")
            }
          } else {
            entry.target.classList.remove("ai-tools-visible")
            if (entry.target.classList.contains("animate-draw")) {
              entry.target.classList.remove("draw-active")
            }
          }
        })
      },
      { threshold: 0.1 }
    )

    nodes.forEach((node) => observer.observe(node))
    paths.forEach((path) => observer.observe(path))
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-32 bg-white dark:bg-[#020617] overflow-hidden flex flex-col items-center border-t border-slate-100 dark:border-slate-900"
    >
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/5 dark:from-blue-500/15 via-blue-500/0 to-transparent rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-500/5 dark:from-purple-500/15 via-purple-500/0 to-transparent rounded-full pointer-events-none" />

      {/* ── Static 3D Claymorphic Background Elements ── */}
      {/* Left Side: 3D Lightbulb */}
      <div className="absolute top-[30%] left-[4%] w-20 h-20 opacity-35 select-none hidden lg:block z-0 pointer-events-none">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_12px_24px_rgba(245,158,11,0.25)]">
          <defs>
            <radialGradient id="bulbGlass" cx="50%" cy="40%" r="50%" fx="30%" fy="30%">
              <stop offset="0%" stopColor="#ffedd5" />
              <stop offset="40%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#d97706" />
            </radialGradient>
            <linearGradient id="bulbBase" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#94a3b8" />
              <stop offset="50%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#64748b" />
            </linearGradient>
            <filter id="bulbGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <circle cx="50" cy="45" r="28" fill="#f59e0b" opacity="0.25" filter="url(#bulbGlow)" />
          <path d="M50 15 C30 15, 26 38, 38 52 C42 56, 42 66, 44 70 H56 C58 66, 58 56, 62 52 C74 38, 70 15, 50 15 Z" fill="url(#bulbGlass)" />
          <path d="M38 25 C34 30, 32 38, 36 44" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
          <path d="M44 48 L46 32 C47 30, 53 30, 54 32 L56 48" stroke="#ffedd5" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="50" cy="31" r="3" fill="#ffedd5" />
          <rect x="42" y="70" width="16" height="5" rx="2.5" fill="url(#bulbBase)" />
          <rect x="42" y="76" width="16" height="5" rx="2.5" fill="url(#bulbBase)" />
          <rect x="44" y="82" width="12" height="4" rx="2" fill="url(#bulbBase)" />
          <path d="M47 86 H53 L50 90 Z" fill="#334155" />
        </svg>
      </div>

      {/* Right Side: 3D AI Chat Bubble */}
      <div className="absolute top-[60%] right-[3%] w-24 h-24 select-none hidden lg:block z-0 pointer-events-none">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_16px_32px_rgba(99,102,241,0.25)]">
          <defs>
            <radialGradient id="bubbleGrad" cx="30%" cy="30%" r="75%">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="60%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#312e81" />
            </radialGradient>
            <filter id="sparkleGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <rect x="8" y="16" width="84" height="58" rx="22" fill="url(#bubbleGrad)" />
          <rect x="10" y="18" width="80" height="54" rx="20" stroke="#a5b4fc" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />
          <rect x="9" y="20" width="82" height="52" rx="20" stroke="#1e1b4b" strokeWidth="2.5" strokeLinecap="round" opacity="0.3" />
          <path d="M28 73 C30 84, 18 90, 18 90 C18 90, 36 88, 42 74 Z" fill="#312e81" />
          <path d="M28 73 C30 84, 18 90, 18 90 C18 90, 36 88, 42 74 Z" fill="url(#bubbleGrad)" />
          <path d="M20 28 C32 22, 68 22, 80 28" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" opacity="0.45" />
          <path d="M50 28 L53 39 L64 42 L53 45 L50 56 L47 45 L36 42 L47 39 Z" fill="#ffffff" filter="url(#sparkleGlow)" />
          <path d="M68 46 L69.5 51.5 L75 53 L69.5 54.5 L68 60 L66.5 54.5 L61 53 L66.5 51.5 Z" fill="#a5b4fc" />
        </svg>
      </div>

      {/* Header */}
      <div className="text-center mb-24 z-20 px-6 max-w-3xl">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 dark:from-blue-300 dark:to-purple-300 mb-6 drop-shadow-sm tracking-tight leading-tight">
          Tools Students Will Learn
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl font-light">
          An interconnected ecosystem. We train students to chain powerful AI platforms together to build fully functional systems from scratch.
        </p>
      </div>

      {/* Interactive Ecosystem Layout (Desktop) */}
      <div className="relative w-full max-w-5xl h-[600px] mx-auto hidden lg:block z-10">
        {/* Connection SVGs — animated draw */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          <defs>
            <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" opacity="0.4" />
              <stop offset="50%" stopColor="#8b5cf6" opacity="0.8" />
              <stop offset="100%" stopColor="#ec4899" opacity="1" />
            </linearGradient>
          </defs>
          <path className="animate-draw" pathLength="1" d="M 230 260 Q 350 260 410 110" stroke="url(#flowGradient)" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />
          <path className="animate-draw" pathLength="1" style={{ animationDelay: "0.3s" }} d="M 230 260 Q 350 260 410 490" stroke="url(#flowGradient)" strokeWidth="2" fill="none" strokeLinecap="round" strokeDasharray="4 4" opacity="0.6" />
          <path className="animate-draw" pathLength="1" style={{ animationDelay: "0.6s" }} d="M 580 110 Q 750 110 820 190" stroke="url(#flowGradient)" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />
          <path className="animate-draw" pathLength="1" style={{ animationDelay: "0.9s" }} d="M 580 490 Q 750 490 820 400" stroke="url(#flowGradient)" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />
          <path className="animate-draw" pathLength="1" style={{ animationDelay: "1.2s" }} d="M 480 160 L 480 440" stroke="url(#flowGradient)" strokeWidth="2" fill="none" strokeLinecap="round" strokeDasharray="2 6" opacity="0.6" />
        </svg>

        <EcosystemNode icon={TerminalSquare} label="Initial Prompt" desc="Student defines the logic and creative vision." position="top-[220px] left-[50px]" color="slate" delay={0} />
        <EcosystemNode icon={MessageSquare} label="ChatGPT & Claude" desc="Brainstorms features, writes copy, and generates raw code." position="top-[50px] left-[400px]" color="blue" delay={180} />
        <EcosystemNode icon={Image} label="Midjourney & DALL-E" desc="Generates stunning UI assets and visual photography." position="bottom-[50px] left-[400px]" color="purple" delay={360} />
        <EcosystemNode icon={Layout} label="Canva & Figma" desc="Students assemble the AI output into professional layouts." position="top-[150px] right-[50px]" color="pink" delay={540} />
        <EcosystemNode icon={Binary} label="Live Deployment" desc="Compiling the final creative assets into a real app or presentation." position="top-[350px] right-[50px]" color="emerald" delay={720} />
      </div>

      {/* Mobile Layout */}
      <div className="flex flex-col w-full px-4 lg:hidden z-10 relative gap-8">
        <div className="grid grid-cols-2 gap-3 w-full">
          {[
            { icon: TerminalSquare, label: "Initial Prompt", desc: "Student defines vision & logic", color: "slate" },
            { icon: MessageSquare, label: "ChatGPT & Claude", desc: "Brainstorms ideas & writes copy", color: "blue" },
            { icon: Image, label: "Midjourney & DALL-E", desc: "Generates stunning AI visuals", color: "purple" },
            { icon: Layout, label: "Canva & Figma", desc: "Assembles into pro layouts", color: "pink" },
            { icon: Binary, label: "Live Deployment", desc: "Ships a real app or project", color: "emerald" },
            { icon: Zap, label: "AI Automation", desc: "Automates repetitive tasks", color: "yellow" },
          ].map(({ icon: Icon, label, desc, color }, i) => {
            const accentColor = color as AccentColor
            const styles = ACCENT_STYLES[accentColor]
            return (
              <div
                key={i}
                className="mobile-tool-card bg-white dark:bg-[#0a0f1c] border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 flex flex-col items-center text-center gap-2 shadow-sm opacity-0"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className={`w-12 h-12 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center border ${styles.border} dark:border-white/10 mb-1`}>
                  <Icon className={`w-6 h-6 ${styles.text} ${styles.darkText}`} />
                </div>
                <h4 className="text-slate-900 dark:text-white font-bold text-xs leading-tight">{label}</h4>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">{desc}</p>
              </div>
            )
          })}
        </div>

        <div className="flex items-center gap-2 px-2">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
          <span className="text-slate-400 dark:text-slate-500 text-xs font-semibold tracking-widest uppercase">Student Workflow</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
        </div>

        <div className="flex flex-col gap-3 w-full">
          {[
            { step: "01", title: "Prompt Design", desc: "Students write a structured prompt explaining their idea to an LLM.", color: "from-blue-50 to-blue-100/30 dark:from-blue-500/20 dark:to-blue-500/5", border: "border-blue-100 dark:border-blue-500/20" },
            { step: "02", title: "AI Generation", desc: "AI tools output the raw code, text, graphics, and structure required.", color: "from-purple-50 to-purple-100/30 dark:from-purple-500/20 dark:to-purple-500/5", border: "border-purple-100 dark:border-purple-500/20" },
            { step: "03", title: "Human Polish", desc: "Students use Canva to refine layouts and edit out AI hallucinations.", color: "from-pink-50 to-pink-100/30 dark:from-pink-500/20 dark:to-pink-500/5", border: "border-pink-100 dark:border-pink-500/20" },
            { step: "04", title: "Final Project", desc: "A complete, functioning website, game, or presentation is created.", color: "from-emerald-50 to-emerald-100/30 dark:from-emerald-500/20 dark:to-emerald-500/5", border: "border-emerald-100 dark:border-emerald-500/20" },
          ].map(({ step, title, desc, color, border }, i) => (
            <div
              key={i}
              className={`workflow-step relative bg-gradient-to-br ${color} border ${border} rounded-2xl p-4 flex items-start gap-4 overflow-hidden opacity-0`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <span className="text-4xl font-black font-mono opacity-10 text-slate-400 dark:text-slate-500 absolute right-4 top-3 select-none">{step}</span>
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-slate-800 dark:text-slate-200 font-bold text-xs">{step}</span>
              </div>
              <div>
                <h3 className="text-slate-900 dark:text-white font-bold text-sm mb-1">{title}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
