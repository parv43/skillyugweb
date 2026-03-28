import Navbar from "@/components/Navbar"
import HeroSection from "@/components/HeroSection"
import SkillsSection from "@/components/SkillsSection"
import StudentProjects from "@/components/StudentProjects"
import BootcampTimeline from "@/components/BootcampTimeline"
import AIToolsSection from "@/components/AIToolsSection"
import InteractiveChatDemo from "@/components/InteractiveChatDemo"
import Testimonials from "@/components/Testimonials"
import DemoBookingSection from "@/components/DemoBookingSection"
import FloatingCTA from "@/components/FloatingCTA"
import SlidingCTA from "@/components/SlidingCTA"

export default function Home() {
  return (
    <main className="bg-[#020617] min-h-screen text-slate-50 font-sans selection:bg-purple-500/30 selection:text-white relative">
      
      {/* Global Background Connection Lines */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20 hidden md:block">
        <svg width="100%" height="100%" className="absolute inset-0">
          <defs>
            <linearGradient id="globalGlow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
              <stop offset="50%" stopColor="#8b5cf6" stopOpacity="1" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {/* Animated vertical flowing lines */}
          <path d="M 15% 0 L 15% 100%" stroke="url(#globalGlow)" strokeWidth="1" strokeDasharray="10 10" className="opacity-50" />
          <path d="M 85% 0 L 85% 100%" stroke="url(#globalGlow)" strokeWidth="1" strokeDasharray="10 10" className="opacity-50" />
          
          <path d="M 15% 0 L 15% 100%" stroke="url(#globalGlow)" strokeWidth="3" strokeDasharray="100 1000" className="animate-[stroke-dashoffset_10s_linear_infinite] opacity-60" />
          <path d="M 85% 0 L 85% 100%" stroke="url(#globalGlow)" strokeWidth="3" strokeDasharray="100 1000" className="animate-[stroke-dashoffset_12s_linear_infinite] opacity-60" />
        </svg>
      </div>

      <div className="relative z-10 hidden overflow-x-hidden">
         {/* Fix for overflowing glowing elements */}
      </div>

      <Navbar />
      <HeroSection />
      
      {/* Promotional Ribbon */}
      <SlidingCTA />
      
      <AIToolsSection />
      
      {/* Section 3: Interactive Prompting Chat Demo */}
      <InteractiveChatDemo />
      
      <SkillsSection />
      <StudentProjects />
      <BootcampTimeline />
      <Testimonials />
      <DemoBookingSection />
      
      {/* Floating CTA System */}
      <FloatingCTA />
      
      {/* Minimal Footer */}
      <footer className="relative z-10 w-full bg-[#020617] border-t border-slate-900/80 py-12 flex flex-col items-center">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-[0_0_15px_rgba(59,130,246,0.5)] flex items-center justify-center opacity-70 mb-4 cyber-glow">
          <span className="text-white font-black text-xs">SY</span>
        </div>
        <p className="text-sm font-mono text-slate-500 tracking-widest text-center">
          © 2026 SKILLYUG NEURAL SYSTEMS<br />
          ALL RIGHTS RESERVED.
        </p>
      </footer>
    </main>
  )
}
