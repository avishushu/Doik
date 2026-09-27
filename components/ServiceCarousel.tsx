"use client";

import { useEffect, useRef } from "react";
import { useBookingSheet } from "@/lib/booking-sheet-context";
import { useTreatments } from "@/lib/use-doik-data";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1457972729786-0411a3b2b626?auto=format&fit=crop&q=80&w=600";

export default function ServiceCarousel() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const { open } = useBookingSheet();
  const { treatments, loading } = useTreatments();

  const featured = treatments.filter((t) => t.featured);
  const setLength = featured.length;
  const loopItems = setLength > 0 ? [...featured, ...featured, ...featured] : [];

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel || setLength === 0) return;
    const cards = Array.from(carousel.querySelectorAll<HTMLDivElement>(".service-card"));

    function cardScrollPosition(card: HTMLDivElement): number {
      if (!carousel) return 0;
      return card.getBoundingClientRect().left - carousel.getBoundingClientRect().left + carousel.scrollLeft;
    }
    function findNearestIndex(): number {
      if (!carousel) return -1;
      const center = carousel.getBoundingClientRect().left + carousel.offsetWidth / 2;
      let nearestIdx = -1;
      let nearestDist = Infinity;
      cards.forEach((card, idx) => {
        const box = card.getBoundingClientRect();
        const cardCenter = box.left + box.width / 2;
        const dist = Math.abs(center - cardCenter);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestIdx = idx;
        }
      });
      return nearestIdx;
    }
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
          card.style.zIndex = "10";
        } else {
          card.style.transform = "scale(0.88) translateY(0px)";
          card.style.opacity = "0.55";
          card.style.borderColor = "rgba(255, 255, 255, 0.1)";
          card.style.boxShadow = "none";
          card.style.zIndex = "1";
        }
      });
    }
    function measureSetWidth(): number {
      if (!cards[0] || !cards[setLength]) return 0;
      return cardScrollPosition(cards[setLength]) - cardScrollPosition(cards[0]);
    }
    function centerScrollLeftFor(index: number): number {
      const card = cards[index];
      if (!card || !carousel) return 0;
      return cardScrollPosition(card) + card.offsetWidth / 2 - carousel.clientWidth / 2;
    }
    function jumpTo(newLeft: number) {
      if (!carousel) return;
      carousel.style.scrollSnapType = "none";
      carousel.scrollLeft = newLeft;
      requestAnimationFrame(() => {
        if (carousel) carousel.style.scrollSnapType = "";
      });
    }
    function handleLoop() {
      if (!carousel) return;
      const idx = findNearestIndex();
      if (idx === -1) return;
      const setWidth = measureSetWidth();
      if (setWidth === 0) return;
      if (idx < setLength) jumpTo(carousel.scrollLeft + setWidth);
      else if (idx >= setLength * 2) jumpTo(carousel.scrollLeft - setWidth);
    }
    function onScroll() {
      updateScales();
      handleLoop();
    }
    function initPosition(): boolean {
      if (!carousel || !cards[setLength] || cards.length === 0) return false;
      if (carousel.clientWidth === 0) return false;
      jumpTo(centerScrollLeftFor(setLength));
      updateScales();
      return true;
    }

    carousel.addEventListener("scroll", onScroll);
    window.addEventListener("resize", updateScales);

    let resizeObserver: ResizeObserver | null = null;
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const ok = initPosition();
        if (!ok) {
          resizeObserver = new ResizeObserver(() => {
            if (initPosition() && resizeObserver) resizeObserver.disconnect();
          });
          resizeObserver.observe(carousel);
        }
      });
    });

    return () => {
      carousel.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateScales);
      cancelAnimationFrame(raf);
      resizeObserver?.disconnect();
    };
  }, [setLength]);

  if (loading) {
    return <p className="text-gray-400 text-sm py-6">טוענת טיפולים...</p>;
  }

  if (featured.length === 0) {
    return (
      <p className="text-gray-400 text-sm py-6">
        אין עדיין טיפולים מודגשים - סמני "להציג בקרוסלה" במסך ניהול הטיפולים.
      </p>
    );
  }

  return (
    <div
      ref={carouselRef}
      dir="ltr"
      className="relative flex gap-2 overflow-x-auto no-scrollbar py-6 -mx-6 px-[20%] snap-x snap-mandatory"
      style={{ scrollBehavior: "auto" }}
    >
      {loopItems.map((t, i) => (
        <div
          key={`${t.id}-${i}`}
          onClick={() => open({ title: t.title, price: String(t.price), duration: String(t.duration) })}
          className="service-card snap-center relative min-w-[220px] max-w-[220px] h-[300px] rounded-[2.5rem] overflow-hidden flex-shrink-0 cursor-pointer border border-white/10 bg-neutral-900 transition-[box-shadow,border-color] duration-150"
        >
          <img src={t.image || FALLBACK_IMAGE} alt={t.title} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
          <div className="absolute bottom-0 inset-x-0 p-5" dir="rtl">
            <h3 className="font-bold text-lg mb-1 text-white">{t.title}</h3>
            <p className="text-xs text-pink-200 font-bold tabular-nums">₪{t.price} • {t.duration} דק'</p>
          </div>
        </div>
      ))}
    </div>
  );
}
