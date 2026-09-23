"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthContext } from "@/lib/auth-context";
import { useBookingSheet } from "@/lib/booking-sheet-context";
import { cancelBooking } from "@/lib/booking-actions";
import { IconLock } from "@/components/icons";

type Booking = {
  id: string;
  treatment: string;
  date: string;
  time: string;
  blockMinutes: number;
};

export default function MyBookingsPage() {
  const { user, loading } = useAuthContext();
  const { open } = useBookingSheet();
  const isLoggedIn = !!user && !user.isAnonymous;

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [fetching, setFetching] = useState(true);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  async function loadBookings() {
    if (!user) return;
    const today = new Date().toISOString().slice(0, 10);
    const q = query(
      collection(db, "doik/app/bookings"),
      where("createdBy", "==", user.uid),
      orderBy("date"),
      limit(50)
    );
    const snap = await getDocs(q);
    const all = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Booking));
    setBookings(all.filter((b) => b.date >= today));
    setFetching(false);
  }

  useEffect(() => {
    if (!isLoggedIn) {
      setFetching(false);
      return;
    }
    loadBookings();
  }, [isLoggedIn, user]);

  async function handleCancel(b: Booking) {
    if (!confirm(`לבטל את התור ל${b.treatment} בתאריך ${b.date}?`)) return;
    setErrorMsg("");
    setCancelingId(b.id);
    try {
      await cancelBooking(b);
      setBookings((prev) => prev.filter((x) => x.id !== b.id));
    } catch (err) {
      console.error(err);
      setErrorMsg("לא הצלחנו לבטל את התור, נסי שוב או צרי קשר בוואטסאפ");
    } finally {
      setCancelingId(null);
    }
  }

  async function handleReschedule(b: Booking) {
    if (!confirm("שינוי התור יבטל את התור הנוכחי ויפתח קביעת תור חדשה - להמשיך?")) return;
    setErrorMsg("");
    setCancelingId(b.id);
    try {
      await cancelBooking(b);
      setBookings((prev) => prev.filter((x) => x.id !== b.id));
      open({ title: b.treatment, price: "", duration: "" });
    } catch (err) {
      console.error(err);
      setErrorMsg("לא הצלחנו לשנות את התור, נסי שוב או צרי קשר בוואטסאפ");
    } finally {
      setCancelingId(null);
    }
  }

  if (loading) {
    return (
      <div className="app-shell px-6" style={{ paddingTop: "calc(96px + var(--sat))" }}>
        <p className="text-gray-400 text-sm">טוען...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="app-shell px-6" style={{ paddingTop: "calc(96px + var(--sat))" }}>
        <h1 className="font-serif text-3xl font-bold text-white mb-8">התורים שלי</h1>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-brand-rose/20 flex items-center justify-center mx-auto mb-4 text-brand-rose">
            <IconLock className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">התחברי כדי לצפות בהיסטוריית התורים שלך</h3>
          <p className="text-sm text-gray-400 mb-5">כך נזכיר לך על התור הקרוב ותוכלי לראות אותו כאן בכל רגע.</p>
          <Link
            href="/account"
            className="inline-block bg-gradient-to-r from-brand-rose to-pink-700 text-white px-6 py-3 rounded-full text-sm font-bold"
          >
            התחברות / הרשמה
          </Link>
        </div>
        <button
          onClick={() => open()}
          className="w-full border border-white/15 text-white rounded-full py-3.5 text-sm font-semibold hover:bg-white/5 transition-colors"
        >
          קביעת תור בכל זאת
        </button>
      </div>
    );
  }

  return (
    <div className="app-shell px-6" style={{ paddingTop: "calc(96px + var(--sat))" }}>
      <h1 className="font-serif text-3xl font-bold text-white mb-8">התורים שלי</h1>

      {fetching && <p className="text-gray-400 text-sm mb-6">טוען...</p>}

      {!fetching && bookings.length === 0 && (
        <p className="text-gray-400 text-sm mb-6">אין לך תורים קרובים כרגע.</p>
      )}

      {errorMsg && <p className="text-xs text-red-400 mb-4">{errorMsg}</p>}

      <div className="space-y-3 mb-6">
        {bookings.map((b) => (
          <div key={b.id} className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <h3 className="font-bold text-white mb-1">{b.treatment}</h3>
            <p className="text-sm text-brand-rose font-semibold tabular-nums mb-3">
              {b.date} · {b.time}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleReschedule(b)}
                disabled={cancelingId === b.id}
                className="flex-1 border border-white/15 text-white rounded-full py-2 text-xs font-semibold hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                שינוי תור
              </button>
              <button
                onClick={() => handleCancel(b)}
                disabled={cancelingId === b.id}
                className="flex-1 border border-red-500/30 text-red-300 rounded-full py-2 text-xs font-semibold hover:bg-red-950/30 transition-colors disabled:opacity-50"
              >
                {cancelingId === b.id ? "מבטלת..." : "ביטול תור"}
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => open()}
        className="w-full bg-gradient-to-r from-brand-rose to-pink-700 text-white rounded-full py-3.5 text-sm font-bold active:scale-95 transition-transform"
      >
        הזמיני תור נוסף
      </button>
    </div>
  );
}
