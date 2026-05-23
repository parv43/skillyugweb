"use client"

import React, { useState, useEffect } from "react"
import { Menu, X, Sun, Moon } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useAccessControl } from "@/hooks/useAccessControl"
import Avatar from "boring-avatars"


export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  const pathname = usePathname()
  const rafRef = React.useRef<number | null>(null)
  
  // Use the shared access control hook
  const { isLoggedIn, hasAccess: hasMyBatchAccess, userId, userEmail } = useAccessControl()

  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [mounted, setMounted] = useState(false)

  // Initialize theme on mount to match document class to prevent SSR hydration mismatches
  useEffect(() => {
    setMounted(true)
    const hasDarkClass = document.documentElement.classList.contains("dark")
    setTheme(hasDarkClass ? "dark" : "light")
  }, [])

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light"
    setTheme(nextTheme)
    localStorage.setItem("theme", nextTheme)
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  const renderThemeToggle = () => {
    if (!mounted) return <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10" />

    return (
      <button
        onClick={toggleTheme}
        className="relative w-10 h-10 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300 group overflow-hidden cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.02)]"
        aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      >
        <span className="sr-only">Toggle dark mode</span>
        <div className="relative w-5 h-5 flex items-center justify-center">
          <Sun 
            className={`w-5 h-5 text-yellow-400 absolute transition-all duration-500 transform-gpu ${
              theme === "dark" 
                ? "rotate-90 scale-0 opacity-0" 
                : "rotate-0 scale-100 opacity-100"
            }`}
          />
          <Moon 
            className={`w-5 h-5 text-indigo-400 absolute transition-all duration-500 transform-gpu ${
              theme === "dark" 
                ? "rotate-0 scale-100 opacity-100" 
                : "-rotate-90 scale-0 opacity-0"
            }`}
          />
        </div>
      </button>
    )
  }

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
    <header 
      className={`animate-slide-down fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-black/5 backdrop-blur-md border-b border-white/5 py-4 shadow-lg" 
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
          <ul className="flex gap-8 items-center bg-white/5 px-6 py-2.5 rounded-full border border-white/5 backdrop-blur-sm shadow-[inset_0_0_10px_rgba(255,255,255,0.02)]">
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
                    className={`text-sm font-medium transition-all ${
                      active ? "text-white text-shadow-[0_0_10px_rgba(255,255,255,0.8)]" : "text-slate-300 hover:text-white hover:text-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
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
          {renderThemeToggle()}
          {isLoggedIn ? (
            <Link 
              href="/profile" 
              className="flex items-center justify-center rounded-full border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:scale-105 transition-all duration-300"
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
                className="text-sm font-semibold text-slate-300 hover:text-white transition-colors"
              >
                Log in
              </Link>
              <Link 
                href="/signup?role=parent" 
                className="px-6 py-2.5 rounded-full text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:shadow-[0_0_25px_rgba(139,92,246,0.6)] hover:scale-105 transition-all duration-300 block border border-white/10"
              >
                Sign up as Parent
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-controls="mobile-menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      <div 
        id="mobile-menu"
        className={`md:hidden absolute top-full left-0 w-full bg-[#050a1e] border-b border-white/10 shadow-2xl transition-all duration-300 overflow-y-auto ${
          mobileMenuOpen ? "max-h-[85vh] opacity-100 py-4" : "max-h-0 opacity-0 py-0"
        }`}
      >
        <nav aria-label="Mobile Navigation">
          <ul className="flex flex-col px-6 gap-2">
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
                    className={`block text-base font-medium transition-colors py-3 px-4 rounded-lg ${
                      active ? "text-white bg-white/10" : "text-slate-300 hover:text-white hover:bg-white/5"
                    }`}
                    aria-label={link.ariaLabel || `Go to ${link.name}`}
                    onClick={(e: React.MouseEvent) => handleNavClick(e, link.href)}
                  >
                    {link.name}
                  </Link>
                </li>
              );
            })}
            <li className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
              <span className="text-sm font-medium text-slate-300">Theme</span>
              {renderThemeToggle()}
            </li>
            <li className="mt-4 pt-4 border-t border-white/10">
              {isLoggedIn ? (
                <Link 
                  href="/profile" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-3 py-3 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 shadow-[0_0_15px_rgba(255,255,255,0.05)] border border-white/10 transition-colors"
                  aria-label="View Profile"
                >
                  <Avatar
                    size={32}
                    name={userEmail || userId || "User"}
                    variant="beam"
                    colors={["#92A1C6", "#146A7C", "#F0AB3D", "#C271B4", "#C20D90"]}
                  />
                  <span className="text-white font-bold text-base">My Profile</span>
                </Link>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link 
                    href="/login" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-3 rounded-lg text-base font-bold text-slate-300 bg-slate-800/50 hover:text-white hover:bg-slate-700/50 transition-colors border border-white/5"
                  >
                    Log in
                  </Link>
                  <Link 
                    href="/signup?role=parent" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-3 rounded-lg text-base font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-[0_0_15px_rgba(59,130,246,0.4)] block border border-white/10"
                  >
                    Sign up as Parent
                  </Link>
                </div>
              )}
            </li>
            <li className="mt-2">
              <Link 
                href="/#contact" 
                onClick={(e: React.MouseEvent) => handleNavClick(e, "/#contact")}
                className="w-full text-center py-3 rounded-lg text-base font-bold text-blue-300 border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 transition-colors block"
                aria-label="Contact Us"
              >
                Contact Us
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}
