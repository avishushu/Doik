export default function Footer() {
  return (
    <footer className="mt-16 pt-8 border-t border-white/10 pb-4">
      <div dir="ltr" className="flex items-baseline gap-1.5 mb-3">
        <span className="font-latin italic font-bold text-lg text-white">Hodaya</span>
        <span className="text-[10px] font-sans font-bold tracking-[0.2em] text-brand-rose uppercase">Beauty</span>
      </div>
      <div className="text-sm text-gray-400 space-y-1 mb-4">
        <p>רחוב הדוגמה 12, תל אביב</p>
        <p>03-1234567</p>
        <p>ראשון–חמישי 9:00–20:00</p>
      </div>
      <p className="text-xs text-gray-600">© {new Date().getFullYear()} Hodaya Beauty</p>
    </footer>
  );
}
