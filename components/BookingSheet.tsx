"use client";

import { useState } from "react";
import confetti from "canvas-confetti";
import { collection, addDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useBookingSheet } from "@/lib/booking-sheet-context";

const timeSlots = ["14:00", "16:30", "18:00"];

export default function BookingSheet() {
  const { isOpen, service, close } = useBookingSheet();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTime) {
      setErrorMsg("נא לבחור שעה");
      return;
    }
    if (navigator.vibrate) navigator.vibrate(12);
    setErrorMsg("");
    setStatus("loading");

    try {
      const purgeDate = new Date(date);
      purgeDate.setDate(purgeDate.getDate() + 180);

      await addDoc(collection(db, "doik/app/bookings"), {
        treatment: service?.title ?? "בקשה כללית לתור",
        date,
        time: selectedTime,
        name: name.trim(),
        phone: phone.trim(),
        createdAt: serverTimestamp(),
        purgeAfter: Timestamp.fromDate(purgeDate),
      });

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
          setName("");
          setPhone("");
          setDate("");
        }, 400);
      }, 1500);
    } catch (err) {
      console.error(err);
      setStatus("error");
      setErrorMsg("משהו השתבש, נסי שוב או צרי קשר בוואטסאפ");
    }
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
        className={`absolute bottom-0 inset-x-0 max-w-md mx-auto bg-[#121212] border-t border-white/10 rounded-t-[2.5rem] p-6 max-h-[85vh] overflow-y-auto transition-transform duration-[400ms] ${
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">שם מלא</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-brand-rose"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">טלפון</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-brand-rose tabular-nums"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">תאריך מבוקש</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
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

          {errorMsg && <p className="text-xs text-red-400">{errorMsg}</p>}

          <button
            type="submit"
            disabled={status === "loading"}
            className={`w-full rounded-2xl py-4 font-bold text-lg shadow-lg active:scale-95 transition-transform mt-4 flex items-center justify-center gap-2 text-white disabled:opacity-60 ${
              status === "success" ? "bg-green-600" : "bg-gradient-to-r from-brand-rose to-pink-700"
            }`}
          >
            {status === "loading" && "שומר תור..."}
            {status === "success" && "✓ התור שוריין בהצלחה!"}
            {(status === "idle" || status === "error") && "אישור והבטחת התור"}
          </button>
        </form>
      </div>
    </div>
  );
}
