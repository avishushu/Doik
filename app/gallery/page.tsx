import Footer from "@/components/Footer";
import { galleryImages } from "@/lib/gallery-data";

export default function GalleryPage() {
  return (
    <div className="app-shell px-6" style={{ paddingTop: "calc(96px + var(--sat))" }}>
      <h1 className="font-serif text-3xl font-bold text-white mb-8">גלריית עבודות</h1>
      <div className="grid grid-cols-2 gap-3">
        {galleryImages.map((src, i) => (
          <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-white/10">
            <img src={src} alt="עבודה מהמכון" className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-6">תמונות זמניות להמחשה — יוחלפו בתמונות אמיתיות מהמכון.</p>
      <Footer />
    </div>
  );
}
