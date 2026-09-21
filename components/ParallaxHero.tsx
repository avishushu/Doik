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
          src="https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0"
          alt="הודיה ביוטי"
          className="w-full h-full object-cover opacity-85"
        />
      </div>
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
