"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"

const NeuralNode = ({ x, y, size, delay }: any) => (
  <motion.circle
    cx={x}
    cy={y}
    r={size}
    fill="#3b82f6"
    initial={{ opacity: 0.1, scale: 0.8 }}
    animate={{ opacity: [0.1, 0.4, 0.1], scale: [0.8, 1.2, 0.8] }}
    transition={{ duration: 4, delay, repeat: Infinity, ease: "easeInOut" }}
    className="drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]"
  />
)

const NeuralConnection = ({ x1, y1, x2, y2, delay }: any) => (
  <motion.line
    x1={x1}
    y1={y1}
    x2={x2}
    y2={y2}
    stroke="url(#neuralGradient)"
    strokeWidth="1"
    initial={{ pathLength: 0, opacity: 0 }}
    animate={{ pathLength: [0, 1, 1], opacity: [0, 0.3, 0] }}
    transition={{ duration: 5, delay, repeat: Infinity, ease: "easeInOut" }}
  />
)

// The orbiting AI tools icons
const OrbitingIcon = ({ icon, angle, radiusX, radiusY, duration }: any) => {
  return (
    <motion.div
      className="absolute top-1/2 left-1/2 -ms-6 -mt-6 w-12 h-12 z-20 will-change-transform flex items-center justify-center"
      initial={{ rotate: angle }}
      animate={{ rotate: angle + 360 }}
      transition={{ duration, repeat: Infinity, ease: "linear" }}
    >
      <motion.div
        className="absolute w-full h-full flex items-center justify-center glass-panel rounded-full text-xl"
        style={{ transform: \`translateY(-\${radiusX}px)\` }}
        initial={{ rotate: -angle }}
        animate={{ rotate: -(angle + 360) }}
        transition={{ duration, repeat: Infinity, ease: "linear" }}
      >
        {icon}
      </motion.div>
    </motion.div>
  )
}

export default function HeroSection() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const tools = ["🤖", "🎨", "🧠", "✨", "🎬", "📈"]

  return (
    <section className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20 pb-16">
      {/* Background Neural Network SVG */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-50">
        <svg width="100%" height="100%" className="min-w-full min-h-full">
          <defs>
            <linearGradient id="neuralGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.5" />
            </linearGradient>
          </defs>
          <NeuralNode x="20%" y="30%" size={4} delay={0} />
          <NeuralNode x="80%" y="20%" size={5} delay={1} />
          <NeuralNode x="70%" y="70%" size={3} delay={0.5} />
          <NeuralNode x="30%" y="80%" size={6} delay={2} />
          <NeuralNode x="10%" y="60%" size={4} delay={1.5} />
          <NeuralNode x="90%" y="50%" size={5} delay={0.5} />

          <NeuralConnection x1="20%" y1="30%" x2="80%" y2="20%" delay={0} />
          <NeuralConnection x1="80%" y1="20%" x2="70%" y2="70%" delay={1} />
          <NeuralConnection x1="70%" y1="70%" x2="30%" y2="80%" delay={0.5} />
          <NeuralConnection x1="30%" y1="80%" x2="20%" y2="30%" delay={2} />
          <NeuralConnection x1="10%" y1="60%" x2="30%" y2="80%" delay={1.5} />
          <NeuralConnection x1="90%" y1="50%" x2="70%" y2="70%" delay={1} />
        </svg>

        {/* Deep Glowing Orbs */}
        <div className="absolute top-[20%] left-[20%] w-[40vw] h-[40vw] rounded-full bg-blue-600/10 blur-[100px]" />
        <div className="absolute bottom-[20%] right-[20%] w-[40vw] h-[40vw] rounded-full bg-purple-600/10 blur-[100px]" />
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-between w-full max-w-7xl px-6 lg:px-12 z-10 gap-16">
        
        {/* Left Side: Text and CTA */}
        <motion.div 
          className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left space-y-8"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="glass-panel px-4 py-2 rounded-full border border-blue-500/30 inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
            <span className="text-sm font-medium text-blue-200 uppercase tracking-widest">Future Ready Education</span>
          </div>

          <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-tight">
            Master the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 neon-text">
              Ultimate AI Tools
            </span>
          </h1>

          <p className="text-lg lg:text-xl text-slate-400 max-w-xl leading-relaxed">
            The next generation of innovators starts here. Equip your child with the AI skills they need to shape the world tomorrow.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button className="glow-button px-8 py-4 rounded-full text-white font-bold text-lg tracking-wide shadow-lg hover:scale-105 transition-transform">
              Join the Bootcamp
            </button>
            <button className="glass-panel px-8 py-4 rounded-full text-slate-300 font-semibold hover:bg-white/5 transition-colors">
              Explore Curriculum
            </button>
          </div>
        </motion.div>

        {/* Right Side: Skillyug Orbit System */}
        <motion.div 
          className="flex-1 relative w-full aspect-square max-w-[500px] flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          {/* Orbital path rings */}
          <div className="absolute inset-[15%] rounded-full border border-white/5 shadow-[inset_0_0_30px_rgba(255,255,255,0.01)]" />
          <div className="absolute inset-[5%] rounded-full border border-white/5" />

          {/* Core Skillyug Logo Planet */}
          <div className="relative z-10 w-32 h-32 flex items-center justify-center rounded-full glass-panel shadow-[0_0_40px_rgba(59,130,246,0.3)] border border-blue-500/30 p-2">
            <div className="absolute inset-0 rounded-full border border-purple-500/40 animate-ping opacity-20" />
            <h2 className="text-2xl font-black text-white tracking-widest">SKILLYUG</h2>
          </div>

          {/* Orbiting Tech Icons */}
          {tools.map((icon, index) => (
            <OrbitingIcon
              key={index}
              icon={icon}
              angle={(index / tools.length) * 360}
              radiusX={220} // distance from center
              duration={20 + (index % 2) * 5}
            />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
