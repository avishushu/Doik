import ServiceCard from "@/components/ServiceCard";

const services = [
  { title: "בניית ציפורניים", description: "בנייה בג'ל או אקריליק, כל אורך וצורה.", price: "החל מ-₪X" },
  { title: "לק ג'ל", description: "לק ג'ל עמיד לשבועות ארוכים, מגוון גוונים.", price: "החל מ-₪X" },
  { title: "איפור ערב", description: "איפור מקצועי לאירועים וערבים מיוחדים.", price: "החל מ-₪X" },
  { title: "איפור כלה", description: "כולל ניסיון איפור לפני היום הגדול.", price: "החל מ-₪X" },
  { title: "תסרוקת ערב", description: "עיצוב שיער לאירועים ומסיבות.", price: "החל מ-₪X" },
  { title: "תסרוקת כלה", description: "כולל ניסיון תסרוקת לפני החתונה.", price: "החל מ-₪X" },
];

export default function ServicesPage() {
  return (
    <section className="section-container py-16">
      <h1 className="text-3xl font-bold text-center mb-10">השירותים שלנו</h1>
      <div className="grid md:grid-cols-3 gap-6">
        {services.map((service) => (
          <ServiceCard key={service.title} {...service} />
        ))}
      </div>
    </section>
  );
}
