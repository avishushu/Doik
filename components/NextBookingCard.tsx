"use client";

import { useNextBooking } from "@/lib/use-home-status";
import { friendlyDay, todayIL } from "@/lib/date-utils";

function countdown(minutes: number): string {
  if (minutes < 1) return "עכשיו";
  if (minutes < 60) return minutes === 1 ? "בעוד דקה" : `בעוד ${minutes} דקות`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    if (hours === 1) return "בעוד שעה";
    if (hours === 2) return "בעוד שעתיים";
    return `בעוד ${hours} שעות`;
  }
  const days = Math.floor(minutes / 1440);
  if (days === 1) return "בעוד יום";
  if (days === 2) return "בעוד יומיים";
  return `בעוד ${days} ימים`;
}

// התור הקרוב של המשתמשת (גם אם לא נרשמה) - לא מוצג אם אין תור עתידי
export default function NextBookingCard() {
  const { next, minutes } = useNextBooking();
  if (!next || minutes === null) return null;

  return (
    <div className="bg-gradient-to-r from-pink-950/40 to-purple-950/40 border border-brand-rose/20 rounded-2xl p-4 flex justify-between items-center backdrop-blur-md">
      <div>
        <span className="text-xs text-pink-300 font-bold uppercase tracking-wider">התור הקרוב שלך</span>
        <h4 className="font-bold text-white text-sm">{next.treatment}</h4>
      </div>
      <div className="text-left tabular-nums">
        <span className="text-sm font-bold text-white block">
          {friendlyDay(next.date, todayIL())}, {next.time}
        </span>
        <span className="text-xs text-gray-400">{countdown(minutes)}</span>
      </div>
    </div>
  );
}
