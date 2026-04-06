"use client"

import React from "react"
import { motion } from "framer-motion"

interface Testimonial {
  name: string
  role: string
  quote: string
  initials: string
  bgColor: string
}

const testimonials: Testimonial[] = [
  {
    name: "Meera K.",
    role: "High School Student",
    quote: "Skillyug helped me understand how AI tools can make studying much easier.",
    initials: "MK",
    bgColor: "from-blue-500 to-cyan-500"
  },
  {
    name: "Priya V.",
    role: "Parent of 11th Grader",
    quote: "My child now uses AI tools confidently for research, notes, and school assignments.",
    initials: "PV",
    bgColor: "from-purple-500 to-pink-500"
  },
  {
    name: "Karan D.",
    role: "Middle School Student",
    quote: "I learned how to use AI tools to finish homework faster and understand concepts better.",
    initials: "KD",
    bgColor: "from-yellow-500 to-orange-500"
  }
]

// Duplicate the array to create a seamless infinite loop
const loopedTestimonials = [...testimonials, ...testimonials]

const TestimonialSlide = ({ testimonial }: { testimonial: Testimonial }) => {
  return (
    <div className="testimonial-card w-[300px] sm:w-[400px] shrink-0 mx-4 group">
      <div className="h-full flex flex-col p-8 rounded-[2rem] glass-panel bg-white/5 border border-white/10 hover:border-purple-500/50 hover:bg-white/10 transition-all duration-500 shadow-[0_0_15px_rgba(255,255,255,0.02)] hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] cyber-glow relative overflow-hidden">
        
        {/* Subtle background gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative z-10 flex-1 flex flex-col">
          {/* Quote icon */}
          <span className="text-4xl text-purple-400/30 font-serif leading-none mb-4 group-hover:text-purple-400/60 transition-colors">
            &ldquo;
          </span>
          <p className="text-slate-300 font-light text-base sm:text-lg leading-relaxed mb-8 flex-1 whitespace-normal">
            {testimonial.quote}
          </p>
          
          <div className="flex items-center gap-4 mt-auto">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 bg-gradient-to-br ${testimonial.bgColor} border border-white/20`}>
              {testimonial.initials}
            </div>
            <div>
              <h4 className="text-white font-bold tracking-wide">{testimonial.name}</h4>
              <p className="text-xs text-blue-400 uppercase tracking-widest font-semibold mt-1">
                {testimonial.role}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Testimonials() {
  return (
    <section id="testimonials" className="relative w-full py-32 bg-[#020617] overflow-hidden border-t border-white/5">
      
      {/* Background radial lights (optimized) */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/15 via-purple-900/5 to-transparent rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/15 via-blue-900/5 to-transparent rounded-full pointer-events-none" />

      <div className="text-center mb-16 relative z-20 px-6">
        <span className="inline-block py-1 px-3 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-semibold tracking-wider uppercase mb-4">
          Network Feedback
        </span>
        <motion.h2 
          className="text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 drop-shadow-md tracking-tight"
        >
          What Students and Parents Say About Skillyug
        </motion.h2>
      </div>

      {/* Infinite Horizontal Marquee */}
      <div className="relative w-full flex overflow-hidden z-10 py-8 group/slider">
        
        {/* Gradient edge faders */}
        <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-40 bg-gradient-to-r from-[#020617] to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-40 bg-gradient-to-l from-[#020617] to-transparent z-20 pointer-events-none" />

        <motion.div
          className="flex whitespace-nowrap"
          whileInView={{ x: ["0%", "-50%"] }}
          transition={{
            duration: 40,
            ease: "linear",
            repeat: Infinity,
          }}
        >
          {loopedTestimonials.map((testimonial, idx) => (
            <TestimonialSlide key={idx} testimonial={testimonial} />
          ))}
        </motion.div>
      </div>

    </section>
  )
}
