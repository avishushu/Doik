import Footer from "@/components/Footer";

const galleryImages = [
  "https://images.unsplash.com/photo-1457972729786-0411a3b2b626?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1500840216050-6ffa99d75160?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1602549179763-ce6c9df961b7?auto=format&fit=crop&w=600&q=80",
];

export default function GalleryPage() {
  return (
    <div className="app-shell px-6" style={{ paddingTop: "calc(96px + var(--sat))" }}>
      <h1 className="font-serif text-3xl font-bold text-white mb-8">גלריית עבודות</h1>
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-white/10">
            <img src={galleryImages[i % galleryImages.length]} alt="עבודה מהמכון" className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-6">תמונות זמניות להמחשה — יוחלפו בתמונות אמיתיות מהמכון.</p>
      <Footer />
    </div>
  );
}
