"use client";

import { useEffect, useState } from "react";
import { collection, doc, getDoc, onSnapshot, query, orderBy, where } from "firebase/firestore";
import { db } from "./firebase";

export type Treatment = {
  id: string;
  title: string;
  duration: number;
  price: number;
  active: boolean;
};

export type TimeWindow = { start: string; end: string };
export type AvailabilityDay = { date: string; windows: TimeWindow[] };

export function useTreatments() {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "doik/app/treatments"), orderBy("title"));
    const unsub = onSnapshot(q, (snap) => {
      const all = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Treatment));
      setTreatments(all.filter((t) => t.active));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return { treatments, loading };
}

export function useBufferMinutes() {
  const [buffer, setBuffer] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDoc(doc(db, "doik/app/settings", "global")).then((snap) => {
      if (snap.exists() && typeof snap.data().bufferMinutes === "number") {
        setBuffer(snap.data().bufferMinutes);
      }
      setLoading(false);
    });
  }, []);

  return { buffer, loading };
}

export function useAvailableDays() {
  const [days, setDays] = useState<AvailabilityDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const q = query(
      collection(db, "doik/app/availability"),
      where("date", ">=", today),
      orderBy("date")
    );
    const unsub = onSnapshot(q, (snap) => {
      setDays(snap.docs.map((d) => d.data() as AvailabilityDay));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return { days, loading };
}
