/* eslint-disable @next/next/no-img-element */
"use client"

import React, { useEffect, useRef } from "react"
import {
  MessageSquare,
  Layout,
  Image,
  PenTool,
  Search,
  Presentation,
  Edit3,
  Sparkles,
  FileText,
  type LucideIcon,
} from "lucide-react"

type ToolColor = "blue" | "purple" | "pink" | "indigo" | "cyan" | "violet" | "sky" | "fuchsia" | "teal"

const TOOL_COLORS: Record<ToolColor, { border: string; text: string; darkText: string; darkBorder: string }> = {
  blue: { border: "border-blue-200", text: "text-blue-600", darkText: "dark:text-blue-400", darkBorder: "dark:border-blue-900/30" },
  purple: { border: "border-purple-200", text: "text-purple-600", darkText: "dark:text-purple-400", darkBorder: "dark:border-purple-900/30" },
  pink: { border: "border-pink-200", text: "text-pink-600", darkText: "dark:text-pink-400", darkBorder: "dark:border-pink-900/30" },
  indigo: { border: "border-indigo-200", text: "text-indigo-600", darkText: "dark:text-indigo-400", darkBorder: "dark:border-indigo-900/30" },
  cyan: { border: "border-cyan-200", text: "text-cyan-600", darkText: "dark:text-cyan-400", darkBorder: "dark:border-cyan-900/30" },
  violet: { border: "border-violet-200", text: "text-violet-600", darkText: "dark:text-violet-400", darkBorder: "dark:border-violet-900/30" },
  sky: { border: "border-sky-200", text: "text-sky-600", darkText: "dark:text-sky-400", darkBorder: "dark:border-sky-900/30" },
  fuchsia: { border: "border-fuchsia-200", text: "text-fuchsia-600", darkText: "dark:text-fuchsia-400", darkBorder: "dark:border-fuchsia-900/30" },
  teal: { border: "border-teal-200", text: "text-teal-600", darkText: "dark:text-teal-400", darkBorder: "dark:border-teal-900/30" },
}

interface ToolCardProps {
  icon: LucideIcon
  title: string
  desc: string
  color?: ToolColor
  idx?: number
}

const ToolCard = ({ icon: Icon, title, desc, color = "blue", idx = 0 }: ToolCardProps) => {
  const styles = TOOL_COLORS[color]
  return (
    <div
      className="skill-card flex flex-col items-center text-center p-2 group opacity-0"
      style={{ transitionDelay: `${idx * 80}ms` }}
    >
      <div className={`w-14 h-14 rounded-2xl bg-white dark:bg-[#0a0f1c] flex items-center justify-center mb-5 border ${styles.border} ${styles.darkBorder} shadow-sm group-hover:-translate-y-1 transition-transform duration-300 relative`}>
        <Icon className={`w-6 h-6 ${styles.text} ${styles.darkText}`} />
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-[280px]">
        {desc}
      </p>
    </div>
  )
}

