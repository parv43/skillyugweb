"use client"

import React, { useEffect, useRef } from "react"
import { Compass, MessageSquare, Image as ImageIcon, Zap, Trophy, type LucideIcon } from "lucide-react"

interface BootcampStepProps {
  icon: LucideIcon
  title: string
  desc: string
  index: number
}

const BootcampStep = ({ icon: Icon, title, desc, index }: BootcampStepProps) => {
  return (
    <div
      className="timeline-step flex flex-col md:flex-row items-center md:items-start group relative w-full md:w-1/5 shrink-0 px-4 md:px-2 z-10 opacity-0"
      style={{ transitionDelay: `${index * 130}ms` }}
    >
      <div className="flex flex-col items-center text-center w-full">
        <div className="w-16 h-16 rounded-full bg-[#020617] border border-slate-700/50 flex items-center justify-center mb-4 text-blue-400 group-hover:border-blue-500/30 transition-colors relative z-10 shadow-[0_0_10px_rgba(2,6,23,1)] overflow-hidden">
          <Icon className="w-8 h-8 relative z-10" />
          <div className="absolute inset-0 bg-slate-800/50 group-hover:bg-slate-800 transition-colors z-0" />
        </div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Step 0{index + 1}</div>
        <h3 className="text-lg font-bold text-slate-100 mb-2 leading-tight">{title}</h3>
        <p className="text-sm text-slate-400 font-light leading-relaxed max-w-[200px]">{desc}</p>
      </div>
    </div>
  )
}

export default function BootcampTimeline() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const steps = section.querySelectorAll(".timeline-step")
    const lines = section.querySelectorAll(".timeline-line-fill") as NodeListOf<HTMLElement>

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Reveal steps
            steps.forEach((step) => {
              step.classList.add("timeline-step-visible")
            })
            // Animate lines
            lines.forEach((line) => {
              line.style.transition = "transform 1.8s cubic-bezier(0.4,0,0.2,1) 0.3s"
              line.style.transform = line.classList.contains("origin-left") ? "scaleX(1)" : "scaleY(1)"
            })
          } else {
            // Reset steps
            steps.forEach((step) => {
              step.classList.remove("timeline-step-visible")
            })
            // Reset lines
            lines.forEach((line) => {
              line.style.transition = "none"
              line.style.transform = line.classList.contains("origin-left") ? "scaleX(0)" : "scaleY(0)"
            })
          }
        })
      },
      { threshold: 0.2 }
    )

    const timelineContainer = section.querySelector(".timeline-container")
    if (timelineContainer) {
      observer.observe(timelineContainer)
    } else {
      observer.observe(section)
    }
    
    return () => observer.disconnect()
  }, [])

  const steps = [
    { title: "Explore AI Tools", desc: "Learn what modern AI can actually do.", icon: Compass },
    { title: "Prompting Fundamentals", desc: "Talk to AI to get exact results.", icon: MessageSquare },
    { title: "Content Creation", desc: "Generate stunning art and copy.", icon: ImageIcon },
    { title: "Automation Workflows", desc: "Link apps to run tasks silently.", icon: Zap },
    { title: "Final Student Project", desc: "Build a complete AI-powered app.", icon: Trophy }
  ]

  return (
    <section
      ref={sectionRef}
      id="curriculum"
      className="relative w-full py-24 bg-[#020617] overflow-hidden border-t border-slate-800/50"
    >
      <div className="text-center mb-16 z-20 px-6 max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-bold text-slate-100 mb-4 tracking-tight">
          Learning Progression
        </h2>
        <p className="text-slate-400 text-base md:text-lg font-light">
          A focused 5-step journey from beginner to active creator.
        </p>
      </div>

      <div className="timeline-container w-full max-w-7xl mx-auto px-4 relative flex flex-col md:flex-row justify-between items-start gap-8 md:gap-0">

        {/* Horizontal connecting line (desktop) — animated fill */}
        <div className="hidden md:block absolute top-[31px] left-[10%] right-[10%] h-[2px] z-0 overflow-hidden rounded-full">
          <div className="timeline-line-fill w-full h-full bg-gradient-to-r from-slate-800/50 via-blue-500/80 to-slate-800/50 origin-left scale-x-0" style={{ transition: "none" }} />
        </div>

        {/* Vertical connecting line (mobile) — animated fill */}
        <div className="md:hidden absolute top-[32px] bottom-[32px] left-1/2 -translate-x-1/2 w-[2px] z-0 overflow-hidden rounded-full">
          <div className="timeline-line-fill w-full h-full bg-gradient-to-b from-slate-800/50 via-blue-500/80 to-slate-800/50 origin-top scale-y-0" style={{ transition: "none" }} />
        </div>

        {steps.map((step, i) => (
          <BootcampStep
            key={i}
            index={i}
            title={step.title}
            desc={step.desc}
            icon={step.icon}
          />
        ))}
      </div>
    </section>
  )
}
