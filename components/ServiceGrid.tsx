"use client";

import { useTreatments } from "@/lib/use-doik-data";
import { useBookingSheet } from "@/lib/booking-sheet-context";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1457972729786-0411a3b2b626?auto=format&fit=crop&q=80&w=600";

export default function ServiceGrid() {
  const { open } = useBookingSheet();
  const { treatments, loading } = useTreatments();

  if (loading) return <p className="text-gray-400 text-sm">טוענת טיפולים...</p>;
  if (treatments.length === 0) return <p className="text-gray-400 text-sm">אין עדיין טיפולים זמינים.</p>;

  return (
    <div className="grid grid-cols-2 gap-3">
      {treatments.map((t) => (
        <div
          key={t.id}
          onClick={() => open({ title: t.title, price: String(t.price), duration: String(t.duration) })}
          className="relative aspect-[3/4] rounded-[1.75rem] overflow-hidden cursor-pointer border border-white/10 bg-neutral-900"
        >
          <img src={t.image || FALLBACK_IMAGE} alt={t.title} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
          <div className="absolute bottom-0 inset-x-0 p-4">
            <h3 className="font-bold text-sm mb-0.5 text-white">{t.title}</h3>
            <p className="text-[11px] text-pink-200 font-bold tabular-nums">₪{t.price} • {t.duration} דק'</p>
          </div>
        </div>
      ))}
    </div>
  );
}
