"use client"

import React from "react"
import { motion } from "framer-motion"
import { BookOpen, Zap, Palette, Cpu, Clock, Rocket } from "lucide-react"

const ProjectCard = ({ title, tech, desc, icon: Icon, delay }: any) => {
  return (
    <motion.div
      className="glass-panel p-6 sm:p-8 rounded-[2rem] border border-white/5 hover:border-blue-500/30 transition-all duration-300 group flex flex-col h-full cyber-glow relative overflow-hidden bg-white/[0.02]"
      transition={{ duration: 0.6, delay, type: "spring" }}
    >
      {/* Subtle hover gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="flex items-center gap-4 mb-6 relative z-10">
        <div className="w-14 h-14 rounded-2xl bg-[#0f172a] border border-white/10 flex items-center justify-center shadow-[inset_0_0_15px_rgba(255,255,255,0.05)] group-hover:border-blue-500/40 transition-colors">
          <Icon className="w-7 h-7 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white leading-tight">{title}</h3>
          <p className="text-xs font-semibold text-purple-400 mt-1 uppercase tracking-wider">{tech}</p>
        </div>
      </div>
      
      <p className="text-slate-400 text-sm leading-relaxed relative z-10 flex-1">
        {desc}
      </p>
    </motion.div>
  )
}

export default function StudentProjects() {
  const projects = [
    {
      title: "Smarter Studying With AI",
      tech: "Study Smarter",
      desc: "Students learn how to use AI tools like ChatGPT to understand difficult concepts, summarize chapters, and create structured study notes.",
      icon: BookOpen
    },
    {
      title: "Faster Homework & Assignments",
      tech: "Work Faster",
      desc: "Students discover how AI can help research topics, organize ideas, and complete assignments more efficiently.",
      icon: Zap
    },
    {
      title: "Better School Projects",
      tech: "Create Better",
      desc: "Students use tools like Canva AI to design presentations, posters, and visual projects that stand out in class.",
      icon: Palette
    },
    {
      title: "Confidence With Modern Technology",
      tech: "Build Confidence",
      desc: "Students gain early familiarity with AI tools that are becoming common in education and modern workplaces.",
      icon: Cpu
    },
    {
      title: "Improved Productivity",
      tech: "Save Time",
      desc: "Students learn how AI tools help them save time on repetitive tasks and focus more on learning and creativity.",
      icon: Clock
    },
    {
      title: "Future-Ready Digital Skills",
      tech: "Be Prepared",
      desc: "Students develop practical familiarity with AI tools that will shape future education and career environments.",
      icon: Rocket
    }
  ]

  return (
    <section id="projects" className="relative w-full py-32 bg-[#020617] overflow-hidden flex flex-col border-t border-white/5">
      
      {/* Minimal ambient glow (optimized) */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/15 via-blue-900/5 to-transparent pointer-events-none rounded-full z-0" />

      <div className="text-center mb-20 z-20 px-6 max-w-3xl mx-auto">
        <motion.h2 
          className="text-4xl md:text-5xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 mb-6 drop-shadow-md tracking-tight"
        >
          How This Bootcamp Gives Students an Advantage With AI
        </motion.h2>
        <p className="text-slate-400 text-lg font-light flex-1">
          Students learn how to use modern AI tools to study faster, complete assignments efficiently, and build confidence using technology that is shaping the future of education and work.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 px-6 max-w-7xl mx-auto w-full z-10 relative">
        {projects.map((project, idx) => (
          <ProjectCard 
            key={idx}
            title={project.title}
            tech={project.tech}
            desc={project.desc}
            icon={project.icon}
            delay={0.2 + (idx * 0.1)}
          />
        ))}
      </div>
    </section>
  )
}
