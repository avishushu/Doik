"use client";

import { useState, useEffect, useMemo } from "react";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  getDocs,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import AdminCalendar from "@/components/AdminCalendar";

type TimeWindow = { start: string; end: string };
type AvailabilityDay = { date: string; windows: TimeWindow[] };
type Booking = { id: string; treatment: string; date: string; time: string; name: string; phone: string };

function dateRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const cur = new Date(start);
  const last = new Date(end);
  while (cur <= last) {
    dates.push(cur.toISOString().slice(0, 10));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

export default function AvailabilityPage() {
  const [days, setDays] = useState<AvailabilityDay[]>([]);
  const [daysLoading, setDaysLoading] = useState(true);

  const [bookingCounts, setBookingCounts] = useState<Map<string, number>>(new Map());

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dayBookings, setDayBookings] = useState<Booking[]>([]);
  const [dayBookingsLoading, setDayBookingsLoading] = useState(false);

  const [editWindows, setEditWindows] = useState<TimeWindow[]>([]);
  const [savingDay, setSavingDay] = useState(false);
  const [dayError, setDayError] = useState("");

  const [showQuickForm, setShowQuickForm] = useState(false);
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [quickWindows, setQuickWindows] = useState<TimeWindow[]>([{ start: "09:00", end: "18:00" }]);
  const [quickSaving, setQuickSaving] = useState(false);
  const [quickError, setQuickError] = useState("");

  const availableDateSet = useMemo(() => new Set(days.map((d) => d.date)), [days]);
  const selectedDay = days.find((d) => d.date === selectedDate) || null;

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const q = query(collection(db, "doik/app/availability"), orderBy("date"));
    const unsub = onSnapshot(q, (snap) => {
      const all = snap.docs.map((d) => d.data() as AvailabilityDay);
      setDays(all.filter((d) => d.date >= today));
      setDaysLoading(false);
    });
    return () => unsub();
  }, []);

  // סופר הזמנות לכל החודשים הקרובים בבת אחת, כדי שהנקודות על הלוח יופיעו מיד
  useEffect(() => {
    async function loadCounts() {
      const today = new Date().toISOString().slice(0, 10);
      const q = query(collection(db, "doik/app/bookings"), where("date", ">=", today));
      const snap = await getDocs(q);
      const counts = new Map<string, number>();
      snap.docs.forEach((d) => {
        const date = d.data().date as string;
        counts.set(date, (counts.get(date) || 0) + 1);
      });
      setBookingCounts(counts);
    }
    loadCounts();
  }, []);

  useEffect(() => {
    if (!selectedDate) {
      setDayBookings([]);
      return;
    }
    setDayBookingsLoading(true);
    const q = query(collection(db, "doik/app/bookings"), where("date", "==", selectedDate));
    getDocs(q).then((snap) => {
      const list = snap.docs
        .map((d) => ({ id: d.id, ...d.data() } as Booking))
        .sort((a, b) => a.time.localeCompare(b.time));
      setDayBookings(list);
      setDayBookingsLoading(false);
    });
  }, [selectedDate]);

  useEffect(() => {
    if (selectedDay) {
      setEditWindows(selectedDay.windows);
    } else {
      setEditWindows([]);
    }
    setDayError("");
  }, [selectedDate, selectedDay]);

  function addEditWindow() {
    setEditWindows((prev) => [...prev, { start: "", end: "" }]);
  }
  function removeEditWindow(i: number) {
    setEditWindows((prev) => prev.filter((_, idx) => idx !== i));
  }
  function updateEditWindow(i: number, field: "start" | "end", value: string) {
    setEditWindows((prev) => prev.map((w, idx) => (idx === i ? { ...w, [field]: value } : w)));
  }

  function validateWindows(list: TimeWindow[]): string | null {
    if (list.length === 0) return "נא להוסיף לפחות חלון שעות אחד";
    for (const w of list) {
      if (!w.start || !w.end) return "נא למלא שעת התחלה וסיום לכל חלון";
      if (w.start >= w.end) return "בכל חלון, שעת ההתחלה חייבת להיות לפני שעת הסיום";
    }
    const sorted = [...list].sort((a, b) => a.start.localeCompare(b.start));
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].start < sorted[i - 1].end) return "חלונות הזמן חופפים - נא לתקן";
    }
    return null;
  }

  async function saveSelectedDay() {
    if (!selectedDate) return;
    const err = validateWindows(editWindows);
    if (err) {
      setDayError(err);
      return;
    }
    setDayError("");
    setSavingDay(true);
    try {
      const sorted = [...editWindows].sort((a, b) => a.start.localeCompare(b.start));
      await setDoc(doc(db, "doik/app/availability", selectedDate), { date: selectedDate, windows: sorted });
    } catch (err) {
      console.error(err);
      setDayError("משהו השתבש, נסי שוב");
    } finally {
      setSavingDay(false);
    }
  }

  async function closeSelectedDay() {
    if (!selectedDate) return;
    if (dayBookings.length > 0) {
      if (!confirm(`יש ${dayBookings.length} הזמנות ביום הזה - לסגור בכל זאת? ההזמנות עצמן לא יבוטלו.`)) return;
    }
    setSavingDay(true);
    try {
      await deleteDoc(doc(db, "doik/app/availability", selectedDate));
    } catch (err) {
      console.error(err);
      setDayError("משהו השתבש, נסי שוב");
    } finally {
      setSavingDay(false);
    }
  }

  function addQuickWindow() {
    setQuickWindows((prev) => [...prev, { start: "", end: "" }]);
  }
  function removeQuickWindow(i: number) {
    setQuickWindows((prev) => prev.filter((_, idx) => idx !== i));
  }
  function updateQuickWindow(i: number, field: "start" | "end", value: string) {
    setQuickWindows((prev) => prev.map((w, idx) => (idx === i ? { ...w, [field]: value } : w)));
  }

  async function handleQuickAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!rangeStart || !rangeEnd) {
      setQuickError("נא לבחור תאריך התחלה וסיום");
      return;
    }
    if (rangeEnd < rangeStart) {
      setQuickError("תאריך הסיום חייב להיות אחרי תאריך ההתחלה");
      return;
    }
    const err = validateWindows(quickWindows);
    if (err) {
      setQuickError(err);
      return;
    }
    setQuickError("");
    setQuickSaving(true);
    try {
      const sorted = [...quickWindows].sort((a, b) => a.start.localeCompare(b.start));
      const dates = dateRange(rangeStart, rangeEnd);
      await Promise.all(
        dates.map((date) => setDoc(doc(db, "doik/app/availability", date), { date, windows: sorted }))
      );
      setRangeStart("");
      setRangeEnd("");
      setQuickWindows([{ start: "09:00", end: "18:00" }]);
      setShowQuickForm(false);
    } catch (err) {
      console.error(err);
      setQuickError("משהו השתבש, נסי שוב");
    } finally {
      setQuickSaving(false);
    }
  }

  return (
    <div className="app-shell px-6" style={{ paddingTop: "calc(96px + var(--sat))" }}>
      <h1 className="font-serif text-3xl font-bold text-white mb-2">ניהול זמינות</h1>
      <p className="text-sm text-gray-400 mb-6">
        לחצי על יום כדי לראות הזמנות ולערוך שעות, או סמני טווח ימים שלם בבת אחת.
      </p>

      {daysLoading ? (
        <p className="text-gray-400 text-sm mb-6">טוענת...</p>
      ) : (
        <AdminCalendar
          availableDateSet={availableDateSet}
          bookingCounts={bookingCounts}
          selectedDate={selectedDate}
          onSelect={(date) => setSelectedDate(date)}
        />
      )}

      {selectedDate && (
        <div className="mt-6 bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-white font-bold tabular-nums">{selectedDate}</p>
            <button
              type="button"
              onClick={() => setSelectedDate(null)}
              className="text-xs text-gray-500 hover:text-white"
            >
              סגירה
            </button>
          </div>

          <p className="text-xs text-gray-400 mb-2">הזמנות ביום זה</p>
          {dayBookingsLoading && <p className="text-gray-500 text-xs mb-4">טוענת...</p>}
          {!dayBookingsLoading && dayBookings.length === 0 && (
            <p className="text-gray-500 text-xs mb-4">אין הזמנות ביום זה.</p>
          )}
          {dayBookings.length > 0 && (
            <div className="space-y-2 mb-5">
              {dayBookings.map((b) => (
                <div key={b.id} className="bg-black/20 border border-white/5 rounded-xl p-3">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-white text-sm font-semibold">{b.treatment}</span>
                    <span className="text-brand-rose text-xs font-bold tabular-nums">{b.time}</span>
                  </div>
                  <p className="text-xs text-gray-400">{b.name}</p>
                  <p className="text-xs text-gray-500" dir="ltr">{b.phone}</p>
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-white/10 pt-4">
            <p className="text-xs text-gray-400 mb-2">
              {selectedDay ? "שעות פתיחה ביום זה" : "היום הזה עדיין סגור - הוסיפי שעות כדי לפתוח אותו"}
            </p>
            <div className="space-y-2 mb-3">
              {editWindows.map((w, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="time"
                    value={w.start}
                    onChange={(e) => updateEditWindow(i, "start", e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl p-2.5 text-white text-sm tabular-nums focus:outline-none focus:border-brand-rose"
                  />
                  <span className="text-gray-500 text-xs">עד</span>
                  <input
                    type="time"
                    value={w.end}
                    onChange={(e) => updateEditWindow(i, "end", e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl p-2.5 text-white text-sm tabular-nums focus:outline-none focus:border-brand-rose"
                  />
                  <button
                    type="button"
                    onClick={() => removeEditWindow(i)}
                    className="w-8 h-8 flex-shrink-0 rounded-full border border-red-500/30 text-red-300 flex items-center justify-center text-xs"
                    aria-label="הסרת חלון"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <button type="button" onClick={addEditWindow} className="text-brand-rose text-xs font-semibold mb-4">
              + הוספת חלון שעות
            </button>

            {dayError && <p className="text-xs text-red-400 mb-3">{dayError}</p>}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={saveSelectedDay}
                disabled={savingDay}
                className="flex-1 bg-gradient-to-r from-brand-rose to-pink-700 text-white rounded-full py-2.5 text-sm font-bold disabled:opacity-60"
              >
                {savingDay ? "שומרת..." : "שמירת שעות"}
              </button>
              {selectedDay && (
                <button
                  type="button"
                  onClick={closeSelectedDay}
                  disabled={savingDay}
                  className="flex-1 border border-red-500/30 text-red-300 rounded-full py-2.5 text-sm font-semibold disabled:opacity-50"
                >
                  סגירת היום
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mt-6">
        <button
          type="button"
          onClick={() => setShowQuickForm((v) => !v)}
          className="text-sm text-gray-400 font-semibold flex items-center gap-1"
        >
          {showQuickForm ? "▲" : "▼"} סימון טווח ימים בבת אחת
        </button>

        {showQuickForm && (
          <form onSubmit={handleQuickAdd} className="bg-white/5 border border-white/10 rounded-2xl p-5 mt-3 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">מתאריך</label>
                <input
                  type="date"
                  value={rangeStart}
                  onChange={(e) => setRangeStart(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm tabular-nums focus:outline-none focus:border-brand-rose"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">עד תאריך</label>
                <input
                  type="date"
                  value={rangeEnd}
                  onChange={(e) => setRangeEnd(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm tabular-nums focus:outline-none focus:border-brand-rose"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-2 block">חלונות שעות</label>
              <div className="space-y-2">
                {quickWindows.map((w, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="time"
                      value={w.start}
                      onChange={(e) => updateQuickWindow(i, "start", e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm tabular-nums focus:outline-none focus:border-brand-rose"
                    />
                    <span className="text-gray-500 text-xs">עד</span>
                    <input
                      type="time"
                      value={w.end}
                      onChange={(e) => updateQuickWindow(i, "end", e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm tabular-nums focus:outline-none focus:border-brand-rose"
                    />
                    {quickWindows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuickWindow(i)}
                        className="w-9 h-9 flex-shrink-0 rounded-full border border-red-500/30 text-red-300 flex items-center justify-center text-sm"
                        aria-label="הסרת חלון"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button type="button" onClick={addQuickWindow} className="mt-2 text-brand-rose text-sm font-semibold">
                + הוספת חלון שעות נוסף
              </button>
            </div>

            {quickError && <p className="text-xs text-red-400">{quickError}</p>}

            <button
              type="submit"
              disabled={quickSaving}
              className="w-full bg-gradient-to-r from-brand-rose to-pink-700 text-white rounded-full py-3 text-sm font-bold disabled:opacity-60"
            >
              {quickSaving ? "שומרת..." : "סימון הימים כפנויים"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
