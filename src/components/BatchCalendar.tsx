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
    { title: "Image Generation masterclass (Midjourney/DALL-E)", time: "6:30 PM IST", type: "live" },
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
  // Start view on May 2026
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 1));
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date(2026, 4, 20));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDateClick = (day: number) => {
    setSelectedDate(new Date(year, month, day));
  };

  const renderDays = () => {
    const blanks = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      blanks.push(<div key={`blank-${i}`} className="h-10 w-full" />);
    }

    const days = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d);
      const isBootcamp = isBootcampDay(dateObj);
      const dateStr = formatDate(dateObj);
      const hasEvents = !!mockEvents[dateStr];
      const isSelected = selectedDate && formatDate(selectedDate) === dateStr;

      days.push(
        <button
          key={d}
          onClick={() => handleDateClick(d)}
          className={`relative h-10 w-full rounded-xl flex items-center justify-center text-sm font-medium transition-all hover:scale-105 active:scale-95
            ${
              isSelected
                ? "bg-gradient-to-br from-blue-500 to-violet-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.5)] border border-white/20"
                : isBootcamp
                ? "bg-blue-500/10 border border-blue-400/20 text-blue-200 hover:bg-blue-500/20"
                : "text-slate-400 hover:bg-white/5 border border-transparent"
            }
          `}
        >
          {d}
          {hasEvents && !isSelected && (
            <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-pink-400" />
          )}
        </button>
      );
    }

    return [...blanks, ...days];
  };

  const selectedDateStr = selectedDate ? formatDate(selectedDate) : null;
  const dayEvents = selectedDateStr ? mockEvents[selectedDateStr] : null;

  return (
    <div className="space-y-6">
      {/* Calendar Card */}
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] backdrop-blur-xl p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-blue-300" />
            <h2 className="text-2xl font-black tracking-tight">Bootcamp Schedule</h2>
          </div>
          <div className="flex items-center gap-4 border border-white/10 rounded-full p-1 bg-slate-950/40">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-bold w-28 text-center text-white">
              {currentDate.toLocaleString("default", { month: "long" })} {year}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-y-4 gap-x-2 text-center">
          {daysOfWeek.map((day) => (
            <div
              key={day}
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 pb-2"
            >
              {day}
            </div>
          ))}
          {renderDays()}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-4 text-xs font-bold text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500/20 border border-blue-400/30" />
            <span>Active Bootcamp Day</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-pink-400" />
            <span>Scheduled Session/Task</span>
          </div>
        </div>
      </div>

      {/* Expanded Events List below */}
      {selectedDate && (
        <div className="rounded-[1.75rem] border border-blue-400/15 bg-gradient-to-br from-[#020617] to-slate-900/60 p-6 md:p-8 shadow-[0_4px_40px_rgba(59,130,246,0.05)] overflow-hidden relative">
          <div className="absolute top-0 right-0 p-12 opacity-10 blur-2xl pointer-events-none">
             <div className="w-32 h-32 bg-blue-500 rounded-full" />
          </div>
          
          <h3 className="text-lg font-bold text-white mb-6 border-b border-white/5 pb-4">
            Schedule for{" "}
            <span className="text-blue-300">
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
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
                      className={`p-3 rounded-xl border border-white/10 ${
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
                      <h4 className="text-base font-bold text-slate-100">
                        {event.title}
                      </h4>
                      <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-slate-400 tracking-wide">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{event.time}</span>
                      </div>
                    </div>
                  </div>
                  {event.urgency && (
                    <span className="rounded-full border border-pink-500/20 bg-pink-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-pink-300 self-start sm:self-auto">
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
              <p className="text-sm text-slate-500 mt-1">Check out the highlighted active bootcamp days.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
