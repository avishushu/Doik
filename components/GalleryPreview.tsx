import Link from "next/link";
import { galleryImages } from "@/lib/gallery-data";

export default function GalleryPreview() {
  return (
    <div className="mt-12">
      <div className="mb-6">
        <h2 className="text-2xl font-serif font-bold text-white">מהעבודות שלנו</h2>
        <p className="text-xs text-gray-400">קצת מהיצירות האחרונות</p>
      </div>

      <div
        className="flex gap-3 overflow-x-auto no-scrollbar -mx-6 px-6 pb-1"
        style={{
          maskImage: "linear-gradient(to right, transparent 0%, black 10%, black 100%)",
          WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 10%, black 100%)",
        }}
      >
        {galleryImages.slice(0, 5).map((src, i) => (
          <div key={i} className="w-32 h-40 rounded-2xl overflow-hidden border border-white/10 flex-shrink-0">
            <img src={src} alt="מהגלריה שלנו" className="w-full h-full object-cover" />
          </div>
        ))}
      </div>

      <Link
        href="/gallery"
        className="mt-5 flex items-center justify-center gap-2 w-full border border-white/15 text-white rounded-full py-3 text-sm font-semibold hover:bg-white/5 transition-colors"
      >
        הצג הכל בגלריה
      </Link>
    </div>
  );
}
