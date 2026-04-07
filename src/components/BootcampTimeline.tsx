"use client"

import React from "react"
import { motion } from "framer-motion"
import { Compass, MessageSquare, Image as ImageIcon, Zap, Trophy, type LucideIcon } from "lucide-react"

interface BootcampStepProps {
  icon: LucideIcon
  title: string
  desc: string
  index: number
}

const BootcampStep = ({ icon: Icon, title, desc, index }: BootcampStepProps) => {
  return (
    <div className="flex flex-col md:flex-row items-center md:items-start group relative w-full md:w-1/5 shrink-0 px-4 md:px-2 z-10">
      
      {/* Step Content */}
      <motion.div 
        className="flex flex-col items-center text-center w-full"


        
        transition={{ duration: 0.4, delay: index * 0.1 }}
      >
        <div className="w-16 h-16 rounded-full bg-[#020617] border border-slate-700/50 flex items-center justify-center mb-4 text-blue-400 group-hover:border-blue-500/30 transition-colors relative z-10 shadow-[0_0_10px_rgba(2,6,23,1)] overflow-hidden">
          <Icon className="w-8 h-8 relative z-10" />
          <div className="absolute inset-0 bg-slate-800/50 group-hover:bg-slate-800 transition-colors z-0" />
        </div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Step 0{index + 1}</div>
        <h3 className="text-lg font-bold text-slate-100 mb-2 leading-tight">{title}</h3>
        <p className="text-sm text-slate-400 font-light leading-relaxed max-w-[200px]">{desc}</p>
      </motion.div>
    </div>
  )
}

export default function BootcampTimeline() {
  const steps = [
    {
      title: "Explore AI Tools",
      desc: "Learn what modern AI can actually do.",
      icon: Compass
    },
    {
      title: "Prompting Fundamentals",
      desc: "Talk to AI to get exact results.",
      icon: MessageSquare
    },
    {
      title: "Content Creation",
      desc: "Generate stunning art and copy.",
      icon: ImageIcon
    },
    {
      title: "Automation Workflows",
      desc: "Link apps to run tasks silently.",
      icon: Zap
    },
    {
      title: "Final Student Project",
      desc: "Build a complete AI-powered app.",
      icon: Trophy
    }
  ]

  return (
    <section id="curriculum" className="hidden md:block relative w-full py-24 bg-[#020617] overflow-hidden border-t border-slate-800/50">
      <div className="text-center mb-16 z-20 px-6 max-w-3xl mx-auto">
        <motion.h2 
          className="text-3xl md:text-5xl font-bold text-slate-100 mb-4 tracking-tight"
          
        >
          Learning Progression
        </motion.h2>
        <p className="text-slate-400 text-base md:text-lg font-light">
          A focused 5-step journey from beginner to active creator.
        </p>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 relative flex flex-col md:flex-row justify-between items-start gap-8 md:gap-0">
        
        {/* Continuous Horizontal Line (Desktop) - Hardware Accelerated */}
        <div className="hidden md:block absolute top-[31px] left-[10%] right-[10%] h-[2px] z-0 overflow-hidden rounded-full">
          <motion.div 
            className="w-full h-full bg-gradient-to-r from-slate-800/50 via-blue-500/80 to-slate-800/50 origin-left will-change-transform"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            
            transition={{ duration: 3.5, ease: "easeInOut", delay: 0.2 }}
          />
        </div>

        {/* Continuous Vertical Line (Mobile) - Hardware Accelerated */}
        <div className="md:hidden absolute top-[32px] bottom-[32px] left-1/2 -translate-x-1/2 w-[2px] z-0 overflow-hidden rounded-full">
          <motion.div 
            className="w-full h-full bg-gradient-to-b from-slate-800/50 via-blue-500/80 to-slate-800/50 origin-top will-change-transform"
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            
            transition={{ duration: 3.5, ease: "easeInOut", delay: 0.2 }}
          />
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
