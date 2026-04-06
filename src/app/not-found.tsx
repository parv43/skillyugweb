"use client"

import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center -space-y-4 px-6 text-center">
      <h2 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-500 to-purple-500 drop-shadow-[0_0_30px_rgba(139,92,246,0.3)] mb-4">404</h2>
      <p className="text-xl text-slate-300 font-light mb-8 max-w-md">
        This pathway doesn&apos;t exist in our neural network yet.
      </p>
      <Link 
        href="/"
        className="glass-panel px-8 py-3 rounded-full text-blue-400 font-bold hover:bg-white/5 transition-colors border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
      >
        Return to Core
      </Link>
    </div>
  )
}
