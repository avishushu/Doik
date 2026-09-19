"use client";

import { services } from "@/lib/services-data";
import { useBookingSheet } from "@/lib/booking-sheet-context";

export default function ServiceGrid() {
  const { open } = useBookingSheet();

  return (
    <div className="grid grid-cols-2 gap-3">
      {services.map((s) => (
        <div
          key={s.title}
          onClick={() => open({ title: s.title, price: s.price, duration: s.duration })}
          className="relative aspect-[3/4] rounded-[1.75rem] overflow-hidden cursor-pointer border border-white/10 bg-neutral-900"
        >
          <img src={s.image} alt={s.title} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
          {s.badge && (
            <div className="absolute top-3 right-3 bg-brand-rose/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
              <span className="text-[10px] text-white font-bold">{s.badge}</span>
            </div>
          )}
          <div className="absolute bottom-0 inset-x-0 p-4">
            <h3 className="font-bold text-sm mb-0.5 text-white">{s.title}</h3>
            <p className="text-[11px] text-pink-200 font-bold tabular-nums">{s.price} • {s.duration}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
