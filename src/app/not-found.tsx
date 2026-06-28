"use client"

import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-center -space-y-4 px-6 text-center">
      <h2 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#0060aa] via-[#8b5cf6] to-[#ff8b12] drop-shadow-[0_0_30px_rgba(255,139,18,0.15)] mb-4">404</h2>
      <p className="text-xl text-slate-600 dark:text-slate-300 font-light mb-8 max-w-md">
        This pathway doesn&apos;t exist in our network yet.
      </p>
      <Link 
        href="/"
        className="px-8 py-3 rounded-full text-white font-bold bg-gradient-to-r from-[#0060aa] to-[#ff8b12] hover:from-[#005291] hover:to-[#e0770b] transition-all shadow-lg hover:shadow-orange-500/10 hover:scale-105 active:scale-95"
      >
        Return to Home
      </Link>
    </div>
  )
}
