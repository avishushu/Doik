export default function Footer() {
  return (
    <footer className="mt-24 border-t border-gold-light bg-white">
      <div className="section-container py-10 text-sm text-charcoal/70 flex flex-col md:flex-row justify-between gap-4">
        <p>© {new Date().getFullYear()} שם המכון. כל הזכויות שמורות.</p>
        <p>כתובת המכון · טלפון · וואטסאפ</p>
      </div>
    </footer>
  );
}
