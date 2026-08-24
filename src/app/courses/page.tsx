"use client"

import { useEffect, useRef, useState } from "react"
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react"
import Link from "next/link"
import Image from "next/image"
import { 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Trophy, 
  BookOpen, 
  Code, 
  Brain, 
  Compass, 
  User, 
  Check, 
  X,
  HelpCircle,
  Calendar,
  Users,
  ShieldAlert,
  Star
} from "lucide-react"
import Navbar from "@/components/Navbar"

// Logo colors: 
// Skillyug Blue: #0060aa
// Skillyug Orange: #ff8b12

const instructors = [
  {
    name: "Teacher 1",
    initials: "T1",
    image: null,
    title: "Senior AI & Technology Trainer",
    bio: "Information to be announced before course commencement."
  },
  {
    name: "Teacher 2",
    initials: "T2",
    image: null,
    title: "Creative Design & Automation Expert",
    bio: "Information to be announced before course commencement."
  },
]

const roadmapWeeks = [
  {
    week: 1,
    title: "AI Tools & Prompts",
    shortDesc: "Master generative platforms and write effective prompts.",
    icon: Compass,
    color: "#0060aa", // Blue
    tags: ["AI Basics", "Prompt Design", "Image Gen", "Video Gen", "AI Ethics"],
    project: "Story Script & Avatar Video"
  },
  {
    week: 2,
    title: "Smart Study & Vedic Math",
    shortDesc: "Boost calculations and learn study acceleration tools.",
    icon: Brain,
    color: "#ff8b12", // Orange
    tags: ["Study Hacks", "Fast Addition", "Multiplication Tricks", "ML Intro", "Forgetting Curve"],
    project: "Mental Addition Challenge"
  },
  {
    week: 3,
    title: "Logic & Flowcharts",
    shortDesc: "Build core problem-solving logic and systematic procedures.",
    icon: Code,
    color: "#0060aa", // Blue
    tags: ["Logical Thinking", "Algorithms", "Flowcharts", "Vedic Division", "Logic Games"],
    project: "Flowchart & Process Logic"
  },
  {
    week: 4,
    title: "Python Programming",
    shortDesc: "Learn to write real Python scripts and build your first calculator.",
    icon: BookOpen,
    color: "#ff8b12", // Orange
    tags: ["Python Setup", "Variables", "Data Types", "User Input", "Calculator App"],
    project: "Multi-Function Calculator"
  },
  {
    week: 5,
    title: "Creative AI & Graduation",
    shortDesc: "Create custom portfolio projects, design visual assets, and graduate.",
    icon: Trophy,
    color: "#0060aa", // Blue
    tags: ["If/Else Logic", "Canva AI", "AI Stories & Reels", "Graduation Ceremony"],
    project: "AI Canva Presentation & Certificate"
  }
]

const courseTiers = [
  {
    id: "basic",
    name: "Basic Batch",
    price: "₹10,000",
    rawPrice: 10000,
    duration: "25 Days",
    batchSize: "30 Students",
    mentors: "1 Dedicated Mentor",
    tagline: "Perfect for starting your child's AI journey.",
    cta: "Book Slot",
    features: {
      duration: "25 Days",
      size: "30 Students",
      mentorship: "1 Dedicated Mentor",
      liveSessions: "Interactive Live Classes",
      projects: "2 Hands-on Projects",
      support: "Group Chat Support",
      portfolio: "Digital Portfolio Review",
      certificate: "Skillyug Verified Certification",
      extraClass: "No"
    }
  },
  {
    id: "premium",
    name: "Premium Batch",
    price: "₹7,500",
    rawPrice: 7500,
    duration: "30 Days",
    batchSize: "20 Students",
    mentors: "2 Dedicated Mentors",
    tagline: "Most Popular. Expanded focus and personalized guidance.",
    cta: "Book Slot",
    highlight: true,
    features: {
      duration: "30 Days",
      size: "20 Students",
      mentorship: "2 Dedicated Mentors (Only for Premium)",
      liveSessions: "Interactive Live Classes",
      projects: "4 Hands-on Projects",
      support: "Priority Discord Support",
      portfolio: "Detailed 1-on-1 Portfolio Feedback",
      certificate: "Gold Star Verified Certification",
      extraClass: "2 Doubt-Clearing Sessions"
    }
  },
  {
    id: "elite",
    name: "Elite Batch",
    price: "₹25,000",
    rawPrice: 25000,
    duration: "30 Days",
    batchSize: "3 Students",
    mentors: "1 Dedicated Mentor",
    tagline: "Ultimate personalized learning with high mentor attention.",
    cta: "Book Slot",
    features: {
      duration: "30 Days",
      size: "3 Students",
      mentorship: "1 Dedicated Mentor (Direct Attention)",
      liveSessions: "Interactive 1-on-1 & Micro-Group",
      projects: "6 Custom Portfolio Projects",
      support: "24/7 Priority Discord & WhatsApp",
      portfolio: "Personalized Portfolio & Code Review",
      certificate: "Elite Honors Certification",
      extraClass: "Unlimited 1-on-1 Doubt Sessions"
    }
  }
]



interface RoadNodeProps {
  week: number
  active: boolean
  onClick: () => void
  onMouseEnter: () => void
  color: string
  icon: React.ComponentType<{ className?: string }>
  size?: "default" | "sm"
  animate: boolean
}

function RoadNode({ week, active, onClick, onMouseEnter, color, icon: Icon, size = "default", animate }: RoadNodeProps) {
  const isOrange = color === "#ff8b12"
  const dimensions = size === "sm" ? "w-12 h-12" : "w-16 h-16"
  const iconSize = size === "sm" ? "h-5 w-5" : "h-7 w-7"
  
  const baseClass = "relative z-10 rounded-full flex items-center justify-center transition-all duration-350 cursor-pointer select-none border-0"
  const animClass = animate ? `node-animate-${week}` : "opacity-0 scale-0"
  
  // Claymorphic active & inactive styles
  const activeClass = active 
    ? (isOrange ? "clay-node-active-orange node-ripple-orange text-white" : "clay-node-active-blue node-ripple-blue text-white") 
    : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-250 clay-node"

  return (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={`${baseClass} ${dimensions} ${animClass} ${activeClass}`}
      aria-label={`Select Week ${week}`}
    >
      <Icon className={iconSize} />
      <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black flex items-center justify-center border border-white/20 dark:border-slate-200/50 shadow-md">
        {week}
      </span>
    </button>
  )
}

