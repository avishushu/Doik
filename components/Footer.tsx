export default function Footer() {
  return (
    <footer className="mt-16 pt-8 border-t border-white/10 pb-4">
      <p className="font-latin italic font-bold text-lg text-white mb-3">Studio.</p>
      <div className="text-sm text-gray-400 space-y-1 mb-4">
        <p>רחוב הדוגמה 12, תל אביב</p>
        <p>03-1234567</p>
        <p>ראשון–חמישי 9:00–20:00</p>
      </div>
      <p className="text-xs text-gray-600">© {new Date().getFullYear()} Studio</p>
    </footer>
  );
}
