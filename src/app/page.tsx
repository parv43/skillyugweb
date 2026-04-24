/* eslint-disable @next/next/no-img-element */
import { Metadata } from "next"
import Link from "next/link"
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
import PaymentSupportNotice from "@/components/PaymentSupportNotice"
import SlidingCTA from "@/components/SlidingCTA"
import ContactUs from "@/components/ContactUs"
import { createMetadata, getHomeFaqSchema } from "@/lib/seo"

export const metadata: Metadata = {
  ...createMetadata({
    title: "AI Education Bootcamp for Students in Classes 6–12",
    description:
      "Skillyug helps Class 6–12 students learn ChatGPT, Canva AI, Gamma, and real project workflows through a hands-on AI bootcamp, a ₹49 demo class, and a ₹299 bootcamp spot booking.",
  }),
}

const homeFaqSchema = getHomeFaqSchema()

export default function Home() {
  return (
    <main className="bg-[#020617] min-h-screen text-slate-50 font-sans selection:bg-purple-500/30 selection:text-white relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeFaqSchema) }}
      />
      
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
          <line x1="15%" y1="0" x2="15%" y2="100%" stroke="url(#globalGlow)" strokeWidth="1" strokeDasharray="10 10" className="opacity-50" />
          <line x1="85%" y1="0" x2="85%" y2="100%" stroke="url(#globalGlow)" strokeWidth="1" strokeDasharray="10 10" className="opacity-50" />
          
          <line x1="15%" y1="0" x2="15%" y2="100%" stroke="url(#globalGlow)" strokeWidth="3" strokeDasharray="100 1000" className="animate-[stroke-dashoffset_10s_linear_infinite] opacity-60" />
          <line x1="85%" y1="0" x2="85%" y2="100%" stroke="url(#globalGlow)" strokeWidth="3" strokeDasharray="100 1000" className="animate-[stroke-dashoffset_12s_linear_infinite] opacity-60" />
        </svg>
      </div>

      <div className="relative z-10 hidden overflow-x-hidden">
         {/* Fix for overflowing glowing elements */}
      </div>

      <Navbar />
      <PaymentSupportNotice />
      <h1 className="sr-only">
        AI education bootcamp for students in Classes 6 to 12 with ChatGPT,
        Canva AI, Gamma, project skills, a ₹49 demo class, and a ₹299 bootcamp
        spot booking.
      </h1>
      <HeroSection />
      
      {/* Promotional Ribbon */}
      <SlidingCTA />

      {/* Gallery — mobile only, shown right after hero */}
      <div className="md:hidden">
        <GallerySection />
      </div>

      {/* Interactive Chat Demo — mobile only, shown after gallery */}
      <div id="ask-ai" className="relative -top-24 h-0" />
      <div className="md:hidden">
        <InteractiveChatDemo id="ask-ai-mobile" />
      </div>
      
      <AIToolsSection />
      
      {/* Section 3: Interactive Prompting Chat Demo — desktop only */}
      <div className="hidden md:block">
        <InteractiveChatDemo id="ask-ai-desktop" />
      </div>
      
      <SkillsSection />
      <StudentProjects />
      <BootcampTimeline />
      {/* Gallery — hidden on mobile to avoid duplication (shown at top for mobile) */}
      <div className="hidden md:block">
        <GallerySection />
      </div>
      <Testimonials />
      <DemoBookingSection />
      
      {/* Floating CTA System */}
      <FloatingCTA />
      
      <ContactUs />
      
      <footer className="relative z-10 w-full bg-[#020617] border-t border-slate-900/80 pt-8 pb-20 flex flex-col items-center">
        <div className="bg-black/5 p-6 md:p-16 px-10 md:px-48 rounded-[2rem] md:rounded-[2.5rem] mb-16 backdrop-blur-sm overflow-hidden group">
          <img src="/skillyug-optimized.svg" alt="Skillyug Logo" className="h-14 md:h-36 object-contain scale-[1.8] md:scale-[2.0] transition-transform group-hover:scale-[2.4] duration-500 transform-gpu" />
        </div>
        
        <nav className="mb-6">
          <ul className="flex flex-wrap justify-center gap-6 text-sm font-medium text-slate-400">
            <li><Link href="/" className="hover:text-blue-400 transition-colors">Home</Link></li>
            <li><Link href="/blog" className="hover:text-blue-400 transition-colors">Blog</Link></li>
            <li><Link href="/#ask-ai" className="hover:text-blue-400 transition-colors">Interactive Demo</Link></li>
            <li><Link href="/#curriculum" className="hover:text-blue-400 transition-colors">Curriculum</Link></li>
          </ul>
        </nav>

        <div className="mb-8 flex gap-4 text-xs text-slate-500">
          <Link href="/refund-policy" className="hover:text-slate-300 transition-colors">Refund Policy</Link>
          <span>|</span>
          <Link href="/terms-and-conditions" className="hover:text-slate-300 transition-colors">Terms & Conditions</Link>
        </div>

        <p className="text-sm font-mono text-slate-500 tracking-widest text-center">
          © 2026 SKILLYUG<br />
          ALL RIGHTS RESERVED.
        </p>
      </footer>
    </main>
  )
}
