"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthContext } from "@/lib/auth-context";
import { useBookingSheet } from "@/lib/booking-sheet-context";
import { IconLock } from "@/components/icons";

type Booking = {
  id: string;
  treatment: string;
  date: string;
  time: string;
};

export default function MyBookingsPage() {
  const { user, loading } = useAuthContext();
  const { open } = useBookingSheet();
  const isLoggedIn = !!user && !user.isAnonymous;

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) {
      setFetching(false);
      return;
    }
    async function load() {
      const today = new Date().toISOString().slice(0, 10);
      const q = query(
        collection(db, "doik/app/bookings"),
        where("createdBy", "==", user!.uid),
        orderBy("date"),
        limit(50)
      );
      const snap = await getDocs(q);
      const all = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Booking));
      setBookings(all.filter((b) => b.date >= today));
      setFetching(false);
    }
    load();
  }, [isLoggedIn, user]);

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

      <div className="space-y-3 mb-6">
        {bookings.map((b) => (
          <div key={b.id} className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <h3 className="font-bold text-white mb-1">{b.treatment}</h3>
            <p className="text-sm text-brand-rose font-semibold tabular-nums">
              {b.date} · {b.time}
            </p>
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