function RoadTextBlock({ week, active, revealed, align = "left" }: { week: number; active: boolean; revealed: boolean; align?: "left" | "right" | "center" }) {
  const w = roadmapWeeks.find((item) => item.week === week)
  if (!w) return null

  const alignmentClass = align === "right" ? "text-right items-end" : align === "center" ? "text-center items-center" : "text-left items-start"
  const flexDir = align === "right" ? "justify-end" : align === "center" ? "justify-center" : "justify-start"

  return (
    <div 
      className={`flex flex-col ${alignmentClass} select-none max-w-[340px] md:max-w-[380px] w-full transition-all duration-700 ${
        revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <span 
        className="text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-300"
        style={{ color: active ? w.color : "#94a3b8" }}
      >
        Week {w.week}
      </span>
      <h3 className={`text-base font-black mt-0.5 transition-all duration-300 ${
        active 
          ? "text-[#0060aa] dark:text-white scale-[1.02] origin-left" 
          : "text-slate-800 dark:text-slate-350"
      }`}>
        {w.title}
      </h3>
      <p className={`text-xs mt-1 leading-relaxed transition-colors duration-300 ${
        active ? "text-slate-800 dark:text-slate-100" : "text-slate-600 dark:text-slate-400"
      }`}>
        {w.shortDesc}
      </p>

      {/* Summarized tags/words list */}
      <div className={`flex flex-wrap gap-1 mt-2 ${flexDir}`}>
        {w.tags.map((tag) => (
          <span 
            key={tag} 
            className="text-[9px] font-bold px-2.5 py-1 rounded-full transition-all duration-300 clay-tag text-slate-600 dark:text-slate-400"
            style={{
              backgroundColor: active ? `${w.color}15` : "rgba(148, 163, 184, 0.05)",
              color: active ? w.color : undefined,
              boxShadow: active ? `inset 1px 1px 2px rgba(255,255,255,0.4), inset -1px -1px 2px rgba(0,0,0,0.1), 0 2px 4px ${w.color}10` : undefined
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function CoursesPage() {
  const [activeWeek, setActiveWeek] = useState<number>(1)
  const [revealedWeeks, setRevealedWeeks] = useState<number[]>([1])
  const [animate, setAnimate] = useState(false)
  const [animationKey, setAnimationKey] = useState(0)
  const [userInteracted, setUserInteracted] = useState(false)
  const roadmapRef = useRef<HTMLDivElement>(null)



  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimate(true)
          setAnimationKey((prev) => prev + 1) // Force remount to restart animations on entering view
          setUserInteracted(false) // Reset user interaction on scroll in
        } else {
          setAnimate(false) // Reset the road glow when section is out of viewport
        }
      },
      { threshold: 0.1 }
    )

    if (roadmapRef.current) {
      observer.observe(roadmapRef.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const timers: NodeJS.Timeout[] = []

    if (animate && !userInteracted) {
      setTimeout(() => {
        setActiveWeek(1)
        setRevealedWeeks([1])
      }, 0)
      
      timers.push(setTimeout(() => { 
        if (!userInteracted) { 
          setActiveWeek(2)
          setRevealedWeeks(prev => prev.includes(2) ? prev : [...prev, 2])
        } 
      }, 2000))
      
      timers.push(setTimeout(() => { 
        if (!userInteracted) { 
          setActiveWeek(3)
          setRevealedWeeks(prev => prev.includes(3) ? prev : [...prev, 3])
        } 
      }, 4000))
      
      timers.push(setTimeout(() => { 
        if (!userInteracted) { 
          setActiveWeek(4)
          setRevealedWeeks(prev => prev.includes(4) ? prev : [...prev, 4])
        } 
      }, 6000))
      
      timers.push(setTimeout(() => { 
        if (!userInteracted) { 
          setActiveWeek(5)
          setRevealedWeeks(prev => prev.includes(5) ? prev : [...prev, 5])
        } 
      }, 8000))
    } else if (userInteracted) {
      setTimeout(() => {
        setRevealedWeeks([1, 2, 3, 4, 5])
      }, 0)
    }

    return () => {
      timers.forEach(clearTimeout)
    }
  }, [animate, animationKey, userInteracted])

  const handleSelectWeek = (week: number) => {
    setActiveWeek(week)
    setUserInteracted(true)
  }

  // Toggle to hide courses page under construction
  const SHOW_UNDER_CONSTRUCTION = true;

  if (SHOW_UNDER_CONSTRUCTION) {
    return (
      <main className="min-h-screen overflow-hidden bg-slate-50 dark:bg-[#020617] text-slate-800 dark:text-slate-200 selection:bg-orange-100 selection:text-orange-900 transition-colors duration-300 relative flex flex-col items-center justify-center">
        <Navbar />

        {/* Minimal mesh background glows */}
        <div className="absolute inset-0 z-0 bg-[linear-gradient(135deg,#f8fafc_0%,#f1f5f9_60%,#ffebd6_100%)] dark:bg-[linear-gradient(135deg,#020617_0%,#050811_60%,#190d05_100%)]" />
        <div className="absolute top-[20%] left-[20%] w-[300px] h-[300px] bg-[#0060aa]/5 dark:bg-[#0060aa]/8 rounded-full blur-[90px] animate-pulse duration-[10000ms]" />
        <div className="absolute bottom-[20%] right-[20%] w-[350px] h-[350px] bg-[#ff8b12]/5 dark:bg-[#ff8b12]/8 rounded-full blur-[100px] animate-pulse duration-[8000ms]" />

        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes rotate-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .animate-rotate-slow {
            animation: rotate-slow 15s linear infinite;
          }
        `}} />

        <div className="relative z-10 max-w-xl mx-auto px-6 text-center flex flex-col items-center">
          {/* Subtle spinning logo */}
          <div className="relative mb-8 p-4 rounded-2xl bg-slate-200/30 dark:bg-white/5 border border-slate-200/40 dark:border-white/5 animate-fade-in">
            <Compass className="h-10 w-10 text-[#0060aa] dark:text-[#ff9d3b] animate-rotate-slow" />
          </div>

          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#ff8b12] dark:text-[#ff9d3b] mb-4">
            Under Construction
          </span>

          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">
            New courses catalog is coming
          </h1>

          <p className="text-sm md:text-base text-slate-500 dark:text-slate-450 max-w-md mb-10 leading-relaxed font-normal">
            We are upgrading our coding and AI bootcamps list. Check back soon for our fresh batch launches and learning paths.
          </p>

          {/* Simple Clean CTA */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-slate-650 dark:text-slate-400 hover:text-[#0060aa] dark:hover:text-[#ff9d3b] transition-all group"
          >
            Go Back Home
            <ArrowRight className="h-3.5 w-3.5 transform transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-slate-50 dark:bg-[#020617] text-slate-800 dark:text-slate-200 selection:bg-orange-100 selection:text-orange-900 transition-colors duration-300 relative">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden px-6 pb-16 pt-44 md:pt-48 lg:pt-56 md:px-10 md:py-28 lg:px-16">
        {/* Background gradient utilizing Skillyug Orange & Blue */}
        <div className="absolute inset-0 z-0 bg-[linear-gradient(135deg,#f8fafc_0%,#f1f5f9_40%,#ffebd6_75%,#dbeafe_100%)] dark:bg-[linear-gradient(135deg,#020617_0%,#090d16_40%,#271206_75%,#031627_100%)]" />
        
        {/* Custom keyframe animations for floating elements and background glows */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes hero-float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-12px) rotate(0.5deg); }
          }
          @keyframes hero-glow {
            0%, 100% { opacity: 0.5; filter: blur(60px); }
            50% { opacity: 0.7; filter: blur(75px); }
          }
          .animate-hero-float {
            animation: hero-float 6s ease-in-out infinite;
          }
          .animate-hero-glow-1 {
            animation: hero-glow 8s ease-in-out infinite;
          }
          .animate-hero-glow-2 {
            animation: hero-glow 8s ease-in-out infinite 4s;
          }
        `}} />
        
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-48 bg-gradient-to-b from-transparent via-slate-50/80 dark:via-[#020617]/80 to-slate-50 dark:to-[#020617]" />

        <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column - Text Content */}
          <div className="lg:col-span-7 max-w-2xl lg:text-left text-center flex flex-col items-center lg:items-start">
            <div className="mb-6 inline-flex items-center rounded-full border border-orange-200 dark:border-orange-900/30 bg-orange-50/90 dark:bg-orange-950/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#ff8b12] dark:text-[#ff9d3b] backdrop-blur-md">
              <Sparkles className="h-4 w-4 mr-2" />
              Live Interactive Courses
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-7xl leading-tight">
              Give Your Child the Advantage in the{" "}
              <span className="bg-gradient-to-r from-[#0060aa] via-[#8b5cf6] to-[#ff8b12] bg-clip-text text-transparent drop-shadow-sm">
                Era of AI
              </span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-slate-600 dark:text-slate-300 sm:text-xl">
              Students in Classes 6–10 gain mastery over industry-leading generative platforms, coding structures, and design automation through hands-on project building and live expert sessions.
            </p>
            <div className="mt-10 flex flex-wrap justify-center lg:justify-start gap-4">
              <a
                href="#pricing"
                className="rounded-full bg-gradient-to-r from-[#0060aa] to-[#ff8b12] hover:from-[#005291] hover:to-[#e0770b] text-white px-8 py-4 text-base font-bold shadow-lg hover:shadow-orange-500/10 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer pointer-events-auto"
              >
                Explore Batches
              </a>
              <a
                href="#roadmap"
                className="rounded-full border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-[#0a0f1c]/70 hover:bg-white dark:hover:bg-[#0a0f1c] text-slate-900 dark:text-white px-8 py-4 text-base font-bold backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer pointer-events-auto"
              >
                View Roadmap
              </a>
            </div>
          </div>

          {/* Right Column - Hero Poster Image & Testimonial */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-end gap-6 w-full relative pointer-events-auto">
            {/* Glowing background orbs for theme-matching depth */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-[#0060aa]/10 dark:bg-[#0060aa]/15 filter blur-3xl pointer-events-none animate-hero-glow-1" />
            <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-[#ff8b12]/10 dark:bg-[#ff8b12]/12 filter blur-3xl pointer-events-none animate-hero-glow-2" />

            {/* Poster Frame */}
            <div className="relative group w-full max-w-[460px] aspect-square rounded-[2rem] overflow-hidden border border-slate-200/60 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.08)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.45)] transition-all duration-500 hover:shadow-[0_25px_60px_rgba(255,139,18,0.12)] dark:hover:shadow-[0_25px_60px_rgba(255,139,18,0.22)] animate-hero-float">
              <Image
                src="/hero_student_coding.png"
                alt="Young student masterfully coding on a laptop"
                fill
                priority
                sizes="(max-w-1024px) 100vw, 460px"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.03] select-none"
              />
              
              {/* Subtle glass reflection overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 dark:to-white/5 pointer-events-none" />
              
              {/* Floating Badge 1 - Interactive Coding */}
              <div className="absolute bottom-5 left-5 bg-white/90 dark:bg-slate-950/80 backdrop-blur-md border border-slate-200/60 dark:border-white/10 rounded-2xl p-3 flex items-center gap-3 shadow-lg select-none transform transition-transform duration-500 hover:scale-105">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#0060aa] to-[#ff8b12] flex items-center justify-center text-white">
                  <Code className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <div className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Project-based</div>
                  <div className="text-xs font-black text-slate-800 dark:text-white">Interactive Coding</div>
                </div>
              </div>

              {/* Floating Badge 2 - Next-Gen AI Tools */}
              <div className="absolute top-5 right-5 bg-white/90 dark:bg-slate-950/80 backdrop-blur-md border border-slate-200/60 dark:border-white/10 rounded-2xl p-3 flex items-center gap-3 shadow-lg select-none transform transition-transform duration-500 hover:scale-105">
                <div className="h-8 w-8 rounded-xl bg-orange-50 dark:bg-[#ff8b12]/20 border border-orange-100 dark:border-[#ff8b12]/30 flex items-center justify-center text-[#ff8b12]">
                  <Sparkles className="h-4 w-4 animate-pulse" />
                </div>
                <div className="text-left">
                  <div className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">AI Integrated</div>
                  <div className="text-xs font-black text-slate-800 dark:text-white">Next-Gen Tools</div>
                </div>
              </div>
            </div>

            {/* Testimonial Card */}
            <div className="w-full max-w-[460px] bg-white/80 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/60 dark:border-white/10 p-5 rounded-2xl shadow-lg transition-all duration-300 hover:border-orange-200 dark:hover:border-orange-500/20 select-none">
              <div className="flex items-center justify-between mb-3">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-orange-400 text-orange-400" />
                  ))}
                </div>
                <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 px-2 py-0.5 rounded-full border border-orange-200/40 dark:border-orange-950/50">
                  5.0 Rated
                </span>
              </div>
              <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 italic leading-relaxed mb-4 text-left">
                &quot;Skillyug has transformed my son&apos;s screen time from gaming to coding!&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#0060aa] to-[#ff8b12] text-white flex items-center justify-center font-bold text-xs shadow-md">
                  RK
                </div>
                <div className="text-left">
                  <div className="text-xs font-black text-slate-800 dark:text-white flex items-center gap-1.5">
                    Rajesh K.
                    <span className="inline-flex items-center gap-0.5 text-[9px] text-[#0060aa] dark:text-[#ff9d3b] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded-md font-semibold">
                      <Check className="h-2.5 w-2.5 text-[#0060aa] dark:text-[#ff9d3b]" /> Verified Parent
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Parent of Grade 8 Student</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap Section - Glowing Winding Road style */}
      <section id="roadmap" ref={roadmapRef} className="relative px-6 py-28 md:px-10 lg:px-16 bg-white dark:bg-[#060a13] border-t border-b border-slate-200/60 dark:border-white/5 overflow-hidden blueprint-grid">
        {/* Style Tag with Keyframe Animations */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes drawRoad {
            from { stroke-dashoffset: 100; }
            to { stroke-dashoffset: 0; }
          }
          .road-glow-path {
            stroke-dasharray: 100;
            stroke-dashoffset: 100;
            animation: drawRoad 8s linear forwards;
          }
          
          /* Sonar/Ripple effect for active nodes */
          @keyframes ripple {
            0% {
              transform: scale(1);
              opacity: 0.85;
            }
            100% {
              transform: scale(1.65);
              opacity: 0;
            }
          }
          .node-ripple-blue::after {
            content: '';
            position: absolute;
            inset: -6px;
            border: 2.5px solid #0060aa;
            border-radius: 9999px;
            animation: ripple 2s cubic-bezier(0.25, 0, 0, 1) infinite;
            pointer-events: none;
          }
          .node-ripple-orange::after {
            content: '';
            position: absolute;
            inset: -6px;
            border: 2.5px solid #ff8b12;
            border-radius: 9999px;
            animation: ripple 2s cubic-bezier(0.25, 0, 0, 1) infinite;
            pointer-events: none;
          }
          
          @keyframes pulseGlow {
            0%, 100% { box-shadow: 0 0 12px rgba(255, 139, 18, 0.4); }
            50% { box-shadow: 0 0 24px rgba(255, 139, 18, 0.75); }
          }
          .pulse-node-orange {
            animation: pulseGlow 2.5s ease-in-out infinite;
          }
          @keyframes pulseGlowBlue {
            0%, 100% { box-shadow: 0 0 12px rgba(0, 96, 170, 0.4); }
            50% { box-shadow: 0 0 24px rgba(0, 96, 170, 0.75); }
          }
          .pulse-node-blue {
            animation: pulseGlowBlue 2.5s ease-in-out infinite;
          }
          
          /* Staggered popping for nodes */
          @keyframes nodePop {
            0% {
              transform: scale(0);
              opacity: 0;
            }
            70% {
              transform: scale(1.2);
              opacity: 0.9;
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
          .node-animate-1 { animation: nodePop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s forwards; opacity: 0; }
          .node-animate-2 { animation: nodePop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 2.0s forwards; opacity: 0; }
          .node-animate-3 { animation: nodePop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 4.0s forwards; opacity: 0; }
          .node-animate-4 { animation: nodePop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 6.0s forwards; opacity: 0; }
          .node-animate-5 { animation: nodePop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 8.0s forwards; opacity: 0; }

          /* Claymorphic styles */
          .clay-node {
            background: #f1f5f9;
            box-shadow: 
              inset 2px 2px 5px rgba(255, 255, 255, 1), 
              inset -2px -2px 5px rgba(148, 163, 184, 0.25),
              0 10px 20px -5px rgba(0, 0, 0, 0.05);
            border: 1px solid rgba(148, 163, 184, 0.4);
          }
          .dark .clay-node {
            background: #0f172a;
            box-shadow: 
              inset 2px 2px 5px rgba(255, 255, 255, 0.05), 
              inset -2px -2px 5px rgba(0, 0, 0, 0.4),
              0 10px 20px -5px rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.05);
          }

          .clay-node-active-blue {
            background: #0060aa;
            box-shadow: 
              inset 3px 3px 6px rgba(255, 255, 255, 0.4), 
              inset -3px -3px 6px rgba(0, 0, 0, 0.25),
              0 8px 16px rgba(0, 96, 170, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }

          .clay-node-active-orange {
            background: #ff8b12;
            box-shadow: 
              inset 3px 3px 6px rgba(255, 255, 255, 0.4), 
              inset -3px -3px 6px rgba(0, 0, 0, 0.25),
              0 8px 16px rgba(255, 139, 18, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }

          .clay-tag {
            background: rgba(241, 245, 249, 0.5);
            border: 1px solid rgba(255, 255, 255, 0.8);
            box-shadow: 
              inset 1px 1px 2px rgba(255, 255, 255, 1), 
              inset -1px -1px 2px rgba(0, 0, 0, 0.03),
              0 2px 4px rgba(0, 0, 0, 0.02);
          }
          .dark .clay-tag {
            background: rgba(30, 41, 59, 0.5);
            border: 1px solid rgba(255, 255, 255, 0.05);
            box-shadow: 
              inset 1px 1px 2px rgba(255, 255, 255, 0.05), 
              inset -1px -1px 2px rgba(0, 0, 0, 0.3),
              0 2px 4px rgba(0, 0, 0, 0.1);
          }

          .blueprint-grid {
            background-size: 40px 40px;
            background-image: 
              linear-gradient(to right, rgba(148, 163, 184, 0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(148, 163, 184, 0.05) 1px, transparent 1px);
          }
          .dark .blueprint-grid {
            background-image: 
              linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
          }

          /* Pricing Card Claymorphic Styles */
          .clay-card {
            background: rgba(248, 250, 252, 0.9);
            backdrop-filter: blur(12px);
            border: 3px solid rgba(255, 255, 255, 0.95);
            box-shadow: 
              inset 8px 8px 16px rgba(255, 255, 255, 1), 
              inset -8px -8px 16px rgba(165, 180, 200, 0.25),
              0 20px 40px -10px rgba(0, 0, 0, 0.06),
              0 5px 15px -5px rgba(0, 0, 0, 0.04);
            transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
          }
          .dark .clay-card {
            background: rgba(15, 23, 42, 0.85);
            border: 3px solid rgba(255, 255, 255, 0.08);
            box-shadow: 
              inset 8px 8px 16px rgba(255, 255, 255, 0.06), 
              inset -8px -8px 16px rgba(0, 0, 0, 0.45),
              0 25px 50px -12px rgba(0, 0, 0, 0.5);
          }

          .clay-card:hover {
            transform: translateY(-10px);
            box-shadow: 
              inset 10px 10px 20px rgba(255, 255, 255, 1), 
              inset -10px -10px 20px rgba(165, 180, 200, 0.2),
              0 35px 60px -15px rgba(0, 96, 170, 0.16),
              0 10px 25px -10px rgba(0, 96, 170, 0.08);
          }
          .dark .clay-card:hover {
            box-shadow: 
              inset 10px 10px 20px rgba(255, 255, 255, 0.12), 
              inset -10px -10px 20px rgba(0, 0, 0, 0.4),
              0 35px 60px -15px rgba(0, 96, 170, 0.45);
          }

          .clay-card-highlight {
            background: rgba(248, 250, 252, 0.92);
            backdrop-filter: blur(12px);
            border: 3.5px solid #ff8b12;
            box-shadow: 
              inset 8px 8px 16px rgba(255, 255, 255, 1), 
              inset -8px -8px 16px rgba(255, 139, 18, 0.18),
              0 25px 50px -12px rgba(255, 139, 18, 0.14),
              0 5px 15px -5px rgba(255, 139, 18, 0.08);
            transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
          }
          .dark .clay-card-highlight {
            background: rgba(20, 24, 38, 0.9);
            border: 3.5px solid #ff8b12;
            box-shadow: 
              inset 8px 8px 16px rgba(255, 255, 255, 0.08), 
              inset -8px -8px 16px rgba(0, 0, 0, 0.45),
              0 30px 60px -10px rgba(255, 139, 18, 0.35);
          }

          @keyframes borderGlow {
            0%, 100% { 
              border-color: #ff8b12; 
              box-shadow: 
                inset 8px 8px 16px rgba(255, 255, 255, 0.18), 
                inset -8px -8px 16px rgba(255, 139, 18, 0.3),
                0 35px 70px -15px rgba(255, 139, 18, 0.45); 
            }
            50% { 
              border-color: #0060aa; 
              box-shadow: 
                inset 8px 8px 16px rgba(255, 255, 255, 0.18), 
                inset -8px -8px 16px rgba(0, 96, 170, 0.3),
                0 35px 70px -15px rgba(0, 96, 170, 0.45); 
            }
          }

          .clay-card-highlight:hover {
            transform: translateY(-10px) scale(1.02);
            animation: borderGlow 4s linear infinite;
          }

          .clay-btn-normal {
            background: #0f172a;
            color: #ffffff;
            box-shadow: 
              inset 3px 3px 6px rgba(255, 255, 255, 0.3), 
              inset -3px -3px 6px rgba(0, 0, 0, 0.6),
              0 6px 15px rgba(0, 0, 0, 0.15);
            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .dark .clay-btn-normal {
            background: #f8fafc;
            color: #0f172a;
            box-shadow: 
              inset 3px 3px 6px rgba(255, 255, 255, 0.9), 
              inset -3px -3px 6px rgba(0, 0, 0, 0.15),
              0 6px 15px rgba(0, 0, 0, 0.25);
          }
          .clay-btn-normal:hover {
            background: #1e293b;
            box-shadow: 
              inset 4px 4px 8px rgba(255, 255, 255, 0.3), 
              inset -4px -4px 8px rgba(0, 0, 0, 0.6),
              0 10px 20px rgba(0, 0, 0, 0.2);
          }
          .dark .clay-btn-normal:hover {
            background: #ffffff;
            box-shadow: 
              inset 4px 4px 8px rgba(255, 255, 255, 0.9), 
              inset -4px -4px 8px rgba(0, 0, 0, 0.05),
              0 10px 20px rgba(0, 0, 0, 0.3);
          }

          .clay-btn-highlight {
            background: linear-gradient(135deg, #0060aa 0%, #ff8b12 100%);
            color: #ffffff;
            box-shadow: 
              inset 4px 4px 8px rgba(255, 255, 255, 0.4), 
              inset -4px -4px 8px rgba(0, 0, 0, 0.3),
              0 10px 22px -5px rgba(255, 139, 18, 0.35);
            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .clay-btn-highlight:hover {
            box-shadow: 
              inset 5px 5px 10px rgba(255, 255, 255, 0.5), 
              inset -5px -5px 10px rgba(0, 0, 0, 0.3),
              0 15px 30px -5px rgba(255, 139, 18, 0.55);
          }
        `}} />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(0,96,170,0.03),transparent_40%),radial-gradient(circle_at_20%_80%,rgba(255,139,18,0.03),transparent_40%)]" />
        
        <div className="relative mx-auto max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white sm:text-5xl tracking-tight">
              Our 5-Week{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0060aa] to-[#ff8b12]">
                Learning Journey
              </span>
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 font-medium">
              A premium orthogonal roadmap mapping your child&apos;s weekly progress. Hover or tap each week to explore details.
            </p>
          </div>

          {/* DESKTOP VIEW: Clean winding road with absolute positioned nodes and text blocks */}
          <div key={animationKey} className="relative w-full aspect-[1000/550] max-w-5xl mx-auto hidden md:block">
            {/* The Road background SVG */}
            <svg viewBox="0 0 1000 550" className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible" fill="none">
              <defs>
                <linearGradient id="roadBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0060aa" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#ff8b12" />
                </linearGradient>
                <linearGradient id="roadGlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0060aa" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#ff8b12" />
                </linearGradient>
                <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="8" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Layer 1: Wide Neon Glow Base */}
              <path 
                d="M 80,220 L 165,220 Q 185,220 185,240 L 185,350 Q 185,370 205,370 L 375,370 Q 395,370 395,350 L 395,240 Q 395,220 415,220 L 585,220 Q 605,220 605,240 L 605,350 Q 605,370 625,370 L 795,370 Q 815,370 815,350 L 815,240 Q 815,220 835,220 L 920,220" 
                stroke="url(#roadBorderGrad)" 
                strokeWidth={36} 
                strokeLinecap="round" 
                opacity="0.08"
                filter="url(#neonGlow)"
              />
              
              {/* Layer 2: Glowing Road Edges */}
              <path 
                d="M 80,220 L 165,220 Q 185,220 185,240 L 185,350 Q 185,370 205,370 L 375,370 Q 395,370 395,350 L 395,240 Q 395,220 415,220 L 585,220 Q 605,220 605,240 L 605,350 Q 605,370 625,370 L 795,370 Q 815,370 815,350 L 815,240 Q 815,220 835,220 L 920,220" 
                stroke="url(#roadBorderGrad)" 
                strokeWidth={28} 
                strokeLinecap="round" 
                opacity="0.3"
              />

              {/* Layer 3: Main Road Track Bed */}
              <path 
                d="M 80,220 L 165,220 Q 185,220 185,240 L 185,350 Q 185,370 205,370 L 375,370 Q 395,370 395,350 L 395,240 Q 395,220 415,220 L 585,220 Q 605,220 605,240 L 605,350 Q 605,370 625,370 L 795,370 Q 815,370 815,350 L 815,240 Q 815,220 835,220 L 920,220" 
                className="stroke-slate-100 dark:stroke-[#090e1a]"
                strokeWidth={24} 
                strokeLinecap="round" 
              />
              
              {/* Layer 4: Neon Laser Flow progress path (Slower animation) */}
              <path 
                key={`progress-${animationKey}`}
                d="M 80,220 L 165,220 Q 185,220 185,240 L 185,350 Q 185,370 205,370 L 375,370 Q 395,370 395,350 L 395,240 Q 395,220 415,220 L 585,220 Q 605,220 605,240 L 605,350 Q 605,370 625,370 L 795,370 Q 815,370 815,350 L 815,240 Q 815,220 835,220 L 920,220" 
                stroke="url(#roadGlowGrad)" 
                strokeWidth={5} 
                strokeLinecap="round" 
                filter="url(#neonGlow)"
                className={animate ? "road-glow-path" : "opacity-0"} 
                pathLength={100}
              />

              {/* Layer 5: Road Center Dash Line */}
              <path 
                d="M 80,220 L 165,220 Q 185,220 185,240 L 185,350 Q 185,370 205,370 L 375,370 Q 395,370 395,350 L 395,240 Q 395,220 415,220 L 585,220 Q 605,220 605,240 L 605,350 Q 605,370 625,370 L 795,370 Q 815,370 815,350 L 815,240 Q 815,220 835,220 L 920,220" 
                stroke="#ffffff" 
                strokeWidth={1.5} 
                strokeLinecap="round" 
                strokeDasharray="6,12"
                className="opacity-60 dark:opacity-30"
              />
            </svg>

            {/* Week 1: Top Node, Top Text */}
            <div className="absolute left-[8%] top-[40%] -translate-x-1/2 -translate-y-1/2 z-20">
              <RoadNode 
                week={1} 
                active={activeWeek === 1} 
                onClick={() => handleSelectWeek(1)} 
                onMouseEnter={() => handleSelectWeek(1)}
                color="#0060aa" 
                icon={Compass} 
                animate={animate}
              />
            </div>
            <div className="absolute left-[8%] top-[2%] -translate-x-1/2 z-10 w-[220px]">
              <RoadTextBlock 
                week={1} 
                active={activeWeek === 1} 
                revealed={revealedWeeks.includes(1)} 
                align="center" 
              />
            </div>

            {/* Week 2: Bottom Node, Bottom Text */}
            <div className="absolute left-[29%] top-[67.27%] -translate-x-1/2 -translate-y-1/2 z-20">
              <RoadNode 
                week={2} 
                active={activeWeek === 2} 
                onClick={() => handleSelectWeek(2)} 
                onMouseEnter={() => handleSelectWeek(2)}
                color="#ff8b12" 
                icon={Brain} 
                animate={animate}
              />
            </div>
            <div className="absolute left-[29%] top-[76%] -translate-x-1/2 z-10 w-[220px]">
              <RoadTextBlock 
                week={2} 
                active={activeWeek === 2} 
                revealed={revealedWeeks.includes(2)} 
                align="center" 
              />
            </div>

            {/* Week 3: Top Node, Top Text */}
            <div className="absolute left-[50%] top-[40%] -translate-x-1/2 -translate-y-1/2 z-20">
              <RoadNode 
                week={3} 
                active={activeWeek === 3} 
                onClick={() => handleSelectWeek(3)} 
                onMouseEnter={() => handleSelectWeek(3)}
                color="#0060aa" 
                icon={Code} 
                animate={animate}
              />
            </div>
            <div className="absolute left-[50%] top-[2%] -translate-x-1/2 z-10 w-[220px]">
              <RoadTextBlock 
                week={3} 
                active={activeWeek === 3} 
                revealed={revealedWeeks.includes(3)} 
                align="center" 
              />
            </div>

            {/* Week 4: Bottom Node, Bottom Text */}
            <div className="absolute left-[71%] top-[67.27%] -translate-x-1/2 -translate-y-1/2 z-20">
              <RoadNode 
                week={4} 
                active={activeWeek === 4} 
                onClick={() => handleSelectWeek(4)} 
                onMouseEnter={() => handleSelectWeek(4)}
                color="#ff8b12" 
                icon={BookOpen} 
                animate={animate}
              />
            </div>
            <div className="absolute left-[71%] top-[76%] -translate-x-1/2 z-10 w-[220px]">
              <RoadTextBlock 
                week={4} 
                active={activeWeek === 4} 
                revealed={revealedWeeks.includes(4)} 
                align="center" 
              />
            </div>

            {/* Week 5: Top Node, Top Text */}
            <div className="absolute left-[92%] top-[40%] -translate-x-1/2 -translate-y-1/2 z-20">
              <RoadNode 
                week={5} 
                active={activeWeek === 5} 
                onClick={() => handleSelectWeek(5)} 
                onMouseEnter={() => handleSelectWeek(5)}
                color="#0060aa" 
                icon={Trophy} 
                animate={animate}
              />
            </div>
            <div className="absolute left-[92%] top-[2%] -translate-x-1/2 z-10 w-[220px]">
              <RoadTextBlock 
                week={5} 
                active={activeWeek === 5} 
                revealed={revealedWeeks.includes(5)} 
                align="center" 
              />
            </div>
          </div>

          {/* MOBILE VIEW: Winding vertical road and text blocks (col layout) */}
          <div key={`mobile-${animationKey}`} className="flex flex-col gap-10 md:hidden select-none relative px-2">
            {/* The Road background SVG running vertically down the left side */}
            <div className="absolute top-4 bottom-4 left-6 w-8 pointer-events-none z-0">
              <svg viewBox="0 0 20 600" className="w-full h-full overflow-visible" fill="none" preserveAspectRatio="none">
                {/* Track base */}
                <line 
                  x1={10} y1={0} x2={10} y2={600} 
                  className="stroke-slate-100 dark:stroke-slate-900" 
                  strokeWidth={16} 
                  strokeLinecap="round" 
                />
                {/* Edge border */}
                <line 
                  x1={10} y1={0} x2={10} y2={600} 
                  stroke="url(#roadBorderGrad)" 
                  strokeWidth={20} 
                  strokeLinecap="round" 
                  opacity={0.3}
                />
                {/* Laser progress */}
                <line 
                  x1={10} y1={0} x2={10} y2={600} 
                  stroke="url(#roadGlowGrad)" 
                  strokeWidth={4} 
                  strokeLinecap="round" 
                  filter="url(#neonGlow)"
                  className={animate ? "road-glow-path" : "opacity-0"}
                  pathLength={100}
                />
                {/* Dashed divider */}
                <line 
                  x1={10} y1={0} x2={10} y2={600} 
                  stroke="#ffffff" 
                  strokeWidth={1} 
                  strokeDasharray="4,8"
                  className="opacity-70 dark:opacity-30" 
                />
              </svg>
            </div>

            {/* Week Items */}
            {roadmapWeeks.map((item) => {
              const isRevealed = revealedWeeks.includes(item.week)
              const isActive = activeWeek === item.week

              return (
                <div key={item.week} className="flex items-start gap-6 relative z-10">
                  {/* Left Column: Node button */}
                  <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
                    <RoadNode
                      week={item.week}
                      active={isActive}
                      onClick={() => handleSelectWeek(item.week)}
                      onMouseEnter={() => handleSelectWeek(item.week)}
                      color={item.color}
                      icon={item.icon}
                      size="sm"
                      animate={animate}
                    />
                  </div>

                  {/* Right Column: Text Block */}
                  <div className="flex-grow pt-1">
                    <RoadTextBlock
                      week={item.week}
                      active={isActive}
                      revealed={isRevealed}
                      align="left"
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Teachers Introduction Section */}
      <section className="relative px-6 py-24 md:px-10 lg:px-16 bg-slate-50 dark:bg-[#020617]">
        <div className="mx-auto max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white sm:text-4xl tracking-tight">
              Learn From Our Expert Mentors
            </h2>
            <p className="mt-4 text-base text-slate-600 dark:text-slate-400">
              Classes are taught live by dedicated industry educators who focus on logic building and structured practical exercises.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {instructors.map((instructor) => (
              <article
                key={instructor.name}
                className="relative rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#0a0f1c] p-8 shadow-sm hover:shadow-md hover:border-[#ff8b12]/30 transition-all duration-300"
              >
                <div className="flex items-center gap-6 mb-6">
                  {/* Blank Placeholder Circle */}
                  <div className="flex h-20 w-20 items-center justify-center rounded-full border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-[#0f172a] shadow-inner">
                    <User className="h-10 w-10 text-slate-400 dark:text-slate-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                      {instructor.name}
                    </h3>
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#0060aa] dark:text-[#ff8b12] mt-0.5">
                      {instructor.title}
                    </p>
                  </div>
                </div>
                <div className="border-t border-slate-100 dark:border-white/5 pt-4">
                  <p className="text-base leading-relaxed text-slate-500 dark:text-slate-400 italic">
                    {instructor.bio}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Courses Comparison Grid (Apple Mac Comparison Style) */}
      <section id="pricing" className="relative px-6 py-24 md:px-10 lg:px-16 bg-white dark:bg-[#060a13] border-t border-slate-200/60 dark:border-white/5">
        <div className="absolute inset-x-0 bottom-0 h-96 bg-[radial-gradient(circle_at_center,rgba(0,96,170,0.03),transparent_60%)] pointer-events-none" />
        
        <div className="relative mx-auto max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white sm:text-5xl tracking-tight">
              Compare Our{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0060aa] to-[#ff8b12]">
                Course Batches
              </span>
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
              Find the perfect batch size and level of mentorship for your child. Curriculum duration varies by batch level.
            </p>
          </div>

          {/* Apple-style comparison cards grid */}
          <div className="grid gap-10 lg:grid-cols-3 items-stretch mb-20 px-2">
            {courseTiers.map((tier) => (
              <div
                key={tier.id}
                className={`relative flex flex-col rounded-[2.5rem] p-8 ${
                  tier.highlight
                    ? "clay-card-highlight z-10"
                    : "clay-card"
                }`}
              >
                {tier.highlight && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#0060aa] to-[#ff8b12] text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 shadow-md">
                    Most Popular
                  </span>
                )}

                <div className="mb-6">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                    {tier.name}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-450 mt-2 min-h-[40px]">
                    {tier.tagline}
                  </p>
                </div>

                <div className="flex items-baseline gap-2 mb-8">
                  <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                    {tier.price}
                  </span>
                  <span className="text-sm text-slate-500 dark:text-slate-450 font-semibold">
                    / Full Course
                  </span>
                </div>

                {/* Apple-style Quick Specs */}
                <div className="border-t border-b border-slate-200/60 dark:border-white/10 py-6 mb-8 space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-450 font-medium">Duration</span>
                    <span className="text-xs font-bold px-3 py-1 rounded-full clay-tag text-slate-800 dark:text-slate-200">
                      {tier.duration}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-450 font-medium">Batch Size</span>
                    <span className="text-xs font-black px-3 py-1 rounded-full clay-tag text-[#ff8b12] dark:text-orange-400"
                          style={{ backgroundColor: "rgba(255, 139, 18, 0.05)" }}>
                      {tier.batchSize}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-450 font-medium">Mentorship</span>
                    <span className="text-xs font-black px-3 py-1 rounded-full clay-tag text-[#0060aa] dark:text-blue-400"
                          style={{ backgroundColor: "rgba(0, 96, 170, 0.05)" }}>
                      {tier.mentors}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/book-slot?from=courses&tier=${tier.id}`}
                  className={`mt-auto w-full rounded-full py-4 text-center text-sm font-black uppercase tracking-widest ${
                    tier.highlight
                      ? "clay-btn-highlight"
                      : "clay-btn-normal"
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>

          {/* Apple-style Specs Comparison Grid Table */}
          <div className="hidden md:block overflow-hidden rounded-3xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-[#0a0f1c]/70 backdrop-blur-md p-8 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 border-b border-slate-200/60 dark:border-white/10 pb-4">
              Detailed Feature Comparison
            </h3>
            
            <div className="grid grid-cols-4 gap-6 items-center text-sm">
              {/* Table Header */}
              <div className="font-bold text-slate-400 uppercase tracking-wider">Features</div>
              <div className="font-bold text-slate-900 dark:text-white text-center">Basic Batch</div>
              <div className="font-bold text-[#ff8b12] text-center">Premium Batch</div>
              <div className="font-bold text-[#0060aa] dark:text-blue-400 text-center">Elite Batch</div>

              <div className="col-span-4 border-t border-slate-200/40 dark:border-white/5 my-2" />

              {/* Row: Fees */}
              <div className="font-semibold text-slate-700 dark:text-slate-355">Fee</div>
              <div className="text-center font-bold text-slate-900 dark:text-white">₹3,800</div>
              <div className="text-center font-bold text-[#ff8b12]">₹7,500</div>
              <div className="text-center font-bold text-[#0060aa] dark:text-blue-400">₹25,000</div>

              <div className="col-span-4 border-t border-slate-200/40 dark:border-white/5 my-2" />

              {/* Row: Duration */}
              <div className="font-semibold text-slate-700 dark:text-slate-355">Duration</div>
              <div className="text-center font-medium text-slate-600 dark:text-slate-300">25 Days</div>
              <div className="text-center font-bold text-[#ff8b12]">30 Days</div>
              <div className="text-center font-bold text-[#0060aa] dark:text-blue-400">30 Days</div>

              <div className="col-span-4 border-t border-slate-200/40 dark:border-white/5 my-2" />

              {/* Row: Mentorship */}
              <div className="font-semibold text-slate-700 dark:text-slate-355">Mentors</div>
              <div className="text-center font-medium text-slate-600 dark:text-slate-300">1 Mentor</div>
              <div className="text-center font-black text-[#ff8b12]">2 Dedicated Mentors</div>
              <div className="text-center font-medium text-slate-600 dark:text-slate-300">1 Mentor</div>

              <div className="col-span-4 border-t border-slate-200/40 dark:border-white/5 my-2" />

              {/* Row: Batch Size */}
              <div className="font-semibold text-slate-700 dark:text-slate-355">Batch Size</div>
              <div className="text-center font-medium text-slate-600 dark:text-slate-300">30 Students</div>
              <div className="text-center font-medium text-slate-600 dark:text-slate-300">20 Students</div>
              <div className="text-center font-black text-[#0060aa] dark:text-blue-400">3 Students (Micro)</div>

              <div className="col-span-4 border-t border-slate-200/40 dark:border-white/5 my-2" />

              {/* Row: Live Sessions */}
              <div className="font-semibold text-slate-700 dark:text-slate-355">Live Sessions</div>
              <div className="text-center font-medium text-slate-600 dark:text-slate-300">Daily Live Group</div>
              <div className="text-center font-medium text-slate-600 dark:text-slate-300">Daily Live Group</div>
              <div className="text-center font-bold text-slate-900 dark:text-white">1-on-1 Personalized / Micro</div>

              <div className="col-span-4 border-t border-slate-200/40 dark:border-white/5 my-2" />

              {/* Row: Support */}
              <div className="font-semibold text-slate-700 dark:text-slate-355">Query Support</div>
              <div className="text-center font-medium text-slate-600 dark:text-slate-300">Group Q&A</div>
              <div className="text-center font-bold text-slate-900 dark:text-white">Priority Discord</div>
              <div className="text-center font-black text-[#ff8b12]">Direct WhatsApp & Call</div>

              <div className="col-span-4 border-t border-slate-200/40 dark:border-white/5 my-2" />

              {/* Row: Project Portfolio */}
              <div className="font-semibold text-slate-700 dark:text-slate-355">Project Feedback</div>
              <div className="text-center font-medium text-slate-600 dark:text-slate-300">Digital Submission</div>
              <div className="text-center font-medium text-slate-600 dark:text-slate-300">1-on-1 Detailed Video</div>
              <div className="text-center font-bold text-slate-900 dark:text-white">Live Code Review & Portfolio Build</div>

              <div className="col-span-4 border-t border-slate-200/40 dark:border-white/5 my-2" />

              {/* Row: Certification */}
              <div className="font-semibold text-slate-700 dark:text-slate-355">Certification</div>
              <div className="text-center font-medium text-slate-600 dark:text-slate-300">Skillyug Standard</div>
              <div className="text-center font-medium text-slate-600 dark:text-slate-300">Skillyug Gold Star</div>
              <div className="text-center font-bold text-slate-900 dark:text-white">Skillyug Elite Honors</div>

              <div className="col-span-4 border-t border-slate-200/40 dark:border-white/5 my-2" />

              {/* Row: Extra Classes */}
              <div className="font-semibold text-slate-700 dark:text-slate-355">Doubt Sessions</div>
              <div className="text-center text-slate-400">None</div>
              <div className="text-center font-medium text-slate-600 dark:text-slate-300">2 Extra Classes</div>
              <div className="text-center font-bold text-slate-900 dark:text-white">Unlimited 1-on-1</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-100/50 dark:bg-[#0a0f1c]/50 px-6 py-24 text-center sm:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.03),transparent_34%)]" />
        <div className="relative mx-auto flex max-w-4xl flex-col items-center">
          <div>
            <Image
              src="/skillyug-optimized.svg"
              alt="Skillyug"
              width={520}
              height={220}
              className="h-auto w-64 sm:w-80 md:w-[420px]"
            />
          </div>
          <nav className="mt-20 flex flex-wrap items-center justify-center gap-x-10 gap-y-5 text-xl font-bold text-slate-600 dark:text-slate-400 sm:text-2xl">
            <Link href="/" className="transition hover:text-slate-900 dark:hover:text-white">Home</Link>
            <Link href="/courses" className="transition hover:text-slate-900 dark:hover:text-white">Courses</Link>
            <Link href="/blog" className="transition hover:text-slate-900 dark:hover:text-white">Blog</Link>
          </nav>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-7 text-base font-medium text-slate-500 dark:text-slate-450 sm:text-lg">
            <Link href="/refund-policy" className="transition hover:text-slate-805 dark:hover:text-slate-300">Refund Policy</Link>
            <span>|</span>
            <Link href="/terms-and-conditions" className="transition hover:text-slate-805 dark:hover:text-slate-300">Terms & Conditions</Link>
          </div>
          <p className="mt-16 text-lg font-medium uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500 sm:text-2xl">
            © 2026 Skillyug<br />All Rights Reserved.
          </p>
        </div>
      </footer>
    </main>
  )
}
