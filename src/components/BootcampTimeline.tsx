"use client"

import React, { useState, useEffect } from "react"
import { Compass, Brain, GitMerge, TerminalSquare, Crown, Star } from "lucide-react"

export default function BootcampTimeline() {
  // Start at 0 and track auto-playing state
  const [activeStep, setActiveStep] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  const steps = [
    { 
      week: "Week 01", 
      title: "The AI Universe", 
      desc: "Uncover what modern AI can truly achieve.", 
      icon: Compass 
    },
    { 
      week: "Week 02", 
      title: "Mind & Machine", 
      desc: "Study smarter, compute faster, and create responsibly.", 
      icon: Brain 
    },
    { 
      week: "Week 03", 
      title: "Logic & Systems", 
      desc: "Draw the invisible lines of digital thought.", 
      icon: GitMerge 
    },
    { 
      week: "Week 04", 
      title: "The First Keystroke", 
      desc: "Speak the machine's language through code.", 
      icon: TerminalSquare 
    },
    { 
      week: "Week 05", 
      title: "Creative Mastery", 
      desc: "Generate stunning multimedia and claim your crown.", 
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
    }, 1000) // 1-second delay between steps

    return () => clearInterval(timer)
  }, [isAutoPlaying, steps.length])

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
      id="curriculum"
      className="relative w-full py-24 bg-[#020617] overflow-hidden border-t border-slate-800/50 flex flex-col items-center select-none"
    >
      {/* Header Section */}
      <div className="text-center mb-16 px-6 max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-bold text-slate-100 mb-4 tracking-tight">
          Learning Progression
        </h2>
        <p className="text-slate-400 text-base md:text-lg font-light">
          A focused 5-week journey from explorer to active creator.
        </p>
      </div>

      {/* Winding Timeline Section */}
      <div className="w-full flex justify-center mt-6">
        <div 
          className="relative animate-fade-in" 
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
              
              // Path is blue if the node it leads to has been reached/completed
              const isActivePath = i < activeStep

              return (
                <path
                  key={`path-${i}`}
                  d={pathData}
                  fill="none"
                  stroke={isActivePath ? "#3b82f6" : "#1e293b"}
                  strokeWidth="3"
                  strokeDasharray="8 8"
                  className="transition-colors duration-500"
                  style={isActivePath ? { filter: 'drop-shadow(0 0 6px rgba(59,130,246,0.4))' } : {}}
                />
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
            const ringColor = isCompleted || isCurrent ? 'border-[#3b82f6]' : 'border-slate-800'
            const bgColor = isCurrent ? 'bg-[#0f172a]' : 'bg-[#020617]'
            const iconColor = isCompleted || isCurrent 
                                ? (i === 4 ? 'text-yellow-400' : 'text-[#3b82f6]') 
                                : 'text-slate-600'
            
            const textOpacity = isLocked ? 'opacity-40' : 'opacity-100'

            return (
              <React.Fragment key={`node-${i}`}>
                {/* Text Block */}
                <div
                  className={`absolute flex flex-col justify-center h-16 transition-all duration-300 ${textOpacity}`}
                  style={{
                    top: cy - 32,
                    left: isLeft ? cx + 48 : 'auto',
                    right: !isLeft ? (timelineWidth - cx) + 48 : 'auto',
                    width: 170,
                    textAlign: isLeft ? 'left' : 'right',
                  }}
                >
                  <span className="text-[10px] font-bold tracking-[0.15em] text-[#3b82f6] uppercase mb-1 drop-shadow-sm">
                    {step.week}
                  </span>
                  <h3 className={`text-base font-bold leading-tight mb-1 transition-colors ${isLocked ? 'text-slate-500' : 'text-white'}`}>
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-snug">
                    {step.desc}
                  </p>
                </div>

                {/* Circular Icon Node */}
                <div
                  className={`absolute w-16 h-16 rounded-full border-2 ${ringColor} ${bgColor} flex items-center justify-center cursor-pointer transition-all duration-300 z-10 shadow-lg hover:scale-105 hover:bg-slate-900/60`}
                  style={{ 
                    top: cy - 32, 
                    left: cx - 32,
                    boxShadow: isCurrent ? '0 0 20px rgba(59,130,246,0.2)' : 'none'
                  }}
                  onClick={() => handleNodeClick(i)}
                  title={`Jump to ${step.week}`}
                >
                  <Icon className={`w-7 h-7 ${iconColor} transition-colors duration-300`} />
                  
                  {/* Current Step Indicator Badge (like the yellow star in screenshot 2) */}
                  {isCurrent && (
                    <div className="absolute -right-2 -top-1 w-6 h-6 bg-red-500 rounded-full border-[3px] border-[#020617] flex items-center justify-center animate-bounce">
                      <Star className="w-3 h-3 text-white fill-current" />
                    </div>
                  )}
                  
                  {/* Completion checkmark badge */}
                  {isCompleted && (
                     <div className="absolute -right-1 -top-1 w-5 h-5 bg-[#3b82f6] rounded-full border-[2px] border-[#020617] flex items-center justify-center">
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
