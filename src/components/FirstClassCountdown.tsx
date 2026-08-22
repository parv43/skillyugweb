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
      setTimeout(() => {
        setPreviousDigit(currentDigit)
        setCurrentDigit(digit)
        setIsFlipping(true)
      }, 0)
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
    setTimeout(() => {
      setMounted(true)
    }, 0)
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
      <div className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 backdrop-blur-xl p-5 md:p-6 animate-pulse min-h-[90px]"></div>
    )
  }

  // Create Google Calendar event URL:
  const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Skillyug+Summer+AI+Bootcamp+-+First+Class&dates=20260528T073000Z/20260528T090000Z&details=Welcome+to+the+first+live+session+of+the+Skillyug+Summer+AI+Bootcamp!+Please+access+the+live+link+from+your+My+Batch+Workspace.&sf=true&output=xml`

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-gradient-to-r from-blue-500/[0.02] via-purple-500/[0.02] to-pink-500/[0.02] bg-white backdrop-blur-xl p-5 md:p-6 shadow-sm hover:border-slate-300 transition-all duration-300">
      <div className="flex flex-col gap-6">
        
        {/* Top Row: Info & Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100 shadow-sm flex-shrink-0 hidden xs:flex">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <Sparkles className="w-3.5 h-3.5 text-purple-600 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">
                  Live Cohort Starts Soon
                </span>
              </div>
              <h3 className="text-base font-black text-slate-900 mt-0.5">
                {timeLeft.isExpired ? "First Class has started!" : "First Class starts in"}
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                Thursday, 28th May at 2:00 PM IST
              </p>
            </div>
          </div>
          
          {/* Action Button */}
          <div className="flex-shrink-0">
            {timeLeft.isExpired ? (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-green-200 bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-wider animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
                Live Now
              </div>
            ) : (
              <a
                href={calendarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-700 transition-all hover:bg-slate-100 hover:text-slate-900 hover:scale-[1.03] active:scale-[0.97]"
              >
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                Add to Calendar
              </a>
            )}
          </div>
        </div>

        {/* Bottom Row: Countdown Clock (Centered) */}
        {!timeLeft.isExpired && (
          <div className="flex items-center gap-2 sm:gap-3 justify-center w-full">
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
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mt-1.5 select-none">
                      {unit.label}
                    </span>
                  </div>
                  {index < arr.length - 1 && (
                    <span className="text-lg font-bold text-slate-400 self-start mt-2 select-none animate-[pulse_1s_infinite]">
                      :
                    </span>
                  )}
                </React.Fragment>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}
