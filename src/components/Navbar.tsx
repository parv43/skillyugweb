"use client"

import React, { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [session, setSession] = useState<any>(null)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60)
    }
    
    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll() // Initial check

    // Check user session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    
    return () => {
      window.removeEventListener("scroll", handleScroll)
      subscription.unsubscribe()
    }
  }, [])

  // Close mobile menu and handle smooth scroll for hash links
  const handleNavClick = (e: React.MouseEvent, href: string) => {
    setMobileMenuOpen(false)

    // Handle smooth scroll for same-page hash links
    if (pathname === "/" && href.includes("#")) {
      const hash = href.split("#")[1]
      const element = document.getElementById(hash)
      if (element) {
        e.preventDefault()
        element.scrollIntoView({ behavior: "smooth" })
      }
    }
  }

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Curriculum", href: "/#curriculum" },
    { name: "Projects", href: "/#projects" },
    { name: "Ask AI", href: "/#ask-ai", ariaLabel: "Ask questions about the AI bootcamp" },
    { name: "Testimonials", href: "/#testimonials" },
    { name: "Blog", href: "/blog" },
  ]

  return (
    <header 
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-[rgba(5,10,30,0.85)] backdrop-blur-[10px] border-b border-white/5 py-4 shadow-lg" 
          : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center group bg-black/30 p-1.5 px-3 rounded-xl border border-white/10 shadow-2xl backdrop-blur-lg overflow-hidden" aria-label="Skillyug Home">
          <img src="/skillyug.png" alt="Skillyug Logo" className="h-8 md:h-11 object-contain scale-[2.4] transform-gpu" />
        </Link>

        {/* Desktop Navigation */}
        <nav aria-label="Main Navigation" className="hidden md:block">
          <ul className="flex gap-8 items-center bg-white/5 px-6 py-2.5 rounded-full border border-white/5 backdrop-blur-sm shadow-[inset_0_0_10px_rgba(255,255,255,0.02)]">
            {navLinks.map((link) => {
              const active = link.name === "Blog" 
                ? pathname.startsWith("/blog") 
                : link.name === "Home" 
                  ? pathname === "/" 
                  : false;
              
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
          {session ? (
            <Link 
              href="/profile" 
              className="px-6 py-2.5 rounded-full text-sm font-bold text-white bg-slate-800/80 hover:bg-slate-700/80 shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:scale-105 transition-all duration-300 block border border-white/10"
              aria-label="View Profile"
            >
              My Profile
            </Link>
          ) : (
            <Link 
              href="/signup" 
              className="px-6 py-2.5 rounded-full text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:shadow-[0_0_25px_rgba(139,92,246,0.6)] hover:scale-105 transition-all duration-300 block border border-white/10"
              aria-label="Book Free Demo"
            >
              Book Free Demo
            </Link>
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
            {navLinks.map((link) => {
              const active = link.name === "Blog" 
                ? pathname.startsWith("/blog") 
                : link.name === "Home" 
                  ? pathname === "/" 
                  : false;
                  
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
            <li className="mt-4 pt-4 border-t border-white/10">
              {session ? (
                <Link 
                  href="/profile" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-3 rounded-lg text-base font-bold text-white bg-slate-800/80 hover:bg-slate-700/80 shadow-[0_0_15px_rgba(255,255,255,0.05)] block border border-white/10 transition-colors"
                  aria-label="View Profile"
                >
                  My Profile
                </Link>
              ) : (
                <Link 
                  href="/signup" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-3 rounded-lg text-base font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-[0_0_15px_rgba(59,130,246,0.4)] block border border-white/10"
                  aria-label="Book Free Demo"
                >
                  Book Free Demo
                </Link>
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
