"use client"

import React, { useState, useEffect } from "react"
import { Calendar, Clock, Sparkles } from "lucide-react"

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
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left Side: Title and Date info */}
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="hidden sm:flex p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
            <Calendar className="w-6 h-6 text-blue-300" />
          </div>
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2">
              <Sparkles className="w-4 h-4 text-purple-300 animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-300">
                Live Cohort Starts Soon
              </span>
            </div>
            <h3 className="text-lg md:text-xl font-black text-white mt-1">
              {timeLeft.isExpired ? "First Class has started!" : "First Class starts in"}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              Thursday, 28th May at 1:00 PM IST
            </p>
          </div>
        </div>

        {/* Right Side: Interactive Countdown & Calendar Link */}
        <div className="flex flex-wrap items-center justify-center gap-6">
          {!timeLeft.isExpired && (
            <div className="flex items-center gap-3">
              {[
                { label: "days", value: timeLeft.days },
                { label: "hours", value: timeLeft.hours },
                { label: "mins", value: timeLeft.minutes },
                { label: "secs", value: timeLeft.seconds },
              ].map((unit, index, arr) => (
                <React.Fragment key={unit.label}>
                  <div className="flex flex-col items-center">
                    <div className="bg-slate-950/60 border border-white/8 hover:border-blue-500/30 transition-colors rounded-xl px-3 py-2 min-w-[3.5rem] flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_4px_12px_rgba(0,0,0,0.3)]">
                      <span className="text-xl md:text-2xl font-mono font-bold text-white tracking-tight">
                        {String(unit.value).padStart(2, "0")}
                      </span>
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                      {unit.label}
                    </span>
                  </div>
                  {index < arr.length - 1 && (
                    <span className="text-lg font-bold text-slate-500/60 self-start mt-2 select-none animate-[pulse_1s_infinite]">
                      :
                    </span>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}

          {timeLeft.isExpired ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-green-500/30 bg-green-500/10 text-green-300 text-xs font-bold uppercase tracking-wider animate-pulse">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
              Live Now
            </div>
          ) : (
            <a
              href={calendarUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-white/10 bg-white/[0.03] text-xs font-bold uppercase tracking-[0.15em] text-slate-200 transition-all hover:bg-white/[0.08] hover:text-white hover:scale-[1.03] active:scale-[0.97]"
            >
              <Clock className="w-4 h-4 text-blue-300" />
              Add to Calendar
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
