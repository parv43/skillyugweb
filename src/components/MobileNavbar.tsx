"use client"

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Sparkles, MessageSquare, BookOpen } from "lucide-react"

export default function MobileNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState("home")
  const [isIPhone, setIsIPhone] = useState(false)
  const pathname = usePathname()
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsIPhone(/iPhone/i.test(navigator.userAgent))
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)

      rafRef.current = requestAnimationFrame(() => {
        const isScrolled = window.scrollY > 100
        setScrolled((prev) => (prev === isScrolled ? prev : isScrolled))
      })
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll() // Initial check

    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  // Detect active section on scroll for landing page
  useEffect(() => {
    if (pathname !== "/") {
      if (pathname.startsWith("/blog")) {
        setActiveSection("blogs")
      } else {
        setActiveSection("")
      }
      return
    }

    const observerOptions = {
      root: null,
      rootMargin: "-25% 0px -45% 0px",
      threshold: 0.1,
    }

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id
          if (id === "testimonials") {
            setActiveSection("testimonials")
          } else if (id === "ask-ai-mobile" || id === "ask-ai-desktop") {
            setActiveSection("ask-ai")
          }
        }
      })
    }

    const observer = new IntersectionObserver(handleIntersection, observerOptions)

    const askAiEl = document.getElementById("ask-ai-mobile") || document.getElementById("ask-ai-desktop")
    const testimonialsEl = document.getElementById("testimonials")

    if (askAiEl) observer.observe(askAiEl)
    if (testimonialsEl) observer.observe(testimonialsEl)

    const handleScrollTop = () => {
      if (window.scrollY < 150) {
        setActiveSection("home")
      }
    }

    window.addEventListener("scroll", handleScrollTop, { passive: true })
    handleScrollTop()

    return () => {
      observer.disconnect()
      window.removeEventListener("scroll", handleScrollTop)
    }
  }, [pathname])

  const handleNavClick = (e: React.MouseEvent, href: string, targetId: string) => {
    if (pathname === "/" && href.startsWith("/#")) {
      e.preventDefault()
      const element = document.getElementById(targetId)
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" })
        setActiveSection(href.replace("/#", "").replace("-mobile", "").replace("-desktop", ""))
      }
    } else if (pathname === "/" && href === "/") {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: "smooth" })
      setActiveSection("home")
    } else if (href.startsWith("/#")) {
      // If we are on another page, let the navigation proceed normally
      // But store the pending scroll so it scrolls to target on load
      sessionStorage.setItem("pendingScroll", targetId)
    }
  }

  const navItems = [
    { name: "Home", id: "home", href: "/", icon: Home },
    { name: "Ask AI", id: "ask-ai", href: "/#ask-ai-mobile", targetId: "ask-ai-mobile", icon: Sparkles },
    { name: "Testimonials", id: "testimonials", href: "/#testimonials", targetId: "testimonials", icon: MessageSquare },
    { name: "Blogs", id: "blogs", href: "/blog", icon: BookOpen },
  ]

  if (isIPhone) {
    return (
      <div className="fixed bottom-[calc(8px+env(safe-area-inset-bottom,0px))] left-0 right-0 z-50 flex justify-center md:hidden pointer-events-none">
        <div
          className={`pointer-events-auto w-[90%] transition-[max-width,padding,background-color,border-color,box-shadow,opacity,transform] duration-500 ease-out transform-gpu ${
            scrolled
              ? "max-w-[340px] py-2.5 px-4 bg-white/75 dark:bg-[#0f172a]/75 backdrop-blur-lg border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] scale-100"
              : "max-w-[280px] py-1.5 px-3 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/40 dark:border-slate-800/40 rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.06)] scale-90 opacity-95"
          }`}
        >
          <nav className="flex items-center justify-between w-full">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeSection === item.id || (item.id === "blogs" && pathname.startsWith("/blog"))
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href, item.targetId || "")}
                  className="relative flex items-center justify-center transition-all duration-300 cursor-pointer"
                >
                  {isActive ? (
                    <div
                      className={`flex items-center gap-1.5 text-blue-600 dark:text-blue-400 bg-blue-500/15 dark:bg-blue-400/15 rounded-full transition-all duration-300 transform-gpu scale-105 ${
                        scrolled ? "py-1.5 px-3.5 text-sm" : "py-1 px-2.5 text-xs"
                      }`}
                    >
                      <Icon className={scrolled ? "w-4 h-4 animate-[pulse_2s_infinite]" : "w-3.5 h-3.5"} />
                      <span className="font-bold tracking-tight">{item.name}</span>
                    </div>
                  ) : (
                    <div
                      className={`flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all rounded-full p-2`}
                    >
                      <Icon className={scrolled ? "w-5 h-5" : "w-4 h-4"} />
                    </div>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`fixed bottom-[calc(8px+env(safe-area-inset-bottom,0px))] left-1/2 -translate-x-1/2 z-50 w-[90%] md:hidden transition-all duration-500 ease-out transform-gpu ${
        scrolled
          ? "max-w-[340px] py-2.5 px-4 bg-white/75 dark:bg-[#0f172a]/75 backdrop-blur-lg border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] scale-100"
          : "max-w-[280px] py-1.5 px-3 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/40 dark:border-slate-800/40 rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.06)] scale-90 opacity-95"
      }`}
    >
      <nav className="flex items-center justify-between w-full">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeSection === item.id || (item.id === "blogs" && pathname.startsWith("/blog"))
          
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={(e) => handleNavClick(e, item.href, item.targetId || "")}
              className="relative flex items-center justify-center transition-all duration-300 cursor-pointer"
            >
              {isActive ? (
                <div
                  className={`flex items-center gap-1.5 text-blue-600 dark:text-blue-400 bg-blue-500/15 dark:bg-blue-400/15 rounded-full transition-all duration-300 transform-gpu scale-105 ${
                    scrolled ? "py-1.5 px-3.5 text-sm" : "py-1 px-2.5 text-xs"
                  }`}
                >
                  <Icon className={scrolled ? "w-4 h-4 animate-[pulse_2s_infinite]" : "w-3.5 h-3.5"} />
                  <span className="font-bold tracking-tight">{item.name}</span>
                </div>
              ) : (
                <div
                  className={`flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all rounded-full p-2`}
                >
                  <Icon className={scrolled ? "w-5 h-5" : "w-4 h-4"} />
                </div>
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
