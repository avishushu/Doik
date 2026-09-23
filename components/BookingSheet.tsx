"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import {
  collection,
  doc,
  query,
  where,
  getDocs,
  runTransaction,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { signInAnonymously } from "firebase/auth";
import { db, auth } from "@/lib/firebase";
import { useBookingSheet } from "@/lib/booking-sheet-context";
import { useAuthContext } from "@/lib/auth-context";
import { useTreatments, useBufferMinutes, useAvailableDays } from "@/lib/use-doik-data";
import {
  totalBlockMinutes,
  cellsForStart,
  computeAvailableStarts,
  groupSlotsByPeriod,
} from "@/lib/availability-engine";
import { IconUser, IconHeart } from "@/components/icons";
import CalendarPicker from "@/components/CalendarPicker";

const DRAG_CLOSE_THRESHOLD = 110;
const SCROLL_TOP_SAFETY_MARGIN = 8;

export default function BookingSheet() {
  const { isOpen, service, close } = useBookingSheet();
  const { user, userData } = useAuthContext();
  const router = useRouter();
  const isLoggedIn = !!user && !user.isAnonymous;

  const { treatments, loading: treatmentsLoading } = useTreatments();
  const { buffer } = useBufferMinutes();
  const { days: availableDays, loading: daysLoading } = useAvailableDays();

  const [step, setStep] = useState(0);
  const [treatmentId, setTreatmentId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [takenCells, setTakenCells] = useState<Set<string>>(new Set());
  const [checkingSlots, setCheckingSlots] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [showSavePrompt, setShowSavePrompt] = useState(false);

  const sheetRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const draggingRef = useRef(false);
  const startYRef = useRef(0);

  const selectedTreatment = treatments.find((t) => t.id === treatmentId) || null;
  const selectedDay = availableDays.find((d) => d.date === selectedDate) || null;

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
      setStep(0);
      setTreatmentId(null);
      setSelectedDate(null);
      setSelectedTime(null);
      setTakenCells(new Set());
      setStatus("idle");
      setShowSavePrompt(false);
      setName("");
      setPhone("");
      return;
    }
    if (service && treatments.length > 0 && !treatmentId) {
      const match = treatments.find((t) => t.title === service.title);
      if (match) {
        setTreatmentId(match.id);
        setStep(1);
      }
    }
  }, [isOpen, service, treatments, treatmentId]);

  useEffect(() => {
    if (!selectedDate) {
      setTakenCells(new Set());
      return;
    }
    let cancelled = false;
    setCheckingSlots(true);
    const q = query(collection(db, "doik/app/bookedSlots"), where("date", "==", selectedDate));
    getDocs(q)
      .then((snap) => {
        if (cancelled) return;
        setTakenCells(new Set(snap.docs.map((d) => d.data().time as string)));
      })
      .catch((err) => console.error("failed to check slot availability", err))
      .finally(() => {
        if (!cancelled) setCheckingSlots(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedDate]);

  const totalMinutes = selectedTreatment ? totalBlockMinutes(selectedTreatment.duration, buffer) : 0;

  const availableStarts = useMemo(() => {
    if (!selectedDay || !selectedTreatment) return [];
    return computeAvailableStarts(selectedDay.windows, totalMinutes, takenCells);
  }, [selectedDay, selectedTreatment, totalMinutes, takenCells]);

  const grouped = groupSlotsByPeriod(availableStarts);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTreatment || !selectedDate || !selectedTime) return;
    if (navigator.vibrate) navigator.vibrate(12);
    setErrorMsg("");
    setStatus("loading");

    const finalName = isLoggedIn ? userData?.name || "" : name.trim();
    const finalPhone = isLoggedIn ? userData?.phone || "" : phone.trim();

    try {
      if (!auth.currentUser) {
        await signInAnonymously(auth);
      }
      const uid = auth.currentUser!.uid;

      const cells = cellsForStart(selectedTime, totalMinutes);
      const cellRefs = cells.map((c) => doc(db, "doik/app/bookedSlots", `${selectedDate}_${c}`));
      const bookingRef = doc(collection(db, "doik/app/bookings"));

      const purgeDate = new Date(selectedDate);
      purgeDate.setDate(purgeDate.getDate() + 180);

      await runTransaction(db, async (tx) => {
        const snaps = await Promise.all(cellRefs.map((ref) => tx.get(ref)));
        if (snaps.some((s) => s.exists())) {
          throw new Error("SLOT_TAKEN");
        }
        cells.forEach((c, i) => {
          tx.set(cellRefs[i], { date: selectedDate, time: c, createdAt: serverTimestamp() });
        });
        tx.set(bookingRef, {
          treatment: selectedTreatment.title,
          date: selectedDate,
          time: selectedTime,
          name: finalName,
          phone: finalPhone,
          createdAt: serverTimestamp(),
          purgeAfter: Timestamp.fromDate(purgeDate),
          createdBy: uid,
        });
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
    } catch (err: any) {
      console.error(err);
      if (err?.message === "SLOT_TAKEN") {
        setStatus("error");
        setErrorMsg("אופס, השעה הזו נתפסה ממש עכשיו - נא לבחור שעה אחרת");
        setSelectedTime(null);
        setStep(2);
      } else {
        setStatus("error");
        setErrorMsg("משהו השתבש, נסי שוב או צרי קשר בוואטסאפ");
      }
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

  const stepCount = 4;

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
          <div className="w-12 h-1.5 bg-gray-600/60 rounded-full mx-auto mb-4" />
          {!showSavePrompt && status !== "success" && (
            <div className="flex gap-1.5 justify-center">
              {Array.from({ length: stepCount }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === step ? "w-6 bg-brand-rose" : i < step ? "w-1.5 bg-brand-rose/50" : "w-1.5 bg-white/10"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <div ref={contentRef} className="px-6 max-h-[70vh] overflow-y-auto">
          {showSavePrompt ? (
            <div className="py-6 text-center">
              <div className="w-14 h-14 rounded-full bg-brand-rose/20 flex items-center justify-center mx-auto mb-4 text-brand-rose">
                <IconHeart className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-serif font-bold text-white mb-2">לשמור את הפרטים שלך?</h3>
              <p className="text-sm text-gray-400 mb-6">
                כך נזכיר לך על התור ותוכלי לראות אותו כאן בכל רגע - לוקח רק חצי דקה.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={goRegister}
                  className="w-full bg-gradient-to-r from-brand-rose to-pink-700 text-white rounded-2xl py-3.5 font-bold"
                >
                  כן, שמרי לי את הפרטים
                </button>
                <button onClick={close} className="w-full text-gray-400 text-sm py-2">
                  לא תודה, אולי בפעם אחרת
                </button>
              </div>
            </div>
          ) : status === "success" ? (
            <div className="py-10 text-center">
              <p className="text-xl font-serif font-bold text-white">✓ התור שוריין בהצלחה!</p>
            </div>
          ) : (
            <>
              {step === 0 && (
                <div className="py-2">
                  <h3 className="text-2xl font-serif font-bold text-white mb-1">איזה טיפול תרצי?</h3>
                  <p className="text-sm text-gray-400 mb-5">בחרי מהרשימה כדי להמשיך</p>
                  {treatmentsLoading && <p className="text-gray-400 text-sm">טוענת...</p>}
                  <div className="space-y-2">
                    {treatments.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setTreatmentId(t.id);
                          setStep(1);
                        }}
                        className="w-full flex justify-between items-center bg-white/5 border border-white/10 rounded-2xl p-4 hover:border-brand-rose/40 transition-colors text-right"
                      >
                        <div>
                          <p className="text-white font-semibold">{t.title}</p>
                          <p className="text-xs text-gray-400 tabular-nums">{t.duration} דקות</p>
                        </div>
                        <span className="text-brand-rose font-bold tabular-nums">₪{t.price}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="py-2">
                  <button type="button" onClick={() => setStep(0)} className="text-sm text-gray-400 mb-3">
                    ← שינוי טיפול
                  </button>
                  <h3 className="text-2xl font-serif font-bold text-white mb-1">מתי נוח לך?</h3>
                  <p className="text-sm text-gray-400 mb-5">{selectedTreatment?.title}</p>

                  {daysLoading && <p className="text-gray-400 text-sm mb-4">טוענת ימים פנויים...</p>}
                  {!daysLoading && availableDays.length === 0 && (
                    <p className="text-gray-400 text-sm mb-4">אין כרגע ימים פתוחים לקביעת תורים.</p>
                  )}

                  <CalendarPicker
                    availableDays={availableDays}
                    selectedDate={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      setSelectedTime(null);
                      setStep(2);
                    }}
                  />
                </div>
              )}
              {step === 2 && (
                <div className="py-2">
                  <button type="button" onClick={() => setStep(1)} className="text-sm text-gray-400 mb-3">
                    ← שינוי תאריך
                  </button>
                  <h3 className="text-2xl font-serif font-bold text-white mb-1">באיזו שעה?</h3>
                  <p className="text-sm text-gray-400 mb-5">
                    {selectedDate} {checkingSlots && "· בודקת זמינות..."}
                  </p>

                  {!checkingSlots && availableStarts.length === 0 && (
                    <p className="text-gray-400 text-sm mb-4">אין שעות פנויות ביום הזה לטיפול הזה - נסי תאריך אחר.</p>
                  )}

                  {grouped.morning.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2">בוקר</p>
                      <div className="grid grid-cols-4 gap-2">
                        {grouped.morning.map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => {
                              setSelectedTime(t);
                              setStep(3);
                            }}
                            className="rounded-xl py-2.5 text-sm font-semibold border border-white/10 bg-white/5 hover:bg-brand-rose/20 tabular-nums transition-colors"
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {grouped.afternoon.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2">צהריים</p>
                      <div className="grid grid-cols-4 gap-2">
                        {grouped.afternoon.map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => {
                              setSelectedTime(t);
                              setStep(3);
                            }}
                            className="rounded-xl py-2.5 text-sm font-semibold border border-white/10 bg-white/5 hover:bg-brand-rose/20 tabular-nums transition-colors"
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {grouped.evening.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2">ערב</p>
                      <div className="grid grid-cols-4 gap-2">
                        {grouped.evening.map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => {
                              setSelectedTime(t);
                              setStep(3);
                            }}
                            className="rounded-xl py-2.5 text-sm font-semibold border border-white/10 bg-white/5 hover:bg-brand-rose/20 tabular-nums transition-colors"
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {step === 3 && (
                <div className="py-2">
                  <button type="button" onClick={() => setStep(2)} className="text-sm text-gray-400 mb-3">
                    ← שינוי שעה
                  </button>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-2xl font-serif font-bold text-white">{selectedTreatment?.title}</h3>
                      <p className="text-sm text-gray-400 tabular-nums">
                        {selectedDate} · {selectedTime} · {selectedTreatment?.duration} דק׳
                      </p>
                    </div>
                    {selectedTreatment && (
                      <span className="text-xl font-bold text-brand-rose tabular-nums">₪{selectedTreatment.price}</span>
                    )}
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {isLoggedIn ? (
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand-rose/20 flex items-center justify-center text-brand-rose">
                          <IconUser className="w-4 h-4" />
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

                    {errorMsg && <p className="text-xs text-red-400">{errorMsg}</p>}

                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="w-full rounded-2xl py-4 font-bold text-lg shadow-lg active:scale-95 transition-transform mt-2 flex items-center justify-center gap-2 text-white disabled:opacity-60 bg-gradient-to-r from-brand-rose to-pink-700"
                    >
                      {status === "loading" ? "שומר תור..." : "אישור והבטחת התור"}
                    </button>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
