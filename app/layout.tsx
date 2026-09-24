import type { Metadata, Viewport } from "next";
import { Rubik, Assistant, Playfair_Display } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import BookingSheet from "@/components/BookingSheet";
import DebugConsole from "@/components/DebugConsole";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import { BookingSheetProvider } from "@/lib/booking-sheet-context";
import { AuthProvider } from "@/lib/auth-context";

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

export const viewport: Viewport = {
  themeColor: "#050505",
};

export const metadata: Metadata = {
  title: "Hodaya Beauty | מכון יופי יוקרתי",
  description: "Hodaya Beauty - בניית ציפורניים וג'ל, איפור מקצועי ותסרוקות ברמה גבוהה.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Hodaya Beauty",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={`${display.variable} ${latin.variable} ${body.variable}`}>
      <head>
        <link
          rel="apple-touch-startup-image"
          href="/splash/iphone-se.png"
          media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/iphone-standard.png"
          media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/iphone-plus.png"
          media="(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/iphone-pro-max.png"
          media="(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)"
        />
      </head>
      <body className="font-sans antialiased bg-brand-dark text-white relative overflow-x-hidden">
        <div id="scroll-sentinel" className="absolute top-10 inset-x-0 h-px pointer-events-none" />
        <div className="fixed inset-0 w-full h-full pointer-events-none z-[-1] overflow-hidden">
          <div className="absolute top-[10%] right-[-10%] w-[250px] h-[250px] bg-pink-700/20 rounded-full mix-blend-screen blur-[80px] animate-blob" />
          <div className="absolute bottom-[20%] left-[-10%] w-[250px] h-[250px] bg-purple-700/20 rounded-full mix-blend-screen blur-[80px]" style={{ animationDelay: "2s" }} />
        </div>
        <AuthProvider>
          <BookingSheetProvider>
            <Header />
            <main className="pb-24">{children}</main>
            <BottomNav />
            <BookingSheet />
          </BookingSheetProvider>
        </AuthProvider>
        <DebugConsole />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
