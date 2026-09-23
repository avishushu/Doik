"use client";

import Link from "next/link";
import { useAuthContext } from "@/lib/auth-context";

const WHATSAPP_NUMBER = "972538245057";
const WHATSAPP_MESSAGE = "היי הודיה, הגעתי דרך האתר";
const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

export default function BottomNav() {
  const { userData } = useAuthContext();
  const isAdmin = userData?.role === "admin";

  if (isAdmin) {
    return (
      <nav
        className="fixed bottom-0 inset-x-0 z-40 max-w-md mx-auto bg-[rgba(18,18,18,0.8)] backdrop-blur-2xl border-t border-white/10 px-6 py-3"
        style={{ paddingBottom: "var(--sab)" }}
      >
        <div className="flex justify-between items-center">
          <Link href="/admin" className="flex flex-col items-center gap-1 text-brand-rose">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>
            <span className="text-[10px] font-bold">לוח בקרה</span>
          </Link>
          <Link href="/admin/treatments" className="flex flex-col items-center gap-1 text-gray-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            <span className="text-[10px] font-bold">טיפולים</span>
          </Link>
          <Link href="/admin/availability" className="flex flex-col items-center gap-1 text-gray-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <span className="text-[10px] font-bold">זמינות</span>
          </Link>
          <Link href="/account" className="flex flex-col items-center gap-1 text-gray-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5z" /></svg>
            <span className="text-[10px] font-bold">חשבון</span>
          </Link>
        </div>
      </nav>
    );
  }

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 max-w-md mx-auto bg-[rgba(18,18,18,0.8)] backdrop-blur-2xl border-t border-white/10 px-6 py-3"
      style={{ paddingBottom: "var(--sab)" }}
    >
      <div className="flex justify-between items-center">
        <Link href="/" className="flex flex-col items-center gap-1 text-brand-rose">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>
          <span className="text-[10px] font-bold">ראשי</span>
        </Link>
        <Link href="/my-bookings" className="flex flex-col items-center gap-1 text-gray-400 hover:text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          <span className="text-[10px] font-bold">תורים</span>
        </Link>
        <a href="https://waze.com" target="_blank" className="flex flex-col items-center gap-1 text-gray-400 hover:text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          <span className="text-[10px] font-bold">ניווט</span>
        </a>
        <a href={whatsappHref} target="_blank" className="flex flex-col items-center gap-1 text-gray-400 hover:text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
          <span className="text-[10px] font-bold">וואטסאפ</span>
        </a>
      </div>
    </nav>
  );
}
