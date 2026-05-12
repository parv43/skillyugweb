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
      className="timeline-step flex flex-col items-center text-center group relative w-full md:w-1/5 shrink-0 px-4 md:px-2 z-10"
      style={{
        opacity: 0,
        transform: "translateY(16px)",
        transition: `opacity 0.5s ease ${index * 130}ms, transform 0.5s ease ${index * 130}ms`
      }}
    >
      <div className="w-16 h-16 rounded-full bg-[#020617] border border-slate-700/50 flex items-center justify-center mb-4 text-blue-400 group-hover:border-blue-500/30 transition-colors relative z-10 shadow-[0_0_10px_rgba(2,6,23,1)]">
        <Icon className="w-8 h-8" />
      </div>
      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Step 0{index + 1}</div>
      <h3 className="text-lg font-bold text-slate-100 mb-2 leading-tight">{index === 0 ? "" : ""}{title}</h3>
      <p className="text-sm text-slate-400 font-light leading-relaxed max-w-[180px]">{desc}</p>
    </div>
  )
}

export default function BootcampTimeline() {
  const sectionRef = useRef<HTMLElement>(null)
  const lineRef = useRef<SVGPathElement>(null)
  const mobileLineRef = useRef<SVGPathElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const steps = Array.from(section.querySelectorAll<HTMLElement>(".timeline-step"))

    function animateLine(path: SVGPathElement | null, duration: number) {
      if (!path) return
      const length = path.getTotalLength()
      path.style.strokeDasharray = String(length)
      path.style.strokeDashoffset = String(length)
      path.style.transition = "none"
      // Force reflow
      void path.getBoundingClientRect()
      path.style.transition = `stroke-dashoffset ${duration}ms cubic-bezier(0.4,0,0.2,1) 200ms`
      path.style.strokeDashoffset = "0"
    }

    function resetLine(path: SVGPathElement | null) {
      if (!path) return
      const length = path.getTotalLength()
      path.style.transition = "none"
      path.style.strokeDasharray = String(length)
      path.style.strokeDashoffset = String(length)
    }

    function showSteps() {
      steps.forEach((step) => {
        step.style.opacity = "1"
        step.style.transform = "translateY(0)"
      })
    }

    function hideSteps() {
      steps.forEach((step) => {
        step.style.opacity = "0"
        step.style.transform = "translateY(16px)"
      })
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            showSteps()
            animateLine(lineRef.current, 1800)
            animateLine(mobileLineRef.current, 1800)
          } else {
            hideSteps()
            resetLine(lineRef.current)
            resetLine(mobileLineRef.current)
          }
        })
      },
      { threshold: 0.3 }
    )

    observer.observe(section)
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
      <div className="text-center mb-16 px-6 max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-bold text-slate-100 mb-4 tracking-tight">
          Learning Progression
        </h2>
        <p className="text-slate-400 text-base md:text-lg font-light">
          A focused 5-step journey from beginner to active creator.
        </p>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 relative flex flex-col md:flex-row justify-between items-start gap-8 md:gap-0">

        {/* Horizontal connecting line — desktop */}
        <div
          className="hidden md:block absolute"
          style={{ top: "32px", left: "10%", right: "10%", height: "2px", zIndex: 0 }}
        >
          <svg width="100%" height="2" style={{ overflow: "visible" }}>
            <defs>
              <linearGradient id="tlGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1e293b" stopOpacity="0" />
                <stop offset="50%" stopColor="#3b82f6" stopOpacity="1" />
                <stop offset="100%" stopColor="#1e293b" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              ref={lineRef}
              d="M 0 1 L 1000 1"
              stroke="url(#tlGrad)"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>

        {/* Vertical connecting line — mobile */}
        <div
          className="md:hidden absolute"
          style={{ top: "32px", bottom: "32px", left: "50%", transform: "translateX(-50%)", width: "2px", zIndex: 0 }}
        >
          <svg width="2" height="100%" style={{ overflow: "visible" }}>
            <defs>
              <linearGradient id="tlGradV" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1e293b" stopOpacity="0" />
                <stop offset="50%" stopColor="#3b82f6" stopOpacity="1" />
                <stop offset="100%" stopColor="#1e293b" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              ref={mobileLineRef}
              d="M 1 0 L 1 1000"
              stroke="url(#tlGradV)"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
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
