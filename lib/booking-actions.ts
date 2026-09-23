"use client";

import { doc, deleteDoc, writeBatch } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { cellsForStart } from "@/lib/availability-engine";

export type CancelableBooking = {
  id: string;
  date: string;
  time: string;
  blockMinutes: number;
};

// מבטלת הזמנה: מוחקת את מסמך ההזמנה ומשחררת בחזרה את כל המשבצות שהיא תפסה
export async function cancelBooking(booking: CancelableBooking) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("NOT_AUTHENTICATED");

  const cells = cellsForStart(booking.time, booking.blockMinutes);
  const batch = writeBatch(db);

  batch.delete(doc(db, "doik/app/bookings", booking.id));
  cells.forEach((c) => {
    batch.delete(doc(db, "doik/app/bookedSlots", `${booking.date}_${c}`));
  });

  await batch.commit();
}
