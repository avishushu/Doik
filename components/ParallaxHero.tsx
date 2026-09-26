"use client";

import { useEffect, useRef } from "react";

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
    <header className="relative h-[65vh] w-full hero-mask overflow-hidden bg-black">
      <div ref={mediaRef} className="absolute inset-0 w-full h-[112%] -top-[6%]" style={{ willChange: "transform" }}>
        <img
          src="/icons/doik_hero_250926.jpg"
          alt="הודיה ביוטי"
          className="w-full h-full object-contain"
          style={{
            maskImage: "linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)",
          }}
        />
      </div>
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-brand-dark to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/30 to-transparent" />
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
