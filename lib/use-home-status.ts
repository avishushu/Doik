"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, limit, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { db } from "./firebase";
import { useAuthContext } from "./auth-context";
import { useTreatments, useBufferMinutes, useAvailableDays } from "./use-doik-data";
import {
  totalBlockMinutes,
  computeAvailableStarts,
  countNonOverlapping,
} from "./availability-engine";
import { todayIL, nowMinutesIL, minutesUntil } from "./date-utils";

// כמה ימים פתוחים לכל היותר נסרקים בחיפוש "התור הפנוי הקרוב" (כל יום = שאילתה אחת)
const MAX_DAYS_SCANNED = 10;

export type NextBooking = { id: string; treatment: string; date: string; time: string };

// התור הקרוב של המשתמשת הנוכחית - גם אם לא נרשמה (משתמשת אנונימית עם אותו מכשיר).
// מאזין חי, כך שתור חדש או ביטול מתעדכנים מיד
export function useNextBooking() {
  const { user } = useAuthContext();
  const uid = user?.uid ?? null;
  const [bookings, setBookings] = useState<NextBooking[]>([]);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!uid) {
      setBookings([]);
      return;
    }
    const q = query(
      collection(db, "doik/app/bookings"),
      where("createdBy", "==", uid),
      orderBy("date"),
      limit(50)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setBookings(snap.docs.map((d) => ({ id: d.id, ...d.data() } as NextBooking)));
      },
      (err) => {
        console.error("failed to load next booking", err);
        setBookings([]);
      }
    );
    return () => unsub();
  }, [uid]);

  const next = useMemo(() => {
    const upcoming = bookings
      .filter((b) => minutesUntil(b.date, b.time, now) >= 0)
      .sort((a, b) => (a.date + a.time < b.date + b.time ? -1 : 1));
    return upcoming[0] ?? null;
  }, [bookings, now]);

  const minutes = next ? minutesUntil(next.date, next.time, now) : null;
  return { next, minutes };
}

export type NextAvailability = { date: string; capacity: number } | null;

// היום הפנוי הקרוב ביותר, ובמקרה שזה היום - כמה תורים (בלי חפיפה) נשארו.
// משתמש בטיפול הקצר ביותר כמדד, כי זה מה שקובע אם בכלל נשאר מקום.
// reloadKey: משנים אותו כדי לרענן (למשל אחרי שהמשתמשת קבעה או ביטלה תור)
export function useNextAvailability(reloadKey: string) {
  const { treatments, loading: treatmentsLoading } = useTreatments();
  const { buffer, loading: bufferLoading } = useBufferMinutes();
  const { days, loading: daysLoading } = useAvailableDays();
  const [result, setResult] = useState<NextAvailability>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (treatmentsLoading || bufferLoading || daysLoading) return;

    const durations = treatments.map((t) => t.duration).filter((d) => typeof d === "number" && d > 0);
    if (durations.length === 0) {
      setResult(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const block = totalBlockMinutes(Math.min(...durations), buffer);
    const today = todayIL();
    const nowMin = nowMinutesIL();
    const candidates = days
      .filter((d) => d.date >= today && d.windows && d.windows.length > 0)
      .slice(0, MAX_DAYS_SCANNED);

    (async () => {
      try {
        for (const d of candidates) {
          const snap = await getDocs(
            query(collection(db, "doik/app/bookedSlots"), where("date", "==", d.date))
          );
          if (cancelled) return;
          const taken = new Set(snap.docs.map((x) => x.data().time as string));
          const starts = computeAvailableStarts(d.windows, block, taken, d.date === today ? nowMin : 0);
          if (starts.length > 0) {
            setResult({ date: d.date, capacity: countNonOverlapping(starts, block) });
            setLoading(false);
            return;
          }
        }
        if (!cancelled) {
          setResult(null);
          setLoading(false);
        }
      } catch (err) {
        console.error("failed to compute next availability", err);
        if (!cancelled) {
          setResult(null);
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [treatmentsLoading, bufferLoading, daysLoading, treatments, buffer, days, reloadKey]);

  return { result, loading };
}
