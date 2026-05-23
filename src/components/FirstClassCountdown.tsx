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
      <div className={`flipper ${isFlipping ? "is-flipping" : ""}`}>
        <div
          className="flip-card flipper__top"
          onAnimationEnd={handleAnimationEnd}
        >
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
  const [session, setSession] = useState<{
    title: string;
    scheduled_at: string;
    join_url: string;
  } | null>(null)
  const [serverSkew, setServerSkew] = useState(0)

  useEffect(() => {
    setMounted(true)

    // Retrieve live scheduled session info and calculate time synchronization offset
    const fetchSession = async () => {
      try {
        const res = await fetch("/api/my-batch/live-session")
        if (res.ok) {
          const data = await res.json()
          if (data.session) {
            setSession(data.session)
          }
          if (data.serverTime) {
            // Skew matches the difference: server time relative to local client time
            const skew = data.serverTime - Date.now()
            setServerSkew(skew)
          }
        }
      } catch (err) {
        console.error("Failed to load live session metadata:", err)
      }
    }

    fetchSession()
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Target launches on May 28, 1:00 PM IST (UTC+5:30) as fallback
    const targetTimeString = session?.scheduled_at || "2026-05-28T13:00:00+05:30"
    const targetDate = new Date(targetTimeString).getTime()

    const calculateTimeLeft = () => {
      // Calculate true client-side time using the server skew calculation
      const now = Date.now() + serverSkew
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
  }, [mounted, session, serverSkew])

  if (!mounted) {
    // Pulse placeholder matches loaded aspect-ratio card exactly to eliminate CLS (Cumulative Layout Shift)
    return (
      <div className="w-full rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-5 md:p-6 animate-pulse min-h-[171px]"></div>
    )
  }

  // Create Google Calendar event URL dynamically mapping the custom session fields:
  const getCalendarUrl = () => {
    let startTimeString = "20260528T073000Z"
    let endTimeString = "20260528T090000Z"

    if (session?.scheduled_at) {
      try {
        const start = new Date(session.scheduled_at)
        const end = new Date(start.getTime() + 90 * 60 * 1000) // Default live room runs for 90 mins
        
        const toGCalISO = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
        startTimeString = toGCalISO(start)
        endTimeString = toGCalISO(end)
      } catch (err) {
        console.error("Error creating dynamic calendar URL dates:", err)
      }
    }

    const title = encodeURIComponent(session?.title || "Skillyug Summer AI Bootcamp - First Class")
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startTimeString}/${endTimeString}&details=Welcome+to+the+first+live+session+of+the+Skillyug+Summer+AI+Bootcamp!+Please+access+the+live+link+from+your+My+Batch+Workspace.&sf=true`
  }

  const calendarUrl = getCalendarUrl()

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 bg-white/[0.02] backdrop-blur-xl p-5 md:p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] hover:border-white/20 transition-all duration-300 countdown-card-dynamic">
      <div className="flex flex-col gap-6">
        
        {/* Top Row: Info & Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 shadow-[0_0_12px_rgba(59,130,246,0.15)] flex-shrink-0 hidden xs:flex">
              <Calendar className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <Sparkles className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-300">
                  Live Cohort Starts Soon
                </span>
              </div>
              <h3 className="text-base font-black text-white mt-0.5">
                {timeLeft.isExpired ? `${session?.title || "First Class"} has started!` : (session?.title || "First Class starts in")}
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                {session?.scheduled_at 
                  ? new Date(session.scheduled_at).toLocaleString('en-IN', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true,
                      timeZone: 'Asia/Kolkata'
                    }) + " IST"
                  : "Thursday, 28th May at 1:00 PM IST"}
              </p>
            </div>
          </div>
          
          {/* Action Button */}
          <div className="flex-shrink-0">
            {timeLeft.isExpired ? (
              <a
                href={session?.join_url || "https://zoom.us/j/your-meeting-id-here"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-green-500/30 bg-green-500/10 text-green-300 text-[10px] font-bold uppercase tracking-wider transition-all hover:bg-green-500/20 hover:scale-[1.03] active:scale-[0.97] shadow-[0_0_12px_rgba(34,197,94,0.2)] animate-pulse"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping" />
                JOIN LIVE CLASS NOW
              </a>
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

      </div>
    </div>
  )
}
