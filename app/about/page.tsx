import Footer from "@/components/Footer";

export default function AboutPage() {
  return (
    <div className="app-shell px-6" style={{ paddingTop: "calc(96px + var(--sat))" }}>
      <h1 className="font-serif text-3xl font-bold text-white mb-6">אודות המכון</h1>
      <p className="text-gray-300 leading-relaxed">
        כאן ייכתב סיפור המכון, הניסיון, ההכשרות והגישה המקצועית.
      </p>
      <Footer />
    </div>
  );
}
