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
            const translateY = scrollY * 0.45;
            const scale = 1 + scrollY * 0.0004;
            mediaRef.current.style.transform = `translate3d(0, ${translateY}px, 0) scale(${scale})`;
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
    <header className="relative h-[65vh] w-full hero-mask overflow-hidden">
      <div ref={mediaRef} className="absolute inset-0 w-full h-[140%] -top-[20%]" style={{ willChange: "transform" }}>
        <img
          src="https://images.unsplash.com/photo-1457972729786-0411a3b2b626?auto=format&fit=crop&q=80&w=1200"
          alt="המכון שלנו"
          className="w-full h-full object-cover opacity-85"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/30 to-transparent" />
      <div className="absolute bottom-16 right-6 left-6 z-10">
        <h1 className="font-serif text-5xl font-bold mb-3 text-white opacity-0 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          יופי<br />
          <span className="text-brand-rose italic font-light">שיש לו זמן אליך</span>
        </h1>
        <p className="text-gray-300 font-light tracking-wide text-lg opacity-0 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
          אמנות, טיפוח ויוקרה.
        </p>
      </div>
    </header>
  );
}
