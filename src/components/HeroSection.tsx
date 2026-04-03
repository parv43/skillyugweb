"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"

// The tool cards orbiting the central badge
const OrbitingTool = ({ label, icon, angle, radius, duration, tilt }: any) => {
  return (
    <div
      className="absolute top-1/2 left-1/2 -ml-[45px] -mt-[45px] w-[90px] h-[90px] z-20 pointer-events-none animate-orbit"
      style={{
        '--start-angle': `${angle}deg`,
        '--duration': `${duration}s`
      } as React.CSSProperties}
    >
      {/* Container that pushes the card outward by radius value */}
      <div 
        className="w-full h-full absolute inset-0 will-change-transform" 
        style={{ transform: `translateY(-${radius}px)` }}
      >
        <div
          className="w-full h-full pointer-events-auto animate-counter-orbit flex flex-col items-center justify-center bg-[rgba(255,255,255,0.05)] backdrop-blur-sm border border-[rgba(255,255,255,0.12)] rounded-[16px] overflow-hidden hover:bg-white/10 hover:border-blue-400/30 transition-colors duration-300"
          style={{
            '--start-angle': `${angle}deg`,
            '--tilt': `${tilt}deg`,
            '--duration': `${duration}s`
          } as React.CSSProperties}
        >
          <span className="text-3xl mb-1">{icon}</span>
          <span className="text-[10px] sm:text-[11px] font-semibold text-slate-200 tracking-wide uppercase leading-none text-center px-1">
            {label}
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Mobile-Only Hero ───────────────────────────────────────────────────────
function MobileHero() {
  return (
    <section className="relative min-h-screen pt-24 pb-12 overflow-hidden flex flex-col items-center bg-[#020617]">
      {/* Background neon blobs */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-[20%] left-[10%] w-64 h-64 bg-purple-600/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[20%] right-[10%] w-80 h-80 bg-blue-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      {/* Header Copy */}
      <div className="text-center px-6 mb-8 z-10">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tight mb-2 text-white">
          Empower your child's<br /> learning and creativity with<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 text-4xl mt-1 inline-block">
            future-ready AI skills.
          </span>
        </h1>
        <p className="text-slate-400 text-sm max-w-xs mx-auto mb-8">
          Master AI, build projects, and automate tasks in this hands-on bootcamp.
        </p>

        {/* Primary CTA — same route as desktop */}
        <Link
          href="/signup"
          className="block w-full max-w-xs mx-auto py-4 px-8 rounded-full text-lg font-bold text-white text-center active:scale-95 transition-transform"
          style={{ background: "linear-gradient(135deg,#4f46e5 0%,#a855f7 100%)", boxShadow: "0 4px 20px rgba(139,92,246,0.4)" }}
        >
          Join the Bootcamp
        </Link>
      </div>

      {/* Family scene image */}
      <div className="relative w-full max-w-lg mt-4 px-4">
        <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/5 relative"
          style={{ filter: "contrast(1.1) brightness(0.9)" }}
        >
          <Image
            src="/Mother_Son_Image.png"
            alt="Mother and son learning AI together"
            width={600}
            height={450}
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 90vw, 600px"
            priority
            className="w-full h-auto block opacity-80"
          />
          {/* Bottom gradient fade */}
          <div className="absolute inset-0"
            style={{ background: "linear-gradient(to bottom, transparent 0%, rgba(2,6,23,0.8) 80%, #020617 100%)" }}
          />
          {/* Purple tint overlay */}
          <div className="absolute inset-0 rounded-3xl"
            style={{ background: "radial-gradient(circle at center,rgba(139,92,246,0.15) 0%,rgba(2,6,23,0.3) 100%)", mixBlendMode: "color" }}
          />
        </div>

      </div>

      {/* Secondary CTA — same scroll behavior as desktop */}
      <div className="mt-10 px-6 w-full flex flex-col items-center">
        <button
          onClick={() => document.getElementById("curriculum")?.scrollIntoView({ behavior: "smooth" })}
          className="w-full max-w-xs py-4 px-8 rounded-full border border-slate-700 bg-slate-800/30 text-white font-semibold backdrop-blur-sm transition-colors hover:bg-slate-800/60"
        >
          Explore Curriculum
        </button>
      </div>
    </section>
  )
}

// ─── Main Export ─────────────────────────────────────────────────────────────
export default function HeroSection() {
  // Dynamic orbit radius for mobile responsiveness
  const [orbitRadius, setOrbitRadius] = useState(230)

  useEffect(() => {
    const updateRadius = () => {
      if (window.innerWidth < 768) {
        setOrbitRadius(170)
      } else {
        setOrbitRadius(230)
      }
    }
    
    updateRadius()
    window.addEventListener('resize', updateRadius)
    return () => window.removeEventListener('resize', updateRadius)
  }, [])

  const tools = [
    { label: "ChatGPT", icon: "💬", tilt: 0 },
    { label: "Midjourney", icon: "🎨", tilt: 0 },
    { label: "DALL-E", icon: "🌠", tilt: 0 },
    { label: "Claude", icon: "🧠", tilt: 0 },
    { label: "Canva AI", icon: "🖼️", tilt: 0 },
    { label: "Runway", icon: "🎬", tilt: 0 },
  ]

  return (
    <>
      {/* ── Mobile Hero (< md) ── */}
      <div className="md:hidden">
        <MobileHero />
      </div>

      {/* ── Desktop Hero (≥ md) — completely unchanged ── */}
      <section className="hidden md:flex relative w-full min-h-[90vh] bg-[#020617] overflow-hidden items-center justify-center pt-24 pb-20">
        
        {/* Background Neural Gradients */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/15 via-purple-900/5 to-transparent rounded-full" />
          <div className="absolute bottom-[20%] left-[10%] w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/15 via-blue-900/5 to-transparent rounded-full" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:60px_60px] opacity-40" />
        </div>

        <div className="container mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-8">
          
          {/* Left Column: Copy & CTAs */}
          <motion.div 
            className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left"
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-blue-500/30 mb-6 bg-blue-500/5">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-[11px] sm:text-xs font-bold text-blue-200 uppercase tracking-widest">Skillyug Summer AI Bootcamp • Classes 6–12</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-slate-400 mb-6 drop-shadow-sm tracking-tight leading-[1.1]">
              Give Your Child the AI Skills<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 neon-text">
                That Will Shape Their Future
              </span>
            </h1>

            <p className="text-lg md:text-xl font-medium text-pink-400 mb-4">
              Your child's learning, creativity, and future readiness are our top priorities.
            </p>

            <p className="text-base md:text-lg text-slate-300 max-w-xl mb-10 font-light leading-relaxed">
              In this hands-on bootcamp, students learn how to use modern AI tools to build real projects, automate tasks, and develop future-ready skills.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto">
              <Link 
                href="/signup"
                className="glow-button px-8 py-4 rounded-full text-white font-bold text-lg hover:scale-105 transition-transform w-full sm:w-auto text-center inline-block"
              >
                Join the Bootcamp
              </Link>
              <button 
                onClick={() => document.getElementById("curriculum")?.scrollIntoView({ behavior: "smooth" })}
                className="glass-panel px-8 py-4 rounded-full text-white font-bold text-lg hover:bg-white/5 transition-colors border border-white/10 w-full sm:w-auto text-center"
              >
                Explore Curriculum
              </button>
            </div>
          </motion.div>

          {/* Right Column: Orbit Animation */}
          <motion.div 
            className="w-full lg:w-1/2 h-[300px] sm:h-[600px] flex items-center justify-center relative"
            transition={{ duration: 1, delay: 0.2 }}
          >
            {/* Faint Orbit Ring */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div 
                className="absolute rounded-full border border-white/5 transition-all duration-500" 
                style={{ width: orbitRadius * 2, height: orbitRadius * 2 }}
              />
            </div>

            {/* Central Pill Badge */}
            <div className="relative z-30 px-8 py-4 rounded-full bg-white shadow-[0_0_30px_rgba(255,255,255,0.4)] flex items-center justify-center">
              <span className="text-xl md:text-2xl font-black text-black tracking-[0.2em] relative z-10">SKILLYUG</span>
              <div className="absolute inset-0 rounded-full border border-white/40 animate-pulse opacity-50" />
            </div>

            {/* Orbiting Tool Cards */}
            {tools.map((tool, i) => (
              <OrbitingTool
                key={i}
                icon={tool.icon}
                label={tool.label}
                angle={(360 / tools.length) * i}
                radius={orbitRadius}
                duration={18}
                tilt={tool.tilt}
              />
            ))}
            
          </motion.div>

        </div>
      </section>
    </>
  )
}
