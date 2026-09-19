import type { Metadata } from "next";
import { Rubik, Assistant, Playfair_Display } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import BookingSheet from "@/components/BookingSheet";
import { BookingSheetProvider } from "@/lib/booking-sheet-context";

const display = Rubik({
  subsets: ["hebrew", "latin"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-display",
  display: "swap",
});

const latin = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  variable: "--font-latin",
  display: "swap",
});

const body = Assistant({
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "שם המכון | מכון יופי יוקרתי",
  description: "מכון יופי יוקרתי המתמחה בבניית ציפורניים וג'ל, איפור מקצועי ותסרוקות.",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={`${display.variable} ${latin.variable} ${body.variable}`}>
      <body className="font-sans antialiased bg-brand-dark text-white relative overflow-x-hidden">
        <div className="fixed inset-0 w-full h-full pointer-events-none z-[-1] overflow-hidden">
          <div className="absolute top-[10%] right-[-10%] w-[250px] h-[250px] bg-pink-700/20 rounded-full mix-blend-screen blur-[80px] animate-blob" />
          <div className="absolute bottom-[20%] left-[-10%] w-[250px] h-[250px] bg-purple-700/20 rounded-full mix-blend-screen blur-[80px]" style={{ animationDelay: "2s" }} />
        </div>
        <BookingSheetProvider>
          <Header />
          <main className="pb-24">{children}</main>
          <BottomNav />
          <BookingSheet />
        </BookingSheetProvider>
      </body>
    </html>
  );
}
