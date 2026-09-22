"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useBookingSheet } from "@/lib/booking-sheet-context";

const navItems = [
  { href: "/", label: "בית" },
  { href: "/services", label: "כל הטיפולים" },
  { href: "/gallery", label: "גלריה" },
  { href: "/about", label: "אודות" },
  { href: "/account", label: "החשבון שלי" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { open } = useBookingSheet();

  useEffect(() => {
    const sentinel = document.getElementById("scroll-sentinel");
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0, rootMargin: "0px" }
    );
    observer.observe(sentinel);

    function onScroll() {
      setScrolled(window.scrollY > 40);
    }
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <>
      <div
        className={`fixed top-0 inset-x-0 z-40 max-w-md mx-auto transition-all duration-500 ${
          scrolled ? "p-3" : "p-6"
        }`}
        style={{ paddingTop: scrolled ? "calc(12px + var(--sat))" : undefined }}
      >
        <div
          className={`flex justify-between items-center transition-all duration-500 ${
            scrolled
              ? "bg-[rgba(20,20,20,0.75)] backdrop-blur-2xl border border-white/10 shadow-2xl px-5 py-2.5 rounded-full"
              : ""
          }`}
        >
          <div dir="ltr" className="flex items-baseline gap-1.5">
            <span className="font-latin italic font-bold text-xl tracking-wide text-white">Hodaya</span>
            <span className="text-[10px] font-sans font-bold tracking-[0.2em] text-brand-rose uppercase">Beauty</span>
          </div>
          <button
            onClick={() => setMenuOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-white"
            aria-label="פתח תפריט"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-[#0a0a0a]/98 backdrop-blur-2xl flex flex-col items-center justify-center gap-8">
          <button
            onClick={() => setMenuOpen(false)}
            className="absolute left-6 w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-white"
            style={{ top: "calc(24px + var(--sat))" }}
            aria-label="סגור תפריט"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="font-serif text-3xl font-bold text-white hover:text-brand-rose transition-colors"
            >
              {item.label}
            </Link>
          ))}
          <button
            onClick={() => {
              setMenuOpen(false);
              open();
            }}
            className="mt-4 bg-gradient-to-r from-brand-rose to-pink-700 text-white px-8 py-3 rounded-full text-lg font-bold"
          >
            קביעת תור
          </button>
        </div>
      )}
    </>
  );
}
