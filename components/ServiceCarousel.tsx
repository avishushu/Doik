"use client";

import { useEffect, useRef } from "react";
import { useBookingSheet } from "@/lib/booking-sheet-context";
import { services } from "@/lib/services-data";

const featured = services.filter((s) => s.featured);

export default function ServiceCarousel() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const { open } = useBookingSheet();

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    const cards = carousel.querySelectorAll<HTMLDivElement>(".service-card");

    function updateScales() {
      if (!carousel) return;
      const center = carousel.getBoundingClientRect().left + carousel.offsetWidth / 2;
      cards.forEach((card) => {
        const box = card.getBoundingClientRect();
        const cardCenter = box.left + box.width / 2;
        const distance = Math.abs(center - cardCenter);
        if (distance < 90) {
          card.style.transform = "scale(1.08) translateY(-12px)";
          card.style.opacity = "1";
          card.style.borderColor = "rgba(190, 24, 93, 0.6)";
          card.style.boxShadow = "0 20px 40px -10px rgba(190, 24, 93, 0.3)";
        } else {
          card.style.transform = "scale(0.88) translateY(0px)";
          card.style.opacity = "0.55";
          card.style.borderColor = "rgba(255, 255, 255, 0.1)";
          card.style.boxShadow = "none";
        }
      });
    }

    carousel.addEventListener("scroll", updateScales);
    window.addEventListener("resize", updateScales);
    const t = setTimeout(updateScales, 150);
    return () => {
      carousel.removeEventListener("scroll", updateScales);
      window.removeEventListener("resize", updateScales);
      clearTimeout(t);
    };
  }, []);

  return (
    <div ref={carouselRef} className="flex gap-2 overflow-x-auto no-scrollbar py-6 -mx-6 px-[20%] snap-x snap-mandatory">
      {featured.map((s) => (
        <div
          key={s.title}
          onClick={() => open({ title: s.title, price: s.price, duration: s.duration })}
          className="service-card snap-center relative min-w-[220px] max-w-[220px] h-[300px] rounded-[2.5rem] overflow-hidden flex-shrink-0 cursor-pointer border border-white/10 bg-neutral-900 transition-[transform,opacity,box-shadow,border-color] duration-300"
        >
          <img src={s.image} alt={s.title} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
          {s.badge && (
            <div className="absolute top-4 right-4 bg-brand-rose/90 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
              <span className="text-xs text-white font-bold">{s.badge}</span>
            </div>
          )}
          <div className="absolute bottom-0 inset-x-0 p-5">
            <div className="bg-white/10 backdrop-blur-md w-10 h-10 rounded-2xl flex items-center justify-center mb-3 border border-white/10">
              <span className="text-xl">{s.emoji}</span>
            </div>
            <h3 className="font-bold text-lg mb-1 text-white">{s.title}</h3>
            <p className="text-xs text-pink-200 font-bold tabular-nums">{s.price} • {s.duration}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
