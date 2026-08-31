import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import dynamic from "next/dynamic"
import Navbar from "@/components/Navbar"
import HeroSection from "@/components/HeroSection"
import PaymentSupportNotice from "@/components/PaymentSupportNotice"
import { createMetadata, getHomeFaqSchema } from "@/lib/seo"

const SkillsSection = dynamic(() => import("@/components/SkillsSection"))
const StudentProjects = dynamic(() => import("@/components/StudentProjects"))
const BootcampTimeline = dynamic(() => import("@/components/BootcampTimeline"))
const OurTopBuilders = dynamic(() => import("@/components/OurTopBuilders"))
const InteractiveChatDemo = dynamic(() => import("@/components/InteractiveChatDemo"))
const GallerySection = dynamic(() => import("@/components/GallerySection"))
const Testimonials = dynamic(() => import("@/components/Testimonials"))
const ContactUs = dynamic(() => import("@/components/ContactUs"))

export const metadata: Metadata = {
  ...createMetadata({
    title: "AI Education Bootcamp for Students in Classes 6–10",
    description:
      "Skillyug helps Class 6–10 students learn ChatGPT, Canva AI, Gamma, and real project workflows through a hands-on AI bootcamp. Reserve your bootcamp spot today.",
  }),
}

const homeFaqSchema = getHomeFaqSchema()

export default function Home() {
  return (
    <main className="bg-background min-h-screen text-foreground font-sans selection:bg-purple-200 selection:text-slate-950 relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeFaqSchema) }}
      />
      
      {/* Global Background Connection Lines */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-5 hidden md:block">
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
        Canva AI, Gamma, project skills, and a ₹10,000 bootcamp spot booking.
      </h1>
      <HeroSection />
      


      <OurTopBuilders />
      <GallerySection />
      <InteractiveChatDemo id="ask-ai" />
      
      <SkillsSection />
      <StudentProjects />
      <BootcampTimeline />
      <Testimonials />

      
      <ContactUs />
      
      <footer className="relative z-10 w-full bg-transparent border-t border-slate-200/60 dark:border-white/5 pt-8 pb-20 flex flex-col items-center">
        <div className="bg-white/80 dark:bg-[#0a0f1c]/80 backdrop-blur-md p-6 md:p-16 px-10 md:px-48 rounded-[2rem] md:rounded-[2.5rem] mb-16 overflow-hidden group border border-slate-200/60 dark:border-white/5 shadow-sm">
          <Image src="/skillyug-optimized.svg" alt="Skillyug Logo" width={300} height={150} className="h-14 md:h-36 w-auto object-contain scale-[1.8] md:scale-[2.0] transition-transform group-hover:scale-[2.4] duration-500 transform-gpu" />
        </div>
        
        <nav className="mb-6">
          <ul className="flex flex-wrap justify-center gap-6 text-sm font-semibold text-slate-500 dark:text-slate-400">
            <li><Link href="/" className="hover:text-[#ff8b12] dark:hover:text-[#ff9d3b] transition-colors">Home</Link></li>
            <li><Link href="/blog" className="hover:text-[#ff8b12] dark:hover:text-[#ff9d3b] transition-colors">Blog</Link></li>
          </ul>
        </nav>

        <div className="mb-8 flex gap-4 text-xs text-slate-400 dark:text-slate-500">
          <Link href="/refund-policy" className="hover:text-slate-600 dark:hover:text-slate-350 transition-colors">Refund Policy</Link>
          <span>|</span>
          <Link href="/terms-and-conditions" className="hover:text-slate-600 dark:hover:text-slate-350 transition-colors">Terms & Conditions</Link>
        </div>

        <p className="text-xs font-mono text-slate-400 dark:text-slate-500 tracking-widest text-center">
          © 2026 SKILLYUG<br />
          ALL RIGHTS RESERVED.
        </p>
      </footer>
    </main>
  )
}
