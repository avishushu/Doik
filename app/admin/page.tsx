"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthContext } from "@/lib/auth-context";

type Booking = {
  id: string;
  treatment: string;
  date: string;
  time: string;
  name: string;
  phone: string;
};

export default function AdminPage() {
  const { user, userData, loading } = useAuthContext();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.isAnonymous || userData?.role !== "admin")) {
      router.replace("/account");
    }
  }, [loading, user, userData, router]);

  useEffect(() => {
    if (userData?.role !== "admin") return;
    async function load() {
      const today = new Date().toISOString().slice(0, 10);
      const q = query(
        collection(db, "doik/app/bookings"),
        where("date", ">=", today),
        orderBy("date"),
        limit(50)
      );
      const snap = await getDocs(q);
      setBookings(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Booking)));
      setFetching(false);
    }
    load();
  }, [userData]);

  if (loading || userData?.role !== "admin") {
    return (
      <div className="app-shell px-6" style={{ paddingTop: "calc(96px + var(--sat))" }}>
        <p className="text-gray-400 text-sm">טוען...</p>
      </div>
    );
  }

  return (
    <div className="app-shell px-6" style={{ paddingTop: "calc(96px + var(--sat))" }}>
      <h1 className="font-serif text-3xl font-bold text-white mb-2">הזמנות קרובות</h1>
      <p className="text-sm text-gray-400 mb-8">מהיום והלאה, עד 50 הזמנות</p>

      {fetching && <p className="text-gray-400 text-sm">טוען הזמנות...</p>}

      {!fetching && bookings.length === 0 && (
        <p className="text-gray-400 text-sm">אין הזמנות קרובות כרגע.</p>
      )}

      <div className="space-y-3">
        {bookings.map((b) => (
          <div key={b.id} className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-white">{b.treatment}</h3>
              <span className="text-brand-rose text-sm font-bold tabular-nums">
                {b.date} · {b.time}
              </span>
            </div>
            <p className="text-sm text-gray-300">{b.name}</p>
            <p className="text-sm text-gray-400" dir="ltr">{b.phone}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
