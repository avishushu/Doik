"use client";

import { useState } from "react";
import confetti from "canvas-confetti";
import { useBookingSheet } from "@/lib/booking-sheet-context";

const timeSlots = ["14:00", "16:30", "18:00"];

export default function BookingSheet() {
  const { isOpen, service, close } = useBookingSheet();
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (navigator.vibrate) navigator.vibrate(12);
    setStatus("loading");
    setTimeout(() => {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
        colors: ["#be185d", "#fce7f3", "#ffffff"],
      });
      setStatus("success");
      setTimeout(() => {
        close();
        setTimeout(() => {
          setStatus("idle");
          setSelectedTime(null);
        }, 400);
      }, 1500);
    }, 600);
  }

  return (
    <div
      className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        className={`absolute bottom-0 inset-x-0 max-w-md mx-auto bg-[#121212] border-t border-white/10 rounded-t-[2.5rem] p-6 transition-transform duration-[400ms] ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ paddingBottom: "calc(20px + var(--sab))" }}
      >
        <div className="w-12 h-1.5 bg-gray-600/60 rounded-full mx-auto mb-6" />

        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-2xl font-serif font-bold text-white">
              {service ? service.title : "קביעת תור"}
            </h3>
            <p className="text-sm text-gray-400 tabular-nums">
              {service ? `משך הטיפול: ${service.duration}` : "בחרי את השעה והתאריך המבוקש"}
            </p>
          </div>
          {service && <span className="text-xl font-bold text-brand-rose tabular-nums">{service.price}</span>}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">תאריך מבוקש</label>
            <input
              type="date"
              required
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-brand-rose tabular-nums"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">שעות זמינות להיום</label>
            <div className="grid grid-cols-3 gap-2 tabular-nums">
              {timeSlots.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSelectedTime(t)}
                  className={`rounded-xl py-3 text-sm font-semibold border transition-all active:scale-95 ${
                    selectedTime === t
                      ? "border-brand-rose bg-brand-rose/30"
                      : "border-white/10 bg-white/5 hover:bg-brand-rose/20"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className={`w-full rounded-2xl py-4 font-bold text-lg shadow-lg active:scale-95 transition-transform mt-4 flex items-center justify-center gap-2 text-white ${
              status === "success" ? "bg-green-600" : "bg-gradient-to-r from-brand-rose to-pink-700"
            }`}
          >
            {status === "loading" && "שומר תור..."}
            {status === "success" && "✓ התור שוריין בהצלחה!"}
            {status === "idle" && "אישור והבטחת התור"}
          </button>
        </form>
      </div>
    </div>
  );
}
