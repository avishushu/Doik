"use client";

import { useEffect, useRef } from "react";

const TOP_BAR_HEIGHT = "calc(90px + var(--sat))";
const FADE_HEIGHT = 50;
const topBarStyle = { height: TOP_BAR_HEIGHT };
const fadeStyle = { top: TOP_BAR_HEIGHT, height: FADE_HEIGHT };

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
    <header className="relative hero-height w-full overflow-hidden bg-black">
      {/* התמונה - מתחילה מיד ב-y=0, יושבת מתחת לכל שאר השכבות */}
      <div ref={mediaRef} className="absolute inset-0 w-full h-full" style={{ willChange: "transform" }}>
        <img
          src="/icons/doik_hero_250926.jpg"
          alt="הודיה ביוטי"
          className="w-full h-full object-contain"
        />
      </div>

      {/* רצועה שחורה אטומה לגמרי - בדיוק בגובה ה-header, 0 עד 90px */}
      <div className="absolute inset-x-0 top-0 bg-black z-20" style={topBarStyle} />

      {/* השתלבות הדרגתית - מ-90px עד 140px, שחור 100% יורד ל-0% */}
      <div
        className="absolute inset-x-0 bg-gradient-to-b from-black to-transparent z-10 pointer-events-none"
        style={fadeStyle}
      />

      {/* דהייה תחתונה - נשארת בנפרד, לטובת קריאות הלוגו התחתון בלבד */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-brand-dark to-transparent" />

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
