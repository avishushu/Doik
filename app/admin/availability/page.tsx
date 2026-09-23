"use client";

import { useState, useEffect } from "react";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

type TimeWindow = { start: string; end: string };
type AvailabilityDay = { date: string; windows: TimeWindow[] };

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
  const [loading, setLoading] = useState(true);

  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [windows, setWindows] = useState<TimeWindow[]>([{ start: "09:00", end: "18:00" }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const q = query(collection(db, "doik/app/availability"), orderBy("date"));
    const unsub = onSnapshot(q, (snap) => {
      const all = snap.docs.map((d) => d.data() as AvailabilityDay);
      setDays(all.filter((d) => d.date >= today));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  function addWindowRow() {
    setWindows((prev) => [...prev, { start: "", end: "" }]);
  }

  function removeWindowRow(index: number) {
    setWindows((prev) => prev.filter((_, i) => i !== index));
  }

  function updateWindow(index: number, field: "start" | "end", value: string) {
    setWindows((prev) => prev.map((w, i) => (i === index ? { ...w, [field]: value } : w)));
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!rangeStart || !rangeEnd) {
      setError("נא לבחור תאריך התחלה וסיום");
      return;
    }
    if (rangeEnd < rangeStart) {
      setError("תאריך הסיום חייב להיות אחרי תאריך ההתחלה");
      return;
    }
    if (windows.length === 0) {
      setError("נא להוסיף לפחות חלון שעות אחד");
      return;
    }
    for (const w of windows) {
      if (!w.start || !w.end) {
        setError("נא למלא שעת התחלה וסיום לכל חלון");
        return;
      }
      if (w.start >= w.end) {
        setError("בכל חלון, שעת ההתחלה חייבת להיות לפני שעת הסיום");
        return;
      }
    }
    const sorted = [...windows].sort((a, b) => a.start.localeCompare(b.start));
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].start < sorted[i - 1].end) {
        setError("חלונות הזמן חופפים - נא לתקן");
        return;
      }
    }

    setError("");
    setSaving(true);
    try {
      const dates = dateRange(rangeStart, rangeEnd);
      await Promise.all(
        dates.map((date) =>
          setDoc(doc(db, "doik/app/availability", date), { date, windows: sorted })
        )
      );
      setRangeStart("");
      setRangeEnd("");
      setWindows([{ start: "09:00", end: "18:00" }]);
    } catch (err) {
      console.error(err);
      setError("משהו השתבש, נסי שוב");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemoveDay(date: string) {
    if (!confirm(`להסיר את הזמינות ליום ${date}?`)) return;
    await deleteDoc(doc(db, "doik/app/availability", date));
  }

  return (
    <div className="app-shell px-6" style={{ paddingTop: "calc(96px + var(--sat))" }}>
      <h1 className="font-serif text-3xl font-bold text-white mb-2">ניהול זמינות</h1>
      <p className="text-sm text-gray-400 mb-6">
        בחרי טווח ימים, ותוכלי להוסיף כמה חלונות שעות שתרצי לאותם ימים - למשל בוקר וערב בנפרד.
      </p>

      <form onSubmit={handleAdd} className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-8 space-y-4">
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
          <label className="text-xs text-gray-400 mb-2 block">חלונות שעות (אפשר להוסיף יותר מאחד)</label>
          <div className="space-y-2">
            {windows.map((w, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="time"
                  value={w.start}
                  onChange={(e) => updateWindow(i, "start", e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm tabular-nums focus:outline-none focus:border-brand-rose"
                />
                <span className="text-gray-500 text-xs">עד</span>
                <input
                  type="time"
                  value={w.end}
                  onChange={(e) => updateWindow(i, "end", e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm tabular-nums focus:outline-none focus:border-brand-rose"
                />
                {windows.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeWindowRow(i)}
                    className="w-9 h-9 flex-shrink-0 rounded-full border border-red-500/30 text-red-300 flex items-center justify-center text-sm"
                    aria-label="הסרת חלון"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addWindowRow}
            className="mt-2 text-brand-rose text-sm font-semibold"
          >
            + הוספת חלון שעות נוסף
          </button>
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-gradient-to-r from-brand-rose to-pink-700 text-white rounded-full py-3 text-sm font-bold disabled:opacity-60"
        >
          {saving ? "שומרת..." : "סימון הימים כפנויים"}
        </button>
      </form>

      <h2 className="text-sm font-bold text-gray-400 mb-3">ימים פתוחים קרובים</h2>
      {loading && <p className="text-gray-400 text-sm">טוענת...</p>}
      {!loading && days.length === 0 && (
        <p className="text-gray-400 text-sm">אין עדיין ימים פתוחים לקביעת תורים.</p>
      )}
      <div className="space-y-2">
        {days.map((d) => (
          <div
            key={d.date}
            className="bg-white/5 border border-white/10 rounded-xl p-3 flex justify-between items-center"
          >
            <div>
              <p className="text-white text-sm font-semibold tabular-nums">{d.date}</p>
              <p className="text-xs text-gray-400 tabular-nums">
                {d.windows?.map((w) => `${w.start}-${w.end}`).join(" · ")}
              </p>
            </div>
            <button
              onClick={() => handleRemoveDay(d.date)}
              className="text-red-300 text-xs font-semibold px-3 py-1.5 border border-red-500/30 rounded-full hover:bg-red-950/30 transition-colors"
            >
              הסרה
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
