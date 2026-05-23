"use client"

import React, { useState, useEffect } from "react"
import { Calendar, Clock, Sparkles } from "lucide-react"

// FlipUnit represents a single flipping digit card
const FlipUnit = ({ digit }: { digit: string }) => {
  const [currentDigit, setCurrentDigit] = useState(digit)
  const [previousDigit, setPreviousDigit] = useState(digit)
  const [isFlipping, setIsFlipping] = useState(false)

  useEffect(() => {
    if (digit !== currentDigit) {
      setPreviousDigit(currentDigit)
      setCurrentDigit(digit)
      setIsFlipping(true)
    }
  }, [digit, currentDigit])

  const handleAnimationEnd = () => {
    setIsFlipping(false)
    setPreviousDigit(digit)
  }

  return (
    <div className="flip-unit">
      {/* Background bottom half (shows current/new digit) */}
      <div className="flip-card flip-card__bottom">
        <div className="flip-card-inner-text">{currentDigit}</div>
      </div>
      {/* Background top half (shows previous/old digit) */}
      <div className="flip-card flip-card__top">
        <div className="flip-card-inner-text">{previousDigit}</div>
      </div>
      {/* Flipper card that rotates */}
      <div
        className={`flipper ${isFlipping ? "is-flipping" : ""}`}
        onAnimationEnd={handleAnimationEnd}
      >
        <div className="flip-card flipper__top">
          <div className="flip-card-inner-text">{previousDigit}</div>
        </div>
        <div className="flip-card flipper__bottom">
          <div className="flip-card-inner-text">{currentDigit}</div>
        </div>
      </div>
    </div>
  )
}

export default function FirstClassCountdown() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const targetDate = new Date("2026-05-28T13:00:00+05:30").getTime()

    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const difference = targetDate - now

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true })
        return
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      setTimeLeft({ days, hours, minutes, seconds, isExpired: false })
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [])

  if (!mounted) {
    return (
      <div className="w-full rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-5 md:p-6 animate-pulse min-h-[90px]"></div>
    )
  }

  // Create Google Calendar event URL:
  const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Skillyug+Summer+AI+Bootcamp+-+First+Class&dates=20260528T073000Z/20260528T090000Z&details=Welcome+to+the+first+live+session+of+the+Skillyug+Summer+AI+Bootcamp!+Please+access+the+live+link+from+your+My+Batch+Workspace.&sf=true&output=xml`

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 bg-white/[0.02] backdrop-blur-xl p-5 md:p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] hover:border-white/20 transition-all duration-300">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        
        {/* Left Block: Info & Button */}
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="hidden lg:flex p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)] flex-shrink-0">
            <Calendar className="w-6 h-6 text-blue-300" />
          </div>
          <div className="flex flex-col items-center sm:items-start gap-3">
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <Sparkles className="w-4 h-4 text-purple-300 animate-pulse" />
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-300">
                  Live Cohort Starts Soon
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white mt-1">
                {timeLeft.isExpired ? "First Class has started!" : "First Class starts in"}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">
                Thursday, 28th May at 1:00 PM IST
              </p>
            </div>
            
            {/* Calendar Button (Desktop: aligned left; Mobile: hidden here, shown at bottom) */}
            <div className="hidden sm:block">
              {timeLeft.isExpired ? (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-green-500/30 bg-green-500/10 text-green-300 text-[10px] font-bold uppercase tracking-wider animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping" />
                  Live Now
                </div>
              ) : (
                <a
                  href={calendarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-[10px] font-bold uppercase tracking-[0.15em] text-slate-200 transition-all hover:bg-white/[0.08] hover:text-white hover:scale-[1.03] active:scale-[0.97]"
                >
                  <Clock className="w-3.5 h-3.5 text-blue-300" />
                  Add to Calendar
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Right Block: Countdown Cards */}
        <div className="flex flex-col items-center gap-4 w-full sm:w-auto">
          {!timeLeft.isExpired && (
            <div className="flex items-center gap-2 sm:gap-3 justify-center">
              {[
                { label: "days", value: timeLeft.days },
                { label: "hours", value: timeLeft.hours },
                { label: "mins", value: timeLeft.minutes },
                { label: "secs", value: timeLeft.seconds },
              ].map((unit, index, arr) => {
                const paddedValue = String(unit.value).padStart(2, "0")
                return (
                  <React.Fragment key={unit.label}>
                    <div className="flex flex-col items-center">
                      <div className="flex gap-0.5 sm:gap-1">
                        {paddedValue.split("").map((digit, dIdx) => (
                          <FlipUnit key={dIdx} digit={digit} />
                        ))}
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-1.5 select-none">
                        {unit.label}
                      </span>
                    </div>
                    {index < arr.length - 1 && (
                      <span className="text-lg font-bold text-slate-500/60 self-start mt-2 select-none animate-[pulse_1s_infinite]">
                        :
                      </span>
                    )}
                  </React.Fragment>
                )
              })}
            </div>
          )}

          {/* Calendar Button (Mobile-only: shown at the bottom) */}
          <div className="sm:hidden w-full flex justify-center">
            {timeLeft.isExpired ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-green-500/30 bg-green-500/10 text-green-300 text-xs font-bold uppercase tracking-wider animate-pulse">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
                Live Now
              </div>
            ) : (
              <a
                href={calendarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-white/10 bg-white/[0.03] text-xs font-bold uppercase tracking-[0.15em] text-slate-200 transition-all hover:bg-white/[0.08] hover:text-white"
              >
                <Clock className="w-4 h-4 text-blue-300" />
                Add to Calendar
              </a>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
