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

const TOOL_COLORS: Record<ToolColor, { bg: string; text: string }> = {
  blue: { bg: "bg-blue-50/80 dark:bg-blue-950/40", text: "text-blue-600 dark:text-blue-400" },
  purple: { bg: "bg-purple-50/80 dark:bg-purple-950/40", text: "text-purple-600 dark:text-purple-400" },
  pink: { bg: "bg-pink-50/80 dark:bg-pink-950/40", text: "text-pink-600 dark:text-pink-400" },
  indigo: { bg: "bg-indigo-50/80 dark:bg-indigo-950/40", text: "text-indigo-600 dark:text-indigo-400" },
  cyan: { bg: "bg-cyan-50/80 dark:bg-cyan-950/40", text: "text-cyan-600 dark:text-cyan-400" },
  violet: { bg: "bg-violet-50/80 dark:bg-violet-950/40", text: "text-violet-600 dark:text-violet-400" },
  sky: { bg: "bg-sky-50/80 dark:bg-sky-950/40", text: "text-sky-600 dark:text-sky-400" },
  fuchsia: { bg: "bg-fuchsia-50/80 dark:bg-fuchsia-950/40", text: "text-fuchsia-600 dark:text-fuchsia-400" },
  teal: { bg: "bg-teal-50/80 dark:bg-teal-950/40", text: "text-teal-600 dark:text-teal-400" },
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
      className="skill-card flex flex-col items-start text-left p-6 hover:-translate-y-1 transition-all duration-300 opacity-0 relative group"
      style={{ transitionDelay: `${idx * 80}ms` }}
    >
      <div className={`w-12 h-12 rounded-full ${styles.bg} flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-105 shadow-sm`}>
        <Icon className={`w-5.5 h-5.5 ${styles.text}`} />
      </div>
      <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-purple-650 dark:group-hover:text-purple-400 transition-colors">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
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
      className="relative w-full py-16 md:py-32 bg-slate-50 dark:bg-[#020617] overflow-hidden flex flex-col items-center justify-center border-t border-slate-200 dark:border-white/5 border-b border-slate-200 dark:border-white/5"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[800px] h-[600px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-150/10 via-purple-150/5 to-transparent pointer-events-none rounded-full z-10" />

      {/* Header */}
      <div className="w-full flex justify-center mb-10 md:mb-20 z-20 px-6">
        <div className="text-center max-w-[800px] w-full mx-auto">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 md:mb-6 tracking-tight leading-tight">
            What Students Will Actually Learn
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-base md:text-xl font-light">
            No complex developer tools. At the Skillyug Summer AI Bootcamp, we focus solely on practical AI study tools and homework apps that help Class 6–12 students learn better and finish assignments faster.
          </p>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="flex flex-col gap-4 px-4 max-w-lg mx-auto w-full z-10 relative md:hidden">
        {tools.filter(t => t.title !== "AI Study Assistant" && t.title !== "AI Research Tools").map((tool, idx) => {
          const Icon = tool.icon
          const colors = ["blue", "purple", "pink", "indigo", "cyan", "violet", "sky", "fuchsia", "teal"]
          const color = colors[idx % colors.length] as ToolColor
          const styles = TOOL_COLORS[color]
          return (
            <div
              key={idx}
              className="skill-card flex items-start gap-4 p-3 opacity-0"
              style={{ transitionDelay: `${idx * 80}ms` }}
            >
              <div className={`w-10 h-10 rounded-full ${styles.bg} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                <Icon className={`w-5 h-5 ${styles.text}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-slate-900 dark:text-slate-100 font-bold text-sm leading-tight mb-1">{tool.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{tool.desc}</p>
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
