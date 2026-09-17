import Link from "next/link";

const navItems = [
  { href: "/", label: "בית" },
  { href: "/services", label: "שירותים" },
  { href: "/gallery", label: "גלריה" },
  { href: "/about", label: "אודות" },
  { href: "/booking", label: "הזמנת תור" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-cream/90 backdrop-blur border-b border-gold-light">
      <div className="section-container flex items-center justify-between h-16">
        <Link href="/" className="text-xl font-bold text-gold-dark">שם המכון</Link>
        <nav className="hidden md:flex gap-8 text-sm">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-charcoal hover:text-gold-dark transition-colors">
              {item.label}
            </Link>
          ))}
        </nav>
        <Link href="/booking" className="bg-gold hover:bg-gold-dark text-white text-sm px-4 py-2 rounded-full transition-colors">
          קביעת תור
        </Link>
      </div>
    </header>
  );
}
