"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useAccessControl } from "@/hooks/useAccessControl"
import { Phone } from "lucide-react"

// The tool cards orbiting the central badge
interface OrbitingToolProps {
  label: string
  icon: string
  angle: number
  radius: number
  duration: number
  tilt: number
}

const OrbitingTool = ({ label, icon, angle, radius, duration, tilt }: OrbitingToolProps) => {
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
          className="w-full h-full pointer-events-auto animate-counter-orbit flex flex-col items-center justify-center bg-white/90 dark:bg-[#0f172a]/80 backdrop-blur-sm border border-slate-200/85 dark:border-white/8 rounded-[16px] overflow-hidden shadow-sm hover:bg-white hover:border-blue-300 hover:shadow-md dark:hover:bg-[#0f172a] dark:hover:border-blue-500/50 transition-all duration-300"
          style={{
            '--start-angle': `${angle}deg`,
            '--tilt': `${tilt}deg`,
            '--duration': `${duration}s`
          } as React.CSSProperties}
        >
          <span className="text-3xl mb-1">{icon}</span>
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-700 dark:text-slate-350 tracking-wide uppercase leading-none text-center px-1">
            {label}
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Mobile-Only Hero ───────────────────────────────────────────────────────
function MobileHero() {
  const { isLoggedIn, hasSlot, loading } = useAccessControl();

  return (
    <section className="relative min-h-[90vh] pt-[120px] pb-0 flex flex-col justify-start bg-background overflow-hidden">
      {/* Subtle Background Glows matching the screenshot */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-[5%] left-[0%] w-[300px] h-[300px] bg-purple-600/5 dark:bg-purple-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="px-6 relative z-20 w-full flex flex-col items-start text-left">
        {/* Header Copy */}
        <h2
          className="text-[38px] font-extrabold leading-[1.1] tracking-tight mb-5 text-slate-900 dark:text-white"
        >
          Help your child build <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-fuchsia-600 dark:from-blue-400 dark:via-indigo-400 dark:to-fuchsia-400">
            AI skills that improve study, projects, and creative confidence.
          </span>
        </h2>
        <p
          className="text-slate-600 dark:text-slate-300 text-[17px] leading-relaxed max-w-sm mb-10 font-normal"
        >
          In a highly competitive world, standard school education isn&apos;t enough. We train your child to leverage advanced AI, giving them a massive edge in academics and their future career.
        </p>



        {/* CTAs */}
        <div className="w-full mb-6">
          {!loading && !hasSlot ? (
            <div className="flex gap-3 w-full">
              <Link
                href={isLoggedIn ? "/book-slot" : "/signup?redirect=/book-slot"}
                className="flex-[1.25] py-4 px-4 rounded-full text-[15px] sm:text-[17px] font-bold text-white text-center active:scale-95 transition-transform flex items-center justify-center"
                style={{ 
                  background: "linear-gradient(90deg, #4b6cb7 0%, #8b5cf6 100%)",
                  boxShadow: "0 4px 20px rgba(139,92,246,0.3)" 
                }}
              >
                Join Bootcamp
              </Link>
              <a
                href="tel:7835049710"
                className="flex-1 py-4 px-4 rounded-full text-[15px] sm:text-[17px] font-bold text-slate-800 dark:text-slate-200 text-center active:scale-95 transition-all border border-slate-350 dark:border-white/20 bg-white/50 dark:bg-white/5 flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Phone size={16} />
                Call Advisor
              </a>
            </div>
          ) : (
            !loading && (
              <a
                href="tel:7835049710"
                className="w-full py-4 px-4 rounded-full text-[15px] sm:text-[17px] font-bold text-slate-800 dark:text-slate-200 text-center active:scale-95 transition-all border border-slate-350 dark:border-white/20 bg-white/50 dark:bg-white/5 flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Phone size={16} />
                Talk to Advisor
              </a>
            )
          )}
        </div>
      </div>

      {/* Full-width Hero Image bleeding to edges */}
      <div
        className="relative w-full mt-[-120px] flex items-end justify-center z-10"
      >
        <Image
          src="/hero-mobile-optimized.webp"
          alt="Father and son learning AI together on a laptop"
          width={800}
          height={1376}
          className="w-full h-auto object-cover object-top"
          priority
          sizes="100vw"
          quality={85}
        />
        {/* Connection gradients: Top for text legibility, Bottom for section transition */}
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-background via-background/40 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      </div>
    </section>
  )
}

// ─── Main Export ─────────────────────────────────────────────────────────────
export default function HeroSection() {
  const [orbitRadius, setOrbitRadius] = useState(230)
  const { isLoggedIn, hasSlot, loading } = useAccessControl();
  const [showSticky, setShowSticky] = useState(false)

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

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 500) {
        setShowSticky(true)
      } else {
        setShowSticky(false)
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
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
      <section className="hidden md:flex relative w-full min-h-[90vh] bg-background overflow-hidden items-center justify-center pt-24 pb-20">
        
        {/* Background Neural Gradients */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-500/10 via-purple-500/5 dark:from-purple-900/15 dark:via-purple-900/5 to-transparent rounded-full" />
          <div className="absolute bottom-[20%] left-[10%] w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-blue-500/5 dark:from-blue-900/15 dark:via-blue-900/5 to-transparent rounded-full" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:60px_60px] opacity-40" />
        </div>

        <div className="container mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-8">
          
          {/* Left Column: Copy & CTAs */}
          <div
            className="w-full lg:w-[58%] flex flex-col items-center lg:items-start text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-200 dark:border-blue-500/30 bg-blue-50/50 dark:bg-blue-500/5 shadow-sm mb-6">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-[11px] sm:text-xs font-bold text-blue-700 dark:text-blue-200 uppercase tracking-widest">Skillyug Summer AI Bootcamp • Classes 6–12</span>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-br dark:from-white dark:via-slate-200 dark:to-slate-400 mb-6 drop-shadow-sm tracking-tight leading-[1.1]">
              Give Your Child the AI Tools<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 dark:neon-text">
                They Need to Build Real World Things
              </span>
            </h2>

            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-xl mb-10 font-light leading-relaxed">
              In a highly competitive world, standard school education isn&apos;t
              enough. We train your child to leverage advanced AI, giving them a
              massive edge in academics and their future career.
            </p>



            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              {!loading && !hasSlot && (
                <Link 
                  href={isLoggedIn ? "/book-slot" : "/signup?redirect=/book-slot"}
                  className="glow-button px-8 py-4 rounded-full text-white font-bold text-lg hover:scale-105 transition-transform w-full sm:w-auto text-center inline-block"
                >
                  Join the Bootcamp
                </Link>
              )}
              <a 
                href="tel:7835049710"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border border-slate-350 dark:border-white/20 bg-white/50 dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 hover:border-slate-400 dark:hover:border-white/30 text-slate-800 dark:text-slate-200 font-bold text-lg hover:scale-105 transition-all w-full sm:w-auto text-center cursor-pointer shadow-sm"
              >
                <Phone size={18} />
                Talk to Advisor
              </a>
            </div>
          </div>

          {/* Right Column: Orbit Animation */}
          <div
            className="w-full lg:w-[42%] h-[300px] sm:h-[600px] flex items-center justify-center relative"
          >
            {/* Faint Orbit Ring */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div 
                className="absolute rounded-full border border-slate-200 dark:border-white/5 transition-all duration-500" 
                style={{ width: orbitRadius * 2, height: orbitRadius * 2 }}
              />
            </div>

            {/* Central Pill Badge */}
            <div className="relative z-30 px-8 py-4 rounded-full bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-white/40 shadow-md dark:shadow-[0_0_30px_rgba(255,255,255,0.3)] flex items-center justify-center text-black dark:text-white">
              <span className="text-xl md:text-2xl font-black text-black dark:text-white tracking-[0.2em] relative z-10">SKILLYUG</span>
              <div className="absolute inset-0 rounded-full border border-slate-200 dark:border-white/20 animate-pulse opacity-50" />
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
            
          </div>

        </div>
      </section>

      {/* Sticky Floating CTA Button */}
      <a
        href="tel:7835049710"
        className={`fixed bottom-24 right-6 md:bottom-8 md:right-8 z-40 flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 border border-blue-400/20 ${
          showSticky ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
        title="Talk to Advisor"
      >
        <Phone size={18} className="animate-pulse" />
        <span className="text-sm md:text-base font-bold tracking-wide">Talk to Advisor</span>
      </a>
    </>
  )
}
