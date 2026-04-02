import { Metadata } from "next"
import Navbar from "@/components/Navbar"
import HeroSection from "@/components/HeroSection"
import SkillsSection from "@/components/SkillsSection"
import StudentProjects from "@/components/StudentProjects"
import BootcampTimeline from "@/components/BootcampTimeline"
import AIToolsSection from "@/components/AIToolsSection"
import InteractiveChatDemo from "@/components/InteractiveChatDemo"
import GallerySection from "@/components/GallerySection"
import Testimonials from "@/components/Testimonials"
import DemoBookingSection from "@/components/DemoBookingSection"
import FloatingCTA from "@/components/FloatingCTA"
import SlidingCTA from "@/components/SlidingCTA"
import ContactUs from "@/components/ContactUs"

export const metadata: Metadata = {
  title: 'Skillyug | AI Education & Bootcamps for Students',
  description: 'Empowering Class 6-12 students with Future AI Skills. Learn ChatGPT, Canva AI, Gamma, and more through our hands-on AI Creator Bootcamp.',
  alternates: {
    canonical: 'https://skillyugedu.com',
  },
  openGraph: {
    title: 'Skillyug | AI Education & Bootcamps for Students',
    description: 'Empowering Class 6-12 students with Future AI Skills. Learn ChatGPT, Canva AI, Gamma, and more through our hands-on AI Creator Bootcamp.',
    url: 'https://skillyugedu.com',
    siteName: 'Skillyug',
    locale: 'en_IN',
    type: 'website',
  },
}

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
      
      <div className="hidden md:block">
        <AIToolsSection />
      </div>
      
      {/* Section 3: Interactive Prompting Chat Demo */}
      <div className="hidden md:block">
        <InteractiveChatDemo />
      </div>
      
      <SkillsSection />
      <StudentProjects />

      {/* Gallery — visible on all devices */}
      <GallerySection />

      {/* Learning Progression — visible on desktop only */}
      <div className="hidden md:block">
        <BootcampTimeline />
      </div>

      <Testimonials />
      <DemoBookingSection />
      
      {/* Floating CTA System */}
      <FloatingCTA />
      
      <ContactUs />
      
      <footer className="relative z-10 w-full bg-[#020617] border-t border-slate-900/80 py-12 flex flex-col items-center">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-[0_0_15px_rgba(59,130,246,0.5)] flex items-center justify-center opacity-70 mb-4 cyber-glow">
          <span className="text-white font-black text-xs">SY</span>
        </div>
        
        <nav className="mb-6">
          <ul className="flex flex-wrap justify-center gap-6 text-sm font-medium text-slate-400">
            <li><a href="/" className="hover:text-blue-400 transition-colors">Home</a></li>
            <li><a href="/blog" className="hover:text-blue-400 transition-colors">Blog</a></li>
            <li><a href="#ask-ai" className="hover:text-blue-400 transition-colors">Interactive Demo</a></li>
            <li><a href="#curriculum" className="hover:text-blue-400 transition-colors">Curriculum</a></li>
          </ul>
        </nav>

        <div className="mb-8 flex gap-4 text-xs text-slate-500">
          <a href="/refund-policy" className="hover:text-slate-300 transition-colors">Refund Policy</a>
          <span>|</span>
          <a href="/terms-and-conditions" className="hover:text-slate-300 transition-colors">Terms & Conditions</a>
        </div>

        <p className="text-sm font-mono text-slate-500 tracking-widest text-center">
          © 2026 SKILLYUG<br />
          ALL RIGHTS RESERVED.
        </p>
      </footer>
    </main>
  )
}
