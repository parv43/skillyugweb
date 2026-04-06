"use client"

import React, { useState, useEffect, useRef } from "react"
import { Calendar } from "lucide-react"
import Link from "next/link"

export default function FloatingCTA() {
  const [isVisible, setIsVisible] = useState(false)
  const [isOverlapping, setIsOverlapping] = useState(false)
  const buttonRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number | null>(null)
  const observedElementsRef = useRef<Element[]>([])

  useEffect(() => {
    const refreshObservedElements = () => {
      observedElementsRef.current = Array.from(
        document.querySelectorAll(
          '.card, .workflow-card, .feature-card, .grid-item, .testimonial-card, .glass-panel, p, h1, h2, h3, h4, h5, h6, li, img, svg'
        )
      )
    }

    const handleScroll = () => {
      if (animationFrameRef.current !== null) {
        return
      }

      animationFrameRef.current = window.requestAnimationFrame(() => {
        animationFrameRef.current = null

        const nextVisible = window.scrollY > 300
        setIsVisible((previous) => (previous === nextVisible ? previous : nextVisible))

        if (!nextVisible || !buttonRef.current) {
          setIsOverlapping((previous) => (previous ? false : previous))
          return
        }

        const buttonRect = buttonRef.current.getBoundingClientRect()
        let overlapping = false

        for (const element of observedElementsRef.current) {
          if (
            element === buttonRef.current ||
            !(element instanceof HTMLElement) ||
            buttonRef.current.contains(element)
          ) {
            continue
          }

          const elRect = element.getBoundingClientRect()
          if (
            elRect.width > 20 &&
            elRect.height > 10 &&
            buttonRect.top < elRect.bottom &&
            buttonRect.bottom > elRect.top &&
            buttonRect.left < elRect.right &&
            buttonRect.right > elRect.left
          ) {
            overlapping = true
            break
          }
        }

        setIsOverlapping((previous) => (previous === overlapping ? previous : overlapping))
      })
    }

    const handleResize = () => {
      refreshObservedElements()
      handleScroll()
    }

    refreshObservedElements()
    window.addEventListener("scroll", handleScroll, { passive: true })
    window.addEventListener("resize", handleResize)
    handleScroll()
    
    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", handleResize)
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
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
        aria-label="Book Your Demo"
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
