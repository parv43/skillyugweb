"use client"

import React, { useState, useEffect, useRef } from "react"
import { Compass, Brain, GitMerge, TerminalSquare, Crown, Star } from "lucide-react"

export default function BootcampTimeline() {
  // Start at 0 and track auto-playing state
  const [activeStep, setActiveStep] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  const steps = [
    { 
      week: "Week 01", 
      title: "The AI Universe", 
      desc: "Prompt AI tools to create stunning art, stories, and sound.", 
      icon: Compass 
    },
    { 
      week: "Week 02", 
      title: "Mind & Machine", 
      desc: "Learn mental math, smart study habits, and safe AI rules.", 
      icon: Brain 
    },
    { 
      week: "Week 03", 
      title: "The Blueprint of Thought", 
      desc: "Map out flowcharts and learn how computers solve problems.", 
      icon: GitMerge 
    },
    { 
      week: "Week 04", 
      title: "The Builder's First Steps", 
      desc: "Use simple commands to build your first coding project.", 
      icon: TerminalSquare 
    },
    { 
      week: "Week 05", 
      title: "The Creative Masterpiece", 
      desc: "Design presentations, launch your project, and claim your crown.", 
      icon: Crown 
    },
  ]

  // Auto-glow animation
  useEffect(() => {
    if (!isAutoPlaying) return

    const timer = setInterval(() => {
      setActiveStep((prev) => {
        // Stop animating when all steps are completed
        if (prev >= steps.length) {
          setIsAutoPlaying(false)
          return prev
        }
        return prev + 1
      })
    }, 1500) // 1.5-second delay for a slower, dramatic glow effect

    return () => clearInterval(timer)
  }, [isAutoPlaying, steps.length])

  // Scroll and intersection tracking to play animation on scroll into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveStep(0)
            setIsAutoPlaying(true)
          } else {
            setIsAutoPlaying(false)
          }
        })
      },
      { threshold: 0.15 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const handleNodeClick = (index: number) => {
    setIsAutoPlaying(false) // Stop animation on user interaction
    setActiveStep(index)
  }

  // Layout configuration for the winding path
  const rowHeight = 150
  const topOffset = 60
  const leftX = 64   // Center X for left-aligned nodes
  const rightX = 256 // Center X for right-aligned nodes
  const timelineWidth = 320
  const timelineHeight = (steps.length - 1) * rowHeight + (topOffset * 2)

  return (
    <section
      ref={sectionRef}
      id="curriculum"
      className="relative w-full py-24 bg-white dark:bg-[#020617] overflow-hidden border-t border-slate-100 dark:border-slate-900 flex flex-col items-center select-none"
    >
      {/* Custom Animations for Glowing Nodes */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 15px rgba(59,130,246,0.4); transform: scale(1.05); }
          50% { box-shadow: 0 0 35px rgba(59,130,246,0.8); transform: scale(1.15); }
        }
        @keyframes fade-in-glow {
          from { box-shadow: 0 0 0px rgba(59,130,246,0); }
          to { box-shadow: 0 0 15px rgba(59,130,246,0.3); }
        }
        .node-current {
          animation: pulse-glow 2s infinite ease-in-out;
          z-index: 20;
        }
        .node-completed {
          animation: fade-in-glow 1s forwards;
        }
      `}} />

      {/* Header Section */}
      <div className="text-center mb-16 px-6 max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
          Learning Progression
        </h2>
        <p className="text-slate-600 dark:text-slate-350 text-base md:text-lg font-light">
          A focused 5-week journey from explorer to active creator.
        </p>
      </div>

      {/* Winding Timeline Section */}
      <div className="w-full flex justify-center mt-6">
        <div 
          className="relative" 
          style={{ width: timelineWidth, height: timelineHeight }}
        >
          {/* Background SVG for Connecting Lines */}
          <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
            {steps.map((_, i) => {
              // We don't draw a line after the last node
              if (i === steps.length - 1) return null 

              const isLeftToRight = i % 2 === 0
              const startX = isLeftToRight ? leftX : rightX
              const endX = isLeftToRight ? rightX : leftX
              
              const startY = i * rowHeight + topOffset
              const endY = (i + 1) * rowHeight + topOffset
              
              // MidY creates the smooth S-curve effect
              const midY = (startY + endY) / 2
              const pathData = `M ${startX},${startY} C ${startX},${midY} ${endX},${midY} ${endX},${endY}`
              
              // Path is active if the node it leads to has been reached/completed
              const isActivePath = i < activeStep

              return (
                <g key={`path-group-${i}`}>
                  {/* Base dark dashed path (always visible) */}
                  <path
                    d={pathData}
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="3"
                    strokeDasharray="8 8"
                    className="stroke-slate-200 dark:stroke-slate-800"
                  />

                  {/* Mask that creates the progressive drawing effect */}
                  <mask id={`glow-mask-${i}`}>
                    <path
                      d={pathData}
                      fill="none"
                      stroke="white"
                      strokeWidth="10" // Thicker than the visible line to ensure full coverage
                      pathLength="100" // Normalizes the path length to 100 for easy CSS percentages
                      strokeDasharray="100"
                      style={{
                        strokeDashoffset: isActivePath ? 0 : 100,
                        transition: "stroke-dashoffset 1.2s ease-in-out",
                      }}
                    />
                  </mask>

                  {/* Glowing active path (revealed slowly by the mask above) */}
                  <path
                    d={pathData}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    strokeDasharray="8 8"
                    className="stroke-blue-500 dark:stroke-blue-400"
                    mask={`url(#glow-mask-${i})`}
                    style={{ filter: "drop-shadow(0 0 8px rgba(59,130,246,0.3))" }}
                  />
                </g>
              )
            })}
          </svg>

          {/* Interactive Nodes and Text */}
          {steps.map((step, i) => {
            const isLeft = i % 2 === 0
            const cx = isLeft ? leftX : rightX
            const cy = i * rowHeight + topOffset
            
            const isCompleted = i < activeStep
            const isCurrent = i === activeStep
            const isLocked = i > activeStep
            
            const Icon = step.icon

            // Dynamic Styling based on state
            const ringColor = isCompleted || isCurrent ? "border-[#3b82f6]" : "border-slate-200 dark:border-slate-800"
            const bgColor = isCurrent ? "bg-blue-50 dark:bg-blue-950/30" : "bg-white dark:bg-[#0a0f1c]"
            const iconColor = isCompleted || isCurrent 
                                ? (i === 4 ? "text-yellow-500" : "text-[#3b82f6]") 
                                : "text-slate-400 dark:text-slate-600"
            
            const textOpacity = isLocked ? "opacity-45" : "opacity-100"

            return (
              <React.Fragment key={`node-${i}`}>
                {/* Text Block */}
                <div
                  className={`absolute flex flex-col justify-center h-16 transition-opacity duration-300 ${textOpacity}`}
                  style={{
                    top: cy - 32,
                    left: isLeft ? cx + 48 : "auto",
                    right: !isLeft ? (timelineWidth - cx) + 48 : "auto",
                    width: 170,
                    textAlign: isLeft ? "left" : "right",
                  }}
                >
                  <span className="text-[10px] font-bold tracking-[0.15em] text-[#3b82f6] dark:text-blue-400 uppercase mb-1 drop-shadow-sm">
                    {step.week}
                  </span>
                  <h3 className={`text-base font-bold leading-tight mb-1 ${isLocked ? "text-slate-400 dark:text-slate-600" : "text-slate-900 dark:text-white"}`}>
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-450 leading-snug">
                    {step.desc}
                  </p>
                </div>

                {/* Circular Icon Node */}
                <div
                  className={`absolute w-16 h-16 rounded-full border-2 ${ringColor} ${bgColor} flex items-center justify-center cursor-pointer transition-colors duration-500 z-10 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 ${isCurrent ? "node-current" : ""} ${isCompleted ? "node-completed" : ""}`}
                  style={{ 
                    top: cy - 32, 
                    left: cx - 32
                  }}
                  onClick={() => handleNodeClick(i)}
                  title={`Jump to ${step.week}`}
                >
                  <Icon className={`w-7 h-7 ${iconColor} transition-colors duration-500`} />
                  
                  {/* Current Step Indicator Badge (like the yellow star in screenshot 2) */}
                  {isCurrent && (
                    <div className="absolute -right-2 -top-1 w-6 h-6 bg-red-500 rounded-full border-[3px] border-white dark:border-[#020617] flex items-center justify-center animate-bounce">
                      <Star className="w-3 h-3 text-white fill-current" />
                    </div>
                  )}
                  
                  {/* Completion checkmark badge */}
                  {isCompleted && (
                     <div className="absolute -right-1 -top-1 w-5 h-5 bg-[#3b82f6] rounded-full border-[2px] border-white dark:border-[#020617] flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                           <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                     </div>
                  )}
                </div>
              </React.Fragment>
            )
          })}
        </div>
      </div>
    </section>
  )
}
