"use client";

import Link from "next/link";
import ParallaxHero from "@/components/ParallaxHero";
import ServiceCarousel from "@/components/ServiceCarousel";
import GalleryPreview from "@/components/GalleryPreview";
import Footer from "@/components/Footer";
import NextBookingCard from "@/components/NextBookingCard";
import AvailabilityBanner from "@/components/AvailabilityBanner";
import { useRedirectAdminHome } from "@/lib/use-admin-redirect";

export default function HomePage() {
  const isAdmin = useRedirectAdminHome();

  if (isAdmin) {
    return (
      <div className="app-shell px-6" style={{ paddingTop: "calc(96px + var(--sat))" }}>
        <p className="text-gray-400 text-sm">מעבירה ללוח הבקרה...</p>
      </div>
    );
  }

  return (
    <div className="app-shell relative">
      <ParallaxHero />
      <div className="px-6 -mt-10 relative z-20">
        <div className="space-y-3 mb-8">
          <NextBookingCard />
          <AvailabilityBanner />
        </div>

        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-2xl font-serif font-bold text-white">הטיפולים המבוקשים</h2>
            <p className="text-xs text-gray-400">אלו שהלקוחות שלנו הכי אוהבות</p>
          </div>
        </div>

        <ServiceCarousel />
        <GalleryPreview />
        <Footer />
      </div>
    </div>
  );
}
