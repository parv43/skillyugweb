"use client"

import React from "react"
import { motion } from "framer-motion"

export default function SlidingCTA() {
  const content = (
    <div className="flex items-center gap-6 md:gap-12 px-6 whitespace-nowrap">
      <span className="text-white font-medium text-sm md:text-base tracking-wide">
        Book Your Demo Class
      </span>
      <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
      <span className="text-blue-200 font-light text-sm md:text-base tracking-wide opacity-90">
        After one demo class, you&apos;ll clearly see how AI tools can transform your child&apos;s learning and confidence.
      </span>
      <span className="w-1.5 h-1.5 rounded-full bg-purple-500/50 hidden md:block" />
      <span className="text-slate-400 font-light text-sm md:text-base tracking-wide hidden md:block">
        Secure ₹49 booking • See the bootcamp experience first
      </span>
      <span className="w-1.5 h-1.5 rounded-full bg-pink-500/50" />
    </div>
  )

  const scrollToBooking = () => {
    const section = document.getElementById("demo-booking")
    if (section) {
      section.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div 
      className="relative w-full h-12 md:h-14 bg-[#0a0f1c] border-y border-white/5 overflow-hidden flex items-center cursor-pointer group"
      onClick={scrollToBooking}
    >
      {/* Background glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/10 via-purple-900/10 to-pink-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Container for the infinite sliding text */}
      <div className="relative flex whitespace-nowrap z-10">
        <motion.div
          className="flex whitespace-nowrap items-center hover:text-white transition-colors duration-300"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            duration: 35,
            ease: "linear",
            repeat: Infinity,
          }}
        >
          {/* We render the content twice to create a seamless infinite loop */}
          {content}
          {content}
        </motion.div>
      </div>

      {/* Decorative gradient edges to fade out the text as it enters/leaves */}
      <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-[#0a0f1c] to-transparent z-20 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-[#0a0f1c] to-transparent z-20 pointer-events-none" />
    </div>
  )
}
