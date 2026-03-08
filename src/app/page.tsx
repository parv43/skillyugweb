import Navbar from "@/components/Navbar"
import HeroSection from "@/components/HeroSection"
import SkillsSection from "@/components/SkillsSection"
import StudentProjects from "@/components/StudentProjects"
import BootcampTimeline from "@/components/BootcampTimeline"
import SchoolsSection from "@/components/SchoolsSection"
import Testimonials from "@/components/Testimonials"
import CTASection from "@/components/CTASection"

export default function Home() {
  return (
    <main className="bg-[#020617] min-h-screen text-slate-50 font-sans selection:bg-purple-500/30 selection:text-white">
      <Navbar />
      <HeroSection />
      <SkillsSection />
      <StudentProjects />
      <BootcampTimeline />
      <SchoolsSection />
      <Testimonials />
      <CTASection />
      
      {/* Minimal Footer Footer */}
      <footer className="w-full bg-[#020617] border-t border-slate-900 py-12 flex flex-col items-center">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-[0_0_15px_rgba(59,130,246,0.5)] flex items-center justify-center opacity-50 mb-4">
          <span className="text-white font-black text-xs">SY</span>
        </div>
        <p className="text-sm font-mono text-slate-600 tracking-widest text-center">
          © 2026 SKILLYUG NEURAL SYSTEMS<br />
          ALL RIGHTS RESERVED.
        </p>
      </footer>
    </main>
  )
}
