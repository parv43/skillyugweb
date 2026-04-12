"use client";

import React, { useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Video,
  FileText,
} from "lucide-react";

// Helper to format Date to YYYY-MM-DD string
const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Define the bootcamp active period (May 20, 2026 - June 20, 2026)
const BOOTCAMP_START = new Date(2026, 4, 20); // Month is 0-indexed (4 = May)
const BOOTCAMP_END = new Date(2026, 5, 20); // 5 = June

const isBootcampDay = (date: Date) => {
  return date >= BOOTCAMP_START && date <= BOOTCAMP_END;
};

// Mock Events Data
const mockEvents: Record<
  string,
  { title: string; time: string; type: "live" | "task"; urgency?: string }[]
> = {
  "2026-05-20": [
    { title: "Bootcamp Kickoff & Orientation", time: "6:00 PM IST", type: "live", urgency: "Mandatory" },
    { title: "Set up Discord & Tooling", time: "Self-paced", type: "task", urgency: "High priority" },
  ],
  "2026-05-22": [
    { title: "ChatGPT Basics & Prompt Frameworks", time: "7:00 PM IST", type: "live" },
  ],
  "2026-05-25": [
    { title: "Submit 5 Custom Prompts", time: "By 11:59 PM", type: "task", urgency: "Due today" },
  ],
  "2026-05-28": [
    { title: "Image Generation Masterclass (Midjourney/DALL-E)", time: "6:30 PM IST", type: "live" },
  ],
  "2026-06-03": [
    { title: "Building AI Workflows", time: "7:00 PM IST", type: "live" },
  ],
  "2026-06-05": [
    { title: "Submit Project Blueprint", time: "By 10:00 AM", type: "task", urgency: "Crucial" },
  ],
  "2026-06-12": [
    { title: "AI Explainers & Video Creation", time: "7:00 PM IST", type: "live" },
  ],
  "2026-06-18": [
    { title: "Final Deliverable Review", time: "6:00 PM IST", type: "live", urgency: "Mandatory" },
  ],
  "2026-06-20": [
    { title: "Graduation & Showcase", time: "5:00 PM IST", type: "live" },
  ],
};

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function BatchCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 1));
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date(2026, 4, 20));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const handleDateClick = (day: number) => {
    setSelectedDate(new Date(year, month, day));
  };

  // Build a flat array of cells to ensure the grid is always uniform.
  // Every cell is either an inert placeholder or a focusable button —
  // no overlapping transparent divs that could swallow pointer events.
  const totalCells = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7;
  const calendarCells = [];

  for (let i = 0; i < totalCells; i++) {
    const day = i - firstDayOfMonth + 1;
    const isValidDay = day >= 1 && day <= daysInMonth;

    if (!isValidDay) {
      calendarCells.push(
        <div key={`empty-${i}`} aria-hidden="true" className="h-10" />
      );
    } else {
      const dateObj = new Date(year, month, day);
      const isBootcamp = isBootcampDay(dateObj);
      const dateStr = formatDate(dateObj);
      const hasEvents = !!mockEvents[dateStr];
      const isSelected = selectedDate != null && formatDate(selectedDate) === dateStr;

      calendarCells.push(
        <button
          key={`day-${day}`}
          type="button"
          onClick={() => handleDateClick(day)}
          aria-label={`Select ${dateStr}`}
          aria-pressed={isSelected}
          className={[
            "relative h-10 w-full rounded-xl flex items-center justify-center text-sm font-semibold",
            "transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400",
            isSelected
              ? "bg-gradient-to-br from-blue-500 to-violet-500 text-white shadow-[0_0_14px_rgba(139,92,246,0.45)] border border-white/20"
              : isBootcamp
              ? "bg-blue-500/10 border border-blue-400/20 text-blue-200 hover:bg-blue-500/25 hover:border-blue-400/40"
              : "text-slate-400 border border-transparent hover:bg-white/5 hover:text-slate-200",
          ].join(" ")}
        >
          {day}
          {hasEvents && !isSelected && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-pink-400"
            />
          )}
        </button>
      );
    }
  }

  const selectedDateStr = selectedDate ? formatDate(selectedDate) : null;
  const dayEvents = selectedDateStr ? mockEvents[selectedDateStr] ?? null : null;

  return (
    <div className="space-y-5">
      {/* Calendar Card */}
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] backdrop-blur-xl p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-7">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-blue-300" />
            <h2 className="text-2xl font-black tracking-tight">Bootcamp Schedule</h2>
          </div>
          <div className="flex items-center gap-1 border border-white/10 rounded-full p-1 bg-slate-950/50">
            <button
              type="button"
              onClick={handlePrevMonth}
              aria-label="Previous month"
              className="p-2 rounded-full hover:bg-white/10 text-slate-300 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-bold w-32 text-center text-white select-none">
              {currentDate.toLocaleString("default", { month: "long" })} {year}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              aria-label="Next month"
              className="p-2 rounded-full hover:bg-white/10 text-slate-300 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Day-of-week headers (separate grid row to prevent drift) */}
        <div className="grid grid-cols-7 mb-2">
          {daysOfWeek.map((d) => (
            <div
              key={d}
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 text-center pb-3"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-y-1.5 gap-x-1">
          {calendarCells}
        </div>

        {/* Legend */}
        <div className="mt-7 pt-5 border-t border-white/5 flex flex-wrap items-center gap-5 text-xs font-semibold text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-blue-500/20 border border-blue-400/30" />
            <span>Active Bootcamp Day</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-pink-400" />
            <span>Session Scheduled</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-gradient-to-br from-blue-500 to-violet-500" />
            <span>Selected</span>
          </div>
        </div>
      </div>

      {/* Expanded Events Panel */}
      {selectedDate && (
        <div className="rounded-[1.75rem] border border-blue-400/15 bg-gradient-to-br from-[#020617] to-slate-900/60 p-6 md:p-8 shadow-[0_4px_40px_rgba(59,130,246,0.06)] overflow-hidden relative">
          {/* Decorative glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"
          />

          <h3 className="relative text-lg font-bold text-white mb-6 border-b border-white/5 pb-4">
            Schedule for{" "}
            <span className="text-blue-300">
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </h3>

          {dayEvents ? (
            <div className="space-y-4">
              {dayEvents.map((event, idx) => (
                <article
                  key={idx}
                  className="rounded-[1.25rem] border border-white/8 bg-white/[0.02] hover:bg-white/[0.04] transition-colors p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-xl border border-white/10 flex-shrink-0 ${
                        event.type === "live"
                          ? "bg-blue-500/10 text-blue-300"
                          : "bg-violet-500/10 text-violet-300"
                      }`}
                    >
                      {event.type === "live" ? (
                        <Video className="w-5 h-5" />
                      ) : (
                        <FileText className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm md:text-base font-bold text-slate-100">{event.title}</h4>
                      <div className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                        <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{event.time}</span>
                      </div>
                    </div>
                  </div>
                  {event.urgency && (
                    <span className="rounded-full border border-pink-500/20 bg-pink-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-pink-300 self-start sm:self-auto flex-shrink-0">
                      {event.urgency}
                    </span>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/5 border border-white/10 mb-4">
                <CalendarDays className="h-5 w-5 text-slate-400" />
              </div>
              <p className="text-slate-300 font-medium">No sessions scheduled for this day.</p>
              <p className="text-sm text-slate-500 mt-1">
                Bootcamp runs May 20 – June 20. Highlighted days have sessions.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
