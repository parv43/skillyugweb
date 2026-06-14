"use client"

import React from "react"
import { BookOpen, Zap, Palette, Cpu, Clock, Rocket, type LucideIcon } from "lucide-react"

type ProjectColor = "blue" | "yellow" | "pink" | "purple" | "emerald" | "orange"

const PROJECT_COLORS: Record<ProjectColor, { badge: string; border: string; text: string }> = {
  blue: { badge: "bg-blue-50 dark:bg-blue-950/40", border: "border-blue-200 dark:border-blue-900/30", text: "text-blue-600 dark:text-blue-400" },
  yellow: { badge: "bg-yellow-50/50 dark:bg-yellow-950/40", border: "border-yellow-200 dark:border-yellow-900/30", text: "text-yellow-750 dark:text-yellow-400" },
  pink: { badge: "bg-pink-50 dark:bg-pink-950/40", border: "border-pink-200 dark:border-pink-900/30", text: "text-pink-600 dark:text-pink-400" },
  purple: { badge: "bg-purple-50 dark:bg-purple-950/40", border: "border-purple-200 dark:border-purple-900/30", text: "text-purple-600 dark:text-purple-400" },
  emerald: { badge: "bg-emerald-50 dark:bg-emerald-950/40", border: "border-emerald-200 dark:border-emerald-900/30", text: "text-emerald-600 dark:text-emerald-400" },
  orange: { badge: "bg-orange-50 dark:bg-orange-950/40", border: "border-orange-200 dark:border-orange-900/30", text: "text-orange-600 dark:text-orange-400" },
}

interface ProjectCardProps {
  title: string
  tech: string
  desc: string
  icon: LucideIcon
}

const ProjectCard = ({ title, tech, desc, icon: Icon }: ProjectCardProps) => {
  return (
    <div className="bg-white dark:bg-[#0a0f1c] p-6 sm:p-8 rounded-[2rem] border border-slate-200/80 dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-md transition-all duration-300 group flex flex-col h-full relative overflow-hidden shadow-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="flex items-center gap-4 mb-6 relative z-10">
        <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center group-hover:border-blue-500/30 transition-colors shadow-sm">
          <Icon className="w-7 h-7 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{title}</h3>
          <p className="text-xs font-bold text-purple-600 dark:text-purple-400 mt-1 uppercase tracking-wider">{tech}</p>
        </div>
      </div>
      
      <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed relative z-10 flex-1">
        {desc}
      </p>
    </div>
  )
}

