"use client"

import React from "react"

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
    bgColor: "from-[#0060aa] to-cyan-500"
  },
  {
    name: "Priya V.",
    role: "Parent of 11th Grader",
    quote: "My child now uses AI tools confidently for research, notes, and school assignments.",
    initials: "PV",
    bgColor: "from-[#0060aa] to-[#ff8b12]"
  },
  {
    name: "Karan D.",
    role: "Middle School Student",
    quote: "I learned how to use AI tools to finish homework faster and understand concepts better.",
    initials: "KD",
    bgColor: "from-[#ff8b12] to-[#ff9d3b]"
  }
]

const loopedTestimonials = [...testimonials, ...testimonials]

const TestimonialSlide = ({ testimonial }: { testimonial: Testimonial }) => {
  return (
    <div className="testimonial-card w-[300px] sm:w-[400px] shrink-0 mx-4 group">
      <div className="h-full flex flex-col p-8 rounded-[2rem] bg-white dark:bg-[#0a0f1c] border border-slate-200 dark:border-white/5 hover:border-orange-205 dark:hover:border-orange-500/20 hover:shadow-md transition-all duration-500 shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0060aa]/5 to-[#ff8b12]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        <div className="relative z-10 flex-1 flex flex-col">
          <span className="text-4xl text-orange-400/50 font-serif leading-none mb-4 group-hover:text-orange-400/80 transition-colors">
            &ldquo;
          </span>
          <p className="text-slate-700 dark:text-slate-200 font-normal text-base sm:text-lg leading-relaxed mb-8 flex-1 whitespace-normal">
            {testimonial.quote}
          </p>
          <div className="flex items-center gap-4 mt-auto">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 bg-gradient-to-br ${testimonial.bgColor} border border-white/30`}>
              {testimonial.initials}
            </div>
            <div>
              <h4 className="text-slate-900 dark:text-white font-bold tracking-wide">{testimonial.name}</h4>
              <p className="text-xs text-[#0060aa] dark:text-[#ff9d3b] uppercase tracking-widest font-bold mt-1">
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
    <section id="testimonials" className="relative w-full py-32 bg-transparent overflow-hidden border-t border-slate-200/40 dark:border-white/5">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#ff8b12]/5 via-[#ff8b12]/0 to-transparent rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#0060aa]/10 via-[#0060aa]/0 to-transparent rounded-full pointer-events-none" />

      <div className="text-center mb-16 relative z-20 px-6">
        <span className="inline-block py-1 px-3 rounded-full bg-orange-50/70 border border-orange-200 text-[#ff8b12] dark:bg-orange-950/40 dark:border-orange-900/30 dark:text-[#ff9d3b] text-sm font-bold tracking-wider uppercase mb-4">
          Network Feedback
        </span>
        <h2
          className="text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#0060aa] via-[#8b5cf6] to-[#ff8b12] drop-shadow-sm tracking-tight leading-tight"
        >
          What Students and Parents Say About Skillyug
        </h2>
      </div>

      {/* Infinite Horizontal Marquee — CSS replaces framer-motion */}
      <div className="relative w-full flex overflow-hidden z-10 py-8 group/slider">
        <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-40 bg-gradient-to-r from-background to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-40 bg-gradient-to-l from-background to-transparent z-20 pointer-events-none" />

        <div className="flex whitespace-nowrap animate-marquee-slow">
          {loopedTestimonials.map((testimonial, idx) => (
            <TestimonialSlide key={idx} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  )
}
