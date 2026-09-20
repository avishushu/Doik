import ParallaxHero from "@/components/ParallaxHero";
import ServiceCarousel from "@/components/ServiceCarousel";
import GalleryPreview from "@/components/GalleryPreview";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <div className="app-shell relative">
      <ParallaxHero />
      <div className="px-6 -mt-10 relative z-20">
        <div className="space-y-3 mb-8">
          <div className="bg-gradient-to-r from-pink-950/40 to-purple-950/40 border border-brand-rose/20 rounded-2xl p-4 flex justify-between items-center backdrop-blur-md">
            <div>
              <span className="text-xs text-pink-300 font-bold uppercase tracking-wider">התור הקרוב שלך</span>
              <h4 className="font-bold text-white text-sm">מניקור ולק ג'ל</h4>
            </div>
            <div className="text-left tabular-nums">
              <span className="text-sm font-bold text-white block">מחר, 10:00</span>
              <span className="text-xs text-gray-400">בעוד 22 שעות</span>
            </div>
          </div>

          <div className="inline-flex items-center gap-3 bg-red-950/40 border border-red-500/30 rounded-full px-4 py-2 backdrop-blur-md w-full">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
            <span className="text-sm font-semibold text-red-100 tracking-wide tabular-nums">עדכון חי: נותר תור 1 בלבד להיום!</span>
          </div>
        </div>

        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-2xl font-serif font-bold text-white">השירותים שלנו</h2>
            <p className="text-xs text-gray-400">החליקי לצפייה במגוון הטיפולים</p>
          </div>
        </div>

        <ServiceCarousel />
        <GalleryPreview />
        <Footer />
      </div>
    </div>
  );
}
