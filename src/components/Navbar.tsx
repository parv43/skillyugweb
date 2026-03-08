"use client"

import React, { useState, useEffect } from "react"
import { motion, useScroll } from "framer-motion"

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const { scrollY } = useScroll()

  useEffect(() => {
    return scrollY.onChange((latest) => {
      setScrolled(latest > 50)
    })
  }, [scrollY])

  return (
    <motion.nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 \${
        scrolled ? "bg-[#020617]/80 backdrop-blur-xl border-b border-white/5 py-4" : "bg-transparent py-6"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between">
        
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-[0_0_15px_rgba(59,130,246,0.5)] flex items-center justify-center">
            <span className="text-white font-black text-xs">SY</span>
          </div>
          <span className="text-xl font-black text-white tracking-widest hidden sm:block">SKILLYUG</span>
        </div>

        {/* Links */}
        <div className="hidden md:flex gap-8 items-center bg-white/5 px-6 py-2 rounded-full border border-white/5 backdrop-blur-sm shadow-[inset_0_0_10px_rgba(255,255,255,0.02)]">
          {["Program", "Curriculum", "Projects", "Testimonials"].map((item) => (
            <a key={item} href="#" className="text-sm font-medium text-slate-300 hover:text-white hover:text-shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all">
              {item}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div>
           <button className="glass-panel px-5 py-2.5 rounded-full text-sm font-bold text-white hover:bg-white/10 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all border border-blue-500/30">
             Book Demo
           </button>
        </div>

      </div>
    </motion.nav>
  )
}
