"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { collection, addDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { signInAnonymously } from "firebase/auth";
import { db, auth } from "@/lib/firebase";
import { useBookingSheet } from "@/lib/booking-sheet-context";
import { useAuthContext } from "@/lib/auth-context";

const timeSlots = ["14:00", "16:30", "18:00"];
const DRAG_CLOSE_THRESHOLD = 110;
const SCROLL_TOP_SAFETY_MARGIN = 8;

export default function BookingSheet() {
  const { isOpen, service, close } = useBookingSheet();
  const { user, userData } = useAuthContext();
  const router = useRouter();
  const isLoggedIn = !!user && !user.isAnonymous;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [showSavePrompt, setShowSavePrompt] = useState(false);

  const sheetRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const draggingRef = useRef(false);
  const startYRef = useRef(0);

  useEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet) return;

    function onTouchStart(e: TouchEvent) {
      startYRef.current = e.touches[0].clientY;
      draggingRef.current = false;
    }

    function onTouchMove(e: TouchEvent) {
      const content = contentRef.current;
      const atTop = !content || content.scrollTop <= SCROLL_TOP_SAFETY_MARGIN;
      const deltaY = e.touches[0].clientY - startYRef.current;

      if (!draggingRef.current) {
        if (atTop && deltaY > 6) {
          draggingRef.current = true;
          setDragging(true);
        } else {
          return;
        }
      }
      e.preventDefault();
      setDragY(Math.max(0, deltaY));
    }

    function onTouchEnd() {
      if (draggingRef.current) {
        setDragY((current) => {
          if (current > DRAG_CLOSE_THRESHOLD) close();
          return 0;
        });
        setDragging(false);
        draggingRef.current = false;
      }
    }

    sheet.addEventListener("touchstart", onTouchStart, { passive: true });
    sheet.addEventListener("touchmove", onTouchMove, { passive: false });
    sheet.addEventListener("touchend", onTouchEnd);
    return () => {
      sheet.removeEventListener("touchstart", onTouchStart);
      sheet.removeEventListener("touchmove", onTouchMove);
      sheet.removeEventListener("touchend", onTouchEnd);
    };
  }, [close]);

  useEffect(() => {
    if (!isOpen) {
      setStatus("idle");
      setShowSavePrompt(false);
      setSelectedTime(null);
      setName("");
      setPhone("");
      setDate("");
    }
  }, [isOpen]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTime) {
      setErrorMsg("נא לבחור שעה");
      return;
    }
    if (navigator.vibrate) navigator.vibrate(12);
    setErrorMsg("");
    setStatus("loading");

    const finalName = isLoggedIn ? userData?.name || "" : name.trim();
    const finalPhone = isLoggedIn ? userData?.phone || "" : phone.trim();

    try {
      if (!auth.currentUser) {
        await signInAnonymously(auth);
      }

      const purgeDate = new Date(date);
      purgeDate.setDate(purgeDate.getDate() + 180);

      await addDoc(collection(db, "doik/app/bookings"), {
        treatment: service?.title ?? "בקשה כללית לתור",
        date,
        time: selectedTime,
        name: finalName,
        phone: finalPhone,
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

      if (!isLoggedIn) {
        setTimeout(() => setShowSavePrompt(true), 1200);
      } else {
        setTimeout(() => close(), 1500);
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
      setErrorMsg("משהו השתבש, נסי שוב או צרי קשר בוואטסאפ");
    }
  }

  function goRegister() {
    sessionStorage.setItem("doik_prefill", JSON.stringify({ name, phone }));
    close();
    router.push("/account");
  }

  const sheetTransform = dragging
    ? `translateY(${dragY}px)`
    : isOpen
    ? "translateY(0)"
    : "translateY(100%)";

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
        ref={sheetRef}
        className={`absolute bottom-0 inset-x-0 max-w-md mx-auto bg-[#121212] border-t border-white/10 rounded-t-[2.5rem] ${
          dragging ? "" : "transition-transform duration-[400ms]"
        }`}
        style={{ transform: sheetTransform, paddingBottom: "calc(20px + var(--sab))" }}
      >
        <div className="pt-4 pb-2 px-6">
          <div className="w-12 h-1.5 bg-gray-600/60 rounded-full mx-auto" />
        </div>

        <div ref={contentRef} className="px-6 max-h-[75vh] overflow-y-auto">
          {showSavePrompt ? (
            <div className="py-6 text-center">
              <div className="w-14 h-14 rounded-full bg-brand-rose/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💌</span>
              </div>
              <h3 className="text-xl font-serif font-bold text-white mb-2">לשמור את הפרטים שלך?</h3>
              <p className="text-sm text-gray-400 mb-6">
                כך נזכור אותך בפעם הבאה ונוכל לעדכן אותך על תורים ומבצעים - לוקח רק חצי דקה.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={goRegister}
                  className="w-full bg-gradient-to-r from-brand-rose to-pink-700 text-white rounded-2xl py-3.5 font-bold"
                >
                  כן, שמרי לי את הפרטים
                </button>
                <button
                  onClick={close}
                  className="w-full text-gray-400 text-sm py-2"
                >
                  לא תודה, אולי בפעם אחרת
                </button>
              </div>
            </div>
          ) : (
            <>
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
                {isLoggedIn ? (
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-brand-rose/20 flex items-center justify-center text-sm">
                      👤
                    </div>
                    <div>
                      <p className="text-sm text-white font-semibold">{userData?.name}</p>
                      <p className="text-xs text-gray-400" dir="ltr">{userData?.phone}</p>
                    </div>
                  </div>
                ) : (
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
                )}

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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
