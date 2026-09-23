"use client";

import { useState, useMemo } from "react";
import type { AvailabilityDay } from "@/lib/use-doik-data";

const weekdayLabels = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];
const monthNames = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
];

function toDateStr(d: Date) {
  return d.toISOString().slice(0, 10);
}

function buildWeeks(year: number, month: number): (Date | null)[][] {
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

export default function CalendarPicker({
  availableDays,
  selectedDate,
  onSelect,
}: {
  availableDays: AvailabilityDay[];
  selectedDate: string | null;
  onSelect: (date: string) => void;
}) {
  const now = useMemo(() => new Date(), []);
  const todayStr = toDateStr(now);
  const availableSet = useMemo(() => new Set(availableDays.map((d) => d.date)), [availableDays]);

  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  const weeks = useMemo(() => buildWeeks(viewYear, viewMonth), [viewYear, viewMonth]);
  const isPrevDisabled = viewYear === now.getFullYear() && viewMonth === now.getMonth();

  function goPrev() {
    if (isPrevDisabled) return;
    const prev = new Date(viewYear, viewMonth - 1, 1);
    setViewYear(prev.getFullYear());
    setViewMonth(prev.getMonth());
  }
  function goNext() {
    const next = new Date(viewYear, viewMonth + 1, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={goPrev}
          disabled={isPrevDisabled}
          aria-label="חודש קודם"
          className={`w-8 h-8 flex items-center justify-center rounded-full border border-white/10 text-white ${
            isPrevDisabled ? "opacity-25 cursor-not-allowed" : "hover:bg-white/5"
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
          </svg>
        </button>
        <p className="font-serif text-lg text-white tabular-nums">
          {monthNames[viewMonth]} {viewYear}
        </p>
        <button
          type="button"
          onClick={goNext}
          aria-label="חודש הבא"
          className="w-8 h-8 flex items-center justify-center rounded-full border border-white/10 text-white hover:bg-white/5"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 6l-6 6 6 6" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2">
        {weekdayLabels.map((w) => (
          <div key={w}>{w}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weeks.flat().map((date, i) => {
          if (!date) return <div key={i} />;
          const dateStr = toDateStr(date);
          const isPast = dateStr < todayStr;
          const isAvailable = availableSet.has(dateStr) && !isPast;
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;

          return (
            <button
              key={i}
              type="button"
              disabled={!isAvailable}
              onClick={() => onSelect(dateStr)}
              className={`aspect-square rounded-full text-sm font-bold flex items-center justify-center tabular-nums transition-colors ${
                isSelected
                  ? "bg-white text-brand-dark"
                  : isAvailable
                  ? "bg-brand-rose/20 text-white border border-brand-rose/60 hover:bg-brand-rose/35"
                  : "text-gray-600 cursor-not-allowed"
              } ${isToday && !isSelected ? "ring-1 ring-white/40" : ""}`}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-4 mt-5 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-brand-rose/20 border border-brand-rose/60 inline-block" />
          פנוי
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-white inline-block" />
          נבחר
        </div>
      </div>
    </div>
  );
}
