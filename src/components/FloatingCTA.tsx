"use client"

import React, { useState, useEffect, useRef } from "react"
import { Calendar } from "lucide-react"
import Link from "next/link"

export default function FloatingCTA() {
  const [isVisible, setIsVisible] = useState(false)
  const [isOverlapping, setIsOverlapping] = useState(false)
  const buttonRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      // Show the button after scrolling down 300px
      if (window.scrollY > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }

      // Check for overlap with main page elements
      if (buttonRef.current) {
        const buttonRect = buttonRef.current.getBoundingClientRect()
        
        // Find all significant elements that the button might overlap with (cards, text, boxes, images, etc.)
        const elements = document.querySelectorAll(
          '.card, .workflow-card, .feature-card, .grid-item, .testimonial-card, .glass-panel, [class*="bg-[#0f172a]"], ' + // Cards and boxes
          'p, h1, h2, h3, h4, h5, h6, li, ' + // Text blocks
          'img, svg' // Media
        )
        let overlapping = false

        elements.forEach(el => {
          // Optimization: Skip elements that are obviously too high up or too far left to overlap the fixed CTA
          // This saves computation
          const elRect = el.getBoundingClientRect()

          // Strict bounding box intersection check with a small threshold to avoid triggering on tiny margins
          if (
            buttonRect.top < elRect.bottom &&
            buttonRect.bottom > elRect.top &&
            buttonRect.left < elRect.right &&
            buttonRect.right > elRect.left
          ) {
            // Further optimization: skip tiny decorative elements (like empty divs)
            if (elRect.width > 20 && elRect.height > 10) {
              overlapping = true
            }
          }
        })
        
        setIsOverlapping(overlapping)
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    // Initial check
    handleScroll()
    
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div
      ref={buttonRef}
      className={`fixed right-4 bottom-6 md:right-6 md:bottom-24 z-50 transition-all duration-500 transform origin-right ${
        isVisible 
          ? (isOverlapping ? "translate-y-2.5 opacity-100" : "translate-y-0 opacity-100") 
          : "translate-y-10 opacity-0 pointer-events-none"
      } ${isOverlapping ? "scale-[0.8]" : "scale-100"}`}
    >
      <Link
        href="/book-demo"
        className={`group relative flex items-center transition-all duration-500 bg-[#0f172a] border border-blue-500/30 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:border-blue-400 hover:shadow-[0_0_25px_rgba(59,130,246,0.3)] hover:-translate-y-1 ${
          isOverlapping ? "px-4 py-3 gap-2" : "px-6 py-3.5 gap-3"
        }`}
        aria-label="Book Free Demo"
      >
        {/* Subtle breathing glow */}
        <div className="absolute inset-0 rounded-full bg-blue-500/5 animate-[pulse_4s_ease-in-out_infinite]" />
        
        <div className={`relative flex items-center justify-center rounded-full bg-blue-500/20 text-blue-400 group-hover:bg-blue-500/30 transition-colors ${
          isOverlapping ? "w-7 h-7" : "w-8 h-8"
        }`}>
          <Calendar className={isOverlapping ? "w-3.5 h-3.5" : "w-4 h-4"} />
        </div>
        
        <span className="relative font-semibold text-slate-200 group-hover:text-white transition-colors tracking-wide overflow-hidden whitespace-nowrap">
          <span className={`block transition-all duration-200 ease-in-out ${isOverlapping ? "text-xs" : "text-sm"}`}>
            {isOverlapping ? "Book your Demo" : "Book your Demo"}
          </span>
        </span>
      </Link>
    </div>
  )
}
