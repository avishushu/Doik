"use client";

import { useState, useMemo } from "react";

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

export default function AdminCalendar({
  availableDateSet,
  bookingCounts,
  selectedDate,
  onSelect,
  onMonthChange,
}: {
  availableDateSet: Set<string>;
  bookingCounts: Map<string, number>;
  selectedDate: string | null;
  onSelect: (date: string) => void;
  onMonthChange?: (year: number, month: number) => void;
}) {
  const now = useMemo(() => new Date(), []);
  const todayStr = toDateStr(now);

  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  const weeks = useMemo(() => buildWeeks(viewYear, viewMonth), [viewYear, viewMonth]);

  function goPrev() {
    const prev = new Date(viewYear, viewMonth - 1, 1);
    setViewYear(prev.getFullYear());
    setViewMonth(prev.getMonth());
    onMonthChange?.(prev.getFullYear(), prev.getMonth());
  }
  function goNext() {
    const next = new Date(viewYear, viewMonth + 1, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
    onMonthChange?.(next.getFullYear(), next.getMonth());
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={goPrev}
          aria-label="חודש קודם"
          className="w-8 h-8 flex items-center justify-center rounded-full border border-white/10 text-white hover:bg-white/5"
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
          const isOpen = availableDateSet.has(dateStr);
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;
          const count = bookingCounts.get(dateStr) || 0;

          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelect(dateStr)}
              className={`relative aspect-square rounded-full text-sm font-semibold flex items-center justify-center tabular-nums transition-colors ${
                isSelected
                  ? "bg-white text-brand-dark"
                  : isOpen && !isPast
                  ? "bg-brand-rose/20 text-white border border-brand-rose/60 hover:bg-brand-rose/35"
                  : isPast
                  ? "text-gray-600 hover:bg-white/5"
                  : "text-gray-400 hover:bg-white/5"
              } ${isToday && !isSelected ? "ring-1 ring-white/40" : ""}`}
            >
              {date.getDate()}
              {count > 0 && (
                <span
                  className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${
                    isSelected ? "bg-brand-dark" : "bg-brand-rose"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-4 mt-5 text-xs text-gray-500 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-brand-rose/20 border border-brand-rose/60 inline-block" />
          פתוח לתורים
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-rose inline-block" />
          יש הזמנות
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-white inline-block" />
          נבחר
        </div>
      </div>
    </div>
  );
}
