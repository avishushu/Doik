import Link from "next/link";
import ServiceCard from "@/components/ServiceCard";

const highlightServices = [
  { title: "בניית ציפורניים וג'ל", description: "בנייה, לק ג'ל, עיצוב וטיפוח ציפורניים ברמה גבוהה." },
  { title: "איפור מקצועי", description: "איפור יומיומי, ערב וכלות בשימוש בקוסמטיקה איכותית." },
  { title: "תסרוקות", description: "תסרוקות לאירועים, ערב וכלות, בהתאמה אישית." },
];

export default function HomePage() {
  return (
    <>
      <section className="section-container py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-charcoal mb-6">מכון יופי יוקרתי</h1>
        <p className="text-lg text-charcoal/70 max-w-2xl mx-auto mb-8">
          ציפורניים, איפור ותסרוקות ברמה הגבוהה ביותר — במקום אחד.
        </p>
        <Link href="/booking" className="inline-block bg-gold hover:bg-gold-dark text-white px-8 py-3 rounded-full text-sm font-medium transition-colors">
          קביעת תור עכשיו
        </Link>
      </section>
      <section className="section-container py-16">
        <h2 className="text-2xl font-bold text-center mb-10">השירותים שלנו</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {highlightServices.map((service) => (
            <ServiceCard key={service.title} {...service} />
          ))}
        </div>
      </section>
    </>
  );
}
