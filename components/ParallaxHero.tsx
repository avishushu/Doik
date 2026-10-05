"use client";

import { useEffect, useRef } from "react";

// כמה מהגלילה התמונה "מפגרת" אחריה - 0.25 זהה לגרסה המקורית של האפקט
const PARALLAX_FACTOR = 0.25;

export default function ParallaxHero() {
  const mediaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {

    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const scrollY = Math.max(0, window.scrollY);
        if (mediaRef.current && scrollY < window.innerHeight) {
          mediaRef.current.style.transform = `translate3d(0, ${scrollY * PARALLAX_FACTOR}px, 0)`;
        }
        ticking = false;
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="w-full">
      {/* מרווח ביטחון - בדיוק ברוחב/גובה ההדר הכולל, שחור אחיד */}
      <div className="w-full bg-black" style={{ height: "calc(96px + var(--sat))" }} />

      {/* התמונה - בזרימה רגילה, גובה טבעי לפי יחס הרוחב-גובה שלה, לא תלוי במסך בכלל */}
      <div className="relative w-full overflow-hidden bg-black">
        {/* רק התמונה זזה בגלילה (פרלקס). הגרדיאנטים והלוגו נשארים במקומם. בראש הדף אין הזזה בכלל, אז הפריסה זהה לקודם */}
        <div ref={mediaRef} style={{ willChange: "transform" }}>
          <img
            src="/icons/doik_hero_250926.jpg"
            alt="הודיה ביוטי"
            className="w-full h-auto block"
          />
        </div>
        {/* השתלבות הדרגתית - בדיוק 50px ראשונים של התמונה, זזה איתה תמיד */}
        <div className="absolute inset-x-0 top-0 h-[50px] bg-gradient-to-b from-black to-transparent pointer-events-none" />

        {/* גרדיאנט תחתון - נותן רקע כהה קריא ללוגו שיושב על התמונה */}
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-brand-dark to-transparent pointer-events-none" />

        {/* הלוגו - מקובע לתחתית התמונה, עם אותה אנימציית כניסה כמו קודם */}
        <div className="absolute bottom-5 right-6 left-6 z-10 flex flex-col items-start opacity-0 animate-hero-logo-in">
          <div dir="ltr" className="flex items-baseline gap-2 justify-end w-full">
            <span className="font-latin italic font-bold text-5xl tracking-wide text-white">Hodaya</span>
          </div>
          <span className="block mt-1 text-sm font-sans font-bold tracking-[0.35em] text-brand-rose uppercase">
            Beauty
          </span>
        </div>
      </div>

      {/* רווח לפני המסכים הבאים */}
      <div className="h-6" />
    </div>
  );
}