export default function SkillsSection() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const cards = section.querySelectorAll(".skill-card")

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("skill-card-visible")
          } else {
            entry.target.classList.remove("skill-card-visible")
          }
        })
      },
      { threshold: 0.1 }
    )

    cards.forEach((card) => observer.observe(card))
    return () => observer.disconnect()
  }, [])

  const tools = [
    { title: "ChatGPT", desc: "Students use ChatGPT to understand difficult concepts, summarize chapters, and generate study notes.", icon: MessageSquare, color: "blue" },
    { title: "NotebookLM", desc: "Students organize research material and class notes to better understand subjects and prepare for exams.", icon: Layout, color: "purple" },
    { title: "Canva AI", desc: "Students design presentations, posters, and visual school projects using AI-powered design tools.", icon: Image, color: "pink" },
    { title: "Napkin AI", desc: "Students convert ideas into clear visual diagrams to explain concepts easily.", icon: PenTool, color: "indigo" },
    { title: "Perplexity AI", desc: "Students research topics faster using AI-powered search with reliable explanations and sources.", icon: Search, color: "cyan" },
    { title: "Gamma AI", desc: "Students generate professional presentations quickly for school assignments and projects.", icon: Presentation, color: "violet" },
    { title: "Grammarly AI", desc: "Students improve writing quality for essays, assignments, and school reports.", icon: Edit3, color: "sky" },
    { title: "AI Study Assistant", desc: "Students learn how AI can help organize study plans and prepare for exams efficiently.", icon: Sparkles, color: "fuchsia" },
    { title: "AI Research Tools", desc: "Students discover how AI helps them collect information and learn independently.", icon: FileText, color: "teal" }
  ]

  return (
    <section
      ref={sectionRef}
      id="what-they-learn"
      className="relative w-full py-16 md:py-32 bg-white dark:bg-[#020617] overflow-hidden flex flex-col items-center justify-center border-t border-slate-100 dark:border-slate-900 border-b"
    >
      {/* Background Layer with subtle Classroom Image */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img src="/classroom.webp" alt="Classroom Environment" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-slate-50/60 dark:bg-slate-950/85" />
        {/* Left Side: 3D Open Book */}
        <div className="absolute top-[32%] left-[4%] w-24 h-24 opacity-35 hidden lg:block select-none">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.15)]">
            <defs>
              <linearGradient id="bookCover" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#4c1d95" />
              </linearGradient>
              <linearGradient id="bookPage" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#f3f4f6" />
              </linearGradient>
              <linearGradient id="bookSpineShadow" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#d1d5db" stopOpacity="0" />
                <stop offset="50%" stopColor="#9ca3af" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#d1d5db" stopOpacity="0" />
              </linearGradient>
            </defs>
            <rect x="6" y="24" width="88" height="58" rx="8" fill="url(#bookCover)" />
            <rect x="6" y="28" width="88" height="54" rx="8" fill="#311075" opacity="0.3" />
            <path d="M12 28 C25 24, 42 26, 48 31 L48 76 C42 71, 25 69, 12 73 Z" fill="url(#bookPage)" />
            <path d="M14 29 C25 26, 40 28, 46 32 L46 74 C40 70, 25 68, 14 71 Z" fill="#ffffff" opacity="0.6" />
            <path d="M88 28 C75 24, 58 26, 52 31 L52 76 C58 71, 75 69, 88 73 Z" fill="url(#bookPage)" />
            <path d="M86 29 C75 26, 60 28, 54 32 L54 74 C60 70, 75 68, 86 71 Z" fill="#ffffff" opacity="0.6" />
            <rect x="47" y="29" width="6" height="48" fill="url(#bookSpineShadow)" />
            <path d="M18 38 H38 M18 46 H40 M18 54 H35 M18 62 H38" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
            <path d="M62 38 H82 M60 46 H82 M65 54 H82 M62 62 H82" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
          </svg>
        </div>
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[800px] h-[600px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/5 via-purple-500/0 to-transparent pointer-events-none rounded-full z-10" />

      {/* Header */}
      <div className="w-full flex justify-center mb-10 md:mb-20 z-20 px-6">
        <div className="text-center max-w-[800px] w-full mx-auto">
          <h2 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-purple-700 to-pink-700 dark:from-blue-300 dark:via-purple-300 dark:to-pink-300 mb-4 md:mb-6 tracking-tight leading-tight">
            What Students Will Actually Learn
          </h2>
          <p className="text-slate-600 dark:text-slate-350 text-base md:text-xl font-light">
            No complex developer tools. At the Skillyug Summer AI Bootcamp, we focus solely on practical AI study tools and homework apps that help Class 6–12 students learn better and finish assignments faster.
          </p>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="flex flex-col gap-3 px-4 max-w-lg mx-auto w-full z-10 relative md:hidden">
        {tools.filter(t => t.title !== "AI Study Assistant" && t.title !== "AI Research Tools").map((tool, idx) => {
          const Icon = tool.icon
          const colors = ["blue", "purple", "pink", "indigo", "cyan", "violet", "sky", "fuchsia", "teal"]
          const color = colors[idx % colors.length] as ToolColor
          const styles = TOOL_COLORS[color]
          return (
            <div
              key={idx}
              className="skill-card flex items-start gap-4 bg-white/90 dark:bg-[#0a0f1c]/90 border border-slate-200 dark:border-white/10 rounded-2xl p-4 backdrop-blur-sm shadow-sm opacity-0"
              style={{ transitionDelay: `${idx * 80}ms` }}
            >
              <div className={`w-11 h-11 rounded-xl bg-slate-50 dark:bg-white/5 border ${styles.border} ${styles.darkBorder} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${styles.text} ${styles.darkText}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-slate-900 dark:text-white font-bold text-sm leading-tight mb-1">{tool.title}</h3>
                <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">{tool.desc}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-6 max-w-6xl mx-auto w-full z-10 relative">
        {tools.map((tool, idx) => (
          <ToolCard
            key={idx}
            idx={idx}
            title={tool.title}
            desc={tool.desc}
            icon={tool.icon}
            color={tool.color as ToolColor}
          />
        ))}
      </div>
    </section>
  )
}
