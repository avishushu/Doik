const placeholderCount = 9;

export default function GalleryPage() {
  return (
    <section className="section-container py-16">
      <h1 className="text-3xl font-bold text-center mb-10">גלריית עבודות</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({ length: placeholderCount }).map((_, i) => (
          <div key={i} className="aspect-square rounded-xl bg-gold-light/40 border border-gold-light flex items-center justify-center text-gold-dark/60 text-sm">
            תמונה {i + 1}
          </div>
        ))}
      </div>
      <p className="text-center text-sm text-charcoal/50 mt-8">התמונות יוחלפו בתמונות עבודה אמיתיות מהמכון.</p>
    </section>
  );
}
