"use client"

import React, { useState, useEffect } from "react"
import { Menu, X, Sun, Moon } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useAccessControl } from "@/hooks/useAccessControl"
import Avatar from "boring-avatars"
import MobileNavbar from "./MobileNavbar"


export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [theme, setTheme] = useState<string | null>(null)
  const [isIPhone, setIsIPhone] = useState(false)

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark")
    setTheme(isDark ? "dark" : "light")
    if (typeof window !== "undefined") {
      setIsIPhone(/iPhone/i.test(navigator.userAgent))
    }
  }, [])

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark"
    setTheme(nextTheme)
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }
  
  const pathname = usePathname()
  const rafRef = React.useRef<number | null>(null)
  
  // Use the shared access control hook
  const { isLoggedIn, hasAccess: hasMyBatchAccess, userId, userEmail } = useAccessControl()

  useEffect(() => {
    // ✅ Use requestAnimationFrame for optimal performance (syncs with 60fps)
    const handleScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      
      rafRef.current = requestAnimationFrame(() => {
        const isScrolled = window.scrollY > 60
        // Only update state if value actually changed (prevent unnecessary re-renders)
        setScrolled((previous) => (previous === isScrolled ? previous : isScrolled))
      })
    }
    
    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll() // Initial check
    
    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  // Handle smart scrolling for "Ask AI" specifically
  const getSmartHash = (targetHash: string) => {
    if (targetHash === "ask-ai") {
      return window.innerWidth < 768 ? "ask-ai-mobile" : "ask-ai-desktop"
    }
    return targetHash
  }

  // Handle hash navigation after page load (for cross-page links)
  useEffect(() => {
    const handleHashScroll = () => {
      const pendingScroll = sessionStorage.getItem("pendingScroll")
      const hash = window.location.hash.replace("#", "")
      
      let targetHash = null
      if (pendingScroll) {
        targetHash = pendingScroll
        sessionStorage.removeItem("pendingScroll")
      } else if (hash === "ask-ai") {
        targetHash = getSmartHash(hash)
      }

      if (targetHash) {
        // Delay to ensure the target section is rendered and layout has settled
        setTimeout(() => {
          const element = document.getElementById(targetHash)
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" })
          }
        }, 400)
      }
    }

    handleHashScroll()
    window.addEventListener('hashchange', handleHashScroll)
    return () => window.removeEventListener('hashchange', handleHashScroll)
  }, [pathname])

  // Close mobile menu and handle smooth scroll for hash links
  const handleNavClick = (e: React.MouseEvent, href: string) => {
    setMobileMenuOpen(false)

    // Handle hash links
    if (href.includes("#")) {
      const hash = href.split("#")[1]
      const targetPath = href.split("#")[0] || "/"
      
      if (pathname === targetPath) {
        // We're already on the target page, scroll immediately
        e.preventDefault()
        const smartHash = getSmartHash(hash)
        const element = document.getElementById(smartHash)
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" })
        }
      } else {
        // Cross-page navigation: store the intended hash to scroll after load
        sessionStorage.setItem("pendingScroll", getSmartHash(hash))
      }
    }
  }

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Bootcamp", href: "/bootcamp" },
    { name: "Ask AI", href: "/#ask-ai", ariaLabel: "Ask questions about the AI bootcamp" },
    { name: "Testimonials", href: "/#testimonials" },
    { name: "Blog", href: "/blog" },
  ]
  const visibleNavLinks = hasMyBatchAccess
    ? [...navLinks.slice(0, 1), { name: "My Batch", href: "/my-batch" }, ...navLinks.slice(1)]
    : navLinks

  return (
    <>
      <header 
        className={`animate-slide-down fixed top-0 inset-x-0 z-50 duration-300 ${
          isIPhone 
            ? "transition-[padding,background-color,border-color,box-shadow]" 
            : "transition-all"
        } ${
          scrolled 
            ? "bg-background/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 py-4 shadow-sm" 
            : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center group transition-all" aria-label="Skillyug Home">
            <Image src="/skillyug-optimized.svg" alt="Skillyug Logo" width={200} height={80} priority className="h-14 md:h-20 w-auto object-contain scale-[1.8] transform-gpu hover:scale-[1.9] transition-transform duration-300" />
          </Link>
  
          {/* Desktop Navigation */}
          <nav aria-label="Main Navigation" className="hidden md:block">
            <ul className="flex gap-8 items-center bg-slate-100/80 dark:bg-slate-900/85 px-6 py-2.5 rounded-full border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-sm shadow-sm">
              {visibleNavLinks.map((link) => {
                const active = link.name === "Blog" 
                  ? pathname.startsWith("/blog") 
                  : link.name === "My Batch"
                    ? pathname === "/my-batch"
                  : link.name === "Home"
                    ? pathname === "/"
                    : link.href === pathname;
                
                return (
                  <li key={link.name}>
                    <Link 
                      href={link.href} 
                      onClick={(e: React.MouseEvent) => handleNavClick(e, link.href)}
                      className={`text-sm font-semibold transition-all ${
                        active ? "text-slate-900 dark:text-white" : "text-slate-600 hover:text-slate-900 dark:text-slate-350 dark:hover:text-white"
                      }`}
                      aria-label={link.ariaLabel || `Go to ${link.name}`}
                    >
                      {link.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
  
          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            {theme ? (
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 hover:scale-105 active:scale-95 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white shadow-sm transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label={theme === "dark" ? "Switch to day mode" : "Switch to night mode"}
              >
                {theme === "dark" ? (
                  <Sun size={18} className="text-amber-500 transition-transform duration-500 hover:rotate-45" />
                ) : (
                  <Moon size={18} className="text-indigo-600 transition-transform duration-500 hover:rotate-12" />
                )}
              </button>
            ) : (
              <div className="w-[40px] h-[40px]" />
            )}
  
            {isLoggedIn ? (
              <Link 
                href="/profile" 
                className="flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300"
                aria-label="View Profile"
              >
                <Avatar
                  size={40}
                  name={userEmail || userId || "User"}
                  variant="beam"
                  colors={["#92A1C6", "#146A7C", "#F0AB3D", "#C271B4", "#C20D90"]}
                />
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <Link 
                  href="/login" 
                  className="text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
                >
                  Log in
                </Link>
                <Link 
                  href="/signup" 
                  className="px-6 py-2.5 rounded-full text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-[0_4px_15px_rgba(59,130,246,0.35)] hover:shadow-[0_6px_20px_rgba(139,92,246,0.45)] hover:scale-105 transition-all duration-300 block border border-blue-500/20"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
  
          {/* Mobile Actions */}
          <div className="flex md:hidden items-center gap-2">
            {theme ? (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 shadow-sm transition-all duration-300 cursor-pointer focus:outline-none"
                aria-label={theme === "dark" ? "Switch to day mode" : "Switch to night mode"}
              >
                {theme === "dark" ? (
                  <Sun size={16} className="text-amber-500" />
                ) : (
                  <Moon size={16} className="text-indigo-600" />
                )}
              </button>
            ) : (
              <div className="w-[36px] h-[36px]" />
            )}
  
            {isLoggedIn ? (
              <Link 
                href="/profile" 
                className="flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 shadow-sm hover:scale-105 transition-all duration-300"
                aria-label="View Profile"
              >
                <Avatar
                  size={32}
                  name={userEmail || userId || "User"}
                  variant="beam"
                  colors={["#92A1C6", "#146A7C", "#F0AB3D", "#C271B4", "#C20D90"]}
                />
              </Link>
            ) : (
              <Link 
                href="/login" 
                className="text-xs font-bold text-slate-650 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors shadow-sm"
              >
                Log in
              </Link>
            )}
          </div>
        </div>
      </header>
  
      <MobileNavbar />
    </>
  )
}
