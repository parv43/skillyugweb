"use client"

import React from "react"
import { motion } from "framer-motion"
import { MessageSquare, Layout, Image, PenTool, Search, Presentation, Edit3, Sparkles, FileText } from "lucide-react"

const ToolCard = ({ icon: Icon, title, desc, color = "blue" }: any) => {
  return (
    <div className="grid-item flex flex-col items-center text-center p-2 group">
      <div className={`w-14 h-14 rounded-2xl bg-[#0f172a]/80 flex items-center justify-center mb-5 border border-${color}-500/30 shadow-[0_4px_12px_rgba(0,0,0,0.1)] group-hover:-translate-y-1 transition-transform duration-300 relative`}>
        <Icon className={`w-6 h-6 text-${color}-400`} />
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed max-w-[280px]">
        {desc}
      </p>
    </div>
  )
}

export default function SkillsSection() {
  const tools = [
    {
      title: "ChatGPT",
      desc: "Students use ChatGPT to understand difficult concepts, summarize chapters, and generate study notes.",
      icon: MessageSquare,
      color: "blue"
    },
    {
      title: "NotebookLM",
      desc: "Students organize research material and class notes to better understand subjects and prepare for exams.",
      icon: Layout,
      color: "blue"
    },
    {
      title: "Canva AI",
      desc: "Students design presentations, posters, and visual school projects using AI-powered design tools.",
      icon: Image,
      color: "blue"
    },
    {
      title: "Napkin AI",
      desc: "Students convert ideas into clear visual diagrams to explain concepts easily.",
      icon: PenTool,
      color: "blue"
    },
    {
      title: "Perplexity AI",
      desc: "Students research topics faster using AI-powered search with reliable explanations and sources.",
      icon: Search,
      color: "blue"
    },
    {
      title: "Gamma AI",
      desc: "Students generate professional presentations quickly for school assignments and projects.",
      icon: Presentation,
      color: "blue"
    },
    {
      title: "Grammarly AI",
      desc: "Students improve writing quality for essays, assignments, and school reports.",
      icon: Edit3,
      color: "blue"
    },
    {
      title: "AI Study Assistant",
      desc: "Students learn how AI can help organize study plans and prepare for exams efficiently.",
      icon: Sparkles,
      color: "blue"
    },
    {
      title: "AI Research Tools",
      desc: "Students discover how AI helps them collect information and learn independently.",
      icon: FileText,
      color: "blue"
    }
  ]

  return (
    <section id="what-they-learn" className="relative w-full py-32 bg-[#020617] overflow-hidden flex flex-col items-center justify-center border-t border-slate-900 border-b">
      
      {/* Deep ambient lighting (optimized) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[800px] h-[600px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-purple-900/5 to-transparent pointer-events-none rounded-full" />
      
      {/* SEO-Friendly Header */}
      <div className="w-full flex justify-center mb-16 md:mb-20 z-20 px-6">
        <div className="text-center max-w-[800px] w-full mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 mb-6 tracking-tight leading-tight">
            What Students Will Actually Learn
          </h2>
          <p className="text-slate-400 text-lg md:text-xl font-light">
            No complex developer tools. At the Skillyug Summer AI Bootcamp, we focus solely on practical AI study tools and homework apps that help Class 6–12 students learn better and finish assignments faster.
          </p>
        </div>
      </div>

      {/* Modern Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-6 max-w-6xl mx-auto w-full z-10 relative">
        {tools.map((tool, idx) => (
          <ToolCard 
            key={idx}
            title={tool.title}
            desc={tool.desc}
            icon={tool.icon}
          />
        ))}
      </div>

    </section>
  )
}
