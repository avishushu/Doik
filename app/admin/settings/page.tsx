"use client";

import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminSettingsPage() {
  const [buffer, setBuffer] = useState("15");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const snap = await getDoc(doc(db, "doik/app/settings", "global"));
      if (snap.exists() && snap.data().bufferMinutes != null) {
        setBuffer(String(snap.data().bufferMinutes));
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const num = parseInt(buffer, 10);
    if (isNaN(num) || num < 0 || num > 120) {
      setError("המרווח חייב להיות בין 0 ל-120 דקות");
      return;
    }
    setError("");
    setSaving(true);
    setSaved(false);
    try {
      await setDoc(doc(db, "doik/app/settings", "global"), { bufferMinutes: num }, { merge: true });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error(err);
      setError("משהו השתבש, נסי שוב");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="app-shell px-6" style={{ paddingTop: "calc(96px + var(--sat))" }}>
      <h1 className="font-serif text-3xl font-bold text-white mb-2">הגדרות</h1>
      <p className="text-sm text-gray-400 mb-8">
        המרווח הזה חל אוטומטית אחרי כל טיפול, כדי שיהיה לך זמן ניקוי ומעבר בין לקוחות.
      </p>

      {loading ? (
        <p className="text-gray-400 text-sm">טוענת...</p>
      ) : (
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">מרווח בין תורים (דקות)</label>
            <input
              type="number"
              value={buffer}
              onChange={(e) => setBuffer(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white tabular-nums focus:outline-none focus:border-brand-rose"
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}
          {saved && <p className="text-xs text-green-400">נשמר בהצלחה ✓</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-gradient-to-r from-brand-rose to-pink-700 text-white rounded-2xl py-4 font-bold disabled:opacity-60"
          >
            {saving ? "שומרת..." : "שמירת הגדרות"}
          </button>
        </form>
      )}
    </div>
  );
}
