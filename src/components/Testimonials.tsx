"use client"

import React from "react"
import { motion } from "framer-motion"

const TestimonialGridItem = ({ name, role, quote, align, delay }: any) => (
   <motion.div
     className="glass-panel p-8 rounded-3xl border border-white/5 hover:border-purple-500/30 transition-colors shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] group flex flex-col justify-between h-full"
     initial={{ opacity: 0, y: 30 }}
     whileInView={{ opacity: 1, y: 0 }}
     viewport={{ once: true, margin: "-5%" }}
     transition={{ duration: 0.6, delay }}
   >
     <p className="text-slate-300 italic mb-8 relative z-10 leading-relaxed font-light text-lg">
       "{quote}"
     </p>
     <div className="flex items-center gap-4 border-t border-white/10 pt-4 mt-auto">
       <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 shadow-[0_0_10px_rgba(139,92,246,0.3)] flex items-center justify-center font-bold text-white text-sm">
         {name[0]}
       </div>
       <div>
         <h4 className="text-white font-semibold text-sm tracking-wide">{name}</h4>
         <p className="text-xs text-blue-400">{role}</p>
       </div>
     </div>
   </motion.div>
)

export default function Testimonials() {
  return (
    <section className="w-full relative py-32 bg-[#020617] overflow-hidden">
      {/* Background glow lines */}
      <div className="absolute top-[20%] left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent"></div>
      
      <div className="text-center mb-20 px-6">
        <h2 className="text-4xl md:text-5xl font-black text-white relative inline-block">
          Network Data
          <div className="absolute -bottom-2 right-0 w-1/2 h-1 bg-gradient-to-l from-blue-500 to-transparent"></div>
        </h2>
      </div>

      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <TestimonialGridItem 
            name="Aravind S." 
            role="Parent of 8th Grader"
            quote="I've never seen my son so eager to learn. He built an app for his school project using AI faster than I could have imagined. The future is here."
            delay={0.1}
          />
          <TestimonialGridItem 
            name="Meera K." 
            role="High School Student"
            quote="Skillyug completely changed how I look at coding and design. I used Midjourney and Claude to launch my own small online business."
            delay={0.2}
          />
          <TestimonialGridItem 
            name="Priya V." 
            role="Parent of 11th Grader"
            quote="A massive shift in mindset. It's not just about learning tools, it's about learning how to think with technology. Worth every penny."
            delay={0.3}
          />
        </div>
      </div>
    </section>
  )
}
