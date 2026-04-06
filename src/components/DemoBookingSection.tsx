"use client"

import React, { useEffect, useState, useRef } from "react"
import { motion, useInView, animate } from "framer-motion"
import { CheckCircle2, Zap, ArrowRight, ShieldCheck } from "lucide-react"
import Link from "next/link"

export default function DemoBookingSection() {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { amount: 0.3, once: true })
  const [percent, setPercent] = useState(0)

  // Animated counter from 0 to 84 whenever the section enters view
  useEffect(() => {
    if (isInView) {
      const controls = animate(0, 84, {
        duration: 1.5,
        ease: [0.22, 1, 0.36, 1], // Custom smooth cubic-bezier (like Linear/Vercel)
        onUpdate: (val) => setPercent(Math.round(val))
      })
      return () => controls.stop()
    }
  }, [isInView])

  return (
    <section id="demo-booking" className="relative w-full py-32 bg-[#020617] overflow-hidden border-t border-slate-900" ref={sectionRef}>
      
      {/* Performant Ambient Background (no massive blur filters) */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/15 via-blue-900/5 to-transparent rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-[10%] w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-purple-900/5 to-transparent rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-12">
          
          {/* Left Column: Copy Content */}
          <motion.div 
            className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left"
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-pink-500/30 bg-pink-500/10 mb-8 shadow-[0_0_15px_rgba(236,72,153,0.15)]">
              <Zap className="w-4 h-4 text-pink-400" />
              <span className="text-xs font-bold text-pink-300 uppercase tracking-widest">Limited Time Offer</span>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-slate-400 mb-8 leading-[1.1] tracking-tight">
              Book Your First AI Creator Demo Class.
            </h2>

            <div className="flex flex-col gap-5 text-left w-full max-w-md mx-auto lg:mx-0">
              {[
                "Live interactive session with AI experts",
                "Hands-on prompt engineering exercises",
                "Exclusive AI Creator toolkit access",
                "Personalized roadmap for Class 6–12 students"
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-4">
                  <CheckCircle2 className="w-6 h-6 text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-slate-300 text-lg leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Column: Glass Booking Card */}
          <motion.div 
            className="w-full lg:w-[480px] shrink-0"
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div 
              className="card bg-[#0f172a]/90 p-8 sm:p-10 rounded-[2rem] border border-slate-700/50 shadow-[0_8px_24px_rgba(0,0,0,0.3)] backdrop-blur-md relative overflow-hidden"
              style={{ contain: 'layout paint' }}
            >
              {/* Promotional Ribbon */}
              <div className="absolute top-4 -right-12 w-48 h-10 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 transform rotate-45 flex items-center justify-center shadow-lg pointer-events-none z-20">
                <span className="text-white font-black text-[10px] tracking-[0.2em] uppercase drop-shadow-md">
                  LIVE DEMO
                </span>
              </div>


              <div className="pr-12 md:pr-16 mb-8">
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">Start Your Journey Today</h3>
                <p className="text-slate-400 text-sm">Join 5,000+ students who have already started building with AI.</p>
              </div>

              {/* Progress Bar Module */}
              <div className="mb-10 bg-[#020617]/50 rounded-2xl p-5 border border-white/5">
                <div className="flex justify-between items-end mb-3">
                  <span className="text-blue-400 font-bold text-sm tracking-wide">{percent}% seats reserved</span>
                  <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">Only 16% left</span>
                </div>
                
                <div className="w-full h-3 bg-slate-800/80 rounded-full overflow-hidden relative border border-white/5">
                  <motion.div 
                    className="absolute top-0 bottom-0 left-0 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full origin-left will-change-transform shadow-[0_0_12px_rgba(139,92,246,0.3)]"
                    initial={{ scaleX: 0 }}
                    animate={isInView ? { scaleX: 0.84 } : { scaleX: 0 }}
                    transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {/* Subtle moving gradient shimmer */}
                    <motion.div 
                      className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                      initial={{ x: "-100%" }}
                      whileInView={{ x: ["-100%", "200%"] }}
                      transition={{ duration: 2, ease: "linear", repeat: Infinity, repeatDelay: 1 }}
                    />
                  </motion.div>
                </div>
              </div>

              {/* Main CTA */}
              <Link href="/book-demo" className="w-full glow-button py-5 rounded-2xl flex items-center justify-center gap-3 text-white font-bold text-lg hover:-translate-y-1 transition-transform shadow-[0_0_16px_rgba(59,130,246,0.2)]">
                Book Your Demo
                <ArrowRight className="w-5 h-5" />
              </Link>

              <div className="flex items-center justify-center gap-2 mt-6 text-slate-500 text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>Secure payment via Razorpay.</span>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