export default function StudentProjects() {
  const projects = [
    { title: "Smarter Studying With AI", tech: "Study Smarter", desc: "Students learn how to use AI tools like ChatGPT to understand difficult concepts, summarize chapters, and create structured study notes.", icon: BookOpen },
    { title: "Faster Homework & Assignments", tech: "Work Faster", desc: "Students discover how AI can help research topics, organize ideas, and complete assignments more efficiently.", icon: Zap },
    { title: "Better School Projects", tech: "Create Better", desc: "Students use tools like Canva AI to design presentations, posters, and visual projects that stand out in class.", icon: Palette },
    { title: "Confidence With Modern Technology", tech: "Build Confidence", desc: "Students gain early familiarity with AI tools that are becoming common in education and modern workplaces.", icon: Cpu },
    { title: "Improved Productivity", tech: "Save Time", desc: "Students learn how AI tools help them save time on repetitive tasks and focus more on learning and creativity.", icon: Clock },
    { title: "Future-Ready Digital Skills", tech: "Be Prepared", desc: "Students develop practical familiarity with AI tools that will shape future education and career environments.", icon: Rocket }
  ]

  const iconColors = ["blue", "yellow", "pink", "purple", "emerald", "orange"]

  return (
    <section id="projects" className="relative w-full py-16 md:py-32 bg-white dark:bg-[#020617] overflow-hidden flex flex-col border-t border-slate-100 dark:border-slate-900">
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/5 dark:from-blue-500/15 via-blue-500/0 to-transparent pointer-events-none rounded-full z-0" />

      {/* Right Side: 3D Space Rocket */}
      <div className="absolute top-[32%] right-[4%] w-24 h-24 pointer-events-none z-10 hidden lg:block select-none">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_16px_32px_rgba(239,68,68,0.25)]">
          <defs>
            <linearGradient id="rocketBody" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="40%" stopColor="#f1f5f9" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>
            <linearGradient id="rocketAccent" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#b91c1c" />
            </linearGradient>
            <radialGradient id="rocketWindow" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#e0f2fe" />
              <stop offset="100%" stopColor="#0284c7" />
            </radialGradient>
            <linearGradient id="rocketFlame" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="50%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M43 78 C43 92, 50 98, 50 98 C50 98, 57 92, 57 78 Z" fill="url(#rocketFlame)" />
          <path d="M46 78 C46 86, 50 90, 50 90 C50 90, 54 86, 54 78 Z" fill="#fbbf24" />
          <path d="M40 60 L24 74 C22 76, 26 80, 30 78 L42 70 Z" fill="url(#rocketAccent)" />
          <path d="M25 73 L29 77 L40 67 Z" fill="#7f1d1d" opacity="0.3" />
          <path d="M60 60 L76 74 C78 76, 74 80, 70 78 L58 70 Z" fill="url(#rocketAccent)" />
          <path d="M75 73 L71 77 L60 67 Z" fill="#7f1d1d" opacity="0.3" />
          <rect x="44" y="72" width="12" height="6" rx="2" fill="#475569" />
          <path d="M50 8 C64 24, 60 56, 58 72 H42 C40 56, 36 24, 50 8 Z" fill="url(#rocketBody)" />
          <path d="M47 16 C39 30, 42 52, 44 68" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" opacity="0.6" />
          <path d="M50 8 C57 16, 58 24, 58 28 H42 C42 24, 43 16, 50 8 Z" fill="url(#rocketAccent)" />
          <circle cx="50" cy="38" r="9" fill="#475569" />
          <circle cx="50" cy="38" r="7.5" fill="url(#rocketWindow)" />
          <path d="M46.5 35 C45 38, 47 42, 50 43.5" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
        </svg>
      </div>

      {/* Heading */}
      <div className="text-center mb-10 md:mb-20 z-20 px-6 max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-5xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-purple-700 to-pink-700 dark:from-blue-300 dark:via-purple-300 dark:to-pink-300 mb-4 md:mb-6 drop-shadow-sm tracking-tight">
          How This Bootcamp Gives Students an Advantage With AI
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-base md:text-lg font-light">
          Students learn how to use modern AI tools to study faster, complete assignments efficiently, and build confidence using technology that is shaping the future of education and work.
        </p>
      </div>

      {/* Mobile Layout */}
      <div className="flex flex-col gap-3 px-4 max-w-lg mx-auto w-full z-10 relative md:hidden">
        {projects.map((project, idx) => {
          const Icon = project.icon
          const color = iconColors[idx] as ProjectColor
          const styles = PROJECT_COLORS[color]
          return (
            <div key={idx} className="flex items-start gap-4 bg-white dark:bg-[#0a0f1c] border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 shadow-sm">
              <div className={`w-11 h-11 rounded-xl bg-slate-50 dark:bg-white/5 border ${styles.border} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${styles.text}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="text-slate-900 dark:text-white font-bold text-sm leading-tight">{project.title}</h3>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${styles.text} ${styles.badge}`}>{project.tech}</span>
                </div>
                <p className="text-slate-600 dark:text-slate-350 text-xs leading-relaxed">{project.desc}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 px-6 max-w-7xl mx-auto w-full z-10 relative">
        {projects.map((project, idx) => (
          <ProjectCard 
            key={idx}
            title={project.title}
            tech={project.tech}
            desc={project.desc}
            icon={project.icon}
          />
        ))}
      </div>
    </section>
  )
}
