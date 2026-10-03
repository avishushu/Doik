"use client";

import { useNextBooking, useNextAvailability } from "@/lib/use-home-status";
import { useBookingSheet } from "@/lib/booking-sheet-context";
import { friendlyDay, todayIL } from "@/lib/date-utils";

// עד כמה תורים נשארו היום כדי להציג "נותרו תורות בודדים"
const FEW_SLOTS_THRESHOLD = 3;

// באנר אמיתי על בסיס הזמינות: "נותרו תורות בודדים היום" או מתי התור הפנוי הקרוב.
// לא מוצג בזמן טעינה או כשאין שום יום פנוי
export default function AvailabilityBanner() {
  const { open } = useBookingSheet();
  const { next } = useNextBooking();
  const { result, loading } = useNextAvailability(next?.id ?? "");

  if (loading || !result) return null;

  const today = todayIL();
  const fewLeftToday = result.date === today && result.capacity <= FEW_SLOTS_THRESHOLD;

  if (fewLeftToday) {
    return (
      <button
        type="button"
        onClick={() => open()}
        className="inline-flex items-center gap-3 bg-red-950/40 border border-red-500/30 rounded-full px-4 py-2 backdrop-blur-md w-full text-right"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
        </span>
        <span className="text-sm font-semibold text-red-100 tracking-wide">נותרו תורות בודדים היום!</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => open()}
      className="inline-flex items-center gap-3 bg-pink-950/40 border border-brand-rose/30 rounded-full px-4 py-2 backdrop-blur-md w-full text-right"
    >
      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-rose" />
      <span className="text-sm font-semibold text-pink-100 tracking-wide">
        התור הפנוי הקרוב: {friendlyDay(result.date, today)}
      </span>
    </button>
  );
}
