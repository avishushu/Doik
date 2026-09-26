"use client";

import { useEffect, useRef } from "react";

const HEADER_CLEARANCE = "calc(56px + var(--sat))";

export default function ParallaxHero() {
  const mediaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;
    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          if (mediaRef.current && scrollY < window.innerHeight) {
            const translateY = scrollY * 0.25;
            mediaRef.current.style.transform = `translate3d(0, ${translateY}px, 0)`;
          }
          ticking = false;
        });
        ticking = true;
      }
    }
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="relative h-[65vh] w-full overflow-hidden bg-black">
      {/* רצועה קבועה - רק בגובה ה-header עצמו, שחור מלא */}
      <div className="absolute inset-x-0 top-0 bg-black z-20" style={{ height: HEADER_CLEARANCE }} />

      {/* התמונה המלאה, לא נחתכת, מתחילה מיד אחרי הרצועה */}
      <div className="absolute inset-x-0 bottom-0" style={{ top: HEADER_CLEARANCE }}>
        <div ref={mediaRef} className="absolute inset-0 w-full h-full" style={{ willChange: "transform" }}>
          <img
            src="/icons/doik_hero_250926.jpg"
            alt="הודיה ביוטי"
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* השתלבות הדרגתית - מתחילה מיד בסוף הרצועה השחורה ונמשכת טווח ניכר לתוך התמונה */}
      <div
        className="absolute inset-x-0 bg-gradient-to-b from-black via-black/60 to-transparent z-10 pointer-events-none"
        style={{ top: HEADER_CLEARANCE, height: "160px" }}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/20 to-transparent" />

      <div className="absolute bottom-16 right-6 left-6 z-10 flex flex-col items-start opacity-0 animate-hero-logo-in">
        <div dir="ltr" className="flex items-baseline gap-2 justify-end w-full">
          <span className="font-latin italic font-bold text-5xl tracking-wide text-white">Hodaya</span>
        </div>
        <span className="block mt-1 text-sm font-sans font-bold tracking-[0.35em] text-brand-rose uppercase">
          Beauty
        </span>
      </div>
    </header>
  );
}
