"use client";

import React, { useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Video,
  BookOpen,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import {
  getCurriculumDays,
  formatDate,
  getInitialDates
} from "@/lib/curriculum";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const getClassStatus = (date: Date) => {
  const now = new Date();
  
  const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  if (compareDate < currentDate) {
    return { 
      label: "Class is Over", 
      type: "past" as const, 
      color: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-950 dark:bg-emerald-950/20 dark:text-emerald-400" 
    };
  } else if (compareDate.getTime() === currentDate.getTime()) {
    // Today! Class is over after 3 PM (15:00)
    if (now.getHours() >= 15) {
      return { 
        label: "Class is Over", 
        type: "past" as const, 
        color: "border-emerald-250 bg-emerald-50 text-emerald-700 dark:border-emerald-950 dark:bg-emerald-950/20 dark:text-emerald-400 font-bold" 
      };
    } else if (now.getHours() >= 13) {
      return { 
        label: "Live Now", 
        type: "live" as const, 
        color: "border-green-200 bg-green-50 text-green-700 animate-pulse font-bold dark:border-green-900/30 dark:bg-green-950/40 dark:text-green-400" 
      };
    } else {
      return { 
        label: "Upcoming", 
        type: "upcoming" as const, 
        color: "border-blue-200 bg-blue-50 text-blue-600 font-bold dark:border-blue-900/30 dark:bg-blue-950/40 dark:text-blue-400" 
      };
    }
  } else {
    return { 
      label: "Scheduled", 
      type: "future" as const, 
      color: "border-slate-200 bg-slate-150/50 text-slate-500 dark:border-white/10 dark:bg-[#0f172a]/50 dark:text-slate-400" 
    };
  }
};

const getBootcampDay = (date: Date, startDateStr?: string | null) => {
  const targetStr = formatDate(date);
  const days = getCurriculumDays(startDateStr);
  return days.find(day => day.dateStr === targetStr);
};

export default function BatchCalendar({ hasSlot = true, startDateStr }: { hasSlot?: boolean, startDateStr?: string | null }) {
  const initialDates = getInitialDates(startDateStr);
  const [currentDate, setCurrentDate] = useState(initialDates.current);
  const [selectedDate, setSelectedDate] = useState<Date | null>(initialDates.selected);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const handleDateClick = (day: number) => {
    setSelectedDate(new Date(year, month, day));
  };

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
      const dayDate = new Date(year, month, day);
      const bootcampDay = getBootcampDay(dayDate, startDateStr);
      const status = getClassStatus(dayDate);
      const isBootcamp = !!bootcampDay;
      const dateStr = formatDate(dayDate);
      const isSelected = selectedDate != null && formatDate(selectedDate) === dateStr;
      
      let isCompleted = false;
      let isTodayClass = false;
      if (bootcampDay) {
        const status = getClassStatus(dayDate);
        isCompleted = status.type === "past";
        isTodayClass = (status.type === "live" || status.type === "upcoming") && dayDate.toDateString() === new Date().toDateString();
      }

      let cellClass = "relative h-10 w-full rounded-xl flex items-center justify-center text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 ";
      if (isSelected) {
        if (isCompleted) {
          cellClass += "bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-md focus-visible:ring-emerald-400 scale-[1.04]";
        } else {
          cellClass += "bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md focus-visible:ring-blue-400 scale-[1.04]";
        }
      } else if (isBootcamp) {
        if (isCompleted) {
          cellClass += "bg-emerald-50/80 border border-emerald-200/60 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-950/40";
        } else if (isTodayClass) {
          cellClass += "bg-blue-100/80 border-2 border-blue-500 text-blue-800 hover:bg-blue-200 dark:bg-blue-950/40 dark:border-blue-400 dark:text-blue-200 dark:hover:bg-blue-950/60 font-black animate-pulse-subtle";
        } else {
          cellClass += "bg-blue-50 border border-blue-100 text-blue-700 hover:bg-blue-100 hover:border-blue-200 dark:bg-blue-950/10 dark:border-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-950/20";
        }
      } else {
        cellClass += "text-slate-400 border border-transparent hover:bg-slate-100 hover:text-slate-800 dark:text-slate-500 dark:hover:bg-white/5 dark:hover:text-slate-300";
      }

      calendarCells.push(
        <button
          key={`day-${day}`}
          type="button"
          onClick={() => handleDateClick(day)}
          aria-label={`Select ${dateStr}`}
          aria-pressed={isSelected}
          className={cellClass}
        >
          {day}
          {isCompleted && !isSelected && (
            <span
              aria-hidden="true"
              className="absolute bottom-1 w-1 h-1 rounded-full bg-emerald-500 dark:bg-emerald-400"
            />
          )}
          {isBootcamp && !isCompleted && !isSelected && (
            <span
              aria-hidden="true"
              className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-500 dark:bg-blue-400"
            />
          )}
        </button>
      );
    }
  }

  const selectedClass = selectedDate ? getBootcampDay(selectedDate) : null;
  const classStatus = selectedDate && selectedClass ? getClassStatus(selectedDate) : null;

  return (
    <div className="space-y-5">
      {/* Calendar Card */}
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 md:p-8 shadow-sm dark:border-white/10 dark:bg-[#0a0f1c]">
        {/* Header */}
        <div className="flex items-center justify-between mb-7">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Bootcamp Schedule</h2>
          </div>
          <div className="flex items-center gap-1 border border-slate-200 rounded-full p-1 bg-slate-50 dark:border-white/10 dark:bg-slate-900">
            <button
              type="button"
              onClick={handlePrevMonth}
              aria-label="Previous month"
              className="p-2 rounded-full hover:bg-slate-200/80 dark:hover:bg-white/10 text-slate-650 dark:text-slate-300 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-bold w-32 text-center text-slate-800 dark:text-slate-250 select-none">
              {currentDate.toLocaleString("default", { month: "long" })} {year}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              aria-label="Next month"
              className="p-2 rounded-full hover:bg-slate-200/80 dark:hover:bg-white/10 text-slate-650 dark:text-slate-300 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Day-of-week headers */}
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
        <div className="mt-7 pt-5 border-t border-slate-100 dark:border-white/5 flex flex-wrap items-center gap-5 text-xs font-semibold text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-blue-50 border border-blue-200 dark:bg-blue-950/10 dark:border-blue-900/20" />
            <span>Active Class (Scheduled)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-emerald-50 border border-emerald-250 dark:bg-emerald-950/20 dark:border-emerald-900/30" />
            <span>Class Completed (Done)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-gradient-to-br from-blue-600 to-indigo-600" />
            <span>Selected (Future)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-gradient-to-br from-emerald-600 to-teal-600" />
            <span>Selected (Completed)</span>
          </div>
        </div>
      </div>

      {/* Expanded Events Panel */}
      {selectedDate && (
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 md:p-8 shadow-sm overflow-hidden relative dark:border-white/10 dark:bg-[#0a0f1c]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-10 -right-10 w-40 h-40 bg-blue-500/[0.03] rounded-full blur-3xl"
          />

          <h3 className="relative text-lg font-black text-slate-900 dark:text-white mb-6 border-b border-slate-100 dark:border-white/5 pb-4">
            Schedule for{" "}
            <span className="text-blue-600 dark:text-blue-400">
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </h3>

          {selectedClass && classStatus ? (
            <div className="space-y-6">
              <article
                className="rounded-[1.5rem] border border-slate-100 bg-slate-50/50 dark:border-white/5 dark:bg-[#0f172a]/30 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`p-3 rounded-2xl border flex-shrink-0 ${
                      classStatus.type === "past"
                        ? "bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:border-emerald-900/30 dark:text-emerald-450"
                        : classStatus.type === "live"
                        ? "bg-red-550 border-red-100 text-red-600 dark:bg-red-950/40 dark:border-red-900/30 dark:text-red-450"
                        : "bg-blue-50 border-blue-100 text-blue-600 dark:bg-blue-950/40 dark:border-blue-900/30 dark:text-blue-450"
                    }`}
                  >
                    {classStatus.type === "live" ? (
                      <Video className="w-6 h-6 animate-pulse" />
                    ) : classStatus.type === "past" ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <CalendarDays className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">
                      Day {selectedClass.dayNumber} of 25
                    </span>
                    <h4 className="text-lg md:text-xl font-black text-slate-900 dark:text-white mt-1">
                      {selectedClass.topic}
                    </h4>
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>2:00 PM - 3:00 PM IST</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <span className={`rounded-full border px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] self-start md:self-auto flex-shrink-0 ${classStatus.color}`}>
                  {classStatus.label}
                </span>
              </article>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-[1.25rem] border border-slate-100 dark:border-white/5 bg-slate-50/20 p-5">
                  <h5 className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-550" />
                    Subtopics Covered
                  </h5>
                  <ul className="space-y-2.5">
                    {selectedClass.subtopics.map((sub, sIdx) => (
                      <li key={sIdx} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-350 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                        <span>{sub}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-[1.25rem] border border-slate-100 dark:border-white/5 bg-slate-50/20 p-5 flex flex-col justify-between">
                  <div>
                    <h5 className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-violet-550" />
                      Expected Outcome
                    </h5>
                    <p className="text-sm text-slate-700 dark:text-slate-350 font-medium leading-relaxed">
                      {selectedClass.outcome}
                    </p>
                  </div>
                  
                  {classStatus.type === "live" && (
                    <a 
                      href="https://meet.google.com/abc-defg-hij"
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-750 text-white py-3 text-xs font-bold uppercase tracking-[0.2em] shadow-lg shadow-red-500/10 transition-all hover:scale-[1.02] active:scale-98"
                    >
                      <Video className="w-4 h-4" />
                      Join Live Meeting
                    </a>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 border border-slate-200 mb-4 dark:bg-slate-900 dark:border-white/10">
                <CalendarDays className="h-5 w-5 text-slate-400 dark:text-slate-500" />
              </div>
              <p className="text-slate-700 dark:text-slate-300 font-medium">No sessions scheduled for this day.</p>
              <p className="text-sm text-slate-500 mt-1">
                Bootcamp runs May 28 – July 1. Highlighted days indicate active classes.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
