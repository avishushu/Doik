import ServiceGrid from "@/components/ServiceGrid";
import Footer from "@/components/Footer";

export default function ServicesPage() {
  return (
    <div className="app-shell px-6" style={{ paddingTop: "calc(96px + var(--sat))" }}>
      <h1 className="font-serif text-3xl font-bold text-white mb-2">כל הטיפולים</h1>
      <p className="text-sm text-gray-400 mb-8">לחיצה על טיפול פותחת קביעת תור מהירה</p>
      <ServiceGrid />
      <Footer />
    </div>
  );
}
